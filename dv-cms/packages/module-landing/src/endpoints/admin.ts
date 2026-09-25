import { promises as dns } from 'node:dns'
import type { Endpoint, PayloadRequest, CollectionSlug } from 'payload'
import { SLUGS, SYMPTOMS } from '../constants.js'
import { effectiveStatus, getCampaignById, pointsOf, type CampaignDoc } from '../lib/campaign.js'
import { fail, isStaff, json, readJson } from '../lib/http.js'
import { loadRanking } from '../lib/scoring.js'
import { getLandingSettings } from '../lib/sms.js'
import { closeRound, ensureRound } from '../lib/rounds.js'
import { monthLabel } from '../lib/round-window.js'
import { revalidateCampaign } from '../lib/revalidate.js'

type Op = 'read' | 'update' | 'delete'

/**
 * Nhân viên có quyền `op` trên collection không — hỏi thẳng hàm access đã
 * được module phân quyền bọc, nên tôn trọng đúng ma trận vai trò trong admin.
 */
async function can(req: PayloadRequest, slug: string, op: Op): Promise<boolean> {
  if (!isStaff(req)) return false
  const access = req.payload.collections[slug as CollectionSlug]?.config.access?.[op]
  if (typeof access !== 'function') return false
  try {
    const r = await access({ req } as never)
    return Boolean(r)
  } catch {
    return false
  }
}

function withStaffCampaign(ops: [string, Op][], handler: (req: PayloadRequest, campaign: CampaignDoc) => Promise<Response>) {
  return async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) return fail(401, 'Bạn cần đăng nhập admin.')
    for (const [slug, op] of ops) {
      if (!(await can(req, slug, op))) return fail(403, 'Vai trò của bạn không có quyền thao tác này.')
    }
    const campaign = await getCampaignById(req.payload, String(req.routeParams?.id ?? ''), req)
    if (!campaign) return fail(404, 'Không tìm thấy chiến dịch.')
    return handler(req, campaign)
  }
}

/** Ô CSV: bọc nháy, nhân đôi nháy trong nội dung, chặn công thức Excel. */
function cell(v: unknown): string {
  let s = v == null ? '' : String(v)
  // Chuỗi bắt đầu bằng = + - @ bị Excel hiểu là công thức (CSV injection) —
  // một người tham gia đặt tên "=HYPERLINK(...)" là đủ gài bẫy người mở file.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

function csv(rows: unknown[][]): string {
  // BOM để Excel trên Windows mở đúng tiếng Việt.
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n')
}

const ORDER_STATUS_VI: Record<string, string> = { new: 'Mới', confirmed: 'Đã xác nhận', shipped: 'Đã giao', cancelled: 'Huỷ' }

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '')

