<!--HOSO
phu_de: Bảng đối chiếu hồ sơ theo bảy công đoạn
pham_vi: Toàn bộ hồ sơ
ngay_lap: 03/09/2026
phien_ban: 1.1
nguoi_lap: Bộ phận Phát triển phần mềm — Công ty Bioscope
nguoi_duyet: Ban Giám đốc
lich_su: 1.0 | 03/09/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Bổ sung phụ lục trạng thái dự thảo DA4
-->
# BẢNG ĐỐI CHIẾU HỒ SƠ THEO CÔNG ĐOẠN

*Tài liệu chung — dùng khi kiểm tra tính đầy đủ của bộ hồ sơ.*

Tài liệu này trả lời đúng một câu hỏi: **với mỗi công đoạn sản xuất phần mềm, công ty có tài liệu nào chứng minh, và bằng chứng gốc nằm ở đâu.**

Người kiểm tra nên đọc tài liệu này trước, rồi mở các tài liệu được dẫn chiếu.

---

## 1. Đối chiếu tổng quát

| Công đoạn | DA1 Website & CMS | DA2 AI chuẩn hoá dữ liệu | DA3 Chatbot AI |
| :---- | :----: | :----: | :----: |
| 1. Xác định yêu cầu | ✅ | ✅ | ✅ |
| 2. Phân tích và thiết kế | ✅ | ✅ | ✅ |
| 3. Lập trình, viết mã lệnh | ✅ | ✅ | ✅ |
| 4. Kiểm tra, thử nghiệm | ✅ | ✅ | ✅ |
| 5. Hoàn thiện, đóng gói | ✅ | ✅ | ✅ |
| 6. Cài đặt, chuyển giao, hướng dẫn, bảo trì | ✅ | ✅ | ✅ |
| 7. Phát hành, phân phối | ✅ | ✅ | ✅ |

Cả ba dự án đi đủ bảy công đoạn.

---

## 2. Đối chiếu chi tiết — Công đoạn 1: Xác định yêu cầu

| Dự án | Tài liệu chứng minh | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 | `DA1-website-va-cms/DA1-02-cd1-xac-dinh-yeu-cau.md` | Tài liệu khảo sát tư vấn thiết kế website; các trao đổi yêu cầu với ban giám đốc và bộ phận kinh doanh |
| DA2 | `DA2-ai-chuan-hoa-du-lieu/DA2-02-cd1-xac-dinh-yeu-cau.md` | Hiện trạng nhập liệu thủ công trước khi có hệ thống; khối lượng hồ sơ nguyên liệu cần chuẩn hoá |
| DA3 | `DA3-chatbot-ai-da-kenh/DA3-02-cd1-xac-dinh-yeu-cau.md` | Hiện trạng trả lời khách thủ công qua nhiều kênh rời rạc; tài liệu yêu cầu ban đầu của dự án |

**Cách kiểm chứng:** mỗi yêu cầu có mã `YC-xx`. Mở tài liệu công đoạn 4 của cùng dự án, mỗi ca kiểm thử đều dẫn chiếu ngược về một mã `YC-xx`. Hai chiều phải khớp.

---

## 3. Đối chiếu chi tiết — Công đoạn 2: Phân tích và thiết kế

| Dự án | Tài liệu chứng minh | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 | `DA1-03-cd2-thiet-ke-kien-truc.md`<br>`DA1-04-cd2-thiet-ke-du-lieu.md`<br>`DA1-05-cd2-thiet-ke-giao-dien-va-luong.md` | Cấu trúc thư mục mã nguồn; định nghĩa 51 nhóm dữ liệu trong mã; cấu trúc bảng thật trong cơ sở dữ liệu |
| DA2 | `DA2-03`, `DA2-04`, `DA2-05` | Định nghĩa hàng đợi công việc AI; cấu hình nhà cung cấp mô hình; luồng xử lý tệp trong mã |
| DA3 | `DA3-03`, `DA3-04`, `DA3-05` | Tệp định nghĩa hạ tầng nhiều dịch vụ; 44 tệp định nghĩa quy trình tự động hoá; lược đồ cơ sở dữ liệu |

