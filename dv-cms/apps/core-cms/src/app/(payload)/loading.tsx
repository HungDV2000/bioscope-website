/**
 * Loading cho khu admin Payload.
 *
 * Next.js hiện file này trong lúc chuyển giữa các trang admin (danh sách →
 * sửa, đổi collection...) thay vì để màn hình đứng im. Dùng inline style +
 * keyframe tự khai báo vì khu admin không nạp Tailwind của frontend; biến màu
 * `--theme-elevation-*` là của chính Payload nên tự hợp theme sáng/tối.
 */
export default function AdminLoading() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '60vh',
        width: '100%',
      }}
    >
      <style>{`@keyframes dv-admin-spin { to { transform: rotate(360deg) } }`}</style>
      <div
        aria-label="Đang tải…"
        role="status"
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '3px solid var(--theme-elevation-100, #e2e8e5)',
          borderTopColor: 'var(--theme-success-500, #008e4d)',
          animation: 'dv-admin-spin 0.7s linear infinite',
        }}
      />
    </div>
  )
}
