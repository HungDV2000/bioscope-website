/**
 * Seed the `navigation` global's companyInfo group (footer company details).
 * Idempotent — safe to re-run. Only fills companyInfo, leaves menus untouched.
 *
 *   docker compose exec -e NODE_ENV=development -w /app/apps/core-cms cms \
 *     ./node_modules/.bin/payload run src/scripts/seedCompanyInfo.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

const companyInfo = {
  name: 'CÔNG TY CỔ PHẦN BIOSCOPE VIỆT NAM',
  taxCode: '0105293554',
  registeredAddress:
    'Số Nhà 10 Đường 1D, Khu dân cư Melosa Khang Điền, Khu phố 3, Phường Long Trường, TP.HCM',
  officeAddress: 'Tầng 2, Nhà xưởng số 4, Đường N6, Đ. D1, Phường Tăng Nhơn Phú, TP.HCM',
  hotline: '0982 298 820',
  email: 'hungdv@bioscope.vn',
  website: 'bioscope.com.vn',
}

try {
  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug: 'navigation',
    data: { companyInfo } as never,
    overrideAccess: true,
  })
  process.stderr.write('[seed-company-info] Đã cập nhật companyInfo cho global navigation.\n')
  process.exit(0)
} catch (err) {
  process.stderr.write(`[seed-company-info] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
