# HỒ SƠ HỆ THỐNG BIOSCOPE

Bộ tài liệu cho website **bioscope.vn** và hệ thống quản trị **admin.bioscope.vn**.

| Ngày lập | 28/08/2026 |
|---|---|
| Phạm vi | Toàn bộ hệ thống trong thư mục `dv-cms/` |
| Mã nguồn | https://github.com/HungDV2000/bioscope-website |
| Số tài liệu | 21 — mỗi tài liệu có bản `.md` và bản `.docx` |

---

## Cấu trúc thư mục

```
docs/
├── README.md                        tài liệu này
├── A-ai-cap-nhat-san-pham/          4 tài liệu
├── B-he-thong-website/              6 tài liệu
├── C-chatbot-ai-tich-hop/           3 tài liệu
├── D-san-xuat-phan-mem-noi-bo/      7 tài liệu
└── _cong-cu/                        công cụ dựng bản .docx
```

Mỗi tài liệu có hai bản: `.md` để sửa và theo dõi thay đổi, `.docx` để in và bàn giao.
**Sửa ở bản `.md`**, rồi dựng lại `.docx` — xem mục cuối.

---

## Bộ A — AI cập nhật sản phẩm

Dành cho lập trình viên hoặc tác nhân AI cần đọc và ghi dữ liệu nguyên liệu.

| File | Nội dung |
|---|---|
| [A1](A-ai-cap-nhat-san-pham/A1-mo-hinh-du-lieu-nguyen-lieu.md) | Mô hình dữ liệu nguyên liệu — toàn bộ trường, kiểu, ràng buộc |
| [A2](A-ai-cap-nhat-san-pham/A2-hop-dong-ghi-du-lieu.md) | Hợp đồng ghi dữ liệu — đường ghi, xác thực, chống trùng |
| [A3](A-ai-cap-nhat-san-pham/A3-quy-trinh-hien-co.md) | Bốn luồng nạp dữ liệu đang vận hành |
| [A4](A-ai-cap-nhat-san-pham/A4-quy-tac-bat-buoc.md) | Ranh giới cứng khi để AI đụng vào dữ liệu sản phẩm |

## Bộ B — Hệ thống website

Dành cho người tiếp quản, bảo trì hoặc mở rộng hệ thống.

| File | Nội dung |
|---|---|
| [B1](B-he-thong-website/B1-kien-truc-tong-quan.md) | Kiến trúc, bản đồ module, luồng dữ liệu |
| [B2](B-he-thong-website/B2-mo-hinh-du-lieu.md) | Toàn bộ nhóm dữ liệu và mức độ riêng tư |
| [B3](B-he-thong-website/B3-danh-muc-trang.md) | Danh mục trang và chức năng |
| [B4](B-he-thong-website/B4-cau-hinh-moi-truong.md) | Biến môi trường và cấu hình |
| [B5](B-he-thong-website/B5-van-hanh.md) | Build, triển khai, migration, sao lưu, khôi phục |
| [B6](B-he-thong-website/B6-bao-mat-quyen-rieng-tu.md) | Bảo mật và dữ liệu cá nhân |

## Bộ C — Chatbot AI tích hợp

Dành cho bên phát triển chatbot và bộ phận vận hành.

| File | Nội dung |
|---|---|
| [C1](C-chatbot-ai-tich-hop/C1-kien-truc-chat-tren-web.md) | Hệ thống chat trên website |
| [C2](C-chatbot-ai-tich-hop/C2-api-du-lieu-cho-chatbot.md) | API dữ liệu cho chatbot |
| [C3](C-chatbot-ai-tich-hop/C3-ranh-gioi-trach-nhiem.md) | Phân định trách nhiệm vận hành |

## Bộ D — Sản xuất phần mềm nội bộ

Chứng minh sản phẩm do đội ngũ nội bộ của công ty phát triển.
Dựng theo bảy công đoạn sản xuất phần mềm.

| File | Công đoạn |
|---|---|
| [D1](D-san-xuat-phan-mem-noi-bo/D1-thuyet-minh-san-pham-va-doi-ngu.md) | Thuyết minh sản phẩm và đội ngũ |
| [D2](D-san-xuat-phan-mem-noi-bo/D2-cong-doan-1-xac-dinh-yeu-cau.md) | 1 — Xác định yêu cầu |
| [D3](D-san-xuat-phan-mem-noi-bo/D3-cong-doan-2-phan-tich-thiet-ke.md) | 2 — Phân tích và thiết kế |
| [D4](D-san-xuat-phan-mem-noi-bo/D4-cong-doan-3-lap-trinh.md) | 3 — Lập trình, viết mã lệnh |
| [D5](D-san-xuat-phan-mem-noi-bo/D5-cong-doan-4-kiem-thu.md) | 4 — Kiểm tra, thử nghiệm |
| [D6](D-san-xuat-phan-mem-noi-bo/D6-cong-doan-5-6-7-dong-goi-trien-khai.md) | 5, 6, 7 — Đóng gói, triển khai, phát hành |
| [D7](D-san-xuat-phan-mem-noi-bo/D7-ho-so-doi-ngu-noi-bo.md) | Hồ sơ đội ngũ — **mẫu chờ nhân sự điền** |

---

## Tài liệu kỹ thuật đã có trước

Bộ hồ sơ này **không chép lại** 12 tài liệu kỹ thuật trong `dv-cms/docs/`, chỉ dẫn chiếu tới.

| Tài liệu | Vị trí |
|---|---|
| Đặc tả yêu cầu hệ thống | `SRS_BIOSCOPE.md` |
| Khảo sát và tư vấn thiết kế | `BIOSCOPE - Tài liệu khảo sát tư vấn thiết kế website.md` |
| Phát triển tại máy cá nhân | `dv-cms/docs/01-local-development.md` |
| Triển khai VPS Docker | `dv-cms/docs/02-deploy-vps-docker.md`, `06-deploy.md` |
| Kế hoạch công việc | `dv-cms/docs/04-backlog-ton-dong.md` |
| Bảo mật | `dv-cms/docs/07-security.md` |
| Hướng dẫn sử dụng CMS | `dv-cms/docs/08-huong-dan-su-dung-cms.md` |
| API danh mục cho chatbot | `dv-cms/docs/10-api-danh-muc-nguyen-lieu.md` |

---

## Quy ước

- Mọi số liệu trong bộ hồ sơ này **trích từ mã nguồn và lịch sử phát triển thật**, không ước lượng.
- Chỗ nào cần dữ liệu từ bộ phận khác thì để **ô trống có đánh dấu**, không điền thay.
- Tài liệu nào lập sau thời điểm phát triển đều **ghi rõ ngày lập thật**.

---

## Dựng lại bản .docx

Sau khi sửa bất kỳ file `.md` nào:

```bash
cd docs/_cong-cu && node run.js
```

Lệnh này quét toàn bộ thư mục con và dựng lại đúng file `.docx` tương ứng, giữ
nguyên định dạng cho cả 21 tài liệu.

Yêu cầu: thư viện `docx` của Node và font **Be Vietnam Pro** đã cài trên máy.