**Cách kiểm chứng:** mở tài liệu thiết kế dữ liệu, chọn ngẫu nhiên một bảng, đối chiếu với cấu trúc bảng thật:

```bash
# DA1/DA2
docker exec -i dvcms-db psql -U dvcms -d dvcms -c "\d ingredients"
```

Tên trường, kiểu dữ liệu, ràng buộc phải khớp với tài liệu.

---

## 4. Đối chiếu chi tiết — Công đoạn 3: Lập trình

| Dự án | Tài liệu chứng minh | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 + DA2 | `DA1-06-cd3-lap-trinh-va-nhat-ky.md`<br>`DA2-06-cd3-lap-trinh-va-nhat-ky.md` | Kho mã nguồn, 218 lần ghi nhận thay đổi, 15/06/2026 → 31/08/2026 |
| DA3 | `DA3-06-cd3-lap-trinh-va-nhat-ky.md` | Kho mã nguồn, 163 lần ghi nhận thay đổi, 06/02/2026 → 12/06/2026 |

**Cách kiểm chứng:**

```bash
# Toàn bộ lịch sử phát triển, có mốc thời gian và người thực hiện
git log --format='%ad | %an | %s' --date=short

# Khối lượng thay đổi từng tháng
git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c

# Nội dung thay đổi ở mức từng dòng của một lần ghi nhận bất kỳ
git show <mã ghi nhận>
```

Đây là bằng chứng mạnh nhất trong toàn bộ hồ sơ: **381 lần ghi nhận trải trên 7 tháng liên tục**, mỗi lần có mốc thời gian riêng. Lịch sử này phải tích luỹ theo thời gian thật, không dựng ngược lại được.

---

## 5. Đối chiếu chi tiết — Công đoạn 4: Kiểm thử

| Dự án | Tài liệu chứng minh | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 | `DA1-07-cd4-kiem-thu-va-uat.md` | Kết quả chạy kiểm tra kiểu dữ liệu và dựng bản phát hành; ghi nhận sửa lỗi trong lịch sử mã nguồn |
| DA2 | `DA2-07-cd4-kiem-thu-va-uat.md` | Nhật ký từng công việc AI lưu trong hệ quản trị, có ghi từng bước xử lý |
| DA3 | `DA3-07-cd4-kiem-thu-va-uat.md` | Quy trình kiểm thử tự động `WF10e_rag-chat-tester`, `WF10f_test-harness`, `WF99a_chat-tester`; thư mục `tests/` |

**Cách kiểm chứng:** các lần ghi nhận thay đổi có tiền tố `fix(...)` chính là bằng chứng lỗi đã được phát hiện qua kiểm thử rồi sửa:

```bash
git log --format='%ad | %s' --date=short | grep '^.*| fix'
```

---

## 6. Đối chiếu chi tiết — Công đoạn 5: Đóng gói

| Dự án | Tài liệu chứng minh | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 + DA2 | `DA1-08`, `DA2-08` | `Dockerfile`, `docker-compose.yml` trong kho mã nguồn |
| DA3 | `DA3-08` | `docker-compose.yml` định nghĩa 6 dịch vụ; các `Dockerfile` tương ứng |

**Cách kiểm chứng:** tệp định nghĩa đóng gói nằm trong kho mã nguồn và có lịch sử sửa đổi riêng — chứng tỏ quy trình đóng gói do đội tự xây dựng và tinh chỉnh dần.

---

## 7. Đối chiếu chi tiết — Công đoạn 6: Cài đặt, chuyển giao, bảo trì

| Dự án | Tài liệu chứng minh | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 + DA2 | `DA1-08`, `DA1-09`, `DA1-10`<br>`DA2-08`, `DA2-09`, `DA2-10` | 28 tệp kịch bản chuyển đổi cấu trúc dữ liệu trong `dv-cms/scripts/`; hệ thống đang vận hành |
| DA3 | `DA3-08`, `DA3-09`, `DA3-10` | Thư mục `scripts/`, `sql/`; tài liệu triển khai trong kho mã nguồn |

