# 11 · Landing page chiến dịch (Gastroheal…)

Module `@dv/module-landing` (CMS) + trang `/lp/<slug>` (frontend). Một chiến dịch =
một landing, chạy trên **tên miền riêng** khai trong admin, dùng chung container
`dvcms-frontend` với web Bioscope.

```
Khách ──https──▶ aaPanel (site gastroheal.net, proxy → 127.0.0.1:26080, Host=$host)
                     │
                     ▼
            dvcms-frontend (Next 16)
            proxy.ts: Host có trong bảng tên miền? ──▶ rewrite mọi đường dẫn → /lp/<slug>
                     │  trình duyệt chỉ gọi /lp-api/<slug>/… (cùng tên miền)
                     ▼  server-to-server, header x-internal-secret
            dvcms-app (Payload) /api/lp/…  ──▶ Postgres (bảng lp_*) + media/lp-recordings
```

## 1. Triển khai lên VPS

Quy trình như các bản cập nhật khác (`docs/06-deploy.md` §7.3), thêm **một bước SQL chạy
tay** — `upgrade.sh` chỉ chạy migration của Payload, không chạy `scripts/migrate-*.sql`.

**Bước 0 — máy local:** commit + push code lên `main`.

**Bước 1 — VPS: kéo code, sao lưu, tạo bảng** (SQL phải chạy TRƯỚC khi CMS mới khởi động:
bảng khoá tài liệu của Payload cần các cột `lp_*_id` mới; CMS cũ bỏ qua bảng/cột thừa nên
chạy trước là an toàn):

```bash
cd /opt/bioscope-website/dv-cms
git pull origin main
bash scripts/backup-db.sh
docker exec -i dvcms-db psql -U dvcms -d dvcms -v ON_ERROR_STOP=1 < scripts/migrate-landing.sql
docker exec dvcms-db psql -U dvcms -d dvcms -c "\dt lp_*"      # phải thấy 13 bảng lp_…
```

File SQL chạy lại nhiều lần vẫn an toàn (idempotent, bọc BEGIN/COMMIT). Các dòng
`NOTICE: … already exists, skipping` là bình thường.

**Bước 2 — biến môi trường** (`.env` cạnh `docker-compose.yml`): đều có mặc định, chỉ kiểm:

| Biến | Service | Ghi chú |
|---|---|---|
| `INTERNAL_API_SECRET` | cms + frontend | Phải **giống nhau**. Bỏ trống = cả hai dùng `PAYLOAD_SECRET`. |
| `REVALIDATE_SECRET` | cms + frontend | Đã có sẵn. Admin lưu là landing đổi ngay. |
| `FRONTEND_INTERNAL_URL` | cms | Mặc định `http://frontend:26300` (mạng Docker nội bộ). |
| `LANDING_SESSION_SECRET` | frontend | Tuỳ chọn. Bỏ trống = dùng `MEMBER_SESSION_SECRET` rồi `PAYLOAD_SECRET`. |

**Bước 3 — build + khởi động lại:**

```bash
bash scripts/upgrade.sh          # backup → pull → build → restart → verify (có rollback)
# hoặc làm tay:
docker compose up -d --build --force-recreate cms frontend
docker compose ps                # dvcms-app, dvcms-frontend: Up
docker compose logs --tail=50 cms | grep -i "error\|landing"
```

Frontend tải font (Be Vietnam Pro, Fraunces) từ Google lúc build → VPS cần ra Internet.

**Bước 4 — admin:**
1. *Landing page → Cài đặt landing*: chọn nhà cung cấp OTP (eSMS/SpeedSMS + khoá API),
   điền **IP máy chủ** (để nút Kiểm tra DNS so khớp).
2. *Landing page → Chiến dịch → Tạo mới*: slug `gastroheal`, số suất, video, nội dung,
   tab *SEO & theo dõi*; để trạng thái **Nháp**. Ngày 1 của tháng muốn chạy thì chuyển
   sang **Đang chạy** — bật giữa tháng thì đợt đó ngắn, khách vừa vào đã chốt.
3. Tab *Tên miền*: thêm `gastroheal.net` và `www.gastroheal.net` → Lưu. Đợt của tháng
   hiện tại được hệ thống tạo ngay khi trang được gọi lần đầu.

**Bước 5 — tên miền trên aaPanel:**

> `gastroheal.net` hiện đang phục vụ bản landing HTML tĩnh. Sao lưu thư mục web của site
> đó trước (`cp -a /www/wwwroot/gastroheal.net /www/backup/gastroheal.net.$(date +%F)`),
> rồi mới bật reverse proxy — bật xong nginx sẽ không phục vụ file tĩnh nữa. Muốn quay
> lui thì tắt reverse proxy là trang cũ trở lại ngay.

