<!--HOSO
phu_de: Kế hoạch quản lý dự án phần mềm
pham_vi: Toàn bộ hồ sơ — bốn dự án
ngay_lap: 12/01/2026
phien_ban: 1.1
nguoi_lap: A Hùng — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 12/01/2026 | Ban hành lần đầu
lich_su: 1.1 | 03/09/2026 | Cập nhật tiến độ thực tế bốn dự án và bổ sung tiêu chí kết thúc
-->
# KẾ HOẠCH QUẢN LÝ DỰ ÁN PHẦN MỀM

*Tài liệu chung — cách OPTIMAI tổ chức, theo dõi và kiểm soát công việc.*

---

## 1. Mục đích

Ba tài liệu nền trả lời ba câu hỏi khác nhau:

| Tài liệu | Trả lời |
| :---- | :---- |
| `00-2` Quy trình sản xuất phần mềm | Làm phần mềm theo các bước nào |
| `00-5` Quy chuẩn mã nguồn | Viết mã và quản lý thay đổi theo quy tắc nào |
| **`00-9` Kế hoạch quản lý dự án** | **Tổ chức, theo dõi và kiểm soát công việc ra sao** |

Tài liệu này là mảnh còn thiếu: quy trình nói *làm gì*, quy chuẩn nói *làm thế nào*, kế hoạch nói *ai làm, khi nào, và xử lý ra sao khi có thay đổi*.

---

## 2. Phạm vi dự án

### 2.1 Bốn dự án trong hợp đồng

| Dự án | Sản phẩm | Trạng thái |
| :---- | :---- | :---- |
| **DA1** | Website Bioscope và Hệ quản trị nội dung | Đã vận hành |
| **DA2** | Hệ thống AI chuẩn hoá dữ liệu sản phẩm | Đã vận hành |
| **DA3** | Chatbot AI đa kênh BioBot | Đã vận hành |
| **DA4** | Chatbot Telegram và Google Workspace | **Thiết kế, chưa triển khai** |

### 2.2 Ranh giới phạm vi

| Thuộc phạm vi | Ngoài phạm vi |
| :---- | :---- |
| Phân tích, thiết kế, lập trình, kiểm thử | Nhập liệu nội dung nghiệp vụ *(Bioscope thực hiện)* |
| Đóng gói, cài đặt, cấu hình | Mua tên miền, thuê máy chủ *(Bioscope chi trả)* |
| Hướng dẫn sử dụng, bàn giao | Đào tạo dài hạn ngoài buổi bàn giao |
| Bảo hành theo thời hạn hợp đồng | Vận hành hằng ngày sau bàn giao |
| Tài liệu kỹ thuật 52 tài liệu | Hồ sơ kế toán, thuế của Bioscope |

Phạm vi chi tiết từng dự án nằm ở tài liệu `-02` tương ứng, dẫn chiếu vào phụ lục hợp đồng — xem `00-7` mục 2.2.

---

## 3. Tổ chức và trách nhiệm

### 3.1 Đội thực hiện — OPTIMAI

| Vai trò | Nhân sự | Trách nhiệm | Quyền quyết định |
| :---- | :---- | :---- | :---- |
| **Product Owner** | A Hùng | Làm việc với Bioscope, chốt yêu cầu, quyết định phạm vi, chủ trì nghiệm thu | Chốt phạm vi trong giới hạn hợp đồng |
| **Team phát triển** | Quân | Thiết kế kiến trúc và dữ liệu, quyết định kỹ thuật, lập trình, đóng gói, triển khai | Quyết định kỹ thuật không ảnh hưởng phạm vi |
| **Team phát triển** | Dưỡng | Thiết kế giao diện và luồng, lập trình, tài liệu thao tác | Như trên |
| **QA** | Thu | Dựng bộ ca kiểm thử, chạy kiểm thử, ghi nhận lỗi, xác nhận đạt | **Quyền chặn phát hành** khi tiêu chí bắt buộc không đạt |

> **Quyền chặn phát hành của QA là quy tắc cứng.** Ba tiêu chí sau không đạt thì không phát hành, không có ngoại lệ và không ai được bỏ qua:
>
> | Dự án | Tiêu chí |
> | :---- | :---- |
> | DA2 | Không có trường trích xuất nào bị bịa dữ liệu |
> | DA3 | Không có câu hỏi y tế nào lọt qua chốt chặn |
> | DA3 | Không có dữ liệu chéo vai trò nào lộ |

### 3.2 Phía Bioscope

