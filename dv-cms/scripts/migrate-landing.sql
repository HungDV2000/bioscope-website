-- =============================================================================
-- Migration: module Landing page (@dv/module-landing)
--
--   lp_campaigns (+ _domains, _videos, _testimonials, _studies, _certifications)
--   lp_participants (+ _symptoms)  : người tham gia (SĐT, triệu chứng — dữ liệu nhạy cảm)
--   lp_point_events                : sổ điểm, (participant, ref_key) DUY NHẤT
--   lp_recordings                  : file ghi âm (upload, lưu ở media/lp-recordings)
--   lp_orders                      : đơn đặt mua
--   lp_otps                        : mã OTP đã gửi (chỉ lưu băm)
--   lp_settings                    : global cài đặt SMS OTP
--   payload_locked_documents_rels  : + lp_*_id
--
-- DDL trích từ push chạy thật trên DB trống (dvcms_lp_test) → khớp 100% với
-- schema mà Payload sinh ra. AN TOÀN: chỉ CREATE/ADD, idempotent, bọc transaction.
-- CHẠY: docker exec -i dvcms-db psql -U dvcms -d dvcms < scripts/migrate-landing.sql
-- (sinh tự động bằng script trong phiên làm việc — đừng sửa tay từng dòng; đổi
--  schema thì sinh lại từ DB trống.)
-- =============================================================================

BEGIN;