1. DNS: bản ghi A `@` và `www` → IP VPS (nếu đã trỏ rồi thì bỏ qua).
2. aaPanel → *Website*: site `gastroheal.net` đã có thì dùng lại; chưa có thì *Add site*
   (+ `www`), PHP: *Static*.
3. *SSL* → Let's Encrypt → bật *Force HTTPS* (đã có SSL thì bỏ qua).
4. *Reverse proxy* → target `http://127.0.0.1:26080`, *Send domain* = `$host`.
5. *Config file* → trong `location /` của reverse proxy, chèn:

   ```nginx
   proxy_set_header Host              $host;
   proxy_set_header X-Real-IP         $remote_addr;
   proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;   # chặn spam OTP theo IP thật
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_http_version 1.1;
   client_max_body_size 20M;          # file ghi âm tới 15 MB — mặc định 1M sẽ lỗi 413
   proxy_read_timeout 120s;
   ```
   Lưu → Reload Nginx.

**Bước 6 — kiểm tra:**

```bash
curl -sI https://gastroheal.net | head -3                 # 200
curl -s  https://gastroheal.net/robots.txt               # có dòng Sitemap:
curl -s  https://gastroheal.net/sitemap.xml              # 1 URL (khi Đang chạy)
```

Trong admin bấm **Kiểm tra DNS** → xanh. Mở trang trên điện thoại, thử tham gia bằng số
thật (nhận SMS), ghi âm, rồi duyệt bản ghi trong admin xem điểm có cộng. Xong thì
chuyển chiến dịch sang **Đang chạy** và khai tên miền với Google Search Console
(gửi `https://gastroheal.net/sitemap.xml`).

**Quay lui khi có sự cố** — theo thứ tự mức độ:

| Vấn đề | Cách xử lý |
|---|---|
| Landing lỗi, cần trả lại trang tĩnh cũ | aaPanel → site `gastroheal.net` → tắt *Reverse proxy* |
| Muốn tắt landing nhưng giữ tên miền | Admin → chiến dịch → trạng thái **Tắt** (khách được chuyển hướng) |
| Bản build mới hỏng | `bash scripts/upgrade.sh rollback /opt/bioscope-data/backups/pre-upgrade-<mốc>` |
| Cần gỡ hẳn dữ liệu landing | Khôi phục bản dump tạo ở Bước 1 |

Các bảng `lp_*` tách riêng, không sửa bảng nào của web Bioscope, nên gỡ landing không
ảnh hưởng web chính.

Xem thử trước khi trỏ DNS: `https://web.bioscope.vn/lp/<slug>` (tự gắn `noindex`).

## 2. Đợt theo tháng & trạng thái

Chiến dịch chạy **theo đợt**, mặc định mỗi tháng một đợt (`Chu kỳ = Theo tháng`).
Người tham gia vẫn là một hồ sơ duy nhất (số điện thoại, mã giới thiệu giữ nguyên);
chỉ **điểm và thứ tự tham gia** là tính lại theo từng đợt — nếu không, người của
tháng trước mang nguyên điểm sang và người mới không bao giờ đuổi kịp.

Một vòng tháng diễn ra như sau (giờ Việt Nam, không theo giờ máy chủ):

| Thời điểm | Hệ thống làm gì | Trang hiển thị |
|---|---|---|
| 00:00 ngày 1 | Mở đợt mới, điểm mọi người về 0 | Đếm ngược tới ngày chốt |
| 23:59 ngày cuối tháng | Khoá điểm, chọn N người cao điểm nhất, **chưa công bố** | Dải "Kết quả tháng … đã chốt, công bố ngày 05" |
| 10:00 ngày 05 tháng sau | Công bố | Dải "N khách hàng nhận quà tháng …" kèm danh sách (tên rút gọn) |

Danh sách người nhận quà **không ra khỏi máy chủ** trước mốc công bố, kể cả qua API —
5 ngày đó để Bioscope đối chiếu và loại trường hợp gian lận (bấm **Chốt lại danh sách**).
Dải kết quả tự ẩn sau *Số ngày hiện kết quả đợt trước* (mặc định 7 ngày).

Tác vụ nền chạy mỗi phút trong tiến trình CMS: chốt đợt hết hạn, công bố đúng mốc, và
luôn mở sẵn đợt của tháng hiện tại. Không cần cron hệ thống.

**Việc làm lại mỗi đợt:** xem video, chia sẻ câu chuyện dạ dày, mời người thân, điểm
thưởng người vào sau. **Một lần cho mỗi người:** chia sẻ kết quả sau 2 tuần.

Trạng thái chiến dịch (độc lập với đợt):