| Vai trò | Trách nhiệm |
| :---- | :---- |
| Ban Giám đốc | Phê duyệt yêu cầu, phê duyệt thay đổi phạm vi, xác nhận nghiệm thu |
| Bộ phận kinh doanh | Cung cấp yêu cầu nghiệp vụ, tham gia nghiệm thu |
| Bộ phận kỹ thuật sản phẩm | Xác nhận tính chính xác của thông số kỹ thuật *(DA2)* |
| Kế toán trưởng | Xác nhận yêu cầu về dữ liệu tài chính *(DA3)* |

### 3.3 Ma trận trách nhiệm theo công đoạn

Chi tiết ở `00-1` mục 4.1.

---

## 4. Tiến độ theo mốc

### 4.1 Thực tế đã thực hiện

| Dự án | Bắt đầu | Kết thúc | Thời gian |
| :---- | :---- | :---- | :---- |
| **DA3** | 06/02/2026 | 12/06/2026 | ~4,2 tháng |
| **DA1** | 15/06/2026 | đang tiếp tục | ~2,6 tháng *(tới 31/08)* |
| **DA2** | 09/07/2026 | đang tiếp tục | ~1,8 tháng *(tới 31/08)* |
| **DA4** | 03/09/2026 | chưa xác định | mới ở giai đoạn thiết kế |

DA1 và DA2 chạy song song trên cùng kho mã nguồn. DA3 làm trước và kết thúc trước khi DA1 bắt đầu.

### 4.2 Mốc kiểm soát mỗi dự án

| Mốc | Điều kiện đạt | Bằng chứng |
| :---- | :---- | :---- |
| **M1** Chốt yêu cầu | Bioscope phê duyệt tài liệu `-02` | Chữ ký trang cuối `-02` |
| **M2** Chốt thiết kế | Ban hành `-03` `-04` `-05` | Trang bìa các tài liệu thiết kế |
| **M3** Hoàn thành lập trình | Qua bốn kiểm tra bắt buộc ở `00-5` mục 2 | Nhật ký `-06`, lịch sử kho mã nguồn |
| **M4** Hoàn thành kiểm thử | Chạy hết bộ ca, **không còn lỗi nặng** | Bảng kết quả trong `-07` |
| **M5** Nghiệm thu | Bioscope ký biên bản nghiệm thu | Biên bản trong `-07` |
| **M6** Bàn giao | Ký biên bản bàn giao, chuyển đủ 9 hạng mục | Biên bản trong `-08` |
| **M7** Kết thúc bảo hành | Hết thời hạn bảo hành theo hợp đồng | Biên bản kết thúc bảo hành |

### 4.3 Trạng thái mốc hiện tại

| Mốc | DA1 | DA2 | DA3 | DA4 |
| :---- | :----: | :----: | :----: | :----: |
| M1 Chốt yêu cầu | ☐ | ☐ | ☐ | — |
| M2 Chốt thiết kế | ✅ | ✅ | ✅ | 📝 dự thảo |
| M3 Hoàn thành lập trình | ✅ | ✅ | ✅ | ☐ |
| M4 Hoàn thành kiểm thử | ☐ | ☐ | ☐ | ☐ |
| M5 Nghiệm thu | ☐ | ☐ | ☐ | ☐ |
| M6 Bàn giao | ☐ | ☐ | ☐ | ☐ |
| M7 Kết thúc bảo hành | ☐ | ☐ | ☐ | ☐ |

> **M1 chưa đạt dù M2 và M3 đã xong.** Đây là tình trạng thực tế cần khắc phục: phần mềm đã dựng xong và đang vận hành, nhưng tài liệu yêu cầu chưa có chữ ký phê duyệt của Bioscope. Ký bổ sung là việc thủ tục, nhưng bỏ qua thì chuỗi *hợp đồng → yêu cầu → nghiệm thu* bị đứt ở mắt xích đầu.

---

## 5. Quản lý thay đổi phạm vi

### 5.1 Vì sao cần

Dự án phần mềm luôn phát sinh yêu cầu mới trong lúc làm. Không có cơ chế kiểm soát thì phạm vi phình dần, tiến độ trượt, và cuối dự án không ai biết đã cam kết những gì.

### 5.2 Quy trình

```
   Bioscope nêu yêu cầu mới, hoặc OPTIMAI đề xuất thay đổi
              ↓
   Product Owner ghi nhận vào Sổ yêu cầu thay đổi (mục 5.4)
              ↓
   Team phát triển đánh giá: khối lượng, ảnh hưởng thiết kế, rủi ro
              ↓
   ┌──────────────────────────────────────────────┐
   │ Trong phạm vi hợp đồng?                       │
   │   Có  → Product Owner quyết định, đưa vào     │
   │         đợt phát triển phù hợp                │
   │   Không → trình Ban Giám đốc HAI BÊN          │
   │           quyết định về phạm vi và chi phí    │
   └──────────────────────────────────────────────┘
              ↓
   Cập nhật tài liệu -02, và -07 nếu ảnh hưởng ca kiểm thử
              ↓
   Ghi vào Lịch sử sửa đổi của tài liệu bị ảnh hưởng
```

