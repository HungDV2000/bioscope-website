import type { Config, Plugin } from 'payload'
import { Campaigns } from './collections/Campaigns.js'
import { Participants } from './collections/Participants.js'
import { PointEvents } from './collections/PointEvents.js'
import { Recordings } from './collections/Recordings.js'
import { Orders } from './collections/Orders.js'
import { Otps } from './collections/Otps.js'
import { Rounds } from './collections/Rounds.js'
import { LandingSettings } from './globals/LandingSettings.js'
import { publicEndpoints } from './endpoints/public.js'
import { adminEndpoints } from './endpoints/admin.js'
import { startRoundScheduler } from './lib/rounds.js'

export type LandingPluginOptions = {
  /** Tắt tác vụ nền chốt/mở đợt (mặc định: bật). */
  autoEnd?: boolean
}

/**
 * Module landing page chiến dịch.
 *
 *  - collections: chiến dịch, người tham gia, sổ điểm, ghi âm, đơn hàng, OTP
 *  - global: cài đặt SMS OTP
 *  - endpoints `/api/lp/*`: phần công khai chỉ nhận lời gọi từ frontend
 *    (khoá INTERNAL_API_SECRET), phần quản trị đòi đăng nhập admin + quyền
 *  - tác vụ nền: mỗi phút kiểm đợt — hết hạn thì chốt, tới mốc thì công bố,
 *    và luôn mở sẵn đợt của tháng hiện tại
 *
 * Đặt TRƯỚC `permissionsPlugin` để các collection này cũng được bọc RBAC.
 */
export const landingPlugin =
  (options: LandingPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }

    config.collections = [...(config.collections ?? []), Campaigns, Rounds, Participants, PointEvents, Recordings, Orders, Otps]
    config.globals = [...(config.globals ?? []), LandingSettings]
    config.endpoints = [...(config.endpoints ?? []), ...publicEndpoints, ...adminEndpoints]

    if (options.autoEnd !== false && process.env.PAYLOAD_MIGRATING !== 'true') {
      const prevOnInit = config.onInit
      config.onInit = async (payload) => {
        if (prevOnInit) await prevOnInit(payload)
        startRoundScheduler(payload)
      }
    }

    return config
  }