| Trạng thái | Khách thấy gì |
|---|---|
| Nháp | Trang "Sắp ra mắt", không lộ nội dung. |
| Đang chạy | Landing đầy đủ. |
| Kết thúc | Dừng hẳn chương trình (không mở đợt mới nữa). |
| Tắt | Chuyển hướng 302 sang *Địa chỉ chuyển hướng khi tắt*. |

## 3. Điểm & duyệt

Bảng điểm hiện trên trang (sửa số trong tab *Thang điểm*):

| Hoạt động | Mặc định | Cộng khi nào |
|---|---|---|
| Xem video | +2 mỗi video | Xem đủ *Số giây xem tối thiểu* |
| Video giới thiệu sản phẩm | +5 | như trên |
| Chia sẻ câu chuyện về dạ dày | +10 | Sau khi nhân viên nghe và bấm *Đạt* |
| Mời người thân/bạn bè tham gia | +10 | Khi người được mời xác thực OTP **và xem xong 1 video** |
| Chia sẻ kết quả sau 2 tuần | +10 | Khách đã nhận quà hoặc đã mua hàng, sau 14 ngày |
| Có người tham gia sau bạn | +2 mỗi người | Tự động, tối đa 10 lần mỗi đợt |

Chống cày điểm mời (mức điểm cao nhất): người được mời phải qua OTP bằng số thật, phải
xem xong một video, mỗi người chỉ tính một lần trọn đời, và mỗi đợt chỉ tính tối đa
*Số người mời được cộng mỗi đợt* (mặc định 5).

**Đơn hàng không còn cộng điểm** (trước 09/2026 thì có). Mã giới thiệu trên đơn vẫn được
lưu để đối chiếu doanh số, nhưng điểm giới thiệu đã chuyển sang mốc "người được mời tham
gia" theo bảng marketing duyệt — giữ cả hai là một lượt giới thiệu được tính hai lần.

- Sổ điểm chỉ ghi thêm, không sửa. Cộng/trừ tay = tạo dòng *Điều chỉnh tay*, bắt buộc ghi lý do.
- Mỗi dòng sổ điểm mang **mã đợt**; khoá chống trùng là `<đợt>:<khoá>`, nên cùng một video
  tháng nào xem cũng được cộng, mà trong tháng thì không cộng hai lần.
- Xếp hạng = điểm nhiệm vụ trong đợt + thưởng người vào sau. Bằng điểm: ai tham gia sớm
  hơn trong đợt đứng trên.

## 4. OTP / SMS

Admin → **Cài đặt landing** → *Nhà cung cấp OTP*: `Chỉ ghi log` (mặc định, KHÔNG gửi
SMS thật — chỉ dùng để thử), `eSMS`, `SpeedSMS`. Khi để "Chỉ ghi log" ở môi trường
production, mã chỉ nằm trong log CMS — **phải chọn nhà mạng thật trước khi chạy quảng cáo**.
Tắt *Bắt buộc OTP* trong chiến dịch thì ai biết số điện thoại cũng đăng nhập được
thay người khác — chỉ tắt khi thử nghiệm.

## 5. Dữ liệu cá nhân (NĐ 13/2023)

- Chỉ vai trò **Admin** (có quyền `*` toàn phần) hoặc vai trò được cấp **đích danh**
  từng bảng `lp-participants / lp-point-events / lp-recordings / lp-orders` mới xem
  được. Biên tập viên không xem được dù có quyền trên "tất cả collection".
- File ghi âm tải qua `/api/lp-recordings/file/…` có kiểm quyền, không phải file tĩnh.
- **Xuất CSV** người tham gia / đơn hàng: nút trong trang chiến dịch.
- **Xoá dữ liệu cá nhân**: nút trong trang chiến dịch, chỉ bấm được khi chiến dịch đã
  *Kết thúc* hoặc *Tắt*, phải gõ lại slug để xác nhận. Xoá hẳn bản ghi âm (cả file) và
  OTP; người tham gia và đơn hàng được **ẩn danh** (tên, số điện thoại, địa chỉ, IP…)
  nhưng giữ số liệu điểm/đơn để thống kê. Không hoàn tác.

## 6. Nội dung & câu chữ

Tab *Nội dung* có sẵn các ô chỉnh câu chữ đầu trang, không cần build lại:

| Ô | Mặc định |
|---|---|
| Tên chương trình | `Chương trình quà tháng {thang}` — `{thang}`/`{nam}` tự điền theo đợt |
| Tiêu đề lớn đầu trang | `{soSuat} PHẦN QUÀ DÀNH CHO KHÁCH HÀNG QUAN TÂM ĐẾN SỨC KHOẺ DẠ DÀY` |
| Câu phụ | "Tham gia chương trình, hoàn thành các hoạt động để tích điểm và có cơ hội nhận quà tận nhà." |
| Mô tả phần quà | "Mỗi phần quà: 1 lọ Gastroheal 50 ml, giao tận nhà" — trả lời câu "quà là gì" |
| Điều kiện tham gia | "Miễn phí · dành cho khách từ 18 tuổi đang ở Việt Nam · mỗi số điện thoại tham gia một lần" |
| Chữ trên nút | THAM GIA NGAY |
| Giải thích con số phần quà | *(để trống thì ẩn)* — nội dung quảng cáo TPBVSK, nên cho bộ phận đăng ký duyệt câu chữ |
| Thể lệ chương trình | Hiện trong popup cuối trang; mỗi dòng một ý |

