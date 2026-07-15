/**
 * SecuritySettings — Wordfence-style, admin-managed security configuration.
 *
 * A single global that drives the firewall engine (`lib/firewall`), login
 * brute-force protection and the scanner. Everything here is editable from the
 * CMS admin (unlike the legacy code-managed frontend WAF), so ops can tune
 * thresholds, block/allow IPs and toggle protections without a redeploy.
 */

import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

export const SecuritySettings: GlobalConfig = {
  slug: 'security-settings',
  label: 'Security (Firewall)',
  admin: {
    group: 'Security',
    description: 'Tường lửa, chặn IP, chống brute-force, quét bảo mật (tham khảo Wordfence).',
  },
  access: {
    read: isAdminOrEditor,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Firewall ──────────────────────────────────────────────────────
        {
          label: 'Firewall',
          description: 'Web Application Firewall — chặn request tấn công.',
          fields: [
            {
              name: 'firewallEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Bật tường lửa (WAF)',
            },
            {
              name: 'firewallMode',
              type: 'select',
              defaultValue: 'block',
              options: [
                { label: 'Chặn (block) — trả 403', value: 'block' },
                { label: 'Chỉ ghi log (learning) — không chặn', value: 'monitor' },
              ],
              admin: { description: 'Learning mode để test rule mà không chặn thật.' },
            },
            {
              name: 'blockKnownAttacks',
              type: 'checkbox',
              defaultValue: true,
              label: 'Chặn chữ ký tấn công (SQLi, XSS, traversal, Log4Shell, RCE)',
            },
            {
              name: 'blockScanners',
              type: 'checkbox',
              defaultValue: true,
              label: 'Chặn scanner/bot độc (sqlmap, nikto, nmap…)',
            },
            {
              name: 'blockWpProbes',
              type: 'checkbox',
              defaultValue: true,
              label: 'Chặn dò đường dẫn WordPress/PHP (wp-admin, xmlrpc, .env…)',
            },
            {
              name: 'customBlockedPatterns',
              type: 'array',
              label: 'Rule chặn tùy chỉnh (regex trên path+query)',
              admin: { description: 'Mỗi dòng là 1 biểu thức chính quy. Cẩn thận kẻo chặn nhầm.' },
              fields: [
                { name: 'pattern', type: 'text', required: true },
                { name: 'note', type: 'text' },
              ],
            },
          ],
        },

        // ── Rate limiting ────────────────────────────────────────────────
        {
          label: 'Rate limit',
          description: 'Giới hạn tần suất request để chống DoS / cào dữ liệu.',
          fields: [
            {
              name: 'rateLimitEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Bật giới hạn tần suất',
            },
            {
              name: 'rateLimitMax',
              type: 'number',
              defaultValue: 240,
              min: 10,
              label: 'Số request tối đa / IP trong 1 phút',
            },
            {
              name: 'rateLimitWindowMs',
              type: 'number',
              defaultValue: 60000,
              min: 1000,
              label: 'Cửa sổ thời gian (ms)',
            },
            {
              name: 'rateLimitBlockSeconds',
              type: 'number',
              defaultValue: 300,
              min: 0,
              label: 'Thời gian tạm chặn khi vượt ngưỡng (giây)',
            },
          ],
        },

        // ── IP access ────────────────────────────────────────────────────
        {
          label: 'IP',
          description: 'Danh sách IP luôn chặn / luôn cho qua (bổ sung cho collection Blocked IPs).',
          fields: [
            {
              name: 'allowedIps',
              type: 'array',
              label: 'IP tin cậy (allowlist) — bỏ qua mọi rule',
              fields: [
                { name: 'ip', type: 'text', required: true },
                { name: 'note', type: 'text' },
              ],
            },
            {
              name: 'blockedIps',
              type: 'array',
              label: 'IP chặn thủ công (blocklist)',
              fields: [
                { name: 'ip', type: 'text', required: true },
                { name: 'note', type: 'text' },
              ],
            },
            {
              name: 'blockedCountries',
              type: 'text',
              label: 'Chặn theo quốc gia (mã ISO 2 ký tự, phân tách bằng dấu phẩy)',
              admin: {
                description:
                  'VD: CN,RU,KP. Cần header geo từ CDN/proxy (x-vercel-ip-country / cf-ipcountry).',
              },
            },
          ],
        },

        // ── Login security ───────────────────────────────────────────────
        {
          label: 'Đăng nhập',
          description: 'Chống dò mật khẩu (brute-force) + bảo vệ đăng nhập admin.',
          fields: [
            {
              name: 'bruteForceEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Khóa tài khoản/IP sau nhiều lần đăng nhập sai',
            },
            {
              name: 'maxLoginAttempts',
              type: 'number',
              defaultValue: 5,
              min: 1,
              label: 'Số lần sai tối đa',
            },
            {
              name: 'lockoutMinutes',
              type: 'number',
              defaultValue: 30,
              min: 1,
              label: 'Thời gian khóa (phút)',
            },
            {
              name: 'immediateBlockInvalidUsers',
              type: 'checkbox',
              defaultValue: true,
              label: 'Khóa ngay IP dò các username không tồn tại',
            },
            {
              name: 'enforce2fa',
              type: 'select',
              defaultValue: 'off',
              options: [
                { label: 'Tắt', value: 'off' },
                { label: 'Bắt buộc cho Admin', value: 'admin' },
                { label: 'Bắt buộc cho tất cả', value: 'all' },
              ],
              label: 'Bắt buộc 2FA (TOTP)',
            },
          ],
        },

        // ── Scanner ──────────────────────────────────────────────────────
        {
          label: 'Quét',
          description: 'Quét bảo mật định kỳ (media độc hại, cấu hình yếu).',
          fields: [
            {
              name: 'scanEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Bật quét bảo mật',
            },
            {
              name: 'scanMediaUploads',
              type: 'checkbox',
              defaultValue: true,
              label: 'Quét file tải lên (chặn đuôi/nội dung nguy hiểm)',
            },
            {
              name: 'blockedUploadExtensions',
              type: 'text',
              defaultValue: 'php,phtml,phar,exe,sh,bat,js,html,svg',
              label: 'Đuôi file cấm tải lên (phân tách bằng dấu phẩy)',
            },
            {
              name: 'alertEmail',
              type: 'email',
              label: 'Email nhận cảnh báo bảo mật',
            },
          ],
        },
      ],
    },
  ],
}
