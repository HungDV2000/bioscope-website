<!--HOSO
phu_de: Chatbot AI đa kênh BioBot — Bioscope Assistants
pham_vi: Dự án DA3
ngay_lap: 15/01/2026
phien_ban: 1.2
nguoi_lap: HungDV — Product Owner, Công ty OPTIMAI
nguoi_duyet: Ban Giám đốc OPTIMAI và đại diện Công ty Bioscope
lich_su: 1.0 | 15/01/2026 | Ban hành lần đầu
lich_su: 1.1 | 18/04/2026 | Bổ sung nhóm yêu cầu mô-đun kế toán
lich_su: 1.2 | 05/06/2026 | Bổ sung nhóm yêu cầu trợ lý có công cụ và chốt chặn an toàn
-->
# DA3 — CÔNG ĐOẠN 1: XÁC ĐỊNH YÊU CẦU
## Chatbot AI đa kênh BioBot — Bioscope Assistants

> **Tài liệu liên quan:** đặc tả kỹ thuật chi tiết nằm ở `docs/SRS_MVP.md` trong kho mã nguồn dự án (1.566 dòng). Tài liệu này ghi phần **yêu cầu nghiệp vụ và tiêu chí nghiệm thu** làm cơ sở cho đặc tả đó.

---

## 1. Bối cảnh

### 1.1 Hiện trạng trước khi có hệ thống

Bioscope tiếp nhận câu hỏi của khách qua nhiều kênh rời rạc, mỗi kênh một người phụ trách.

| Kênh | Ai xử lý | Vấn đề |
| :---- | :---- | :---- |
| Zalo | Nhân viên kinh doanh | Tin nằm trên điện thoại cá nhân, người nghỉ là mất |
| Thư điện tử | Nhân viên kinh doanh | Trả lời chậm, dễ sót |
| Điện thoại | Ai bắt máy | Không lưu lại nội dung |
| Tin nhắn mạng xã hội | Không ai phụ trách rõ | Bỏ sót |

### 1.2 Đo hiện trạng

| Chỉ số | Số liệu ước tính |
| :---- | :---- |
| Thời gian phản hồi trong giờ | 15–60 phút |
| Thời gian phản hồi ngoài giờ | Tới sáng hôm sau |
| Thời gian nhân viên tra một thông số sản phẩm | 5–15 phút |
| Tỉ lệ câu hỏi lặp lại | Cao — cùng vài chục câu hỏi |
| Số kênh có lưu lại lịch sử tập trung | **0** |

### 1.3 Bốn vấn đề gốc

| # | Vấn đề | Vì sao nghiêm trọng |
| :---- | :---- | :---- |
| 1 | **Tri thức nằm trong đầu người** | Nhân viên nghỉ việc là mất kiến thức tích luỹ nhiều năm |
| 2 | **Không có mặt ngoài giờ** | Khách nước ngoài lệch múi giờ; khách trong nước hỏi buổi tối |
| 3 | **Trả lời không nhất quán** | Cùng câu hỏi, mỗi người trả lời một kiểu; khách so sánh thấy mâu thuẫn |
| 4 | **Nhân viên tốn thời gian tra cứu** | Thời gian đáng lẽ dành cho bán hàng |

### 1.4 Rủi ro đặc thù của ngành

Bioscope bán nguyên liệu cho ngành **dược và thực phẩm chức năng**. Khách rất hay hỏi những câu vượt thẩm quyền của công ty:

| Câu hỏi khách hay đặt | Vì sao không được trả lời |
| :---- | :---- |
| "Sản phẩm này chữa bệnh gì?" | Tư vấn chỉ định — thẩm quyền của bác sĩ, dược sĩ |
| "Liều dùng bao nhiêu?" | Tư vấn liều — thẩm quyền y tế |
| "Có tương tác với thuốc X không?" | Tư vấn tương tác thuốc |
| "Thuốc nào tốt hơn?" | So sánh hiệu quả điều trị |