Mốc chốt và mốc công bố nằm ở tab *Quà & hạn chốt*: giờ chốt ngày cuối tháng (mặc định
23:59), ngày công bố tháng sau (mặc định 05) và giờ công bố (mặc định 10:00).



Tab *Nội dung* của chiến dịch: hotline, email, Zalo, thông tin công ty, chứng nhận
(tải bản scan), phản hồi người dùng (đánh dấu *minh hoạ* nếu chưa phải phản hồi thật —
trang sẽ ghi "Nội dung minh hoạ"), nghiên cứu. Thông tin sản phẩm và thành phần
Gastroheal giữ nguyên câu chữ theo bản công bố, nằm trong code
(`apps/bioscope-frontend/src/components/landing/Info.tsx`).

Video: dán link YouTube hoặc Vimeo — hệ thống tự đổi sang link nhúng (YouTube bản
nocookie). Link nguồn khác bị bỏ qua.

## 6b. SEO

- Trang dựng sẵn trên server (SSR): toàn bộ chữ, kể cả nội dung các popup *Tìm hiểu thêm*
  (sản phẩm, thành phần, nghiên cứu…), có ngay trong HTML — popup chỉ ẩn/hiện bằng CSS.
- Tab *SEO & theo dõi*: tiêu đề, mô tả (bỏ trống = tự sinh "Gastroheal – Còn N phần quà"),
  ảnh chia sẻ 1200×630, **favicon** riêng, mã GTM riêng.
- Tự động: canonical về tên miền riêng; chỉ cho Google lập chỉ mục khi *Đang chạy* và vào
  bằng tên miền riêng (Nháp/Kết thúc/xem thử qua `/lp/…` đều `noindex`); `robots.txt` và
  `sitemap.xml` riêng cho tên miền landing; Open Graph + Twitter card.
- JSON-LD: `Organization` (tên, MST, hotline, email, địa chỉ lấy từ tab Nội dung) +
  `WebPage`. **Cố ý không khai `Product`**: Google bắt Product phải có giá hoặc
  đánh giá/điểm sao — landing không hiện giá, còn điểm sao cho TPBVSK dễ thành quảng
  cáo công dụng. Khai thiếu chỉ sinh lỗi trong Search Console.

## 7. Mã nguồn

| Phần | Vị trí |
|---|---|
| Collections, endpoint, logic điểm/OTP | `packages/module-landing/src/` |
| SQL tạo bảng | `scripts/migrate-landing.sql` |
| Trang + giao diện | `apps/bioscope-frontend/src/app/lp/[slug]/`, `src/components/landing/` |
| Cổng API cho trình duyệt | `apps/bioscope-frontend/src/app/lp-api/[slug]/[...path]/route.ts` |
| Nhận tên miền | `apps/bioscope-frontend/src/proxy.ts` (`routeLanding`) |
| Màu/hiệu ứng (tiền tố `gh-`/`lp-`) | `apps/bioscope-frontend/src/app/landing-theme.css` |

## 8. Giới hạn đã biết

- Đồng hồ xem video đếm thời gian mở video (khi tab đang hiện), không đọc được việc
  khách có bấm Play trong khung YouTube hay không.
- Chặn tần suất (rate limit) ở frontend nằm trong bộ nhớ một tiến trình — đủ cho một
  container; nếu chạy nhiều bản sao cần chuyển sang Redis.
- Đổi tên miền / bật-tắt trong admin: bảng tên miền trong proxy làm mới sau tối đa
  20 giây. Nội dung trang và trạng thái Nháp/Kết thúc đổi ngay khi lưu.
- Chốt tay giữa tháng (nút "Chốt danh sách ngay") sẽ đóng đợt đang chạy; đợt mới chỉ mở
  vào ngày 1 tháng sau. Muốn tính lại thì bấm "Chốt lại danh sách".
- Bản migration đầu (21/09/2026) thiếu 3 index duy nhất (`campaign_phone_idx`,
  `campaign_joinSeq_idx`, `participant_refKey_idx`) — chúng chặn đăng ký trùng số và
  cộng điểm hai lần. Bản 25/09/2026 đã bổ sung; nếu đã chạy bản cũ, chỉ cần chạy lại file
  SQL (idempotent).