**Cách kiểm chứng:** mỗi kịch bản chuyển đổi cấu trúc dữ liệu là một lần nâng cấp hệ thống thật:

```bash
ls dv-cms/scripts/*.sql | wc -l    # 28 lần thay đổi cấu trúc dữ liệu
```

Mỗi tệp có phần ghi chú nêu rõ thay đổi gì, vì sao. Đây là bằng chứng của công đoạn bảo trì liên tục.

---

## 8. Đối chiếu chi tiết — Công đoạn 7: Phát hành

| Dự án | Hình thức | Bằng chứng gốc đối chiếu |
| :---- | :---- | :---- |
| DA1 | Cổng thông tin công khai | `bioscope.vn` — truy cập được, có nội dung thật |
| DA1 | Hệ quản trị nội bộ | `admin.bioscope.vn` — có tài khoản người dùng thật |
| DA2 | Chức năng trong hệ quản trị | Bản ghi công việc AI đã chạy, có kết quả thật trong cơ sở dữ liệu |
| DA3 | Khung chat trên web và các kênh nhắn tin | Hội thoại thật với khách hàng lưu trong cơ sở dữ liệu |

---

## 9. Danh mục tài liệu đầy đủ

### 9.1 Hồ sơ chung — 6 tài liệu

| # | Tệp | Nội dung |
| :---- | :---- | :---- |
| 1 | `00-1-thuyet-minh-nang-luc-va-doi-ngu.md` | Khẳng định tự phát triển, đối chiếu nhân sự, ranh giới tự viết / công cụ |
| 2 | `00-2-quy-trinh-san-xuat-phan-mem-noi-bo.md` | Bảy công đoạn: việc làm, đầu ra, bằng chứng |
| 3 | `00-3-doi-chieu-ho-so-theo-cong-doan.md` | Tài liệu đang đọc |
| 4 | `00-4-ha-tang-cong-cu-va-moi-truong.md` | Máy chủ, công cụ, môi trường, chi phí hạ tầng |
| 5 | `00-5-quy-chuan-ma-nguon-va-quan-ly-phien-ban.md` | Quy chuẩn viết mã, quản lý phiên bản, quy trình đổi cấu trúc dữ liệu |
| 6 | `00-6-ho-so-chi-phi-phat-trien.md` | **Chi phí nhân công, hạ tầng, dịch vụ; căn cứ phân bổ; đối chiếu hoá đơn** |

### 9.2 Mỗi dự án — 10 tài liệu

| # | Hậu tố tệp | Công đoạn |
| :---- | :---- | :---- |
| 1 | `-01-thuyet-minh-san-pham` | — |
| 2 | `-02-cd1-xac-dinh-yeu-cau` | 1 |
| 3 | `-03-cd2-thiet-ke-kien-truc` | 2 |
| 4 | `-04-cd2-thiet-ke-du-lieu` | 2 |
| 5 | `-05-cd2-thiet-ke-giao-dien-va-luong` | 2 |
| 6 | `-06-cd3-lap-trinh-va-nhat-ky` | 3 |
| 7 | `-07-cd4-kiem-thu-va-uat` | 4 |
| 8 | `-08-cd5-6-7-dong-goi-trien-khai` | 5, 6, 7 |
| 9 | `-09-huong-dan-su-dung` | 6 |
| 10 | `-10-tra-cuu-ky-thuat` | 3, 6 |

**Tổng cộng sau khi bổ sung DA4: 6 + 40 + 1 mục lục = 47 tài liệu.** DA4 hiện là hồ sơ thiết kế, checklist và biểu mẫu; không tính là bằng chứng đã hoàn tất công đoạn 3–7.

### 9.3 DA4 — trạng thái theo công đoạn

