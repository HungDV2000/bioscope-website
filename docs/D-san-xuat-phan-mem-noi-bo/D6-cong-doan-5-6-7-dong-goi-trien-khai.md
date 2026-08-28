# D6 — CÔNG ĐOẠN 5, 6, 7: ĐÓNG GÓI, TRIỂN KHAI, PHÁT HÀNH

---

# CÔNG ĐOẠN 5 — HOÀN THIỆN, ĐÓNG GÓI SẢN PHẨM

## 1. Phương thức đóng gói

Sản phẩm đóng gói bằng **Docker Compose** — toàn bộ hệ thống chạy được từ một
tệp cấu hình, không phụ thuộc cài đặt thủ công trên máy chủ.

| Dịch vụ | Vai trò |
|---|---|
| `db` | Cơ sở dữ liệu PostgreSQL |
| `cms` | Hệ quản trị và API |
| `frontend` | Website |
| `preview-proxy` | Xem trước nội dung trong quản trị |

Kèm hai ổ lưu trữ dữ liệu: `pgdata` cho cơ sở dữ liệu, `media` cho tệp tải lên.

### Tệp cấu hình đóng gói

| Tệp | Vai trò |
|---|---|
| `dv-cms/docker-compose.yml` | Định nghĩa bốn dịch vụ, mạng nội bộ, ổ dữ liệu |
| `dv-cms/.env.example` | Mẫu 28 biến môi trường, không chứa giá trị thật |
| `dv-cms/bootstrap-docker.sh` | Kịch bản khởi tạo |
| `dv-cms/ecosystem.frontend.config.cjs` | Cấu hình tiến trình |

## 2. Quy hoạch cổng

Toàn hệ thống dùng dải cổng **26xxx** để chạy chung máy chủ với dịch vụ khác mà
không xung đột.

| Cổng | Dịch vụ |
|---|---|
| 26432 | Cơ sở dữ liệu |
| 26081 | Hệ quản trị |
| 26080 | Website |

Cổng chỉ mở trên `127.0.0.1`, không mở ra Internet. Proxy ngược đứng trước và
xử lý chứng chỉ bảo mật.

## 3. Quản lý phiên bản cấu trúc dữ liệu

**25 tệp chuyển đổi cấu trúc**, mỗi tệp đều:

| Yêu cầu | Lý do |
|---|---|
| Chỉ thêm, không xoá | Không làm mất dữ liệu |
| Lặp lại được an toàn | Chạy nhầm hai lần không hỏng |
| Bọc giao dịch | Lỗi giữa chừng thì lùi sạch |
| Có câu lệnh kiểm chứng | Chạy xong biết ngay đúng hay sai |

Cấu trúc dữ liệu được trích từ kết quả chạy thật, **không viết tay theo suy đoán**
— quy tắc rút ra sau sự cố sai giá trị và sai tên cột. Chi tiết ở
[B5](../B-he-thong-website/B5-van-hanh.md).

---

# CÔNG ĐOẠN 6 — CÀI ĐẶT, CHUYỂN GIAO, HƯỚNG DẪN, BẢO TRÌ

## 4. Tài liệu cài đặt và triển khai

| Tài liệu | Nội dung |
|---|---|
| `dv-cms/docs/01-local-development.md` | Cài đặt trên máy cá nhân |
| `dv-cms/docs/02-deploy-vps-docker.md` | Triển khai lên máy chủ bằng Docker |
| `dv-cms/docs/06-deploy.md` | Quy trình triển khai |
| `dv-cms/docs/03-frontend-only-preview.md` | Xem trước riêng phần website |
| [B4](../B-he-thong-website/B4-cau-hinh-moi-truong.md) | Toàn bộ biến môi trường |
| [B5](../B-he-thong-website/B5-van-hanh.md) | Vận hành, chuyển đổi cấu trúc, sao lưu, khôi phục |

## 5. Tài liệu hướng dẫn sử dụng

| Tài liệu | Dung lượng | Đối tượng |
|---|---:|---|
| `dv-cms/docs/08-huong-dan-su-dung-cms.md` | 19.872 byte | Biên tập viên |
| `dv-cms/docs/Huong-dan-su-dung-CMS-Bioscope.docx` | 47.753 byte | Biên tập viên — bản Word bàn giao |

Bản `.docx` là **bản đóng gói bàn giao cho người dùng cuối**, định dạng đọc được
không cần công cụ kỹ thuật.

☐ *Nên xuất thêm bản PDF để lưu hồ sơ.*

## 6. Tài liệu kỹ thuật khác

