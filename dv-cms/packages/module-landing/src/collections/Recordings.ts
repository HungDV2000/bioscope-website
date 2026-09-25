import path from 'node:path'
import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'
import { SLUGS, RECORDING_KINDS, AUDIO_MIME, MAX_AUDIO_BYTES } from '../constants.js'
import { grantPoints, revokePoints } from '../lib/points.js'
import { getCampaignById } from '../lib/campaign.js'
import { roundWindow } from '../lib/round-window.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

const KIND_LABELS: Record<(typeof RECORDING_KINDS)[number], string> = {
  intro: 'Kể chuyện dạ dày (nhiệm vụ)',
  result: 'Kể lại kết quả sau 2 tuần',
  symptom: 'Mô tả vấn đề khác (bước 2)',
}

const relId = (v: unknown): string | number | null => {
  if (v == null) return null
  if (typeof v === 'object') return ((v as { id?: string | number }).id ?? null) as string | number | null
  return v as string | number
}

/** Khoá sổ điểm của từng loại ghi âm. Mỗi người chỉ được cộng một lần/loại. */
const refKeyOf = (kind: string) => (kind === 'result' ? 'result:after2w' : 'record:intro')

/**
 * Bản ghi âm của người tham gia.
 *
 * File nằm trong `media/lp-recordings` — thư mục con của volume `media` mà
 * docker-compose đã gắn sẵn, nên không mất khi rebuild container. Quyền đọc
 * chỉ dành cho nhân viên: đường dẫn `/api/lp-recordings/file/…` đi qua kiểm
 * tra quyền của Payload, không phải file tĩnh ai cũng tải được — đây là giọng
 * nói kèm tên, số điện thoại và bệnh của người ta.
 */
export const Recordings: CollectionConfig = {
  slug: SLUGS.recordings,
  labels: {
    singular: { vi: 'Bản ghi âm', en: 'Recording' },
    plural: { vi: 'Bản ghi âm', en: 'Recordings' },
  },
  admin: {
    useAsTitle: 'filename',
    group: 'Landing page',
    defaultColumns: ['participant', 'kind', 'status', 'durationSec', 'createdAt'],
    description: 'Nghe rồi chọn "Đạt" để cộng điểm cho người tham gia, "Loại" nếu bản ghi không đúng yêu cầu.',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
    admin: staffOnly,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media', 'lp-recordings'),
    mimeTypes: [...AUDIO_MIME],
    filesRequiredOnCreate: true,
    displayPreview: false,
  },
  hooks: {
    beforeValidate: [
      ({ req }) => {
        const size = (req.file as { size?: number } | undefined)?.size
        if (size && size > MAX_AUDIO_BYTES) throw new APIError('File ghi âm vượt quá 15 MB.', 400, null, true)
      },
    ],
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {
        if (operation === 'update' && data.status && data.status !== originalDoc?.status) {
          data.reviewedAt = new Date().toISOString()
          if (req.user) data.reviewedBy = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (doc.kind === 'symptom') return doc
        const becameApproved = doc.status === 'approved' && (operation === 'create' || previousDoc?.status !== 'approved')
        const lostApproval = operation === 'update' && previousDoc?.status === 'approved' && doc.status !== 'approved'
        if (!becameApproved && !lostApproval) return doc

        const participant = relId(doc.participant)
        const campaignId = relId(doc.campaign)
        if (participant == null || campaignId == null) return doc
        const refKey = refKeyOf(doc.kind)

        // Điểm cộng vào đúng đợt đã ghi âm (đợt lưu lúc khách gửi bản ghi);
        // bản ghi cũ chưa có thì tính vào đợt đang chạy.
        const campaign = await getCampaignById(req.payload, campaignId, req)
        const round = String(doc.round || (campaign ? roundWindow(campaign).key : '')) || 'once'

        if (becameApproved) {
          const pts = doc.kind === 'result' ? campaign?.points?.result : campaign?.points?.record
          await grantPoints(
            req.payload,
            {
              participant,
              campaign: campaignId,
              type: doc.kind === 'result' ? 'result' : 'record',
              refKey,
              round,
              points: Number(pts ?? 10),
              note: `Bản ghi #${doc.id} được duyệt`,
            },
            req,
          )
        } else {
          // Chỉ thu hồi nếu không còn bản ghi cùng loại nào khác đang "Đạt".
          const others = await req.payload.find({
            collection: SLUGS.recordings,
            where: {
              and: [
                { participant: { equals: participant } },
                { kind: { equals: doc.kind } },
                { round: { equals: doc.round ?? null } },
                { status: { equals: 'approved' } },
                { id: { not_equals: doc.id } },
              ],
            },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          })
          if (!others.docs.length) await revokePoints(req.payload, participant, refKey, round, req)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'player',
      type: 'ui',
      admin: { components: { Field: '@dv/module-landing/admin#AudioPreview' } },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'participant',
          type: 'relationship',
          relationTo: SLUGS.participants,
          required: true,
          index: true,
          label: 'Người tham gia',
          admin: { width: '50%' },
        },
        {
          name: 'campaign',
          type: 'relationship',
          relationTo: SLUGS.campaigns,
          required: true,
          index: true,
          label: 'Chiến dịch',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'intro',
          label: 'Loại',
          options: RECORDING_KINDS.map((value) => ({ value, label: KIND_LABELS[value] })),
          admin: { width: '50%' },
        },
        { name: 'durationSec', type: 'number', label: 'Thời lượng (giây)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'round',
      type: 'text',
      index: true,
      label: 'Đợt',
      admin: { readOnly: true, description: 'Duyệt xong thì điểm cộng vào đợt này.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Duyệt',
      options: [
        { value: 'pending', label: 'Chờ nghe' },
        { value: 'approved', label: 'Đạt — cộng điểm' },
        { value: 'rejected', label: 'Loại' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'reviewNote', type: 'textarea', label: 'Ghi chú khi duyệt', admin: { position: 'sidebar' } },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users', label: 'Người duyệt', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Duyệt lúc',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
