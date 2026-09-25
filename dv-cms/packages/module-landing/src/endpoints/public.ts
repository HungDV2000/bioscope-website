import type { Endpoint, PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { SLUGS, MAX_AUDIO_BYTES, RECORDING_KINDS, type RecordingKind } from '../constants.js'
import { effectiveStatus, getCampaignBySlug, publicCampaign, publicVideos, relId, type CampaignDoc } from '../lib/campaign.js'
import { ensureEnrolled, ensureRound, lastClosedRound, type RoundDoc } from '../lib/rounds.js'
import { monthLabel } from '../lib/round-window.js'
import { creditInviter } from '../lib/invite.js'
import { clientIp, fail, isInternal, json, readJson, str } from '../lib/http.js'
import { normalizePhone } from '../lib/phone.js'
import { requestOtp, verifyOtp } from '../lib/otp.js'
import { getParticipant, participantState, registerParticipant, findParticipant, type ParticipantDoc } from '../lib/participant.js'
import { grantPoints } from '../lib/points.js'
import { REFERRAL_RE } from '../lib/referral.js'
import { loadRanking, publicTop } from '../lib/scoring.js'
import { issueWatchToken, verifyWatchToken } from '../lib/tokens.js'
import { detectAudio } from '../lib/audio.js'
import { maskName } from '../lib/phone.js'

type Ctx = { campaign: CampaignDoc; status: ReturnType<typeof effectiveStatus>; round: RoundDoc }

/**
 * Bọc handler: kiểm khoá nội bộ + nạp chiến dịch theo slug.
 *
 * Mọi endpoint dưới `/lp/c/:slug` đều đi qua đây, nên không endpoint nào quên
 * được bước kiểm khoá.
 */
function withCampaign(handler: (req: PayloadRequest, ctx: Ctx) => Promise<Response>) {
  return async (req: PayloadRequest): Promise<Response> => {
    if (!isInternal(req)) return fail(401, 'unauthorized')
    const slug = String(req.routeParams?.slug ?? '')
    const campaign = await getCampaignBySlug(req.payload, slug, req)
    if (!campaign) return fail(404, 'campaign_not_found')
    // Đợt của tháng hiện tại — tạo sẵn nếu chưa có, để mọi thao tác đều có chỗ ghi điểm.
    const round = await ensureRound(req.payload, campaign, req)
    return handler(req, { campaign, status: effectiveStatus(campaign), round })
  }
}

/** Người tham gia đang thao tác — frontend đã xác thực cookie ký rồi mới gửi id. */
async function actingParticipant(req: PayloadRequest, campaign: CampaignDoc, round?: RoundDoc): Promise<ParticipantDoc | null> {
  const id = req.headers.get('x-participant-id')
  if (!id) return null
  const p = await getParticipant(req.payload, id, req)
  if (!p) return null
  const cid = typeof p.campaign === 'object' ? p.campaign.id : p.campaign
  // Cookie của chiến dịch A không được dùng cho chiến dịch B.
  if (String(cid) !== String(campaign.id)) return null
  // Quay lại trong tháng mới → ghi tên vào đợt mới, điểm bắt đầu từ 0.
  if (round && round.status === 'open' && p.roundKey !== round.key) {
    await ensureEnrolled(req.payload, campaign, p, round.key, req)
    return (await getParticipant(req.payload, p.id, req)) ?? p
  }
  return p
}

/**
 * Kết quả đợt gần nhất.
 *
 * Danh sách người nhận quà CHỈ trả về khi đợt đã sang trạng thái "Đã công bố"
 * (mặc định 10:00 ngày 05 tháng sau). Trước mốc đó, trang chỉ biết "đã chốt,
 * đang đối chiếu" — 5 ngày để Bioscope loại trường hợp gian lận.
 */
async function lastResultOf(req: PayloadRequest, campaign: CampaignDoc) {
  const round = await lastClosedRound(req.payload, campaign, req)
  if (!round) return null
  const announced = round.status === 'announced'
  const winners = announced
    ? (round.winners ?? []).map((w) => ({
        name: maskName(typeof w.participant === 'object' ? (w.participant?.name ?? '') : ''),
        rank: w.rank,
      }))
    : []
  // Hết hạn hiển thị thì thôi không nhắc kết quả cũ nữa.
  const days = Math.max(1, Number(campaign.showResultDays) || 7)
  if (announced && Date.now() - new Date(round.announceAt).getTime() > days * 86400_000) return null
  return { key: round.key, label: monthLabel(round.key), announceAt: round.announceAt, announced, winners }
}

const publicRound = (r: RoundDoc) => ({
  key: r.key,
  label: monthLabel(r.key),
  endAt: r.endAt,
  announceAt: r.announceAt,
  status: r.status,
})

export const publicEndpoints: Endpoint[] = [
  // ── Bảng tên miền cho proxy của frontend ─────────────────────────────
  {
    path: '/lp/domains',
    method: 'get',
    handler: async (req) => {
      if (!isInternal(req)) return fail(401, 'unauthorized')
      const res = await req.payload.find({
        collection: SLUGS.campaigns,
        select: { slug: true, status: true, autoEndAtDeadline: true, deadline: true, domains: true, offRedirectUrl: true },
        pagination: false,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const domains = (res.docs as unknown as CampaignDoc[]).flatMap((c) =>
        (c.domains ?? []).map((d) => ({
          host: d.host,
          slug: c.slug,
          status: effectiveStatus(c),
          offRedirectUrl: c.offRedirectUrl || 'https://web.bioscope.vn',
        })),
      )
      return json({ domains })
    },
  },

  // ── Cấu hình công khai + bảng xếp hạng ───────────────────────────────
  {
    path: '/lp/c/:slug',
    method: 'get',
    handler: withCampaign(async (req, { campaign, round }) => {
      const ranking = await loadRanking(req.payload, campaign, { roundKey: round.key })
      return json({
        campaign: publicCampaign(campaign, {
          participants: ranking.length,
          round: publicRound(round),
          lastResult: await lastResultOf(req, campaign),
        }),
        leaderboard: publicTop(ranking, 10),
      })
    }),
  },

  // ── Kiểm tra mã giới thiệu (hiện ✓ -10% ở form đặt hàng) ─────────────
  {
    path: '/lp/c/:slug/code/:code',
    method: 'get',
    handler: withCampaign(async (req, { campaign }) => {
      const code = String(req.routeParams?.code ?? '').toUpperCase()
      if (!REFERRAL_RE.test(code)) return json({ valid: false })
      const res = await req.payload.count({
        collection: SLUGS.participants,
        where: { and: [{ campaign: { equals: campaign.id } }, { referralCode: { equals: code } }, { status: { equals: 'active' } }] },
        overrideAccess: true,
        req,
      })
      return json({ valid: res.totalDocs > 0, discountPercent: campaign.discountPercent })
    }),
  },

  // ── Gửi OTP ──────────────────────────────────────────────────────────
  {
    path: '/lp/c/:slug/otp',
    method: 'post',
    handler: withCampaign(async (req, { campaign, status }) => {
      const body = await readJson(req)
      const phone = normalizePhone(body.phone)
      if (!phone) return fail(400, 'invalid_phone')

      // Hết chương trình: người đã tham gia vẫn đăng nhập lại để xem kết quả,
      // còn số mới thì không nhận nữa.
      if (status !== 'active') {
        const existing = await findParticipant(req.payload, campaign.id, phone, req)
        if (!existing) return fail(409, 'campaign_closed', { status })
      }
      if (campaign.requireOtp === false) return json({ ok: true, otpRequired: false })

      const r = await requestOtp(req.payload, { campaign: campaign.id, phone, ip: clientIp(req) }, req)
      if (!r.ok) return fail(r.error === 'send_failed' ? 502 : 429, r.error, { retryAfterSec: r.retryAfterSec })
      return json({ ok: true, otpRequired: true, expiresInSec: r.expiresInSec, ...(r.devCode ? { devCode: r.devCode } : {}) })
    }),
  },

  // ── Xác thực + tham gia ──────────────────────────────────────────────
  {
    path: '/lp/c/:slug/join',
    method: 'post',
    handler: withCampaign(async (req, { campaign, status, round }) => {
      const body = await readJson<Record<string, unknown>>(req)
      const phone = normalizePhone(body.phone)
      const name = str(body.name, 80).replace(/\s+/g, ' ')
      if (!phone) return fail(400, 'invalid_phone')

      const requireOtp = campaign.requireOtp !== false
      if (requireOtp) {
        const v = await verifyOtp(req.payload, { campaign: campaign.id, phone, code: str(body.code, 12) }, req)
        if (!v.ok) return fail(v.error === 'too_many' ? 429 : 400, `otp_${v.error}`)
      }

      const existing = await findParticipant(req.payload, campaign.id, phone, req)
      if (!existing) {
        if (status !== 'active') return fail(409, 'campaign_closed', { status })
        if (round.status !== 'open') return fail(409, 'round_closed', { status })
        if (name.split(' ').length < 2) return fail(400, 'invalid_name')
        if (body.consent !== true) return fail(400, 'consent_required')
      }

      const utm = (typeof body.utm === 'object' && body.utm ? body.utm : {}) as Record<string, unknown>
      const { participant, created } = await registerParticipant(
        req.payload,
        campaign,
        {
          name,
          phone,
          symptoms: Array.isArray(body.symptoms) ? body.symptoms.map(String).slice(0, 10) : [],
          symptomOther: str(body.symptomOther, 120),
          ref: str(body.ref, 12),
          consentText: campaign.consentText || '',
          verified: requireOtp,
          tracking: {
            ip: clientIp(req),
            userAgent: str(req.headers.get('user-agent'), 300),
            host: str(body.host, 120),
            utm: Object.fromEntries(
              Object.entries(utm)
                .filter(([k]) => /^utm_[a-z]+$/.test(k))
                .map(([k, v]) => [k, str(v, 120)]),
            ),
          },
        },
        req,
      )
      if (participant.status === 'blocked') return fail(403, 'blocked')
      if (round.status === 'open' && participant.roundKey !== round.key) {
        await ensureEnrolled(req.payload, campaign, participant, round.key, req)
      }
      const me = (await getParticipant(req.payload, participant.id, req)) ?? participant
      return json({
        ok: true,
        created,
        participantId: participant.id,
        me: await participantState(req.payload, campaign, me, req),
      })
    }),
  },

  // ── Trạng thái của tôi ───────────────────────────────────────────────
  {
    path: '/lp/c/:slug/me',
    method: 'get',
    handler: withCampaign(async (req, { campaign, round }) => {
      const p = await actingParticipant(req, campaign, round)
      if (!p) return fail(401, 'no_session')
      return json({ me: await participantState(req.payload, campaign, p, req) })
    }),
  },

  // ── Video: nhận phiếu bắt đầu xem ────────────────────────────────────
  {
    path: '/lp/c/:slug/video/start',
    method: 'post',
    handler: withCampaign(async (req, { campaign, status, round }) => {
      const p = await actingParticipant(req, campaign, round)
      if (!p) return fail(401, 'no_session')
      if (status !== 'active' || round.status !== 'open') return fail(409, 'campaign_closed', { status })
      const body = await readJson(req)
      const video = publicVideos(campaign).find((v) => v.key === str(body.videoKey, 80))
      if (!video) return fail(404, 'video_not_found')
      return json({ token: issueWatchToken(p.id, video.key), minWatchSeconds: video.minWatchSeconds })
    }),
  },

  // ── Video: nộp phiếu, đủ giờ thì cộng điểm ───────────────────────────
  {
    path: '/lp/c/:slug/video/complete',
    method: 'post',
    handler: withCampaign(async (req, { campaign, status, round }) => {
      const p = await actingParticipant(req, campaign, round)
      if (!p) return fail(401, 'no_session')
      if (status !== 'active' || round.status !== 'open') return fail(409, 'campaign_closed', { status })
      const body = await readJson(req)
      const video = publicVideos(campaign).find((v) => v.key === str(body.videoKey, 80))
      if (!video) return fail(404, 'video_not_found')

      const t = verifyWatchToken(str(body.token, 400), p.id, video.key)
      if (!t.ok) return fail(400, 'bad_token')
      const watched = (Date.now() - t.startedAt) / 1000
      if (watched + 1 < video.minWatchSeconds) {
        return fail(400, 'too_short', { remainingSec: Math.ceil(video.minWatchSeconds - watched) })
      }

      const granted = await grantPoints(
        req.payload,
        {
          participant: p.id,
          campaign: campaign.id,
          type: 'video',
          refKey: `video:${video.key}`,
          round: round.key,
          points: video.points,
          note: video.title,
        },
        req,
      )
      // Xem xong việc thật đầu tiên mới cộng điểm cho người đã mời mình —
      // chặn cày điểm bằng sim rác đăng ký hàng loạt rồi bỏ đó.
      if (granted) await creditInviter(req.payload, campaign, p, round.key, req)
      const fresh = (await getParticipant(req.payload, p.id, req)) ?? p
      return json({ ok: true, granted, points: video.points, me: await participantState(req.payload, campaign, fresh, req) })
    }),
  },

  // ── Ghi âm ───────────────────────────────────────────────────────────
  {
    path: '/lp/c/:slug/recordings',
    method: 'post',
    handler: withCampaign(async (req, { campaign, status, round }) => {
      const p = await actingParticipant(req, campaign, round)
      if (!p) return fail(401, 'no_session')

      await addDataAndFileToRequest(req)
      const file = req.file as { data?: Buffer; size?: number; name?: string } | undefined
      const data = (req.data ?? {}) as Record<string, unknown>
      const kind = String(data.kind ?? 'intro') as RecordingKind
      if (!RECORDING_KINDS.includes(kind)) return fail(400, 'bad_kind')

      if (kind === 'result') {
        const me = await participantState(req.payload, campaign, p, req)
        if (!me.resultUnlocked) return fail(409, 'result_locked')
      } else if (status !== 'active' || round.status !== 'open') {
        return fail(409, 'campaign_closed', { status })
      }

      if (!file?.data?.length) return fail(400, 'no_file')
      if (file.data.length > MAX_AUDIO_BYTES) return fail(413, 'too_large')
      const detected = detectAudio(file.data)
      if (!detected) return fail(415, 'not_audio')

      const autoApprove = campaign.requireRecordingApproval === false && kind !== 'symptom'
      const doc = await req.payload.create({
        collection: SLUGS.recordings,
        data: {
          participant: relId(p.id),
          campaign: relId(campaign.id),
          kind,
          durationSec: Math.max(0, Math.min(3600, Math.round(Number(data.durationSec) || 0))),
          status: autoApprove ? 'approved' : 'pending',
        },
        file: {
          data: file.data,
          mimetype: detected.mime,
          name: `lp-${campaign.slug}-${p.id}-${kind}-${Date.now()}.${detected.ext}`,
          size: file.data.length,
        },
        overrideAccess: true,
        req,
      })
      const fresh = (await getParticipant(req.payload, p.id, req)) ?? p
      return json({
        ok: true,
        recordingId: doc.id,
        status: autoApprove ? 'approved' : 'pending',
        me: await participantState(req.payload, campaign, fresh, req),
      })
    }),
  },

  // ── Đã gửi mã cho người thân ─────────────────────────────────────────
  {
    path: '/lp/c/:slug/share',
    method: 'post',
    handler: withCampaign(async (req, { campaign, round }) => {
      const p = await actingParticipant(req, campaign, round)
      if (!p) return fail(401, 'no_session')
      let fresh = p
      if (!p.sharedAt) {
        fresh = (await req.payload.update({
          collection: SLUGS.participants,
          id: p.id,
          data: { sharedAt: new Date().toISOString() },
          overrideAccess: true,
          req,
        })) as unknown as ParticipantDoc
      }
      return json({ ok: true, me: await participantState(req.payload, campaign, fresh, req) })
    }),
  },

  // ── Đặt hàng ─────────────────────────────────────────────────────────
  {
    path: '/lp/c/:slug/orders',
    method: 'post',
    handler: withCampaign(async (req, { campaign, status }) => {
      if (status === 'draft' || status === 'off') return fail(409, 'campaign_closed', { status })
      const body = await readJson(req)
      const name = str(body.name, 80)
      const phone = normalizePhone(body.phone)
      const address = str(body.address, 300)
      if (name.split(/\s+/).length < 2) return fail(400, 'invalid_name')
      if (!phone) return fail(400, 'invalid_phone')
      if (address.length < 10) return fail(400, 'invalid_address')
      const quantity = Math.max(1, Math.min(20, Math.round(Number(body.quantity) || 1)))

      // Chống bấm đặt liên tục: cùng số, cùng chiến dịch tối đa 5 đơn/giờ.
      const recent = await req.payload.count({
        collection: SLUGS.orders,
        where: {
          and: [
            { campaign: { equals: campaign.id } },
            { phone: { equals: phone } },
            { createdAt: { greater_than: new Date(Date.now() - 3600_000).toISOString() } },
          ],
        },
        overrideAccess: true,
        req,
      })
      if (recent.totalDocs >= 5) return fail(429, 'too_many_orders')

      let referrer: string | number | undefined
      let code = str(body.code, 12).toUpperCase()
      if (code) {
        if (!REFERRAL_RE.test(code)) code = ''
        else {
          const r = await req.payload.find({
            collection: SLUGS.participants,
            where: { and: [{ campaign: { equals: campaign.id } }, { referralCode: { equals: code } }, { status: { equals: 'active' } }] },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          })
          referrer = (r.docs[0] as { id?: string | number } | undefined)?.id
          if (!referrer) code = ''
        }
      }

      const buyer = await actingParticipant(req, campaign)
      const order = await req.payload.create({
        collection: SLUGS.orders,
        data: {
          campaign: relId(campaign.id),
          name,
          phone,
          address,
          quantity,
          note: str(body.note, 500) || undefined,
          code: code || undefined,
          discountPercent: code ? campaign.discountPercent : 0,
          ...(referrer ? { referrer: relId(referrer) } : {}),
          ...(buyer ? { buyer: relId(buyer.id) } : {}),
          status: 'new',
          ip: clientIp(req),
        },
        overrideAccess: true,
        req,
      })
      return json({ ok: true, orderId: order.id, discountPercent: code ? campaign.discountPercent : 0, codeApplied: Boolean(code) })
    }),
  },
]
