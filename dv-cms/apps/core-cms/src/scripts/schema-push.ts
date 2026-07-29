/** DEV-only: nạp config → getPayload kích hoạt push (tạo bảng) để trích schema. */
import config from '../payload.config.js'
import { getPayload } from 'payload'

await getPayload({ config })
console.log('[schema-push] xong — schema đã push.')
process.exit(0)