| Công đoạn | Tài liệu DA4 | Trạng thái | Bằng chứng còn thiếu |
| :---- | :---- | :---- | :---- |
| 1. Xác định yêu cầu | `DA4-02-cd1-xac-dinh-yeu-cau.md` | Dự thảo chờ phê duyệt | Biên bản duyệt phạm vi, role, dataScope, câu hỏi và báo cáo ưu tiên |
| 2. Phân tích và thiết kế | `DA4-03`, `DA4-04`, `DA4-05` | Dự thảo chờ phê duyệt | Schema `OPS_SHEET_ID`, ma trận quyền, thiết kế module nghiệp vụ đã ký |
| 3. Lập trình | `DA4-06` | Mới có kế hoạch và chuẩn mã | Project Apps Script, commit/version, code review, secret scan |
| 4. Kiểm thử | `DA4-07` | Có bộ ca, chưa chạy | Kết quả thật, log, tệp mẫu, chữ ký UAT |
| 5. Đóng gói | `DA4-08` phần A | Có checklist, chưa thực hiện | Release package, checksum, version/deployment record |
| 6. Cài đặt/chuyển giao | `DA4-08` phần B, `DA4-09`, `DA4-10` | Có hướng dẫn, chưa thực hiện | Biên bản tài nguyên, quyền, bàn giao và diễn tập rollback |
| 7. Phát hành | `DA4-08` phần C | Chưa phát hành | UAT sign-off, webhook/trigger production, thông báo phát hành và log đầu tiên |

> **Quy tắc đối chiếu DA4:** không dùng mã nguồn, commit, test hoặc log vận hành của DA3 để lấp các ô còn thiếu của DA4. Hai dự án có kiến trúc và vòng đời bằng chứng khác nhau.

---

## 10. Danh sách kiểm tra trước khi nộp

| # | Việc | Trạng thái |
| :---- | :---- | :---- |
| 1 | Điền bảng đối chiếu danh tính kỹ thuật ↔ nhân sự trong `00-1` mục 2 | ☐ |
| 2 | Đính kèm hợp đồng lao động, quyết định phân công của từng người có tên | ☐ |
| 3 | Đính kèm chứng từ chi trả lương và bảo hiểm xã hội | ☐ |
| 4 | Ký và đóng dấu phần cam kết cuối `00-1` | ☐ |
| 5 | Điền kết quả thật vào các ca kiểm thử ở tài liệu `-07` của ba dự án | ☐ |
| 6 | Ký biên bản nghiệm thu ở tài liệu `-07` của ba dự án | ☐ |
| 7 | Chuyển kho mã nguồn về tài khoản tổ chức, hoặc lập biên bản xác nhận quyền sở hữu | ☐ |
| 8 | Sao lưu toàn bộ kho mã nguồn ra bản lưu trữ có mốc thời gian | ☐ |
| 9 | **Điền hồ sơ chi phí `00-6`: bảng kê nhân công, hạ tầng, dịch vụ** | ☐ |
| 10 | **Đối chiếu chi phí dịch vụ AI trong hệ thống với hoá đơn nhà cung cấp** | ☐ |
| 11 | Điền kết quả kiểm thử đối chiếu tài liệu gốc ở `DA2-07` mục 4 | ☐ |
| 12 | Chạy bộ ca kiểm thử an toàn `DA3-07` mục 3, ghi kết quả | ☐ |
| 13 | Đối chiếu lại văn bản pháp lý đang có hiệu lực tại thời điểm nộp | ☐ |
| 14 | Dựng bản `.docx` mới nhất từ các tệp `.md` | ☐ |
| 15 | Với DA4: phê duyệt yêu cầu/thiết kế trước khi đổi phiên bản hồ sơ từ `0.1` | ☐ |
| 16 | Với DA4: chỉ đánh dấu công đoạn 3–7 hoàn tất sau khi có bằng chứng riêng | ☐ |

Tám mục đầu là việc của công ty, không phải việc kỹ thuật. Hồ sơ kỹ thuật dù đầy đủ đến đâu, thiếu bảy mục này thì vẫn không chứng minh được **công ty** tự phát triển — chỉ chứng minh được **có ai đó** tự phát triển.