### 5.3 Phân loại thay đổi

| Loại | Ví dụ | Ai quyết định |
| :---- | :---- | :---- |
| **Làm rõ** — không đổi phạm vi | Diễn đạt lại yêu cầu cho rõ nghĩa | Product Owner |
| **Điều chỉnh nhỏ** — trong phạm vi | Đổi thứ tự trường, đổi nhãn hiển thị | Product Owner |
| **Bổ sung** — mở rộng phạm vi | Thêm một nhóm chức năng mới | **Ban Giám đốc hai bên** |
| **Loại bỏ** — thu hẹp phạm vi | Bỏ một yêu cầu đã cam kết | **Ban Giám đốc hai bên** |

### 5.4 Sổ yêu cầu thay đổi

| Mã | Ngày | Nội dung | Người đề xuất | Loại | Ảnh hưởng | Quyết định | Tài liệu cập nhật |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| | | | | | | | |

*(Bảng để trống — ghi khi phát sinh.)*

---

## 6. Quản lý rủi ro

### 6.1 Rủi ro cấp dự án

| # | Rủi ro | Mức | Cách phòng | Trạng thái |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **Đội nhỏ, phụ thuộc cá nhân** | Cao | Tài liệu hoá đầy đủ; quy chuẩn mã nguồn; sổ tra cứu sự cố | Đang kiểm soát |
| 2 | Phạm vi phình do yêu cầu phát sinh | Cao | Quy trình quản lý thay đổi ở mục 5 | Đang kiểm soát |
| 3 | Dịch vụ AI bên ngoài đổi giá hoặc ngừng | Trung bình | Cấu hình động, đổi nhà cung cấp không cần sửa mã | Đã xử lý |
| 4 | Nền tảng nhắn tin đổi giao diện lập trình | Trung bình | Mỗi kênh một quy trình riêng | Đã xử lý |
| 5 | Chi phí gọi mô hình vượt dự kiến | Trung bình | Đếm đơn vị, ước tính chi phí từng lượt | Đã xử lý |
| 6 | Mất dữ liệu khi đổi cấu trúc cơ sở dữ liệu | **Cao** | Quy trình bảy bước ở `00-5` mục 5 | Đang kiểm soát |
| 7 | **Chế độ tự đồng bộ cấu trúc còn bật trên hệ thống thật** | **Cao** | Đặt biến tắt | **CHƯA XỬ LÝ** |
| 8 | Nghiệm thu kéo dài do thiếu người xác nhận | Trung bình | Xác định trước người ký ở mục 3.2 | Đang kiểm soát |

> **Rủi ro số 7 là rủi ro kỹ thuật duy nhất chưa xử lý.** Chi tiết và cách khắc phục ở `00-5` mục 5.5 và `DA1-08` phần C5. Cần quyết định trước lần phát hành tiếp theo.

### 6.2 Rủi ro cấp sản phẩm

Rủi ro riêng của từng dự án nằm ở tài liệu `-02` mục cuối:

| Dự án | Số rủi ro | Rủi ro nghiêm trọng nhất |
| :---- | :----: | :---- |
| DA1 | — | Rò rỉ dữ liệu qua giao diện lập trình công khai |
| DA2 | 8 | **Mô hình bịa dữ liệu kỹ thuật** |
| DA3 | 10 | **Trợ lý tư vấn y tế** · **lộ dữ liệu chéo vai trò** |

---

## 7. Trao đổi thông tin

| Nội dung | Giữa ai | Hình thức | Tần suất |
| :---- | :---- | :---- | :---- |
| Yêu cầu nghiệp vụ | Bioscope ↔ Product Owner | Trao đổi trực tiếp, ghi vào `-02` | Khi phát sinh |
| Tiến độ | Product Owner → Bioscope | Báo cáo mốc | Theo mốc M1–M7 |
| Vấn đề kỹ thuật | Trong đội OPTIMAI | Trao đổi trực tiếp | Hằng ngày |
| Kết quả kiểm thử | QA → Product Owner → Bioscope | Bảng kết quả trong `-07` | Cuối mỗi đợt |
| Sự cố sau bàn giao | Bioscope → OPTIMAI | Theo phân loại mức ở `-08` | Khi phát sinh |
| Thay đổi phạm vi | Hai bên | Sổ yêu cầu thay đổi, mục 5.4 | Khi phát sinh |

---

## 8. Quản lý chất lượng