**Một trợ lý AI không được kiểm soát sẽ trả lời hết những câu này** — mô hình ngôn ngữ có sẵn kiến thức y khoa và sẵn sàng chia sẻ. Đây là rủi ro pháp lý và rủi ro cho sức khoẻ người dùng cuối.

Yêu cầu chặn nhóm câu hỏi này được nêu **ngay từ đầu dự án**, không phải bổ sung sau.

---

## 2. Yêu cầu nghiệp vụ

| Mã | Yêu cầu nghiệp vụ | Từ đâu |
| :---- | :---- | :---- |
| NV-01 | Gom mọi kênh liên lạc với khách về một hệ thống | Ban giám đốc Bioscope |
| NV-02 | Trả lời khách ngay cả ngoài giờ làm việc | Bộ phận kinh doanh Bioscope |
| NV-03 | Câu trả lời nhất quán, cùng một nguồn tri thức | Ban giám đốc Bioscope |
| NV-04 | Nhân viên tra được thông tin bằng cách hỏi, không phải mở nhiều tệp | Bộ phận kinh doanh Bioscope |
| NV-05 | **Không trả lời câu hỏi y tế, dược lý vượt thẩm quyền** | Ban giám đốc Bioscope |
| NV-06 | **Dữ liệu kế toán không lọt sang người không có quyền** | Ban giám đốc Bioscope, kế toán trưởng Bioscope |
| NV-07 | Trợ lý chuyển được cho người thật khi không xử lý được | Bộ phận kinh doanh Bioscope |
| NV-08 | Tri thức cập nhật được mà không cần lập trình viên | Bộ phận kinh doanh Bioscope |
| NV-09 | Mọi lượt hỏi đáp có nhật ký để truy vết | Ban giám đốc Bioscope |
| NV-10 | Hỗ trợ xử lý chứng từ kế toán | Kế toán trưởng Bioscope |

> **NV-05 và NV-06 là hai yêu cầu chi phối thiết kế an toàn.** Cả hai đều thuộc loại "không được phép xảy ra, dù chỉ một lần" — nên không thể dựa vào việc yêu cầu mô hình cư xử đúng, phải chặn bằng mã nguồn.

---

## 3. Yêu cầu chức năng

### 3.1 Nhóm hội thoại

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-01 | Nhận câu hỏi bằng tiếng Việt tự nhiên | NV-02 | Bắt buộc |
| YC-02 | Trợ lý **tự chọn công cụ tra dữ liệu** phù hợp câu hỏi | NV-04 | Bắt buộc |
| YC-03 | Gọi được nhiều công cụ liên tiếp cho một câu hỏi | NV-04 | Bắt buộc |
| YC-04 | **Giới hạn số lượt gọi công cụ** mỗi câu hỏi | NV-09 | Bắt buộc |
| YC-05 | Trả lời **chỉ dựa trên dữ liệu công cụ trả về** | NV-03 | **Bắt buộc** |
| YC-06 | Trả lời theo dòng, chữ hiện dần | NV-02 | Nên có |
| YC-07 | Nhớ ngữ cảnh hội thoại | NV-04 | Bắt buộc |
| YC-08 | Hiểu câu trả lời ngắn theo ngữ cảnh trước | NV-04 | Nên có |
| YC-09 | Câu hỏi rõ ràng thì **gọi thẳng công cụ đúng**, không để mô hình chọn | NV-03 | Nên có |
| YC-10 | Phân loại ý định câu hỏi trước khi xử lý | NV-03 | Bắt buộc |
| YC-11 | Nói rõ khi không có dữ liệu, thay vì bịa | NV-03 | **Bắt buộc** |
| YC-12 | Hỏi lại khi câu hỏi mơ hồ | NV-03 | Nên có |