export const adminEndpoints: Endpoint[] = [
  // ── Số liệu nhanh cho cột phải của trang chiến dịch ─────────────────
  {
    path: '/lp/admin/:id/stats',
    method: 'get',
    handler: withStaffCampaign([[SLUGS.campaigns, 'read']], async (req, campaign) => {
      const count = (collection: string, where: Record<string, unknown>) =>
        req.payload.count({ collection: collection as never, where: where as never, overrideAccess: true, req }).then((r) => r.totalDocs)
      const round = await ensureRound(req.payload, campaign, req)
      const [participants, pendingRecordings, newOrders, winners, inRound] = await Promise.all([
        count(SLUGS.participants, { campaign: { equals: campaign.id } }),
        count(SLUGS.recordings, { and: [{ campaign: { equals: campaign.id } }, { status: { equals: 'pending' } }, { kind: { not_equals: 'symptom' } }] }),
        count(SLUGS.orders, { and: [{ campaign: { equals: campaign.id } }, { status: { equals: 'new' } }] }),
        count(SLUGS.participants, { and: [{ campaign: { equals: campaign.id } }, { winner: { equals: true } }] }),
        count(SLUGS.participants, { and: [{ campaign: { equals: campaign.id } }, { roundKey: { equals: round.key } }] }),
      ])
      return json({
        status: effectiveStatus(campaign),
        round: {
          key: round.key,
          label: monthLabel(round.key),
          status: round.status,
          endAt: round.endAt,
          announceAt: round.announceAt,
          participants: inRound,
        },
        participants,
        pendingRecordings,
        newOrders,
        winners,
        slots: campaign.slots,
        winnersFrozenAt: campaign.winnersFrozenAt ?? null,
        piiPurgedAt: campaign.piiPurgedAt ?? null,
        domains: (campaign.domains ?? []).map((d) => d.host),
      })
    }),
  },

  // ── Chốt danh sách nhận quà ─────────────────────────────────────────
  {
    path: '/lp/admin/:id/freeze',
    method: 'post',
    handler: withStaffCampaign(
      [
        [SLUGS.campaigns, 'update'],
        [SLUGS.participants, 'update'],
      ],
      async (req, campaign) => {
        const body = await readJson(req)
        const round = await ensureRound(req.payload, campaign, req)
        const r = await closeRound(req.payload, campaign, round, { force: body.force === true, req })
        if (!r.closed) return fail(409, 'Đợt này đã chốt trước đó. Bấm "Chốt lại" nếu thật sự muốn tính lại.')
        return json({ ok: true, winners: r.winners, round: round.key })
      },
    ),
  },

  // ── Xuất CSV ─────────────────────────────────────────────────────────
  {
    path: '/lp/admin/:id/export',
    method: 'get',
    handler: withStaffCampaign([[SLUGS.participants, 'read']], async (req, campaign) => {
      const type = req.searchParams.get('type') === 'orders' ? 'orders' : 'participants'
      const stamp = new Date().toISOString().slice(0, 10)

      if (type === 'orders') {
        if (!(await can(req, SLUGS.orders, 'read'))) return fail(403, 'Không có quyền xem đơn hàng.')
        const res = await req.payload.find({
          collection: SLUGS.orders,
          where: { campaign: { equals: campaign.id } },
          sort: '-createdAt',
          depth: 1,
          pagination: false,
          overrideAccess: true,
          req,
        })
        const rows: unknown[][] = [
          ['Ngày đặt', 'Người nhận', 'SĐT', 'Địa chỉ', 'Số lọ', 'Mã giảm', 'Giảm %', 'Người giới thiệu', 'Trạng thái', 'Ghi chú khách', 'Ghi chú nội bộ'],
        ]
        for (const o of res.docs as unknown as Record<string, unknown>[]) {
          const ref = o.referrer as { name?: string } | null
          rows.push([fmtDate(o.createdAt as string), o.name, o.phone, o.address, o.quantity, o.code, o.discountPercent, ref?.name ?? '', ORDER_STATUS_VI[String(o.status)] ?? o.status, o.note, o.staffNote])
        }
        return new Response(csv(rows), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="don-hang-${campaign.slug}-${stamp}.csv"`,
            'Cache-Control': 'no-store',
          },
        })
      }

      const ranking = await loadRanking(req.payload, campaign, { fresh: true })
      const byId = new Map(ranking.map((r) => [String(r.id), r]))
      const res = await req.payload.find({
        collection: SLUGS.participants,
        where: { campaign: { equals: campaign.id } },
        sort: 'joinSeq',
        depth: 1,
        pagination: false,
        overrideAccess: true,
        req,
      })
      const p = pointsOf(campaign)
      const rows: unknown[][] = [
        [
          'Hạng',
          'Họ tên',
          'SĐT',
          'Vấn đề',
          'Vấn đề khác',
          'Điểm nhiệm vụ',
          `Điểm người vào sau (x${p.bonusPerJoin})`,
          'Tổng điểm',
          '% hộp quà',
          'Thứ tự đăng ký',
          'Nhận quà',
          'Mã giới thiệu',
          'Được giới thiệu bởi',
          'Trạng thái',
          'Đăng ký lúc',
          'Đồng ý lúc',
          'UTM',
        ],
      ]
      for (const d of res.docs as unknown as Record<string, unknown>[]) {
        const r = byId.get(String(d.id))
        const symptoms = ((d.symptoms as string[]) ?? []).map((s) => SYMPTOMS[s] ?? s).join('; ')
        const referredBy = d.referredBy as { referralCode?: string } | null
        const utm = (d.tracking as { utm?: Record<string, string> } | null)?.utm
        rows.push([
          r?.rank ?? '',
          d.name,
          d.phone,
          symptoms,
          d.symptomOther,
          d.points,
          r ? r.bonusCount * p.bonusPerJoin : '',
          r?.total ?? '',
          r?.pct ?? '',
          d.joinSeq,
          d.winner ? `Có (hạng ${d.winnerRank})` : '',
          d.referralCode,
          referredBy?.referralCode ?? '',
          d.status === 'blocked' ? 'Bị loại' : 'Đang tham gia',
          fmtDate(d.createdAt as string),
          fmtDate(d.consentAt as string),
          utm ? Object.entries(utm).map(([k, v]) => `${k}=${v}`).join('&') : '',
        ])
      }
      return new Response(csv(rows), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nguoi-tham-gia-${campaign.slug}-${stamp}.csv"`,
          'Cache-Control': 'no-store',
        },
      })
    }),
  },

  // ── Xoá dữ liệu cá nhân (NĐ 13/2023) ─────────────────────────────────
  {
    path: '/lp/admin/:id/purge',
    method: 'post',
    handler: withStaffCampaign(
      [
        [SLUGS.participants, 'delete'],
        [SLUGS.recordings, 'delete'],
      ],
      async (req, campaign) => {
        const body = await readJson(req)
        if (body.confirm !== campaign.slug) return fail(400, `Gõ đúng mã chiến dịch "${campaign.slug}" để xác nhận.`)
        const status = effectiveStatus(campaign)
        if (status === 'active' || status === 'draft') {
          return fail(409, 'Chỉ xoá dữ liệu khi chiến dịch đã kết thúc hoặc đã tắt.')
        }
        const base = { overrideAccess: true, req }
        const where = { campaign: { equals: campaign.id } }

        // File ghi âm: xoá cả bản ghi lẫn file trên đĩa (Payload tự xoá file).
        await req.payload.delete({ collection: SLUGS.recordings, where, ...base })
        await req.payload.delete({ collection: SLUGS.otps, where, ...base })

        const people = await req.payload.find({
          collection: SLUGS.participants,
          where,
          select: { name: true },
          pagination: false,
          depth: 0,
          ...base,
        })
        for (const d of people.docs as { id: string | number }[]) {
          await req.payload.update({
            collection: SLUGS.participants,
            id: d.id,
            data: {
              name: 'Đã xoá',
              phone: `deleted-${d.id}`,
              symptoms: [],
              symptomOther: null,
              referralCode: `DEL${d.id}`,
              tracking: { ip: null, userAgent: null, host: null, utm: null },
            },
            ...base,
          })
        }
        await req.payload.update({
          collection: SLUGS.orders,
          where,
          data: { name: 'Đã xoá', phone: 'deleted', address: 'Đã xoá', note: null, ip: null },
          ...base,
        })
        await req.payload.update({
          collection: SLUGS.campaigns,
          id: campaign.id,
          data: { piiPurgedAt: new Date().toISOString() },
          ...base,
        })
        await revalidateCampaign(req.payload, campaign.slug)
        return json({ ok: true, anonymized: people.docs.length })
      },
    ),
  },

  // ── Kiểm tra DNS ─────────────────────────────────────────────────────
  {
    path: '/lp/admin/:id/dns',
    method: 'get',
    handler: withStaffCampaign([[SLUGS.campaigns, 'read']], async (req, campaign) => {
      const settings = await getLandingSettings(req.payload)
      const expected = (settings.serverIp ?? '').trim()
      const results = await Promise.all(
        (campaign.domains ?? []).map(async ({ host }) => {
          try {
            const ips = await dns.resolve4(host)
            const ok = expected ? ips.includes(expected) : null
            return {
              host,
              ips,
              ok,
              message: !expected
                ? 'Đã phân giải — chưa khai IP của VPS trong "Cài đặt landing" nên chưa so được.'
                : ok
                  ? 'Đã trỏ đúng về VPS.'
                  : `Đang trỏ về ${ips.join(', ')}, cần trỏ về ${expected}.`,
            }
          } catch (err) {
            const code = (err as { code?: string }).code
            return {
              host,
              ips: [] as string[],
              ok: false,
              message: code === 'ENOTFOUND' || code === 'ENODATA' ? 'Chưa có bản ghi A — chưa trỏ tên miền.' : `Không tra được DNS (${code ?? 'lỗi'}).`,
            }
          }
        }),
      )
      return json({ expected: expected || null, results })
    }),
  },

  // ── Làm mới trang landing ngay ───────────────────────────────────────
  {
    path: '/lp/admin/:id/revalidate',
    method: 'post',
    handler: withStaffCampaign([[SLUGS.campaigns, 'update']], async (req, campaign) => {
      await revalidateCampaign(req.payload, campaign.slug)
      return json({ ok: true })
    }),
  },
]