| Lớp kiểm soát | Nội dung | Ở đâu |
| :---- | :---- | :---- |
| Quy chuẩn mã nguồn | Quy tắc viết mã, chú thích, đặt tên | `00-5` mục 1 |
| Kiểm tra tự động | Kiểm kiểu, soát lỗi tĩnh, dựng bản phát hành | `00-5` mục 2 |
| Kiểm thử chức năng | Bộ ca có mã, đối chiếu ngược về yêu cầu | `-07` từng dự án |
| Kiểm thử an toàn | Ca kiểm thử âm, có ca cố tình vượt rào | `-07` DA2, DA3 |
| Nghiệm thu người dùng | Bioscope dùng thử trên dữ liệu thật | `-07` mục cuối |
| Kiểm tra sau triển khai | Danh sách kiểm tra sau mỗi lần phát hành | `-08` phần B |

### Số lượng ca kiểm thử

| Dự án | Số ca | Trong đó ca âm |
| :---- | :----: | :----: |
| DA1 | 62 | 24 |
| DA2 | 63 | 26 |
| DA3 | 91 | 31 |
| **Tổng** | **216** | **81** |

Tỉ lệ ca âm cao là chủ ý: ca thử *"làm đúng thì chạy được"* chỉ chứng minh một nửa; ca thử *"làm sai thì bị chặn đúng chỗ"* mới là chỗ phần mềm hay hỏng.

---

## 9. Tiêu chí kết thúc dự án

Dự án được coi là kết thúc khi thoả **toàn bộ** các điều kiện:

| # | Điều kiện | Bằng chứng |
| :---- | :---- | :---- |
| 1 | Toàn bộ yêu cầu mức "Bắt buộc" đã dựng và chạy được | Ma trận truy vết trong `-02` |
| 2 | Bộ ca kiểm thử đã chạy hết, không còn lỗi nặng | Bảng kết quả trong `-07` |
| 3 | Ba tiêu chí bắt buộc của DA2 và DA3 đều đạt | `-07` mục nghiệm thu |
| 4 | Bioscope ký biên bản nghiệm thu | Biên bản trong `-07` |
| 5 | Đã bàn giao đủ 9 hạng mục | Biên bản trong `-08` |
| 6 | Hệ thống đang vận hành ổn định | Kiểm tra sau triển khai |
| 7 | Bộ hồ sơ 52 tài liệu đã bàn giao | Danh mục `00-8` mục 3 |
| 8 | Hết thời hạn bảo hành, không còn sự cố tồn đọng | Biên bản kết thúc bảo hành |

---

## 10. Bài học rút ra

Ghi lại để áp dụng cho dự án sau. Đây là mục thường bị bỏ, nhưng là mục duy nhất giúp đội làm tốt hơn ở lần tiếp theo.

| # | Bài học | Nguồn |
| :---- | :---- | :---- |
| 1 | **Ký phê duyệt yêu cầu trước khi lập trình.** Ký sau khi phần mềm chạy rồi là việc thủ tục, nhưng chuỗi bằng chứng bị đứt ở mắt xích đầu | Mốc M1 chưa đạt ở cả bốn dự án |
| 2 | **Cấu hình danh tính kho mã nguồn theo hòm thư công ty ngay từ đầu.** Để mặc định thì lịch sử không phân tách được theo người | `00-1` mục 4.3 |
| 3 | **Siết quy ước mô tả thay đổi ngay từ ngày đầu.** DA3 và giai đoạn đầu DA1 ghi rất sơ sài, phải bù bằng tài liệu | `00-1` mục 8 |
| 4 | **Nhóm vận hành nên làm ở giữa dự án, không để cuối.** DA3 làm ở giữa và nhờ đó chẩn đoán được mọi sự cố về sau | `DA3-06` mốc 3 |
| 5 | **Tách tác vụ nặng khỏi tiến trình phục vụ người dùng ngay từ thiết kế.** Gộp chung rồi tách sau rất tốn công | `DA2-03` QĐ-06 |
| 6 | **Mỗi quyết định thiết kế đều mở ra một loại hỏng mới.** Phải nghĩ tới nó ngay lúc quyết định | `DA2-03` mục 6.1 |
| 7 | **Đầu ra của mô hình ngôn ngữ không có hình dạng ổn định.** Phải có lớp chuẩn hoá ngay từ đầu | `DA2-06` mốc 2 |
| 8 | **Cơ chế an toàn phải viết bằng mã, không viết trong câu lệnh gửi mô hình** | `DA3-03` QĐ-03 |

---

## 11. Phê duyệt

| Bên | Vai trò | Họ tên | Ngày | Ký |
| :---- | :---- | :---- | :---- | :---- |
| OPTIMAI | Người lập — A Hùng, Product Owner | | | |
| OPTIMAI | Ban Giám đốc | | | |
| **Bioscope** | **Ban Giám đốc xác nhận** | | | |