### 3.2 Nhóm an toàn

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-13 | **Chặn câu hỏi y tế, dược lý** | NV-05 | **Bắt buộc** |
| YC-14 | Chốt chặn dược **không phụ thuộc mô hình**, không thể vượt bằng cách đặt lại câu hỏi | NV-05 | **Bắt buộc** |
| YC-15 | Khi chặn, hướng người hỏi tới nguồn đúng | NV-05 | Bắt buộc |
| YC-16 | **Lọc danh sách công cụ theo vai trò trước khi gửi cho mô hình** | NV-06 | **Bắt buộc** |
| YC-17 | Nhân viên kinh doanh **không truy cập được** công cụ kế toán | NV-06 | **Bắt buộc** |
| YC-18 | Nhân viên kế toán không truy cập được dữ liệu khách hàng của kinh doanh | NV-06 | Bắt buộc |
| YC-19 | Ghi nhật ký mọi lượt gọi mô hình và gọi công cụ | NV-09 | Bắt buộc |
| YC-20 | Chống xử lý trùng khi nền tảng nhắn tin gửi lặp sự kiện | NV-01 | Bắt buộc |

### 3.3 Nhóm đa kênh

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-21 | Kênh web | NV-01 | Bắt buộc |
| YC-22 | Kênh Zalo | NV-01 | Bắt buộc |
| YC-23 | Kênh Telegram | NV-01 | Nên có |
| YC-24 | Kênh Messenger | NV-01 | Nên có |
| YC-25 | Kênh WhatsApp | NV-01 | Nên có |
| YC-26 | Kênh thư điện tử, cả nhận và gửi | NV-01 | Nên có |
| YC-27 | **Sáu kênh dùng chung một bộ xử lý nghiệp vụ** | NV-03 | **Bắt buộc** |
| YC-28 | Tự làm mới khoá truy cập của các nền tảng | NV-01 | Bắt buộc |
| YC-29 | **Chuyển hội thoại cho người thật** khi cần | NV-07 | Bắt buộc |

### 3.4 Nhóm tri thức

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-30 | Quét kho tài liệu, phát hiện tệp mới và tệp đã sửa | NV-08 | Bắt buộc |
| YC-31 | Bóc tách nội dung nhiều định dạng | NV-08 | Bắt buộc |
| YC-32 | Đọc chữ trong ảnh và tài liệu scan | NV-08 | Bắt buộc |
| YC-33 | Cắt tài liệu thành đoạn, sinh vectơ, nạp vào kho | NV-08 | Bắt buộc |
| YC-34 | **Tìm theo ngữ nghĩa**, không chỉ khớp từ khoá | NV-04 | Bắt buộc |
| YC-35 | Tách kho tri thức theo miền nghiệp vụ | NV-06 | **Bắt buộc** |
| YC-36 | Đồng bộ bộ câu hỏi thường gặp | NV-03 | Nên có |
| YC-37 | Kiểm chứng dữ liệu đã nạp đúng | NV-08 | Nên có |
| YC-38 | Xuất kho tri thức ra tài liệu đọc được để rà soát | NV-08 | Nên có |
| YC-39 | Đệm kết quả câu hỏi lặp lại | NV-02 | Nên có |

### 3.5 Nhóm nghiệp vụ

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-40 | Tra cứu, so sánh, phân tích sản phẩm | NV-04 | Bắt buộc |
| YC-41 | Tra cứu khách hàng và lịch sử trao đổi | NV-04 | Bắt buộc |
| YC-42 | Phân khúc khách hàng | NV-04 | Nên có |
| YC-43 | Luồng đơn hàng | NV-04 | Nên có |
| YC-44 | Biểu mẫu phê duyệt | NV-07 | Nên có |
| YC-45 | Thông báo nội bộ | NV-07 | Nên có |
| YC-46 | Tra cứu, tổng hợp hoá đơn và chứng từ | NV-10 | Bắt buộc |
| YC-47 | Đọc chứng từ scan | NV-10 | Bắt buộc |
| YC-48 | Trạng thái báo cáo kế toán | NV-10 | Bắt buộc |

### 3.6 Nhóm vận hành