-- ── 1. Kiểu enum ──────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_campaigns_status') THEN
    CREATE TYPE public.enum_lp_campaigns_status AS ENUM (
        'draft',
        'active',
        'ended',
        'off'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_orders_status') THEN
    CREATE TYPE public.enum_lp_orders_status AS ENUM (
        'new',
        'confirmed',
        'shipped',
        'cancelled'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_participants_status') THEN
    CREATE TYPE public.enum_lp_participants_status AS ENUM (
        'active',
        'blocked'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_participants_symptoms') THEN
    CREATE TYPE public.enum_lp_participants_symptoms AS ENUM (
        's1',
        's2',
        's3',
        's4',
        's5'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_point_events_type') THEN
    CREATE TYPE public.enum_lp_point_events_type AS ENUM (
        'video',
        'record',
        'order',
        'result',
        'manual'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_recordings_kind') THEN
    CREATE TYPE public.enum_lp_recordings_kind AS ENUM (
        'intro',
        'result',
        'symptom'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_recordings_status') THEN
    CREATE TYPE public.enum_lp_recordings_status AS ENUM (
        'pending',
        'approved',
        'rejected'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_settings_esms_sms_type') THEN
    CREATE TYPE public.enum_lp_settings_esms_sms_type AS ENUM (
        '2',
        '8'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_settings_otp_provider') THEN
    CREATE TYPE public.enum_lp_settings_otp_provider AS ENUM (
        'log',
        'esms',
        'speedsms'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='enum_lp_settings_speedsms_sms_type') THEN
    CREATE TYPE public.enum_lp_settings_speedsms_sms_type AS ENUM (
        '3',
        '2',
        '5'
    );
  END IF;
END$$;

-- ── 2. Sequence ───────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.lp_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_participants_symptoms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_point_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_recordings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.lp_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ── 3. Bảng ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lp_campaigns (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    status public.enum_lp_campaigns_status DEFAULT 'draft'::public.enum_lp_campaigns_status NOT NULL,
    auto_end_at_deadline boolean DEFAULT true,
    winners_frozen_at timestamp(3) with time zone,
    pii_purged_at timestamp(3) with time zone,
    slots numeric DEFAULT 43 NOT NULL,
    given numeric DEFAULT 57 NOT NULL,
    discount_percent numeric DEFAULT 10 NOT NULL,
    deadline timestamp(3) with time zone NOT NULL,
    require_otp boolean DEFAULT true,
    require_recording_approval boolean DEFAULT true,
    off_redirect_url character varying DEFAULT 'https://web.bioscope.vn'::character varying,
    points_video numeric DEFAULT 2 NOT NULL,
    points_video_main numeric DEFAULT 5 NOT NULL,
    points_record numeric DEFAULT 10 NOT NULL,
    points_order numeric DEFAULT 10 NOT NULL,
    points_result numeric DEFAULT 10 NOT NULL,
    points_goal numeric DEFAULT 29 NOT NULL,
    points_bonus_per_join numeric DEFAULT 2 NOT NULL,
    points_bonus_max numeric DEFAULT 10 NOT NULL,
    points_max_referral_orders numeric DEFAULT 5 NOT NULL,
    hotline character varying DEFAULT '0982 298 820'::character varying,
    contact_email character varying DEFAULT 'sales.admin@bioscope.vn'::character varying,
    zalo_url character varying,
    company_name character varying DEFAULT 'Công ty Cổ phần Bioscope Việt Nam'::character varying,
    company_intro character varying DEFAULT 'Đối tác đồng sáng tạo và cung ứng nguyên liệu ngành TPCN, Mỹ phẩm, Dược phẩm.'::character varying,
    company_registered_address character varying DEFAULT 'Số nhà 10 Đường 1D, KDC Melosa Khang Điền, Khu phố 3, P. Long Trường, TP.HCM'::character varying,
    company_office_address character varying DEFAULT 'Tầng 2, Nhà xưởng số 4, Đường N6, Đ. D1, P. Tăng Nhơn Phú, TP.HCM'::character varying,
    company_tax_code character varying DEFAULT '0105293554'::character varying,
    company_invoice_email character varying DEFAULT 'hoadon@bioscope.vn'::character varying,
    company_website character varying DEFAULT 'https://www.bioscope.vn/'::character varying,
    meta_title character varying,
    meta_description character varying,
    og_image_id integer,
    gtm_id character varying,
    consent_text character varying DEFAULT 'Tôi đồng ý để Bioscope liên hệ báo tin về chương trình.'::character varying NOT NULL,
    retention_days numeric DEFAULT 180,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_campaigns_certifications (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    number character varying,
    file_id integer
);

CREATE TABLE IF NOT EXISTS public.lp_campaigns_domains (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    host character varying NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_campaigns_studies (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    summary character varying,
    source character varying,
    link character varying
);

CREATE TABLE IF NOT EXISTS public.lp_campaigns_testimonials (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    area character varying,
    symptom character varying,
    quote character varying NOT NULL,
    is_illustration boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.lp_campaigns_videos (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    duration_label character varying,
    min_watch_seconds numeric DEFAULT 20,
    url character varying,
    is_main boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.lp_orders (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    name character varying NOT NULL,
    phone character varying NOT NULL,
    address character varying NOT NULL,
    quantity numeric DEFAULT 1 NOT NULL,
    code character varying,
    discount_percent numeric,
    note character varying,
    status public.enum_lp_orders_status DEFAULT 'new'::public.enum_lp_orders_status NOT NULL,
    referrer_id integer,
    buyer_id integer,
    staff_note character varying,
    ip character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_otps (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    phone character varying NOT NULL,
    code_hash character varying NOT NULL,
    expires_at timestamp(3) with time zone NOT NULL,
    attempts numeric DEFAULT 0,
    consumed_at timestamp(3) with time zone,
    ip character varying,
    delivered boolean DEFAULT false,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_participants (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    name character varying NOT NULL,
    phone character varying NOT NULL,
    symptom_other character varying,
    referral_code character varying,
    referred_by_id integer,
    shared_at timestamp(3) with time zone,
    status public.enum_lp_participants_status DEFAULT 'active'::public.enum_lp_participants_status NOT NULL,
    points numeric DEFAULT 0,
    join_seq numeric,
    winner boolean DEFAULT false,
    winner_rank numeric,
    verified_at timestamp(3) with time zone,
    consent_at timestamp(3) with time zone,
    consent_text character varying,
    tracking_ip character varying,
    tracking_user_agent character varying,
    tracking_host character varying,
    tracking_utm jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_participants_symptoms (
    "order" integer NOT NULL,
    parent_id integer NOT NULL,
    value public.enum_lp_participants_symptoms,
    id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_point_events (
    id integer NOT NULL,
    participant_id integer NOT NULL,
    campaign_id integer,
    type public.enum_lp_point_events_type DEFAULT 'manual'::public.enum_lp_point_events_type NOT NULL,
    points numeric NOT NULL,
    note character varying,
    ref_key character varying,
    created_by_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lp_recordings (
    id integer NOT NULL,
    participant_id integer NOT NULL,
    campaign_id integer NOT NULL,
    kind public.enum_lp_recordings_kind DEFAULT 'intro'::public.enum_lp_recordings_kind NOT NULL,
    duration_sec numeric,
    status public.enum_lp_recordings_status DEFAULT 'pending'::public.enum_lp_recordings_status NOT NULL,
    review_note character varying,
    reviewed_by_id integer,
    reviewed_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric
);

CREATE TABLE IF NOT EXISTS public.lp_settings (
    id integer NOT NULL,
    otp_provider public.enum_lp_settings_otp_provider DEFAULT 'log'::public.enum_lp_settings_otp_provider NOT NULL,
    sms_template character varying DEFAULT 'Ma xac thuc {brand} cua ban la {code}. Ma het han sau 5 phut. Khong chia se ma nay cho ai.'::character varying NOT NULL,
    brand character varying DEFAULT 'Bioscope'::character varying,
    esms_api_key character varying,
    esms_secret_key character varying,
    esms_brandname character varying,
    esms_sms_type public.enum_lp_settings_esms_sms_type DEFAULT '2'::public.enum_lp_settings_esms_sms_type,
    speedsms_access_token character varying,
    speedsms_sender character varying,
    speedsms_sms_type public.enum_lp_settings_speedsms_sms_type DEFAULT '3'::public.enum_lp_settings_speedsms_sms_type,
    otp_per_phone_per_hour numeric DEFAULT 5,
    otp_per_ip_per_hour numeric DEFAULT 20,
    server_ip character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);

-- ── 4. Gắn sequence + giá trị mặc định id ────────────────────────────────
ALTER SEQUENCE public.lp_campaigns_id_seq OWNED BY public.lp_campaigns.id;

ALTER SEQUENCE public.lp_orders_id_seq OWNED BY public.lp_orders.id;

ALTER SEQUENCE public.lp_otps_id_seq OWNED BY public.lp_otps.id;

ALTER SEQUENCE public.lp_participants_id_seq OWNED BY public.lp_participants.id;

ALTER SEQUENCE public.lp_participants_symptoms_id_seq OWNED BY public.lp_participants_symptoms.id;

ALTER SEQUENCE public.lp_point_events_id_seq OWNED BY public.lp_point_events.id;

ALTER SEQUENCE public.lp_recordings_id_seq OWNED BY public.lp_recordings.id;

ALTER SEQUENCE public.lp_settings_id_seq OWNED BY public.lp_settings.id;

ALTER TABLE ONLY public.lp_campaigns ALTER COLUMN id SET DEFAULT nextval('public.lp_campaigns_id_seq'::regclass);

ALTER TABLE ONLY public.lp_orders ALTER COLUMN id SET DEFAULT nextval('public.lp_orders_id_seq'::regclass);

ALTER TABLE ONLY public.lp_otps ALTER COLUMN id SET DEFAULT nextval('public.lp_otps_id_seq'::regclass);

ALTER TABLE ONLY public.lp_participants ALTER COLUMN id SET DEFAULT nextval('public.lp_participants_id_seq'::regclass);

ALTER TABLE ONLY public.lp_participants_symptoms ALTER COLUMN id SET DEFAULT nextval('public.lp_participants_symptoms_id_seq'::regclass);

ALTER TABLE ONLY public.lp_point_events ALTER COLUMN id SET DEFAULT nextval('public.lp_point_events_id_seq'::regclass);

ALTER TABLE ONLY public.lp_recordings ALTER COLUMN id SET DEFAULT nextval('public.lp_recordings_id_seq'::regclass);

ALTER TABLE ONLY public.lp_settings ALTER COLUMN id SET DEFAULT nextval('public.lp_settings_id_seq'::regclass);

-- ── 5. Khoá chính / duy nhất ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_certifications_pkey') THEN
    ALTER TABLE ONLY public.lp_campaigns_certifications
        ADD CONSTRAINT lp_campaigns_certifications_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_domains_pkey') THEN
    ALTER TABLE ONLY public.lp_campaigns_domains
        ADD CONSTRAINT lp_campaigns_domains_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_pkey') THEN
    ALTER TABLE ONLY public.lp_campaigns
        ADD CONSTRAINT lp_campaigns_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_studies_pkey') THEN
    ALTER TABLE ONLY public.lp_campaigns_studies
        ADD CONSTRAINT lp_campaigns_studies_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_testimonials_pkey') THEN
    ALTER TABLE ONLY public.lp_campaigns_testimonials
        ADD CONSTRAINT lp_campaigns_testimonials_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_videos_pkey') THEN
    ALTER TABLE ONLY public.lp_campaigns_videos
        ADD CONSTRAINT lp_campaigns_videos_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_orders_pkey') THEN
    ALTER TABLE ONLY public.lp_orders
        ADD CONSTRAINT lp_orders_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_otps_pkey') THEN
    ALTER TABLE ONLY public.lp_otps
        ADD CONSTRAINT lp_otps_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_participants_pkey') THEN
    ALTER TABLE ONLY public.lp_participants
        ADD CONSTRAINT lp_participants_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_participants_symptoms_pkey') THEN
    ALTER TABLE ONLY public.lp_participants_symptoms
        ADD CONSTRAINT lp_participants_symptoms_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_point_events_pkey') THEN
    ALTER TABLE ONLY public.lp_point_events
        ADD CONSTRAINT lp_point_events_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_recordings_pkey') THEN
    ALTER TABLE ONLY public.lp_recordings
        ADD CONSTRAINT lp_recordings_pkey PRIMARY KEY (id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_settings_pkey') THEN
    ALTER TABLE ONLY public.lp_settings
        ADD CONSTRAINT lp_settings_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- ── 6. Khoá tài liệu đang mở trong admin ────────────────────────────────
ALTER TABLE public.payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS lp_campaigns_id integer,
  ADD COLUMN IF NOT EXISTS lp_participants_id integer,
  ADD COLUMN IF NOT EXISTS lp_point_events_id integer,
  ADD COLUMN IF NOT EXISTS lp_recordings_id integer,
  ADD COLUMN IF NOT EXISTS lp_orders_id integer,
  ADD COLUMN IF NOT EXISTS lp_otps_id integer;

-- ── 7. Chỉ mục ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS lp_campaigns_certifications_file_idx ON public.lp_campaigns_certifications USING btree (file_id);

CREATE INDEX IF NOT EXISTS lp_campaigns_certifications_order_idx ON public.lp_campaigns_certifications USING btree (_order);

CREATE INDEX IF NOT EXISTS lp_campaigns_certifications_parent_id_idx ON public.lp_campaigns_certifications USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS lp_campaigns_created_at_idx ON public.lp_campaigns USING btree (created_at);

CREATE INDEX IF NOT EXISTS lp_campaigns_domains_order_idx ON public.lp_campaigns_domains USING btree (_order);

CREATE INDEX IF NOT EXISTS lp_campaigns_domains_parent_id_idx ON public.lp_campaigns_domains USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS lp_campaigns_og_image_idx ON public.lp_campaigns USING btree (og_image_id);

CREATE UNIQUE INDEX IF NOT EXISTS lp_campaigns_slug_idx ON public.lp_campaigns USING btree (slug);

CREATE INDEX IF NOT EXISTS lp_campaigns_studies_order_idx ON public.lp_campaigns_studies USING btree (_order);

CREATE INDEX IF NOT EXISTS lp_campaigns_studies_parent_id_idx ON public.lp_campaigns_studies USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS lp_campaigns_testimonials_order_idx ON public.lp_campaigns_testimonials USING btree (_order);

CREATE INDEX IF NOT EXISTS lp_campaigns_testimonials_parent_id_idx ON public.lp_campaigns_testimonials USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS lp_campaigns_updated_at_idx ON public.lp_campaigns USING btree (updated_at);

CREATE INDEX IF NOT EXISTS lp_campaigns_videos_order_idx ON public.lp_campaigns_videos USING btree (_order);

CREATE INDEX IF NOT EXISTS lp_campaigns_videos_parent_id_idx ON public.lp_campaigns_videos USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS lp_orders_buyer_idx ON public.lp_orders USING btree (buyer_id);

CREATE INDEX IF NOT EXISTS lp_orders_campaign_idx ON public.lp_orders USING btree (campaign_id);

CREATE INDEX IF NOT EXISTS lp_orders_code_idx ON public.lp_orders USING btree (code);

CREATE INDEX IF NOT EXISTS lp_orders_created_at_idx ON public.lp_orders USING btree (created_at);

CREATE INDEX IF NOT EXISTS lp_orders_phone_idx ON public.lp_orders USING btree (phone);

CREATE INDEX IF NOT EXISTS lp_orders_referrer_idx ON public.lp_orders USING btree (referrer_id);

CREATE INDEX IF NOT EXISTS lp_orders_updated_at_idx ON public.lp_orders USING btree (updated_at);

CREATE INDEX IF NOT EXISTS lp_otps_campaign_idx ON public.lp_otps USING btree (campaign_id);

CREATE INDEX IF NOT EXISTS lp_otps_created_at_idx ON public.lp_otps USING btree (created_at);

CREATE INDEX IF NOT EXISTS lp_otps_ip_idx ON public.lp_otps USING btree (ip);

CREATE INDEX IF NOT EXISTS lp_otps_phone_idx ON public.lp_otps USING btree (phone);

CREATE INDEX IF NOT EXISTS lp_otps_updated_at_idx ON public.lp_otps USING btree (updated_at);

CREATE INDEX IF NOT EXISTS lp_participants_campaign_idx ON public.lp_participants USING btree (campaign_id);

CREATE INDEX IF NOT EXISTS lp_participants_created_at_idx ON public.lp_participants USING btree (created_at);

CREATE INDEX IF NOT EXISTS lp_participants_phone_idx ON public.lp_participants USING btree (phone);

CREATE UNIQUE INDEX IF NOT EXISTS lp_participants_referral_code_idx ON public.lp_participants USING btree (referral_code);

CREATE INDEX IF NOT EXISTS lp_participants_referred_by_idx ON public.lp_participants USING btree (referred_by_id);

CREATE INDEX IF NOT EXISTS lp_participants_symptoms_order_idx ON public.lp_participants_symptoms USING btree ("order");

CREATE INDEX IF NOT EXISTS lp_participants_symptoms_parent_idx ON public.lp_participants_symptoms USING btree (parent_id);

CREATE INDEX IF NOT EXISTS lp_participants_updated_at_idx ON public.lp_participants USING btree (updated_at);

CREATE INDEX IF NOT EXISTS lp_point_events_campaign_idx ON public.lp_point_events USING btree (campaign_id);

CREATE INDEX IF NOT EXISTS lp_point_events_created_at_idx ON public.lp_point_events USING btree (created_at);

CREATE INDEX IF NOT EXISTS lp_point_events_created_by_idx ON public.lp_point_events USING btree (created_by_id);

CREATE INDEX IF NOT EXISTS lp_point_events_participant_idx ON public.lp_point_events USING btree (participant_id);

CREATE INDEX IF NOT EXISTS lp_point_events_updated_at_idx ON public.lp_point_events USING btree (updated_at);

CREATE INDEX IF NOT EXISTS lp_recordings_campaign_idx ON public.lp_recordings USING btree (campaign_id);

CREATE INDEX IF NOT EXISTS lp_recordings_created_at_idx ON public.lp_recordings USING btree (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS lp_recordings_filename_idx ON public.lp_recordings USING btree (filename);

CREATE INDEX IF NOT EXISTS lp_recordings_participant_idx ON public.lp_recordings USING btree (participant_id);

CREATE INDEX IF NOT EXISTS lp_recordings_reviewed_by_idx ON public.lp_recordings USING btree (reviewed_by_id);

CREATE INDEX IF NOT EXISTS lp_recordings_updated_at_idx ON public.lp_recordings USING btree (updated_at);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_campaigns_id_idx ON public.payload_locked_documents_rels USING btree (lp_campaigns_id);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_orders_id_idx ON public.payload_locked_documents_rels USING btree (lp_orders_id);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_otps_id_idx ON public.payload_locked_documents_rels USING btree (lp_otps_id);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_participants_id_idx ON public.payload_locked_documents_rels USING btree (lp_participants_id);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_point_events_id_idx ON public.payload_locked_documents_rels USING btree (lp_point_events_id);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_recordings_id_idx ON public.payload_locked_documents_rels USING btree (lp_recordings_id);

-- ── 8. Khoá ngoại ────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_certifications_file_id_media_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns_certifications
        ADD CONSTRAINT lp_campaigns_certifications_file_id_media_id_fk FOREIGN KEY (file_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_certifications_parent_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns_certifications
        ADD CONSTRAINT lp_campaigns_certifications_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.lp_campaigns(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_domains_parent_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns_domains
        ADD CONSTRAINT lp_campaigns_domains_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.lp_campaigns(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_og_image_id_media_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns
        ADD CONSTRAINT lp_campaigns_og_image_id_media_id_fk FOREIGN KEY (og_image_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_studies_parent_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns_studies
        ADD CONSTRAINT lp_campaigns_studies_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.lp_campaigns(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_testimonials_parent_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns_testimonials
        ADD CONSTRAINT lp_campaigns_testimonials_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.lp_campaigns(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_videos_parent_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns_videos
        ADD CONSTRAINT lp_campaigns_videos_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.lp_campaigns(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_orders_buyer_id_lp_participants_id_fk') THEN
    ALTER TABLE ONLY public.lp_orders
        ADD CONSTRAINT lp_orders_buyer_id_lp_participants_id_fk FOREIGN KEY (buyer_id) REFERENCES public.lp_participants(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_orders_campaign_id_lp_campaigns_id_fk') THEN
    ALTER TABLE ONLY public.lp_orders
        ADD CONSTRAINT lp_orders_campaign_id_lp_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.lp_campaigns(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_orders_referrer_id_lp_participants_id_fk') THEN
    ALTER TABLE ONLY public.lp_orders
        ADD CONSTRAINT lp_orders_referrer_id_lp_participants_id_fk FOREIGN KEY (referrer_id) REFERENCES public.lp_participants(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_otps_campaign_id_lp_campaigns_id_fk') THEN
    ALTER TABLE ONLY public.lp_otps
        ADD CONSTRAINT lp_otps_campaign_id_lp_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.lp_campaigns(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_participants_campaign_id_lp_campaigns_id_fk') THEN
    ALTER TABLE ONLY public.lp_participants
        ADD CONSTRAINT lp_participants_campaign_id_lp_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.lp_campaigns(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_participants_referred_by_id_lp_participants_id_fk') THEN
    ALTER TABLE ONLY public.lp_participants
        ADD CONSTRAINT lp_participants_referred_by_id_lp_participants_id_fk FOREIGN KEY (referred_by_id) REFERENCES public.lp_participants(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_participants_symptoms_parent_fk') THEN
    ALTER TABLE ONLY public.lp_participants_symptoms
        ADD CONSTRAINT lp_participants_symptoms_parent_fk FOREIGN KEY (parent_id) REFERENCES public.lp_participants(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_point_events_campaign_id_lp_campaigns_id_fk') THEN
    ALTER TABLE ONLY public.lp_point_events
        ADD CONSTRAINT lp_point_events_campaign_id_lp_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.lp_campaigns(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_point_events_created_by_id_users_id_fk') THEN
    ALTER TABLE ONLY public.lp_point_events
        ADD CONSTRAINT lp_point_events_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_point_events_participant_id_lp_participants_id_fk') THEN
    ALTER TABLE ONLY public.lp_point_events
        ADD CONSTRAINT lp_point_events_participant_id_lp_participants_id_fk FOREIGN KEY (participant_id) REFERENCES public.lp_participants(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_recordings_campaign_id_lp_campaigns_id_fk') THEN
    ALTER TABLE ONLY public.lp_recordings
        ADD CONSTRAINT lp_recordings_campaign_id_lp_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.lp_campaigns(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_recordings_participant_id_lp_participants_id_fk') THEN
    ALTER TABLE ONLY public.lp_recordings
        ADD CONSTRAINT lp_recordings_participant_id_lp_participants_id_fk FOREIGN KEY (participant_id) REFERENCES public.lp_participants(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_recordings_reviewed_by_id_users_id_fk') THEN
    ALTER TABLE ONLY public.lp_recordings
        ADD CONSTRAINT lp_recordings_reviewed_by_id_users_id_fk FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_campaigns_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_campaigns_fk FOREIGN KEY (lp_campaigns_id) REFERENCES public.lp_campaigns(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_orders_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_orders_fk FOREIGN KEY (lp_orders_id) REFERENCES public.lp_orders(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_otps_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_otps_fk FOREIGN KEY (lp_otps_id) REFERENCES public.lp_otps(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_participants_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_participants_fk FOREIGN KEY (lp_participants_id) REFERENCES public.lp_participants(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_point_events_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_point_events_fk FOREIGN KEY (lp_point_events_id) REFERENCES public.lp_point_events(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_recordings_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_recordings_fk FOREIGN KEY (lp_recordings_id) REFERENCES public.lp_recordings(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── Bổ sung 21/09/2026: favicon riêng cho chiến dịch ─────────────────────────
ALTER TABLE public.lp_campaigns ADD COLUMN IF NOT EXISTS favicon_id integer;
CREATE INDEX IF NOT EXISTS lp_campaigns_favicon_idx ON public.lp_campaigns USING btree (favicon_id);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_campaigns_favicon_id_media_id_fk') THEN
    ALTER TABLE ONLY public.lp_campaigns
        ADD CONSTRAINT lp_campaigns_favicon_id_media_id_fk FOREIGN KEY (favicon_id) REFERENCES public.media(id) ON DELETE SET NULL;
  END IF;
END$$;

-- =============================================================================
-- Bổ sung 25/09/2026: ĐỢT THEO THÁNG (chốt cuối tháng, công bố ngày 05 tháng sau)
--
--   lp_rounds (+ _winners) : mỗi tháng một đợt, kèm danh sách người nhận quà
--   lp_participants        : + round_key / round_join_seq / round_points /
--                            invite_credited / win_at
--   lp_point_events        : + round (khoá chống trùng mang theo mã đợt)
--   lp_recordings          : + round
--   lp_campaigns           : + chu kỳ, mốc chốt/công bố, câu chữ đầu trang,
--                            giải thích con số, thể lệ
--
-- Cuối file có bước CHUYỂN DỮ LIỆU CŨ: mọi người tham gia và điểm hiện có được
-- gán vào đợt của tháng đang chạy, không ai mất điểm.
-- =============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lp_campaigns_cycle') THEN
    CREATE TYPE public.enum_lp_campaigns_cycle AS ENUM ('monthly', 'once');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lp_rounds_status') THEN
    CREATE TYPE public.enum_lp_rounds_status AS ENUM ('open', 'closed', 'announced');
  END IF;
END$$;

CREATE SEQUENCE IF NOT EXISTS public.lp_rounds_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE IF NOT EXISTS public.lp_rounds (
    id integer PRIMARY KEY DEFAULT nextval('public.lp_rounds_id_seq'::regclass),
    campaign_id integer NOT NULL,
    key character varying NOT NULL,
    start_at timestamp(3) with time zone,
    end_at timestamp(3) with time zone NOT NULL,
    announce_at timestamp(3) with time zone NOT NULL,
    status public.enum_lp_rounds_status DEFAULT 'open'::public.enum_lp_rounds_status NOT NULL,
    slots numeric,
    participants numeric,
    frozen_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
ALTER SEQUENCE public.lp_rounds_id_seq OWNED BY public.lp_rounds.id;

CREATE TABLE IF NOT EXISTS public.lp_rounds_winners (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying PRIMARY KEY,
    participant_id integer,
    rank numeric,
    points numeric
);

CREATE UNIQUE INDEX IF NOT EXISTS campaign_key_idx ON public.lp_rounds USING btree (campaign_id, key);
CREATE INDEX IF NOT EXISTS lp_rounds_campaign_idx ON public.lp_rounds USING btree (campaign_id);
CREATE INDEX IF NOT EXISTS lp_rounds_key_idx ON public.lp_rounds USING btree (key);
CREATE INDEX IF NOT EXISTS lp_rounds_created_at_idx ON public.lp_rounds USING btree (created_at);
CREATE INDEX IF NOT EXISTS lp_rounds_updated_at_idx ON public.lp_rounds USING btree (updated_at);
CREATE INDEX IF NOT EXISTS lp_rounds_winners_order_idx ON public.lp_rounds_winners USING btree (_order);
CREATE INDEX IF NOT EXISTS lp_rounds_winners_parent_id_idx ON public.lp_rounds_winners USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS lp_rounds_winners_participant_idx ON public.lp_rounds_winners USING btree (participant_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_rounds_campaign_id_lp_campaigns_id_fk') THEN
    ALTER TABLE ONLY public.lp_rounds
        ADD CONSTRAINT lp_rounds_campaign_id_lp_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.lp_campaigns(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_rounds_winners_parent_id_fk') THEN
    ALTER TABLE ONLY public.lp_rounds_winners
        ADD CONSTRAINT lp_rounds_winners_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.lp_rounds(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lp_rounds_winners_participant_id_lp_participants_id_fk') THEN
    ALTER TABLE ONLY public.lp_rounds_winners
        ADD CONSTRAINT lp_rounds_winners_participant_id_lp_participants_id_fk FOREIGN KEY (participant_id) REFERENCES public.lp_participants(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ── Cột mới ──────────────────────────────────────────────────────────────────
ALTER TABLE public.lp_campaigns
  ADD COLUMN IF NOT EXISTS cycle public.enum_lp_campaigns_cycle DEFAULT 'monthly'::public.enum_lp_campaigns_cycle NOT NULL,
  ADD COLUMN IF NOT EXISTS close_time character varying DEFAULT '23:59'::character varying,
  ADD COLUMN IF NOT EXISTS announce_day numeric DEFAULT 5,
  ADD COLUMN IF NOT EXISTS announce_time character varying DEFAULT '10:00'::character varying,
  ADD COLUMN IF NOT EXISTS show_result_days numeric DEFAULT 7,
  ADD COLUMN IF NOT EXISTS program_name character varying DEFAULT 'Chương trình quà tháng {thang}'::character varying,
  ADD COLUMN IF NOT EXISTS hero_title character varying DEFAULT '{soSuat} phần quà dành cho khách hàng quan tâm đến *sức khoẻ dạ dày*'::character varying,
  ADD COLUMN IF NOT EXISTS hero_subtitle character varying DEFAULT 'Tham gia chương trình, hoàn thành các hoạt động để tích điểm và có cơ hội nhận quà tận nhà.'::character varying,
  ADD COLUMN IF NOT EXISTS cta_label character varying DEFAULT 'THAM GIA NGAY'::character varying,
  ADD COLUMN IF NOT EXISTS gift_note character varying DEFAULT 'Mỗi phần quà: 1 lọ Gastroheal 50 ml, giao tận nhà'::character varying,
  ADD COLUMN IF NOT EXISTS eligibility_note character varying DEFAULT 'Miễn phí · dành cho khách từ 18 tuổi đang ở Việt Nam · mỗi số điện thoại tham gia một lần'::character varying,
  ADD COLUMN IF NOT EXISTS number_explain character varying,
  ADD COLUMN IF NOT EXISTS rules_text character varying;

-- Chu kỳ theo tháng thì hạn chốt do hệ thống tính, không bắt nhập tay nữa.
ALTER TABLE public.lp_campaigns ALTER COLUMN deadline DROP NOT NULL;

ALTER TABLE public.lp_participants
  ADD COLUMN IF NOT EXISTS round_key character varying,
  ADD COLUMN IF NOT EXISTS round_join_seq numeric,
  ADD COLUMN IF NOT EXISTS round_points numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invite_credited boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS win_at timestamp(3) with time zone;

ALTER TABLE public.lp_point_events ADD COLUMN IF NOT EXISTS round character varying;
ALTER TABLE public.lp_recordings ADD COLUMN IF NOT EXISTS round character varying;
ALTER TABLE public.payload_locked_documents_rels ADD COLUMN IF NOT EXISTS lp_rounds_id integer;

-- ── Sửa thiếu sót của bản migration đầu (25/09/2026) ─────────────────────────
-- Ba index DUY NHẤT dưới đây bị sót: chúng là thứ chặn đăng ký trùng số điện
-- thoại và chặn cộng điểm hai lần khi hai request đến cùng lúc. Payload tự tạo
-- khi push ở môi trường dev nên bản chạy thử không lộ ra thiếu sót này.
CREATE UNIQUE INDEX IF NOT EXISTS campaign_phone_idx ON public.lp_participants USING btree (campaign_id, phone);
CREATE UNIQUE INDEX IF NOT EXISTS "campaign_joinSeq_idx" ON public.lp_participants USING btree (campaign_id, join_seq);
CREATE UNIQUE INDEX IF NOT EXISTS "participant_refKey_idx" ON public.lp_point_events USING btree (participant_id, ref_key);

-- Bảng điểm mới (mời người tham gia +10) nên mốc 100% nâng từ 29 lên 45.
ALTER TABLE public.lp_campaigns ALTER COLUMN points_goal SET DEFAULT 45;
ALTER TABLE public.lp_campaigns ALTER COLUMN hero_title SET DEFAULT '{soSuat} phần quà dành cho khách hàng quan tâm đến *sức khoẻ dạ dày*'::character varying;

CREATE INDEX IF NOT EXISTS lp_participants_round_key_idx ON public.lp_participants USING btree (round_key);
CREATE UNIQUE INDEX IF NOT EXISTS "campaign_roundKey_roundJoinSeq_idx" ON public.lp_participants USING btree (campaign_id, round_key, round_join_seq);
CREATE INDEX IF NOT EXISTS lp_point_events_round_idx ON public.lp_point_events USING btree (round);
CREATE INDEX IF NOT EXISTS lp_recordings_round_idx ON public.lp_recordings USING btree (round);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_lp_rounds_id_idx ON public.payload_locked_documents_rels USING btree (lp_rounds_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payload_locked_documents_rels_lp_rounds_fk') THEN
    ALTER TABLE ONLY public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_lp_rounds_fk FOREIGN KEY (lp_rounds_id) REFERENCES public.lp_rounds(id) ON DELETE CASCADE;
  END IF;
END$$;

-- ── Chuyển dữ liệu cũ sang đợt của tháng đang chạy ───────────────────────────
-- Chạy lại lần hai không làm gì thêm (chỉ đụng các dòng còn NULL).
DO $$
DECLARE
  vn      timestamp := now() AT TIME ZONE 'Asia/Ho_Chi_Minh';
  k       text      := to_char(vn, 'YYYY-MM');
  m_start timestamp := date_trunc('month', vn);
  r_start timestamptz := m_start AT TIME ZONE 'Asia/Ho_Chi_Minh';
  r_end   timestamptz := ((m_start + interval '1 month' - interval '1 day')::date + time '23:59:59') AT TIME ZONE 'Asia/Ho_Chi_Minh';
  r_ann   timestamptz := ((m_start + interval '1 month')::date + interval '4 days' + time '10:00') AT TIME ZONE 'Asia/Ho_Chi_Minh';
BEGIN
  INSERT INTO public.lp_rounds (campaign_id, key, start_at, end_at, announce_at, status, slots)
  SELECT c.id, k, r_start, r_end, r_ann, 'open', c.slots
  FROM public.lp_campaigns c
  WHERE NOT EXISTS (SELECT 1 FROM public.lp_rounds r WHERE r.campaign_id = c.id AND r.key = k);

  UPDATE public.lp_participants
     SET round_key = k, round_join_seq = join_seq, round_points = COALESCE(points, 0)
   WHERE round_key IS NULL;

  -- Khoá chống trùng mang theo mã đợt; dòng cũ phải đổi theo, nếu không tháng
  -- này người đó xem lại video cũ sẽ được cộng thêm một lần nữa.
  UPDATE public.lp_point_events SET round = k, ref_key = k || ':' || ref_key WHERE round IS NULL;
  UPDATE public.lp_recordings   SET round = k WHERE round IS NULL;
END$$;

COMMIT;
