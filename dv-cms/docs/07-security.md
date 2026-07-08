# Module Security (kiểu Wordfence)

> Bảo mật **code-managed** (không cho editor sửa qua CMS). Firewall đặt ở frontend — nơi hứng traffic công khai; login-lockout đặt ở Payload.

## Thành phần

| Lớp | Vị trí | Chức năng |
|---|---|---|
| **WAF / Firewall** | `apps/bioscope-frontend/src/lib/security/` + `src/proxy.ts` | Chặn scanner/tấn công ở mọi request trang trước khi render |
| **Rate-limit API** | `src/lib/rate-limit.ts` | 5 req/phút/IP cho `/api/forms/submit` (đã có) |
| **DoS guard** | WAF | 240 req/phút/IP cho traffic trang (chỉnh bằng `SECURITY_RATE_MAX`) |
| **Brute-force login** | `packages/core/.../Users.ts` | Payload khóa tài khoản **15 phút sau 5 lần sai** |
| **Security headers** | `next.config.mjs` | CSP/HSTS/nosniff/Referrer/Permissions (mục 10 backlog) |

## Quy tắc WAF (`lib/security/config.ts`)
Thứ tự kiểm: allowlist IP → blocklist IP → bad-path → chữ ký tấn công → user-agent xấu → rate-limit.
- **Bad paths**: `/wp-*`, `/xmlrpc.php`, `/phpmyadmin`, `/.env` `/.git` `/.ssh`…, `*.php/asp/jsp`, shell/backdoor — site không dùng PHP/WP nên chặn thẳng.
- **Chữ ký tấn công** (trên path+query đã decode): path-traversal `../`, `/etc/passwd`, `<script`, `on*=`, `union select`, `base64_decode()`, `exec()/system()`, Log4Shell `${jndi:`.
- **User-agent**: sqlmap, nikto, nmap, masscan, acunetix, nessus, netsparker, zgrab…
- Chặn → **403** (429 nếu vượt rate-limit), kèm header `x-waf: <reason>` + log `[waf] blocked …`.

## Cấu hình (env, không qua CMS)
```
SECURITY_WAF=on|off            # bật/tắt firewall (mặc định on)
SECURITY_BLOCKED_IPS=1.2.3.4   # chặn IP (phẩy)
SECURITY_ALLOWED_IPS=          # IP tin cậy (bỏ qua mọi luật)
SECURITY_RATE_MAX=240          # req/phút/IP cho trang
```
⚠️ Rate-limit hiện **in-memory theo từng instance**. Nếu scale nhiều container, chuyển sang store dùng chung (Redis/Upstash). Cần nginx truyền `X-Forwarded-For` (đã có trong `docs/06-deploy.md`) để chặn đúng IP thật.

## Đã kiểm thử
`/wp-login.php`→403 · `/.env`→403 · `/?q=../../etc/passwd`→403 · UA `sqlmap`→403 · trang thường→200.

## Hardening tùy chọn (khi cần)
- reCAPTCHA v3 cho form (cần site key/secret).
- CSP siết bằng nonce (bỏ `unsafe-inline/eval`).
- Chặn theo quốc gia (cần dữ liệu geo-IP).
- 2FA cho admin (plugin Payload).
