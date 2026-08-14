/**
 * Nhắc admin dán đúng "Authorized redirect URI" vào Google Cloud Console —
 * sai chỗ này là lỗi redirect_uri_mismatch, rất hay gặp.
 */
export function GoogleAuthNote() {
  // Liệt kê MỌI tên miền website đang chạy: redirect URI phải khớp đúng tên
  // miền khách bấm đăng nhập, sai một ký tự là lỗi redirect_uri_mismatch /
  // google_state.
  const domains = Array.from(
    new Set(
      [process.env.FRONTEND_URL, process.env.NEXT_PUBLIC_SITE_URL, 'https://bioscope.vn']
        .filter(Boolean)
        .map((d) => (d as string).replace(/\/$/, '')),
    ),
  )
  const frontend = domains[0]
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-50)',
        borderRadius: 6,
        padding: '12px 14px',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <strong>Cấu hình bên Google Cloud Console</strong>
      <ol style={{ margin: '8px 0 0', paddingLeft: 18 }}>
        <li>
          Tạo <em>OAuth client ID</em> loại <em>Web application</em>.
        </li>
        <li>
          Mục <em>Authorized redirect URIs</em> — thêm <strong>tất cả</strong> dòng dưới đây (mỗi tên
          miền website một dòng; thiếu dòng nào thì đăng nhập từ tên miền đó sẽ lỗi):
          {domains.map((d) => (
            <div key={d}>
              <code
                style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '3px 7px',
                  background: 'var(--theme-elevation-100)',
                  borderRadius: 4,
                  userSelect: 'all',
                }}
              >
                {d}/api/auth/google/callback
              </code>
            </div>
          ))}
        </li>
        <li>
          Mục <em>Authorized JavaScript origins</em> dán tương ứng:{' '}
          {domains.map((d) => (
            <code key={d} style={{ marginRight: 6, userSelect: 'all' }}>
              {d}
            </code>
          ))}
        </li>
        <li>Copy Client ID + Client Secret dán vào 2 ô phía trên rồi Lưu.</li>
      </ol>
      <p
        style={{
          margin: '10px 0 0',
          padding: '8px 10px',
          background: 'var(--theme-elevation-100)',
          borderRadius: 4,
        }}
      >
        <strong>Bị lỗi “redirect_uri_mismatch”?</strong> Mở địa chỉ sau bằng CHÍNH tên miền khách hay
        dùng, nó in ra đúng chuỗi cần dán:{' '}
        <code style={{ userSelect: 'all' }}>{frontend}/api/auth/google/check</code>
      </p>
      <p style={{ margin: '10px 0 0', opacity: 0.75 }}>
        Tài khoản đăng nhập bằng Google dùng được ngay (chat, sửa hồ sơ) nhưng khu tài liệu B2B vẫn
        cần admin duyệt trạng thái sang <em>Approved</em>.
      </p>
    </div>
  )
}