| Tài liệu | Nội dung |
|---|---|
| `dv-cms/docs/04-backlog-ton-dong.md` | Kế hoạch công việc, ước lượng giờ công |
| `dv-cms/docs/05-better-editor-preview.md` | Cơ chế xem trước |
| `dv-cms/docs/07-security.md` | Module bảo mật |
| `dv-cms/docs/09-migration-localized-slug.md` | Chuyển đổi đường dẫn theo ngôn ngữ |
| `dv-cms/docs/10-api-danh-muc-nguyen-lieu.md` | Tài liệu tích hợp API cho bên ngoài |
| `dv-cms/docs/CMS_SYNC_README.md` | Đồng bộ giữa các hệ thống |

Tổng cộng **12 tài liệu kỹ thuật** lập trong quá trình phát triển, cộng **20
tài liệu** trong bộ hồ sơ này.

## 7. Cơ chế bảo trì

| Cơ chế | Có sẵn trong hệ thống |
|---|---|
| Sao lưu tự động theo lịch | ✅ Bật bằng cấu hình |
| Sao lưu thủ công từ quản trị | ✅ |
| Nhật ký thay đổi nội dung | ✅ Ghi ai sửa gì, khi nào |
| Nhật ký sự kiện bảo mật | ✅ |
| Bản ghi công việc chạy nền | ✅ Bốn loại công việc đều có nhật ký riêng |
| Thùng rác | ✅ Xoá mềm, khôi phục được |
| Bật tắt module | ✅ Ngay trong quản trị |
| Xoá bộ nhớ đệm | ✅ Ngay trong quản trị |

## 8. Chuyển giao vận hành

Hệ thống thiết kế để **người không phải lập trình viên vận hành được**:

| Việc | Làm ở đâu |
|---|---|
| Sửa nội dung mọi trang | Quản trị → Trang |
| Đổi liên hệ, chân trang, mạng xã hội | Quản trị → Cài đặt website |
| Đổi nhà cung cấp AI và model | Quản trị → Cài đặt AI |
| Cấp và thu hồi khoá API | Quản trị → Khoá API tích hợp |
| Đổi câu chào chat | Quản trị → Cài đặt chat |
| Bật tắt đăng nhập Google | Quản trị → Cài đặt đăng nhập |

Không hạng mục nào ở trên cần triển khai lại hệ thống.

---

# CÔNG ĐOẠN 7 — PHÁT HÀNH

## 9. Trạng thái phát hành

| Mục | Nội dung |
|---|---|
| Website | `https://bioscope.vn` · `https://www.bioscope.vn` |
| Hệ quản trị | `https://admin.bioscope.vn` |
| Trạng thái | **Đang vận hành** |
| Hạ tầng | Máy chủ riêng, Docker, proxy ngược có chứng chỉ bảo mật |

## 10. Quy mô vận hành thực tế

| Chỉ tiêu | Giá trị |
|---|---:|
| Nguyên liệu đang phục vụ | 1.557 |
| Trang website | 76 |
| Ngôn ngữ | 2 |
| Nhóm dữ liệu quản trị | ~35 |
| Bảng cơ sở dữ liệu | 403 |

## 11. Hình thức phân phối

Sản phẩm là **phần mềm chạy trên nền web**, phân phối qua truy cập trực tuyến,
không phân phối bản cài đặt.

Người dùng cuối:

| Nhóm | Truy cập qua |
|---|---|
| Khách tham quan | `bioscope.vn` |
| Thành viên B2B | Khu thành viên trên website |
| Biên tập viên, quản trị | `admin.bioscope.vn` |
| Nhân viên kinh doanh | Telegram, qua hệ thống trò chuyện |
| Hệ thống đối tác | API, bằng khoá được cấp |

---

## 12. Kết luận ba công đoạn

| Công đoạn | Tiêu chí | Đánh giá |
|---|---|---|
| **5** | Có phương thức đóng gói | ✅ Docker Compose, bốn dịch vụ |
| | Có quản lý phiên bản cấu trúc dữ liệu | ✅ 25 tệp có kiểm soát |
| **6** | Có tài liệu cài đặt | ✅ Ba tài liệu triển khai |
| | Có tài liệu hướng dẫn người dùng cuối | ✅ Bản Markdown và bản Word |
| | Có cơ chế bảo trì | ✅ Sao lưu, nhật ký, thùng rác |
| **7** | Sản phẩm đã phát hành | ✅ Đang vận hành trên tên miền chính thức |
| | Có người dùng thật | ✅ 1.557 nguyên liệu, thành viên B2B, đối tác qua API |

**Ba công đoạn đầy đủ bằng chứng.**