| Mã | Yêu cầu | Nghiệp vụ gốc | Ưu tiên |
| :---- | :---- | :---- | :---- |
| YC-49 | Kiểm tra sức khoẻ hệ thống định kỳ | NV-01 | Bắt buộc |
| YC-50 | Cảnh báo khi có lỗi | NV-01 | Bắt buộc |
| YC-51 | **Hàng đợi việc chết** cho việc thất bại nhiều lần | NV-01 | Bắt buộc |
| YC-52 | Sao lưu tự động | NV-09 | Bắt buộc |
| YC-53 | Xử lý lỗi tập trung | NV-01 | Bắt buộc |
| YC-54 | Xoá dữ liệu theo yêu cầu | NV-09 | Bắt buộc |

---

## 4. Yêu cầu phi chức năng

| Mã | Loại | Yêu cầu | Cách đo |
| :---- | :---- | :---- | :---- |
| PC-01 | Tốc độ | Chữ đầu tiên hiện trong 3 giây | Bấm giờ |
| PC-02 | Tốc độ | Trả lời xong trong 15 giây với câu hỏi thường | Bấm giờ |
| PC-03 | Tốc độ | Tra kho vectơ dưới 500 mili giây | Đo thời gian gọi |
| PC-04 | Khả dụng | Hệ thống chạy liên tục, tự khởi động lại | Thử khởi động lại máy chủ |
| PC-05 | Khả dụng | Một dịch vụ hỏng không làm sập cả hệ thống | Thử dừng từng dịch vụ |
| PC-06 | **Bảo mật** | **Mọi cổng dịch vụ chỉ gắn vào máy cục bộ** | Quét cổng từ ngoài |
| PC-07 | Bảo mật | Khoá truy cập không nằm trong mã nguồn | Rà soát kho mã nguồn |
| PC-08 | Bảo mật | Khoá của nền tảng điều phối được mã hoá | Kiểm cấu hình |
| PC-09 | Bảo mật | Xác thực webhook từ các nền tảng nhắn tin | Thử gọi webhook giả |
| PC-10 | **An toàn** | **Tỉ lệ lọt câu hỏi y tế bằng 0** | Bộ ca kiểm thử âm |
| PC-11 | **An toàn** | **Tỉ lệ lộ dữ liệu chéo vai trò bằng 0** | Bộ ca kiểm thử âm |
| PC-12 | Chính xác | Trả lời chỉ dựa trên dữ liệu công cụ trả về | Đối chiếu thủ công |
| PC-13 | Chi phí | Kiểm soát được chi phí gọi mô hình | Nhật ký gọi mô hình |
| PC-14 | Bảo trì | Sửa quy trình nghiệp vụ không cần lập trình viên | Thử sửa một quy trình |

---

## 5. Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm |
| :---- | :---- | :---- |
| 1 | Toàn bộ yêu cầu "Bắt buộc" đã dựng và chạy được | Bộ ca kiểm thử `DA3-07` |
| 2 | **Không có câu hỏi y tế nào lọt qua** — thử 20 cách hỏi khác nhau | Ca kiểm thử âm |
| 3 | **Không có dữ liệu chéo vai trò nào lọt** — thử 10 cách hỏi | Ca kiểm thử âm |
| 4 | Trả lời đúng trên 20 câu hỏi thật của khách | Nghiệm thu thực tế |
| 5 | Không có câu trả lời nào bịa dữ liệu | Đối chiếu thủ công |
| 6 | Sáu kênh nhận và trả lời được | Thử từng kênh |
| 7 | Chuyển được cho người thật | Thử luồng chuyển |
| 8 | Nạp tài liệu mới, trợ lý trả lời được ngay | Thử nạp một tài liệu |
| 9 | Mọi cổng dịch vụ không truy cập được từ ngoài | Quét cổng |
| 10 | Không có khoá truy cập trong mã nguồn | Rà soát |
| 11 | Nhật ký ghi đủ lượt gọi mô hình và công cụ | Xem bảng nhật ký |
| 12 | Sao lưu chạy và khôi phục được | Diễn tập khôi phục |

> **Tiêu chí 2 và 3 không được phép "đạt có điều kiện".** Hai tiêu chí này là điều kiện tiên quyết. Một câu lọt qua nghĩa là cơ chế chặn không hoạt động, và toàn bộ đánh giá an toàn trở nên vô nghĩa.

---

## 6. Phạm vi loại trừ

