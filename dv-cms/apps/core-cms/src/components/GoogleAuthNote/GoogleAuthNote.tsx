/**
 * Nhắc admin dán đúng "Authorized redirect URI" vào Google Cloud Console —
 * sai chỗ này là lỗi redirect_uri_mismatch, rất hay gặp.
 */
export function GoogleAuthNote() {
  const frontend = (process.env.FRONTEND_URL || 'https://bioscope.vn').replace(/\/$/, '')
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
          Mục <em>Authorized redirect URIs</em> dán đúng chuỗi này:
          <br />
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
            {frontend}/api/auth/google/callback
          </code>
        </li>
        <li>
          Mục <em>Authorized JavaScript origins</em> dán: <code>{frontend}</code>
        </li>
        <li>Copy Client ID + Client Secret dán vào 2 ô phía trên rồi Lưu.</li>
      </ol>
      <p style={{ margin: '10px 0 0', opacity: 0.75 }}>
        Tài khoản đăng nhập bằng Google dùng được ngay (chat, sửa hồ sơ) nhưng khu tài liệu B2B vẫn
        cần admin duyệt trạng thái sang <em>Approved</em>.
      </p>
    </div>
  )
}
