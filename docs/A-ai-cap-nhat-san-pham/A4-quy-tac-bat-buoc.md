# A4 — RANH GIỚI CỨNG KHI ĐỂ AI ĐỤNG VÀO DỮ LIỆU SẢN PHẨM

> Tài liệu này **không phải khuyến nghị**. Đây là ràng buộc bắt buộc cho mọi
> tác nhân tự động ghi vào dữ liệu nguyên liệu Bioscope.

---

## Vì sao phải có ranh giới cứng

Dữ liệu nguyên liệu đi thẳng ra ba nơi: website công khai, chatbot tư vấn khách
hàng, và tài liệu gửi đối tác.

Đây là ngành **thực phẩm chức năng và dược phẩm**. Một con số hàm lượng sai,
một ngưỡng sử dụng bịa ra, một chứng nhận không có thật — hậu quả không dừng ở
lỗi phần mềm.

Mô hình ngôn ngữ có xu hướng điền vào chỗ trống bằng thứ nghe hợp lý. Với dữ
liệu tiếp thị thì đó là tính năng; với thông số kỹ thuật dược phẩm thì đó là lỗi.

---

## 1. Năm điều cấm tuyệt đối

| # | Cấm | Lý do |
|---|---|---|
| 1 | Ghi vào **bảng giá** (`pricing`) | Dữ liệu thương mại. Chỉ người có thẩm quyền nhập trong admin |
| 2 | **Tự xuất bản** — đặt `_status: published` | Phải có người duyệt trước khi ra khách |
| 3 | **Bịa thông số kỹ thuật** — CAS, hàm lượng, hạn dùng, ngưỡng sử dụng | Không có trong nguồn thì để trống, không suy đoán |
| 4 | **Bịa chứng nhận, trạng thái pháp lý** — Halal, FDA GRAS, số công bố | Là tuyên bố pháp lý, sai là chịu trách nhiệm trước cơ quan quản lý |
| 5 | **Tạo thẻ phân loại mới** tuỳ tiện | Thẻ dùng chung toàn hệ thống, sinh thẻ trùng nghĩa làm vỡ bộ lọc |

---

## 2. Quy tắc theo loại nội dung

### Được sinh tự do

Nội dung tiếp thị, diễn đạt lại từ nguồn có sẵn:

`subtitle` · `description` · `benefits` · `applications`

Điều kiện: **phải dựa trên tài liệu nguồn thật** của nguyên liệu đó. Không có
tài liệu thì không sinh.

### Chỉ được sao chép, không được suy luận

Thông số kỹ thuật và pháp lý:

`technical.*` · `regulatory.*` · `specs` · `suggestedDosage` · `moq` · `badges`

Quy tắc: **có trong nguồn thì chép nguyên, không có thì để trống.**

Không suy ra từ nguyên liệu tương tự. Không lấy từ kiến thức chung của mô hình.
Không quy đổi đơn vị nếu không chắc.

### Chỉ được chọn trong danh sách có sẵn

`type` · `tag` · `primaries` · `functions` · `natures` · `forms` · `properties` ·
`category` · `partner` · `technologies`

Không tìm thấy giá trị phù hợp thì **để trống và báo cho người duyệt**, không
tạo giá trị mới.

Danh sách giá trị hợp lệ ở [A1](A1-mo-hinh-du-lieu-nguyen-lieu.md) mục 2 và 4.

---

## 3. Ba nguyên tắc vận hành

### 3.1 Người duyệt là bắt buộc, không phải tuỳ chọn

Mọi nội dung do máy sinh vào ở dạng **bản nháp**. Người biên tập đọc, đối chiếu
với tài liệu nguồn, sửa nếu cần, rồi mới bấm xuất bản.

Không có cấu hình nào cho phép bỏ qua bước này. Nếu có ai đề nghị thêm cờ
"tự động xuất bản" để chạy nhanh hơn, câu trả lời là không.

### 3.2 Mọi thay đổi phải để lại vết

Ghi lại: thời điểm, tác nhân nào, bản ghi nào, trường nào đổi, giá trị trước và sau.

Không có vết thì khi phát hiện dữ liệu sai sẽ không truy được nguồn, và không
biết còn bao nhiêu bản ghi khác cùng bị sai như vậy.

Hệ thống đã có `audit-logs` và bản ghi công việc riêng cho từng luồng
([A3](A3-quy-trinh-hien-co.md)).

### 3.3 Sai thì phải lùi lại được

Trước mỗi đợt cập nhật hàng loạt:

- Sao lưu cơ sở dữ liệu — xem [B5](../B-he-thong-website/B5-van-hanh.md)
- Chạy thử trên số lượng nhỏ, kiểm tra kết quả trước khi chạy toàn bộ
- Ghi lại phạm vi ảnh hưởng để lùi lại đúng phần đó khi cần

---

## 4. Kiểm tra đầu vào bắt buộc

Trước khi ghi, phải kiểm:

| Kiểm | Không đạt thì |
|---|---|
| `type` nằm trong `supplement` / `cosmetic` / `both` | Từ chối |
| `tag` nằm trong `NEW` / `TRENDING` / `EXCLUSIVE` hoặc rỗng | Từ chối |
| `regulatory.status` nằm trong danh sách hợp lệ | Từ chối |
| Thẻ phân loại tồn tại sẵn trong `ingredient-facets` | Bỏ trường đó, báo người duyệt |
| Có `externalId` | Từ chối |
| Trường ngoài danh sách trắng | Bỏ qua âm thầm |
| `pricing`, `documents`, `_status` | **Từ chối và ghi cảnh báo** |

---

## 5. Prompt hệ thống cho tác nhân sinh nội dung

Dùng nguyên văn khi cấu hình mô hình sinh nội dung nguyên liệu:

```
Bạn đang soạn nội dung cho danh mục nguyên liệu dược phẩm và thực phẩm chức năng.

QUY TẮC BẮT BUỘC:
1. CHỈ dùng thông tin có trong tài liệu nguồn được cung cấp.
2. TUYỆT ĐỐI không bịa số CAS, hàm lượng, liều dùng, hạn dùng, ngưỡng sử dụng,
   chứng nhận hay trạng thái pháp lý.
3. Tài liệu nguồn không nêu thì để TRỐNG trường đó. Không suy đoán, không lấy
   từ kiến thức chung, không suy ra từ nguyên liệu tương tự.
4. Không quy đổi đơn vị nếu không chắc chắn tuyệt đối.
5. Không viết câu khẳng định về hiệu quả điều trị bệnh.
6. Nội dung tiếp thị phải diễn đạt lại từ tài liệu nguồn, không thêm tuyên bố mới.
7. Không chắc thì để trống và ghi chú cho người duyệt, KHÔNG đoán.
```

---

## 6. Trách nhiệm

| Vai trò | Trách nhiệm |
|---|---|
| Người cấu hình tác nhân | Bảo đảm mọi ràng buộc trong tài liệu này được cài đặt |
| Người biên tập duyệt | Đối chiếu nội dung với tài liệu nguồn trước khi xuất bản |
| Quản trị hệ thống | Cấp quyền tối thiểu, thu hồi khoá khi có bất thường |

**Nội dung đã xuất bản là trách nhiệm của người bấm nút xuất bản**, không phải
của công cụ sinh ra nó.