| Không làm | Lý do |
| :---- | :---- |
| **Tư vấn y tế, dược lý dưới mọi hình thức** | Vượt thẩm quyền, rủi ro pháp lý và sức khoẻ |
| Chốt đơn hàng tự động | Quyết định kinh doanh cần người |
| Báo giá tự động cho khách | Giá là thông tin thương lượng |
| Huấn luyện mô hình riêng | Chi phí và dữ liệu không đủ |
| Nhận diện giọng nói | Chưa đủ nhu cầu |
| Thay thế hoàn toàn nhân viên kinh doanh | Trợ lý hỗ trợ, không thay thế |

---

## 7. Ràng buộc

| Loại | Ràng buộc |
| :---- | :---- |
| Pháp lý | **Tuyệt đối không tư vấn y tế.** Ràng buộc mạnh nhất của dự án |
| Bảo mật | Dữ liệu kế toán và dữ liệu kinh doanh phải tách bạch |
| Hạ tầng | Một máy chủ, chạy cùng các dịch vụ khác |
| Phụ thuộc | Nền tảng nhắn tin có thể đổi giao diện lập trình bất kỳ lúc nào |
| Chi phí | Mỗi lượt hỏi tốn tiền gọi mô hình |
| Nhân lực | Đội nhỏ; phải dùng nền tảng điều phối quy trình thay vì viết tay mọi thứ |

---

## 8. Rủi ro nhận diện từ đầu

| # | Rủi ro | Mức | Cách phòng đã thiết kế |
| :---- | :---- | :---- | :---- |
| 1 | **Trợ lý tư vấn y tế** | **Rất cao** | Bộ lọc viết bằng mã, chạy trước mô hình, không thể vượt bằng cách đặt lại câu hỏi |
| 2 | **Lộ dữ liệu chéo vai trò** | **Rất cao** | Lọc danh sách công cụ trước khi gửi cho mô hình — mô hình không biết công cụ kia tồn tại |
| 3 | Trợ lý bịa thông tin | Cao | Chỉ dùng dữ liệu công cụ trả về; nói rõ khi không có dữ liệu |
| 4 | Vòng lặp gọi công cụ không dừng | Cao | Giới hạn 5 lượt mỗi câu hỏi |
| 5 | Nền tảng nhắn tin gửi lặp sự kiện | Trung bình | Quy trình chống trùng sự kiện |
| 6 | Khoá truy cập hết hạn | Trung bình | Quy trình tự làm mới khoá |
| 7 | Một dịch vụ hỏng kéo sập cả hệ thống | Trung bình | Xử lý lỗi tập trung, hàng đợi việc chết |
| 8 | Chi phí gọi mô hình vượt kiểm soát | Trung bình | Bộ nhớ đệm câu hỏi lặp, nhật ký gọi mô hình |
| 9 | Tri thức lạc hậu | Trung bình | Quy trình đồng bộ định kỳ |
| 10 | Nền tảng nhắn tin đổi giao diện lập trình | Trung bình | Mỗi kênh một quy trình riêng, đổi một kênh không ảnh hưởng kênh khác |

Hai rủi ro đầu được xếp mức **rất cao** vì hậu quả không hoàn tác được: một câu tư vấn y tế sai đã gửi đi thì không thu lại được, và dữ liệu tài chính đã lộ thì không thu lại được.

---

## 9. Phê duyệt yêu cầu

| Bên | Vai trò | Họ tên | Ngày | Ký |
| :---- | :---- | :---- | :---- | :---- |
| OPTIMAI | Người lập yêu cầu — HungDV, Product Owner | | | |
| Bioscope | Đại diện bộ phận kinh doanh | | | |
| **Bioscope** | **Kế toán trưởng** | | | |
| **Bioscope** | **Ban giám đốc phê duyệt yêu cầu** | | | |
| OPTIMAI | Ban giám đốc xác nhận phạm vi thực hiện | | | |

Chữ ký của kế toán trưởng là bắt buộc vì yêu cầu NV-06 và NV-10 liên quan trực tiếp tới dữ liệu tài chính.
