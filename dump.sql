--
-- PostgreSQL database dump
--

\restrict KJOxrinPHfgm7qjeWTdeBqzb8oBvKAglwpgpmQqSuXcshYRkSLUWMQQJTdnMB2G

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ArticleStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ArticleStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."ArticleStatus" OWNER TO admin;

--
-- Name: AuditActionType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."AuditActionType" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'ATTACH',
    'DETACH',
    'PUBLISH',
    'UNPUBLISH',
    'RESTORE',
    'ARCHIVE',
    'ROLE_GRANT',
    'ROLE_REVOKE',
    'BAN',
    'UNBAN',
    'PASSWORD_CHANGE',
    'LOGIN',
    'LOGOUT'
);


ALTER TYPE public."AuditActionType" OWNER TO admin;

--
-- Name: MediaKind; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."MediaKind" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT'
);


ALTER TYPE public."MediaKind" OWNER TO admin;

--
-- Name: MediaLinkRole; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."MediaLinkRole" AS ENUM (
    'COVER',
    'GALLERY',
    'THUMBNAIL',
    'BANNER',
    'SEO_COVER',
    'SWATCH',
    'INLINE',
    'TECHNICAL_SHEET_IMAGE',
    'LIFESTYLE'
);


ALTER TYPE public."MediaLinkRole" OWNER TO admin;

--
-- Name: MediaVisibility; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."MediaVisibility" AS ENUM (
    'PRIVATE',
    'PUBLIC'
);


ALTER TYPE public."MediaVisibility" OWNER TO admin;

--
-- Name: Portal; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."Portal" AS ENUM (
    'CUSTOMER',
    'STAFF'
);


ALTER TYPE public."Portal" OWNER TO admin;

--
-- Name: PowerType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."PowerType" AS ENUM (
    'ROOT',
    'ADMIN',
    'STAFF'
);


ALTER TYPE public."PowerType" OWNER TO admin;

--
-- Name: ProductCommercialMode; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ProductCommercialMode" AS ENUM (
    'ON_REQUEST_ONLY',
    'ON_REQUEST_OR_ONLINE',
    'ONLINE_ONLY'
);


ALTER TYPE public."ProductCommercialMode" OWNER TO admin;

--
-- Name: ProductKind; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ProductKind" AS ENUM (
    'VARIANT',
    'PACK',
    'SINGLE'
);


ALTER TYPE public."ProductKind" OWNER TO admin;

--
-- Name: ProductLifecycle; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ProductLifecycle" AS ENUM (
    'DRAFT',
    'ACTIVE'
);


ALTER TYPE public."ProductLifecycle" OWNER TO admin;

--
-- Name: ProductStockUnit; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ProductStockUnit" AS ENUM (
    'ITEM',
    'KILOGRAM',
    'LITER',
    'CUBIC_METER',
    'METER',
    'SQUARE_METER'
);


ALTER TYPE public."ProductStockUnit" OWNER TO admin;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'BANNED',
    'CLOSED'
);


ALTER TYPE public."UserStatus" OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: article_author_links; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.article_author_links (
    article_id bigint NOT NULL,
    user_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.article_author_links OWNER TO admin;

--
-- Name: article_categories; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.article_categories (
    id bigint NOT NULL,
    parent_id bigint,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    color character varying(30) DEFAULT '#0a8dc1'::character varying NOT NULL,
    created_by_user_id text,
    updated_by_user_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.article_categories OWNER TO admin;

--
-- Name: article_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.article_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_categories_id_seq OWNER TO admin;

--
-- Name: article_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.article_categories_id_seq OWNED BY public.article_categories.id;


--
-- Name: article_category_links; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.article_category_links (
    article_id bigint NOT NULL,
    category_id bigint NOT NULL,
    score integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.article_category_links OWNER TO admin;

--
-- Name: article_media_links; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.article_media_links (
    article_id bigint NOT NULL,
    media_id bigint NOT NULL,
    role public."MediaLinkRole" NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.article_media_links OWNER TO admin;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.articles (
    id bigint NOT NULL,
    author_id text NOT NULL,
    updated_by_user_id text,
    published_by_user_id text,
    archived_by_user_id text,
    deleted_by_user_id text,
    deleted_at timestamp(3) without time zone,
    title character varying(255) NOT NULL,
    display_title character varying(255),
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    description_seo text,
    tags text DEFAULT ''::text NOT NULL,
    status public."ArticleStatus" NOT NULL,
    published_at timestamp(3) without time zone,
    cover_media_id bigint,
    og_title character varying(255),
    og_description text,
    og_image_media_id bigint,
    no_index boolean DEFAULT false NOT NULL,
    no_follow boolean DEFAULT false NOT NULL,
    schema_type character varying(100),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.articles OWNER TO admin;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO admin;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: audit_log_field_changes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_log_field_changes (
    id bigint NOT NULL,
    audit_log_id bigint NOT NULL,
    field_name character varying(255) NOT NULL,
    old_value_text text,
    new_value_text text
);


ALTER TABLE public.audit_log_field_changes OWNER TO admin;

--
-- Name: audit_log_field_changes_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.audit_log_field_changes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_field_changes_id_seq OWNER TO admin;

--
-- Name: audit_log_field_changes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.audit_log_field_changes_id_seq OWNED BY public.audit_log_field_changes.id;


--
-- Name: audit_log_relation_changes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_log_relation_changes (
    id bigint NOT NULL,
    audit_log_id bigint NOT NULL,
    relation_name character varying(255) NOT NULL,
    action_type public."AuditActionType" NOT NULL,
    left_entity_type character varying(100) NOT NULL,
    left_entity_id character varying(100) NOT NULL,
    right_entity_type character varying(100) NOT NULL,
    right_entity_id character varying(100) NOT NULL,
    details_json jsonb
);


ALTER TABLE public.audit_log_relation_changes OWNER TO admin;

--
-- Name: audit_log_relation_changes_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.audit_log_relation_changes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_relation_changes_id_seq OWNER TO admin;

--
-- Name: audit_log_relation_changes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.audit_log_relation_changes_id_seq OWNED BY public.audit_log_relation_changes.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    actor_user_id text,
    action_type public."AuditActionType" NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100) NOT NULL,
    target_label character varying(255),
    summary text,
    reason text,
    request_id character varying(255),
    ip_address character varying(100),
    user_agent text,
    before_snapshot_json jsonb,
    after_snapshot_json jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.media (
    id bigint NOT NULL,
    folder_id bigint,
    kind public."MediaKind" NOT NULL,
    visibility public."MediaVisibility" DEFAULT 'PRIVATE'::public."MediaVisibility" NOT NULL,
    storage_path character varying(500) NOT NULL,
    original_filename character varying(255),
    mime_type character varying(255),
    extension character varying(32),
    alt_text character varying(500),
    title character varying(255),
    description text,
    width_px integer,
    height_px integer,
    duration_seconds numeric(10,2),
    size_bytes bigint,
    sha256_hash character varying(128),
    is_active boolean DEFAULT true NOT NULL,
    uploaded_by_user_id text,
    updated_by_user_id text,
    deleted_at timestamp(3) without time zone,
    deleted_by_user_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.media OWNER TO admin;

--
-- Name: media_folders; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.media_folders (
    id bigint NOT NULL,
    parent_id bigint,
    name character varying(255) NOT NULL,
    created_by_user_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.media_folders OWNER TO admin;

--
-- Name: media_folders_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.media_folders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_folders_id_seq OWNER TO admin;

--
-- Name: media_folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.media_folders_id_seq OWNED BY public.media_folders.id;


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO admin;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    key character varying(150) NOT NULL,
    label character varying(255) NOT NULL,
    resource character varying(100) NOT NULL,
    action character varying(100) NOT NULL,
    scope character varying(50),
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO admin;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO admin;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_attributes (
    product_id bigint NOT NULL,
    value text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    kind text NOT NULL
);


ALTER TABLE public.product_attributes OWNER TO admin;

--
-- Name: product_families; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_families (
    id bigint NOT NULL,
    slug character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    subtitle character varying(255),
    description text,
    description_seo text,
    main_image_media_id bigint,
    default_product_id bigint,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_families OWNER TO admin;

--
-- Name: product_families_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.product_families_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_families_id_seq OWNER TO admin;

--
-- Name: product_families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.product_families_id_seq OWNED BY public.product_families.id;


--
-- Name: product_family_members; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_family_members (
    family_id bigint NOT NULL,
    product_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_family_members OWNER TO admin;

--
-- Name: product_media_links; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_media_links (
    product_id bigint NOT NULL,
    media_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_media_links OWNER TO admin;

--
-- Name: product_pack_lines; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_pack_lines (
    pack_product_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_pack_lines OWNER TO admin;

--
-- Name: product_subcategories; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_subcategories (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    subtitle character varying(255),
    slug character varying(255) NOT NULL,
    description text,
    description_seo text,
    image_media_id bigint,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_subcategories OWNER TO admin;

--
-- Name: product_subcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.product_subcategories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_subcategories_id_seq OWNER TO admin;

--
-- Name: product_subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.product_subcategories_id_seq OWNED BY public.product_subcategories.id;


--
-- Name: product_subcategory_links; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_subcategory_links (
    product_id bigint NOT NULL,
    subcategory_id bigint NOT NULL
);


ALTER TABLE public.product_subcategory_links OWNER TO admin;

--
-- Name: product_types; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.product_types (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    subtitle character varying(255),
    slug character varying(255) NOT NULL,
    description text,
    description_seo text,
    image_media_id bigint,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    theme_color character varying(255)
);


ALTER TABLE public.product_types OWNER TO admin;

--
-- Name: product_types_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.product_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_types_id_seq OWNER TO admin;

--
-- Name: product_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.product_types_id_seq OWNED BY public.product_types.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    sku character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    kind public."ProductKind" NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    description_seo text,
    base_price_amount numeric(12,3),
    vat_rate double precision,
    stock numeric(14,3),
    stock_unit public."ProductStockUnit",
    visibility boolean,
    price_visibility boolean,
    stock_visibility boolean,
    lifecycle public."ProductLifecycle",
    commercial_mode public."ProductCommercialMode",
    tags text DEFAULT ''::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    brand_code text,
    datasheet_media_id bigint
);


ALTER TABLE public.products OWNER TO admin;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO admin;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.profiles (
    id bigint NOT NULL,
    user_id text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    job_title character varying(150),
    phone character varying(50),
    bio text,
    birth_date timestamp(3) without time zone,
    avatar_media_id bigint
);


ALTER TABLE public.profiles OWNER TO admin;

--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profiles_id_seq OWNER TO admin;

--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token_hash text NOT NULL,
    user_id text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp(3) without time zone,
    last_used_at timestamp(3) without time zone,
    created_by_ip_address character varying(100),
    created_by_user_agent text,
    replaced_by_token_id text
);


ALTER TABLE public.refresh_tokens OWNER TO admin;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.role_permissions (
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL,
    allowed boolean DEFAULT true NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO admin;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    key character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    color character varying(30) NOT NULL,
    priority_index integer DEFAULT 100 NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO admin;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO admin;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tags OWNER TO admin;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO admin;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: user_role_assignments; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_role_assignments (
    id bigint NOT NULL,
    user_id text NOT NULL,
    role_id bigint NOT NULL,
    granted_by_user_id text,
    revoked_by_user_id text,
    granted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp(3) without time zone,
    reason text
);


ALTER TABLE public.user_role_assignments OWNER TO admin;

--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.user_role_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_role_assignments_id_seq OWNER TO admin;

--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.user_role_assignments_id_seq OWNED BY public.user_role_assignments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    portal public."Portal" DEFAULT 'STAFF'::public."Portal" NOT NULL,
    power_type public."PowerType" DEFAULT 'STAFF'::public."PowerType" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    banned_at timestamp(3) without time zone,
    banned_reason text,
    closed_at timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    password_changed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: article_categories id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_categories ALTER COLUMN id SET DEFAULT nextval('public.article_categories_id_seq'::regclass);


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: audit_log_field_changes id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log_field_changes ALTER COLUMN id SET DEFAULT nextval('public.audit_log_field_changes_id_seq'::regclass);


--
-- Name: audit_log_relation_changes id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log_relation_changes ALTER COLUMN id SET DEFAULT nextval('public.audit_log_relation_changes_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: media_folders id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media_folders ALTER COLUMN id SET DEFAULT nextval('public.media_folders_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: product_families id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_families ALTER COLUMN id SET DEFAULT nextval('public.product_families_id_seq'::regclass);


--
-- Name: product_subcategories id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategories ALTER COLUMN id SET DEFAULT nextval('public.product_subcategories_id_seq'::regclass);


--
-- Name: product_types id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_types ALTER COLUMN id SET DEFAULT nextval('public.product_types_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: user_role_assignments id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_role_assignments ALTER COLUMN id SET DEFAULT nextval('public.user_role_assignments_id_seq'::regclass);


--
-- Data for Name: article_author_links; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.article_author_links (article_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: article_categories; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.article_categories (id, parent_id, name, slug, color, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: article_category_links; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.article_category_links (article_id, category_id, score, created_at) FROM stdin;
\.


--
-- Data for Name: article_media_links; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.article_media_links (article_id, media_id, role, sort_order) FROM stdin;
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.articles (id, author_id, updated_by_user_id, published_by_user_id, archived_by_user_id, deleted_by_user_id, deleted_at, title, display_title, slug, excerpt, content, description_seo, tags, status, published_at, cover_media_id, og_title, og_description, og_image_media_id, no_index, no_follow, schema_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_log_field_changes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_log_field_changes (id, audit_log_id, field_name, old_value_text, new_value_text) FROM stdin;
\.


--
-- Data for Name: audit_log_relation_changes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_log_relation_changes (id, audit_log_id, relation_name, action_type, left_entity_type, left_entity_id, right_entity_type, right_entity_id, details_json) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_logs (id, actor_user_id, action_type, entity_type, entity_id, target_label, summary, reason, request_id, ip_address, user_agent, before_snapshot_json, after_snapshot_json, created_at) FROM stdin;
1	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	1	Baignoires.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 1, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:32.716Z", "extension": "png", "sizeBytes": 644506, "updatedAt": "2026-04-07T07:48:32.716Z", "sha256Hash": "780557b54fee5731678dde407afe22bd1bc71bd5833767f4ee3c3599d1cd08dc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/0bbde244-f5c8-412a-b880-b1b7b4f5cc70-baignoires.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Baignoires.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:32.774
2	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	2	Béton Ciré.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 2, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:32.871Z", "extension": "png", "sizeBytes": 1481066, "updatedAt": "2026-04-07T07:48:32.871Z", "sha256Hash": "461863e318c9fffab9ba10aa83c02f85f453c202671a048f73a30c03b7bff31a", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d2780870-2a89-47db-b78c-015fa1b230cb-beton-cire.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Béton Ciré.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:32.885
3	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	3	Briques.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 3, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:32.983Z", "extension": "png", "sizeBytes": 2004042, "updatedAt": "2026-04-07T07:48:32.983Z", "sha256Hash": "75c2c76b26e9ea37efd7ffcca3201f1341f4b95147d57ba165d840236b612894", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/9d5bd9c4-772c-46a8-9d2d-6419600dc44f-briques.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Briques.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:32.998
4	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	4	Chimie du bâtiment.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 4, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.098Z", "extension": "png", "sizeBytes": 1311713, "updatedAt": "2026-04-07T07:48:33.098Z", "sha256Hash": "f0a07b245c480503fe0e9d9bbacbc8c934d3ff8d31376ae1e21118bc9fb2a504", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2dc7f78d-dd9a-4e87-9f5b-b690f00303f4-chimie-du-batiment.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Chimie du bâtiment.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.112
5	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	5	Ciments et produits en béton.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 5, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.209Z", "extension": "png", "sizeBytes": 2426143, "updatedAt": "2026-04-07T07:48:33.209Z", "sha256Hash": "836b8f3566a50408c4e15b6ab936d4ee1d50dccdda25dbb91aaf636a28ba40f1", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/27d2587b-5336-4692-9a66-8ca5650f0c08-ciments-et-produits-en-beton.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciments et produits en béton.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.223
6	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	6	Espace douche.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 6, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.293Z", "extension": "png", "sizeBytes": 927734, "updatedAt": "2026-04-07T07:48:33.293Z", "sha256Hash": "ba71c086c7549c04f0fa883e6f68cc4e07fdd620a7b181fbc16d012a35caf058", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c3a33fe4-3115-48af-9184-113a7a278e5c-espace-douche.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Espace douche.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.305
95	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	2	Matériaux de construction	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 5}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T15:13:24.489Z", "themeColor": "#FF8A00", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 2, "updatedAt": "2026-04-07T15:13:24.496Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 5}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:13:24.495Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 8}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:13:24.497Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 10}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 4, "updatedAt": "2026-04-07T15:13:24.498Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}, {"id": 27, "name": "Adjuvants", "slug": "adjuvants", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Amélioration des performances béton", "createdAt": "2026-04-07T15:13:24.492Z", "sortOrder": 5, "updatedAt": "2026-04-07T15:13:24.492Z", "categoryId": 2, "description": "Les adjuvants permettent d’optimiser les propriétés du béton selon les besoins du chantier. Ils améliorent la résistance, la maniabilité et la durabilité pour garantir des performances adaptées à chaque application.", "imageMediaId": null, "descriptionSeo": "Adjuvants pour béton : solutions pour améliorer résistance, durabilité et maniabilité. Idéal pour optimiser les performances des ouvrages en construction."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 5}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T15:14:27.424Z", "themeColor": "#FF8A00", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 0, "updatedAt": "2026-04-07T15:14:27.426Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 5}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 1, "updatedAt": "2026-04-07T15:14:27.427Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 8}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T15:14:27.428Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 10}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:14:27.429Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}, {"id": 27, "name": "Adjuvants", "slug": "adjuvants", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Amélioration des performances béton", "createdAt": "2026-04-07T15:13:24.492Z", "sortOrder": 4, "updatedAt": "2026-04-07T15:14:27.430Z", "categoryId": 2, "description": "Les adjuvants permettent d’optimiser les propriétés du béton selon les besoins du chantier. Ils améliorent la résistance, la maniabilité et la durabilité pour garantir des performances adaptées à chaque application.", "imageMediaId": 4, "descriptionSeo": "Adjuvants pour béton : solutions pour améliorer résistance, durabilité et maniabilité. Idéal pour optimiser les performances des ouvrages en construction."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	2026-04-07 15:14:27.442
7	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	7	Étanchéité.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 7, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.397Z", "extension": "png", "sizeBytes": 1733314, "updatedAt": "2026-04-07T07:48:33.397Z", "sha256Hash": "ac7cf895eed4ffe432e4fc0e447fa7b58c46d223b614c2b851a806fa90bbad15", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7bddfb83-5b54-4688-bd59-34bf4036d078-etancheite.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Étanchéité.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.406
11	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	11	Isolation thermique.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 11, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.714Z", "extension": "png", "sizeBytes": 556200, "updatedAt": "2026-04-07T07:48:33.714Z", "sha256Hash": "f1337225a459bcd8308ecc2fbd4c040413dcf7659ff5434afc6609d01f88747d", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/bc5f6a79-f887-4567-a874-87d889135bc6-isolation-thermique.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Isolation thermique.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.723
8	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	8	Éviers de cuisine.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 8, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.476Z", "extension": "png", "sizeBytes": 932093, "updatedAt": "2026-04-07T07:48:33.476Z", "sha256Hash": "7c5f0b14107ebef12a5da5d0c77f1e2ac70092b0deea6d3bb811764bf070f610", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/75923ec2-8a79-4c7f-b731-df4f09ddbf6d-eviers-de-cuisine.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Éviers de cuisine.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.486
9	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	9	Faïence murale.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 9, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.547Z", "extension": "png", "sizeBytes": 425349, "updatedAt": "2026-04-07T07:48:33.547Z", "sha256Hash": "c738c9d7fc8bb6215b7af4fbdd1f8d5e5a418a0450c803aca6ae202b7d82bfe8", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/06a71cce-af5c-434f-8982-b9cdcced0a78-faience-murale.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Faïence murale.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.562
13	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	13	Lavabos et vasques.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 13, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.863Z", "extension": "png", "sizeBytes": 701970, "updatedAt": "2026-04-07T07:48:33.863Z", "sha256Hash": "29b4a4fe9496e4f134003ad8934a7005fd08b524eff805c0a4a6323c8718d700", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/ca8492ec-dd89-4976-ad9d-7a854eebf4cb-lavabos-et-vasques.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Lavabos et vasques.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.878
17	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	17	Mosaïque à l'italienne.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 17, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.243Z", "extension": "png", "sizeBytes": 1734506, "updatedAt": "2026-04-07T07:48:34.243Z", "sha256Hash": "e3b27029257dea57abb2675e68a145447d198d8ead434d3fd4757b00c6948a3b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/8e89580d-f485-41bb-8b94-00196b602c8a-mosaique-a-l-italienne.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Mosaïque à l'italienne.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.254
24	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	24	Plinthes et accessoires.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 24, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.822Z", "extension": "png", "sizeBytes": 1075457, "updatedAt": "2026-04-07T07:48:34.822Z", "sha256Hash": "342cbe5afc3afa6f6d08f4d1378cda5462d7b3a7de33c4698c5b4bae0e95511a", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4b6a0679-422b-4bc8-9a0f-7ee30a9f20ef-plinthes-et-accessoires.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Plinthes et accessoires.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.833
25	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	25	Portes coulissantes.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 25, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.898Z", "extension": "png", "sizeBytes": 1319529, "updatedAt": "2026-04-07T07:48:34.898Z", "sha256Hash": "50388f87b6c1d3c9f41eeb4b8a4ed739dcd0c98357f078d0e7fd09cca890ee92", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/19104ead-0fd1-47c0-8925-9c39a2271687-portes-coulissantes.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Portes coulissantes.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.908
10	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	10	Isolation et étanchéité.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 10, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.639Z", "extension": "png", "sizeBytes": 1269942, "updatedAt": "2026-04-07T07:48:33.639Z", "sha256Hash": "d604f643b3821f7de0644d8d61ff58ec5d9448555a4f6baa7fe5d75dea3c81b5", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2eef7fca-a9eb-4880-a040-750ed8d165ea-isolation-et-etancheite.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Isolation et étanchéité.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.651
15	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	15	Matériaux de construction.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 15, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.072Z", "extension": "png", "sizeBytes": 1529814, "updatedAt": "2026-04-07T07:48:34.072Z", "sha256Hash": "49f6c14efb4300dc93a212de88df70b63f22d80009cd313fa4b731cc2781d1a9", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/34648392-49b5-4aef-8305-401e94d2c6dd-materiaux-de-construction.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Matériaux de construction.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.082
23	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	23	Piscine.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 23, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.746Z", "extension": "png", "sizeBytes": 1769350, "updatedAt": "2026-04-07T07:48:34.746Z", "sha256Hash": "c9ee66b44e65fe6a74d9fb659ee27a79c0146afe142ae796d02041d3c819d2b5", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c3071540-c48f-4af1-b941-205ec26fefba-piscine.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Piscine.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.755
27	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	27	Portes et menuiserie.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 27, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.065Z", "extension": "png", "sizeBytes": 959337, "updatedAt": "2026-04-07T07:48:35.065Z", "sha256Hash": "31760241a02ff44613f8627a10744686deceb217a755f4e36d7a5c4df7298a8e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/818a8464-44e4-47af-a933-fe2cf58bf973-portes-et-menuiserie.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Portes et menuiserie.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.076
32	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	32	Sables et graviers.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 32, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.514Z", "extension": "png", "sizeBytes": 2194414, "updatedAt": "2026-04-07T07:48:35.514Z", "sha256Hash": "5d8c9a8c51ab3354a3f8a9d25dbb87846db462f3edd7b045e5ca736a6b85ca8b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/1cb974b0-1faa-4f97-b22e-225a3f59a9d1-sables-et-graviers.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Sables et graviers.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.522
12	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	12	Jaccuzis.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 12, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.795Z", "extension": "png", "sizeBytes": 1181606, "updatedAt": "2026-04-07T07:48:33.795Z", "sha256Hash": "44c0a8a5f469c24cb43884f2130c8f2b9620c5ee8d67fb0dc4012cb560687622", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/083563f3-2bf6-4731-99cb-307ec3a20aae-jaccuzis.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Jaccuzis.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.804
14	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	14	Margelles et finitions.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 14, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:33.981Z", "extension": "png", "sizeBytes": 2102233, "updatedAt": "2026-04-07T07:48:33.981Z", "sha256Hash": "25e7553b3adee5b4ba8ee1be604bef9eda01713637cb73834d28dbb509cca844", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/a53d752f-731a-41d2-b3c1-5c50536ba229-margelles-et-finitions.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Margelles et finitions.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:33.992
16	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	16	Meubles de salle de bain.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 16, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.144Z", "extension": "png", "sizeBytes": 954376, "updatedAt": "2026-04-07T07:48:34.144Z", "sha256Hash": "ac0f241d5bb8c3a9ce077e5bec00938a7112887c95bc87f16db6453945c0e2af", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/426a4fd2-822a-4d4c-a600-26cc7276462e-meubles-de-salle-de-bain.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Meubles de salle de bain.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.155
18	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	18	Mosaïques.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 18, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.337Z", "extension": "png", "sizeBytes": 1630485, "updatedAt": "2026-04-07T07:48:34.337Z", "sha256Hash": "0659ad4d593d4a00097289f82273b2b0715ddbd8694644dcbc38d4d2d95ccdef", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/40ade6b5-ca01-43f8-a960-2a8bb81f467b-mosaiques.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Mosaïques.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.348
19	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	19	Peinture d'extérieur.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 19, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.404Z", "extension": "png", "sizeBytes": 503502, "updatedAt": "2026-04-07T07:48:34.404Z", "sha256Hash": "ae0ba63d551815fe564f6cb3da0e699cbc4aff79e0ebb785c3321e1602719c05", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d002ddea-0060-4ec1-bf33-defb5fb9ce4c-peinture-d-exterieur.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Peinture d'extérieur.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.416
20	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	20	Peinture d'intérieur.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 20, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.474Z", "extension": "png", "sizeBytes": 537735, "updatedAt": "2026-04-07T07:48:34.474Z", "sha256Hash": "6b01278478950bd807b4d88a61ab3a19bb4a194aa4d5fa66c2585fd57ebabf2f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/48f5aabc-fa2e-445c-a81d-d0fc7b27829f-peinture-d-interieur.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Peinture d'intérieur.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.485
21	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	21	Peinture et Décoration.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 21, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.559Z", "extension": "png", "sizeBytes": 1342244, "updatedAt": "2026-04-07T07:48:34.559Z", "sha256Hash": "f5aa8a6ce9f7290aa840c9609782a217730df7188857da3f131f35915030334b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7e78a0ce-3adb-4337-96ce-b10e71ecf41c-peinture-et-decoration.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Peinture et Décoration.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.568
22	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	22	Pierres de Bali.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 22, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.652Z", "extension": "png", "sizeBytes": 1902473, "updatedAt": "2026-04-07T07:48:34.652Z", "sha256Hash": "66115706697f235c272f0cbb38abdd677b07321886196c5aaaa425a2d5563041", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3a3736a8-ff54-441a-8213-d8ee0292a5e2-pierres-de-bali.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Pierres de Bali.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:34.664
34	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	34	Treillis soudés et fers à béton.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 34, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.680Z", "extension": "png", "sizeBytes": 2022216, "updatedAt": "2026-04-07T07:48:35.680Z", "sha256Hash": "d22566b4922c003f604e17a7ddb69ff4ba618cc1bc59354f98399a1d9cdc80d1", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/66f29a6b-c640-4066-9893-3f7de22b149a-treillis-soudes-et-fers-a-beton.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés et fers à béton.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.691
26	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	26	Portes en bois.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 26, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:34.987Z", "extension": "png", "sizeBytes": 1550963, "updatedAt": "2026-04-07T07:48:34.987Z", "sha256Hash": "c21b3fae96ff5e6aab26881c9f4c501f428a2d8e2aae1bb1e265893fa610ace5", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/38862d27-5e5b-4dc7-8791-adae110a7eaa-portes-en-bois.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Portes en bois.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.004
28	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	28	Revêtements de sol extérieur.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 28, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.173Z", "extension": "png", "sizeBytes": 1407786, "updatedAt": "2026-04-07T07:48:35.173Z", "sha256Hash": "4e7e2273c768ba6786b876178553229f75aefce990d14c15cf07c6738d3d4c8f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/ae5c0bff-aea1-455c-878e-c1d43dae1824-revetements-de-sol-exterieur.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Revêtements de sol extérieur.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.183
29	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	29	Revêtements de sol intérieur.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 29, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.243Z", "extension": "png", "sizeBytes": 936879, "updatedAt": "2026-04-07T07:48:35.243Z", "sha256Hash": "2352390a47156197059ec6cfece180110b99c92bcaad22d21a5e0c6dce96788c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2b692957-2b7c-4707-9efc-c2c356709ed6-revetements-de-sol-interieur.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Revêtements de sol intérieur.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.254
30	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	30	Revêtements de sols et murs.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 30, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.326Z", "extension": "png", "sizeBytes": 1292907, "updatedAt": "2026-04-07T07:48:35.326Z", "sha256Hash": "ca5cf90cd7bff266d50283253ea400494f27bab6509c41436e55fb118b9d180b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4d038235-8923-480f-a132-55c2ec7c4ac2-revetements-de-sols-et-murs.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Revêtements de sols et murs.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.336
33	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	33	Salle de bain et cuisine.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 33, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.582Z", "extension": "png", "sizeBytes": 728332, "updatedAt": "2026-04-07T07:48:35.582Z", "sha256Hash": "e85df3cbea536202dc4ff7de89341fd95d318f9c9b9fb04fe87e518f1aa78452", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b7ae17d7-ef4e-4608-b92e-0e82fe09c4e0-salle-de-bain-et-cuisine.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Salle de bain et cuisine.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.591
31	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	31	Robinetterie.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 31, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1280, "folderId": 1, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T07:48:35.410Z", "extension": "png", "sizeBytes": 1298177, "updatedAt": "2026-04-07T07:48:35.410Z", "sha256Hash": "189f6a5daf040e111ea688f22f31266d6d9342a0562cf42f587e46a3cf692fdc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/729b52b7-edda-403f-abcb-2689c7cb6111-robinetterie.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Robinetterie.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 07:48:35.418
35	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	1	Revêtements de sols et murs	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:21.354Z", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:21.359Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:52:21.361Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": null, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:52:21.362Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:52:21.362Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T07:52:21.363Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T07:52:21.364Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-07 07:52:21.371
36	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:21.354Z", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:21.359Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:52:21.361Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": null, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:52:21.362Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:52:21.362Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T07:52:21.363Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T07:52:21.364Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:37.112Z", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:37.118Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:52:37.119Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:52:37.120Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:52:37.121Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T07:52:37.122Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T07:52:37.123Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-07 07:52:37.127
37	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	2	Matériaux de construction	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:54:22.136Z", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:54:22.140Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:54:22.141Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:54:22.142Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	2026-04-07 07:54:22.149
38	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	2	Matériaux de construction	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:54:22.136Z", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:54:22.140Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:54:22.141Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:54:22.142Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 4}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:55:08.353Z", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:55:08.356Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:55:08.364Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:55:08.365Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:55:08.366Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	2026-04-07 07:55:08.37
39	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	3	Isolation et étanchéité	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": null, "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:58:55.821Z", "description": null, "imageMediaId": null, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:58:55.824Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:58:55.825Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": null}	2026-04-07 07:58:55.832
40	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	3	Isolation et étanchéité	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": null, "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:58:55.821Z", "description": null, "imageMediaId": null, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:58:55.824Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:58:55.825Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": null}	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Protection thermique et étanche", "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:17.388Z", "description": "Optimisez la performance de vos bâtiments grâce à nos solutions d’isolation et d’étanchéité. Protégez vos structures contre les infiltrations, améliorez le confort thermique et assurez la longévité de vos installations.", "imageMediaId": 10, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:17.390Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:17.391Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": "Solutions d’isolation et d’étanchéité pour bâtiments : protection contre l’humidité, amélioration thermique et durabilité des structures. Produits adaptés aux normes modernes de construction."}	2026-04-07 07:59:17.4
96	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:09:13.262Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:09:13.265Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:09:13.266Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:09:13.267Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:09:13.268Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:09:13.269Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:09:13.270Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 5}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T15:14:57.024Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T15:14:57.026Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T15:14:57.027Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T15:14:57.028Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:14:57.029Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 4, "updatedAt": "2026-04-07T15:14:57.032Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-07 15:14:57.042
41	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	3	Isolation et étanchéité	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Protection thermique et étanche", "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:17.388Z", "description": "Optimisez la performance de vos bâtiments grâce à nos solutions d’isolation et d’étanchéité. Protégez vos structures contre les infiltrations, améliorez le confort thermique et assurez la longévité de vos installations.", "imageMediaId": 10, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:17.390Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:17.391Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": "Solutions d’isolation et d’étanchéité pour bâtiments : protection contre l’humidité, amélioration thermique et durabilité des structures. Produits adaptés aux normes modernes de construction."}	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Protection thermique et étanche", "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:59:26.399Z", "description": "Optimisez la performance de vos bâtiments grâce à nos solutions d’isolation et d’étanchéité. Protégez vos structures contre les infiltrations, améliorez le confort thermique et assurez la longévité de vos installations.", "imageMediaId": 10, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:26.401Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:26.402Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": "Solutions d’isolation et d’étanchéité pour bâtiments : protection contre l’humidité, amélioration thermique et durabilité des structures. Produits adaptés aux normes modernes de construction."}	2026-04-07 07:59:26.41
42	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	2	Matériaux de construction	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 4}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:55:08.353Z", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:55:08.356Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:55:08.364Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:55:08.365Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:55:08.366Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 4}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:33.438Z", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:33.440Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:33.441Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:59:33.442Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:59:33.443Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	2026-04-07 07:59:33.452
43	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	4	Salle de bain et cuisine	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 4, "name": "Salle de bain et cuisine", "slug": "salle-de-bain-et-cuisine", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Équipements et robinetterie", "createdAt": "2026-04-07T08:02:47.901Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:47.901Z", "description": "Aménagez des espaces fonctionnels et élégants avec notre gamme dédiée à la salle de bain et à la cuisine. Robinetterie, équipements sanitaires et accessoires allient design contemporain et performance au quotidien.", "imageMediaId": 33, "subcategories": [{"id": 13, "name": "Éviers de cuisine", "slug": "eviers-de-cuisine", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Praticité au quotidien", "createdAt": "2026-04-07T08:02:47.905Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:02:47.905Z", "categoryId": 4, "description": "Découvrez notre sélection d’éviers de cuisine conçus pour répondre aux exigences du quotidien. Résistants, fonctionnels et esthétiques, ils s’intègrent parfaitement à tous les styles de cuisine.", "imageMediaId": 8, "descriptionSeo": "Éviers de cuisine modernes et résistants. Solutions pratiques et esthétiques pour un usage quotidien optimal."}, {"id": 14, "name": "Robinetterie", "slug": "robinetterie", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design et performance", "createdAt": "2026-04-07T08:02:47.906Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:02:47.906Z", "categoryId": 4, "description": "Notre gamme de robinetterie allie précision, durabilité et esthétique. Adaptée aux cuisines et salles de bain, elle garantit confort d’utilisation et performance au quotidien.", "imageMediaId": 31, "descriptionSeo": "Robinetterie pour salle de bain et cuisine : mitigeurs, mélangeurs et solutions modernes. Design élégant et performance durable."}, {"id": 15, "name": "Baignoires", "slug": "baignoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et détente", "createdAt": "2026-04-07T08:02:47.907Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:02:47.907Z", "categoryId": 4, "description": "Transformez votre salle de bain en espace de relaxation avec notre gamme de baignoires. Pensées pour le confort et le bien-être, elles combinent design contemporain et ergonomie.", "imageMediaId": 1, "descriptionSeo": "Baignoires modernes pour salle de bain : confort, design et durabilité. Idéal pour créer un espace de détente et de bien-être chez vous."}, {"id": 16, "name": "Jacuzzis", "slug": "jacuzzis", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Bien-être et hydromassage", "createdAt": "2026-04-07T08:02:47.908Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:47.908Z", "categoryId": 4, "description": "Offrez-vous une expérience de relaxation haut de gamme avec nos jacuzzis. Équipés de systèmes d’hydromassage, ils créent un véritable espace de bien-être à domicile.", "imageMediaId": 12, "descriptionSeo": "Jacuzzis et spas pour maison : solutions de bien-être avec hydromassage. Idéal pour détente, confort et aménagement haut de gamme."}, {"id": 17, "name": "Lavabos et vasques", "slug": "lavabos-et-vasques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Élégance et fonctionnalité", "createdAt": "2026-04-07T08:02:47.909Z", "sortOrder": 4, "updatedAt": "2026-04-07T08:02:47.909Z", "categoryId": 4, "description": "Apportez une touche de modernité à votre salle de bain avec notre sélection de lavabos et vasques. Alliant design, praticité et qualité des matériaux, ils s’adaptent à tous les styles d’aménagement.", "imageMediaId": 13, "descriptionSeo": "Lavabos et vasques design pour salle de bain. Large choix de modèles modernes, pratiques et durables pour un espace élégant et fonctionnel."}, {"id": 18, "name": "Espace douche", "slug": "espace-douche", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions douche modernes", "createdAt": "2026-04-07T08:02:47.910Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:02:47.910Z", "categoryId": 4, "description": "Créez un espace douche fonctionnel et élégant avec nos solutions complètes. Parois, receveurs et équipements sont pensés pour allier confort, sécurité et design contemporain.", "imageMediaId": null, "descriptionSeo": "Espace douche : parois, receveurs et équipements modernes pour salle de bain. Solutions design, pratiques et durables."}], "descriptionSeo": "Équipements pour salle de bain et cuisine : robinetterie, sanitaires, accessoires modernes et durables. Des solutions design pour améliorer confort et fonctionnalité."}	2026-04-07 08:02:47.916
44	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	4	Salle de bain et cuisine	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 4, "name": "Salle de bain et cuisine", "slug": "salle-de-bain-et-cuisine", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Équipements et robinetterie", "createdAt": "2026-04-07T08:02:47.901Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:47.901Z", "description": "Aménagez des espaces fonctionnels et élégants avec notre gamme dédiée à la salle de bain et à la cuisine. Robinetterie, équipements sanitaires et accessoires allient design contemporain et performance au quotidien.", "imageMediaId": 33, "subcategories": [{"id": 13, "name": "Éviers de cuisine", "slug": "eviers-de-cuisine", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Praticité au quotidien", "createdAt": "2026-04-07T08:02:47.905Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:02:47.905Z", "categoryId": 4, "description": "Découvrez notre sélection d’éviers de cuisine conçus pour répondre aux exigences du quotidien. Résistants, fonctionnels et esthétiques, ils s’intègrent parfaitement à tous les styles de cuisine.", "imageMediaId": 8, "descriptionSeo": "Éviers de cuisine modernes et résistants. Solutions pratiques et esthétiques pour un usage quotidien optimal."}, {"id": 14, "name": "Robinetterie", "slug": "robinetterie", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design et performance", "createdAt": "2026-04-07T08:02:47.906Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:02:47.906Z", "categoryId": 4, "description": "Notre gamme de robinetterie allie précision, durabilité et esthétique. Adaptée aux cuisines et salles de bain, elle garantit confort d’utilisation et performance au quotidien.", "imageMediaId": 31, "descriptionSeo": "Robinetterie pour salle de bain et cuisine : mitigeurs, mélangeurs et solutions modernes. Design élégant et performance durable."}, {"id": 15, "name": "Baignoires", "slug": "baignoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et détente", "createdAt": "2026-04-07T08:02:47.907Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:02:47.907Z", "categoryId": 4, "description": "Transformez votre salle de bain en espace de relaxation avec notre gamme de baignoires. Pensées pour le confort et le bien-être, elles combinent design contemporain et ergonomie.", "imageMediaId": 1, "descriptionSeo": "Baignoires modernes pour salle de bain : confort, design et durabilité. Idéal pour créer un espace de détente et de bien-être chez vous."}, {"id": 16, "name": "Jacuzzis", "slug": "jacuzzis", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Bien-être et hydromassage", "createdAt": "2026-04-07T08:02:47.908Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:47.908Z", "categoryId": 4, "description": "Offrez-vous une expérience de relaxation haut de gamme avec nos jacuzzis. Équipés de systèmes d’hydromassage, ils créent un véritable espace de bien-être à domicile.", "imageMediaId": 12, "descriptionSeo": "Jacuzzis et spas pour maison : solutions de bien-être avec hydromassage. Idéal pour détente, confort et aménagement haut de gamme."}, {"id": 17, "name": "Lavabos et vasques", "slug": "lavabos-et-vasques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Élégance et fonctionnalité", "createdAt": "2026-04-07T08:02:47.909Z", "sortOrder": 4, "updatedAt": "2026-04-07T08:02:47.909Z", "categoryId": 4, "description": "Apportez une touche de modernité à votre salle de bain avec notre sélection de lavabos et vasques. Alliant design, praticité et qualité des matériaux, ils s’adaptent à tous les styles d’aménagement.", "imageMediaId": 13, "descriptionSeo": "Lavabos et vasques design pour salle de bain. Large choix de modèles modernes, pratiques et durables pour un espace élégant et fonctionnel."}, {"id": 18, "name": "Espace douche", "slug": "espace-douche", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions douche modernes", "createdAt": "2026-04-07T08:02:47.910Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:02:47.910Z", "categoryId": 4, "description": "Créez un espace douche fonctionnel et élégant avec nos solutions complètes. Parois, receveurs et équipements sont pensés pour allier confort, sécurité et design contemporain.", "imageMediaId": null, "descriptionSeo": "Espace douche : parois, receveurs et équipements modernes pour salle de bain. Solutions design, pratiques et durables."}], "descriptionSeo": "Équipements pour salle de bain et cuisine : robinetterie, sanitaires, accessoires modernes et durables. Des solutions design pour améliorer confort et fonctionnalité."}	{"id": 4, "name": "Salle de bain et cuisine", "slug": "salle-de-bain-et-cuisine", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Équipements et robinetterie", "createdAt": "2026-04-07T08:02:47.901Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:54.426Z", "description": "Aménagez des espaces fonctionnels et élégants avec notre gamme dédiée à la salle de bain et à la cuisine. Robinetterie, équipements sanitaires et accessoires allient design contemporain et performance au quotidien.", "imageMediaId": 33, "subcategories": [{"id": 13, "name": "Éviers de cuisine", "slug": "eviers-de-cuisine", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Praticité au quotidien", "createdAt": "2026-04-07T08:02:47.905Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:02:54.428Z", "categoryId": 4, "description": "Découvrez notre sélection d’éviers de cuisine conçus pour répondre aux exigences du quotidien. Résistants, fonctionnels et esthétiques, ils s’intègrent parfaitement à tous les styles de cuisine.", "imageMediaId": 8, "descriptionSeo": "Éviers de cuisine modernes et résistants. Solutions pratiques et esthétiques pour un usage quotidien optimal."}, {"id": 14, "name": "Robinetterie", "slug": "robinetterie", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design et performance", "createdAt": "2026-04-07T08:02:47.906Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:02:54.430Z", "categoryId": 4, "description": "Notre gamme de robinetterie allie précision, durabilité et esthétique. Adaptée aux cuisines et salles de bain, elle garantit confort d’utilisation et performance au quotidien.", "imageMediaId": 31, "descriptionSeo": "Robinetterie pour salle de bain et cuisine : mitigeurs, mélangeurs et solutions modernes. Design élégant et performance durable."}, {"id": 15, "name": "Baignoires", "slug": "baignoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et détente", "createdAt": "2026-04-07T08:02:47.907Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:02:54.430Z", "categoryId": 4, "description": "Transformez votre salle de bain en espace de relaxation avec notre gamme de baignoires. Pensées pour le confort et le bien-être, elles combinent design contemporain et ergonomie.", "imageMediaId": 1, "descriptionSeo": "Baignoires modernes pour salle de bain : confort, design et durabilité. Idéal pour créer un espace de détente et de bien-être chez vous."}, {"id": 16, "name": "Jacuzzis", "slug": "jacuzzis", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Bien-être et hydromassage", "createdAt": "2026-04-07T08:02:47.908Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:54.431Z", "categoryId": 4, "description": "Offrez-vous une expérience de relaxation haut de gamme avec nos jacuzzis. Équipés de systèmes d’hydromassage, ils créent un véritable espace de bien-être à domicile.", "imageMediaId": 12, "descriptionSeo": "Jacuzzis et spas pour maison : solutions de bien-être avec hydromassage. Idéal pour détente, confort et aménagement haut de gamme."}, {"id": 17, "name": "Lavabos et vasques", "slug": "lavabos-et-vasques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Élégance et fonctionnalité", "createdAt": "2026-04-07T08:02:47.909Z", "sortOrder": 4, "updatedAt": "2026-04-07T08:02:54.432Z", "categoryId": 4, "description": "Apportez une touche de modernité à votre salle de bain avec notre sélection de lavabos et vasques. Alliant design, praticité et qualité des matériaux, ils s’adaptent à tous les styles d’aménagement.", "imageMediaId": 13, "descriptionSeo": "Lavabos et vasques design pour salle de bain. Large choix de modèles modernes, pratiques et durables pour un espace élégant et fonctionnel."}, {"id": 18, "name": "Espace douche", "slug": "espace-douche", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions douche modernes", "createdAt": "2026-04-07T08:02:47.910Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:02:54.433Z", "categoryId": 4, "description": "Créez un espace douche fonctionnel et élégant avec nos solutions complètes. Parois, receveurs et équipements sont pensés pour allier confort, sécurité et design contemporain.", "imageMediaId": 6, "descriptionSeo": "Espace douche : parois, receveurs et équipements modernes pour salle de bain. Solutions design, pratiques et durables."}], "descriptionSeo": "Équipements pour salle de bain et cuisine : robinetterie, sanitaires, accessoires modernes et durables. Des solutions design pour améliorer confort et fonctionnalité."}	2026-04-07 08:02:54.442
45	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	5	Peintures et décoration	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:05:13.588Z", "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:05:13.593Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:05:13.599Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:05:13.601Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	2026-04-07 08:05:13.61
46	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	5	Peintures et décoration	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:05:13.588Z", "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:05:13.593Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:05:13.599Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:05:13.601Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 4, "updatedAt": "2026-04-07T08:05:21.724Z", "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:05:21.726Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:05:21.728Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:05:21.730Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	2026-04-07 08:05:21.736
47	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	6	Piscine	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 6, "name": "Piscine", "slug": "piscine", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Aménagements extérieurs premium", "createdAt": "2026-04-07T08:06:49.862Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:06:49.862Z", "description": "Créez un espace de détente unique avec notre sélection dédiée à l’univers de la piscine. Revêtements, équipements et accessoires sont pensés pour allier esthétique, confort et résistance en extérieur.", "imageMediaId": 23, "subcategories": [{"id": 22, "name": "Margelles et finitions", "slug": "margelles-et-finitions", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Contours et finitions piscine", "createdAt": "2026-04-07T08:06:49.866Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:06:49.866Z", "categoryId": 6, "description": "Apportez la touche finale à votre piscine avec notre sélection de margelles et finitions. Conçues pour allier sécurité, résistance et esthétique, elles structurent élégamment vos espaces extérieurs.", "imageMediaId": 14, "descriptionSeo": "Margelles et finitions pour piscine : solutions esthétiques et antidérapantes pour sécuriser et sublimer les contours de votre bassin."}, {"id": 23, "name": "Mosaïques", "slug": "mosaiques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Revêtements décoratifs piscine", "createdAt": "2026-04-07T08:06:49.867Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:06:49.867Z", "categoryId": 6, "description": "Personnalisez votre piscine avec nos mosaïques décoratives aux finitions raffinées. Résistantes à l’eau et aux produits chimiques, elles permettent de créer des designs uniques et lumineux.", "imageMediaId": 18, "descriptionSeo": "Mosaïques pour piscine : revêtements résistants et décoratifs pour personnaliser votre bassin avec élégance et durabilité."}], "descriptionSeo": "Produits pour piscine : revêtements, équipements et accessoires pour un aménagement extérieur durable et esthétique. Idéal pour créer un espace de détente haut de gamme."}	2026-04-07 08:06:49.876
48	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	6	Piscine	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 6, "name": "Piscine", "slug": "piscine", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Aménagements extérieurs premium", "createdAt": "2026-04-07T08:06:49.862Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:06:49.862Z", "description": "Créez un espace de détente unique avec notre sélection dédiée à l’univers de la piscine. Revêtements, équipements et accessoires sont pensés pour allier esthétique, confort et résistance en extérieur.", "imageMediaId": 23, "subcategories": [{"id": 22, "name": "Margelles et finitions", "slug": "margelles-et-finitions", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Contours et finitions piscine", "createdAt": "2026-04-07T08:06:49.866Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:06:49.866Z", "categoryId": 6, "description": "Apportez la touche finale à votre piscine avec notre sélection de margelles et finitions. Conçues pour allier sécurité, résistance et esthétique, elles structurent élégamment vos espaces extérieurs.", "imageMediaId": 14, "descriptionSeo": "Margelles et finitions pour piscine : solutions esthétiques et antidérapantes pour sécuriser et sublimer les contours de votre bassin."}, {"id": 23, "name": "Mosaïques", "slug": "mosaiques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Revêtements décoratifs piscine", "createdAt": "2026-04-07T08:06:49.867Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:06:49.867Z", "categoryId": 6, "description": "Personnalisez votre piscine avec nos mosaïques décoratives aux finitions raffinées. Résistantes à l’eau et aux produits chimiques, elles permettent de créer des designs uniques et lumineux.", "imageMediaId": 18, "descriptionSeo": "Mosaïques pour piscine : revêtements résistants et décoratifs pour personnaliser votre bassin avec élégance et durabilité."}], "descriptionSeo": "Produits pour piscine : revêtements, équipements et accessoires pour un aménagement extérieur durable et esthétique. Idéal pour créer un espace de détente haut de gamme."}	{"id": 6, "name": "Piscine", "slug": "piscine", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Aménagements extérieurs premium", "createdAt": "2026-04-07T08:06:49.862Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:07:30.140Z", "description": "Créez un espace de détente unique avec notre sélection dédiée à l’univers de la piscine. Revêtements, équipements et accessoires sont pensés pour allier esthétique, confort et résistance en extérieur.", "imageMediaId": 23, "subcategories": [{"id": 24, "name": "Pierres de Bali", "slug": "pierres-de-bali", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Ambiance naturelle et exotique", "createdAt": "2026-04-07T08:07:30.142Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:07:30.142Z", "categoryId": 6, "description": "Créez une atmosphère unique avec les pierres de Bali, reconnues pour leurs reflets naturels et leur élégance. Idéales pour piscines et espaces extérieurs, elles apportent une touche haut de gamme et apaisante.", "imageMediaId": 22, "descriptionSeo": "Pierres de Bali pour piscine : revêtements naturels aux reflets uniques. Idéal pour créer une ambiance exotique et haut de gamme."}, {"id": 22, "name": "Margelles et finitions", "slug": "margelles-et-finitions", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Contours et finitions piscine", "createdAt": "2026-04-07T08:06:49.866Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:07:30.143Z", "categoryId": 6, "description": "Apportez la touche finale à votre piscine avec notre sélection de margelles et finitions. Conçues pour allier sécurité, résistance et esthétique, elles structurent élégamment vos espaces extérieurs.", "imageMediaId": 14, "descriptionSeo": "Margelles et finitions pour piscine : solutions esthétiques et antidérapantes pour sécuriser et sublimer les contours de votre bassin."}, {"id": 23, "name": "Mosaïques", "slug": "mosaiques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Revêtements décoratifs piscine", "createdAt": "2026-04-07T08:06:49.867Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:07:30.144Z", "categoryId": 6, "description": "Personnalisez votre piscine avec nos mosaïques décoratives aux finitions raffinées. Résistantes à l’eau et aux produits chimiques, elles permettent de créer des designs uniques et lumineux.", "imageMediaId": 18, "descriptionSeo": "Mosaïques pour piscine : revêtements résistants et décoratifs pour personnaliser votre bassin avec élégance et durabilité."}], "descriptionSeo": "Produits pour piscine : revêtements, équipements et accessoires pour un aménagement extérieur durable et esthétique. Idéal pour créer un espace de détente haut de gamme."}	2026-04-07 08:07:30.151
49	cmnnfemzf00008wg9iwn6hacx	CREATE	ProductCategory	7	Portes et menuiserie	Création d'une nouvelle catégorie produit	\N	\N	\N	\N	\N	{"id": 7, "name": "Portes et menuiserie", "slug": "portes-et-menuiserie", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Portes et finitions bois", "createdAt": "2026-04-07T08:08:53.437Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:08:53.437Z", "description": "Découvrez notre gamme de portes et solutions de menuiserie conçues pour allier sécurité, esthétique et durabilité. Portes intérieures, extérieures et éléments de finition s’intègrent harmonieusement à tous les styles d’aménagement.", "imageMediaId": 27, "subcategories": [{"id": 25, "name": "Portes coulissantes", "slug": "portes-coulissantes", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Gain d’espace moderne", "createdAt": "2026-04-07T08:08:53.442Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:08:53.442Z", "categoryId": 7, "description": "Optimisez vos espaces avec nos portes coulissantes au design contemporain. Pratiques et élégantes, elles permettent une circulation fluide tout en apportant une touche moderne à vos intérieurs.", "imageMediaId": 25, "descriptionSeo": "Portes coulissantes modernes pour intérieur : solutions pratiques et design pour optimiser l’espace et améliorer la circulation."}, {"id": 26, "name": "Portes en bois", "slug": "portes-en-bois", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Authenticité et chaleur", "createdAt": "2026-04-07T08:08:53.445Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:08:53.445Z", "categoryId": 7, "description": "Apportez du caractère à vos espaces avec nos portes en bois. Robustes et intemporelles, elles offrent une excellente isolation et s’intègrent parfaitement à tous les styles d’aménagement.", "imageMediaId": 26, "descriptionSeo": "Portes en bois pour intérieur et extérieur : design authentique, isolation et durabilité pour sublimer vos espaces."}], "descriptionSeo": "Portes intérieures et extérieures, éléments de menuiserie et finitions bois. Des solutions esthétiques et durables pour améliorer sécurité, isolation et design de vos espaces."}	2026-04-07 08:08:53.46
50	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	7	Portes et menuiserie	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 7, "name": "Portes et menuiserie", "slug": "portes-et-menuiserie", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Portes et finitions bois", "createdAt": "2026-04-07T08:08:53.437Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:08:53.437Z", "description": "Découvrez notre gamme de portes et solutions de menuiserie conçues pour allier sécurité, esthétique et durabilité. Portes intérieures, extérieures et éléments de finition s’intègrent harmonieusement à tous les styles d’aménagement.", "imageMediaId": 27, "subcategories": [{"id": 25, "name": "Portes coulissantes", "slug": "portes-coulissantes", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Gain d’espace moderne", "createdAt": "2026-04-07T08:08:53.442Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:08:53.442Z", "categoryId": 7, "description": "Optimisez vos espaces avec nos portes coulissantes au design contemporain. Pratiques et élégantes, elles permettent une circulation fluide tout en apportant une touche moderne à vos intérieurs.", "imageMediaId": 25, "descriptionSeo": "Portes coulissantes modernes pour intérieur : solutions pratiques et design pour optimiser l’espace et améliorer la circulation."}, {"id": 26, "name": "Portes en bois", "slug": "portes-en-bois", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Authenticité et chaleur", "createdAt": "2026-04-07T08:08:53.445Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:08:53.445Z", "categoryId": 7, "description": "Apportez du caractère à vos espaces avec nos portes en bois. Robustes et intemporelles, elles offrent une excellente isolation et s’intègrent parfaitement à tous les styles d’aménagement.", "imageMediaId": 26, "descriptionSeo": "Portes en bois pour intérieur et extérieur : design authentique, isolation et durabilité pour sublimer vos espaces."}], "descriptionSeo": "Portes intérieures et extérieures, éléments de menuiserie et finitions bois. Des solutions esthétiques et durables pour améliorer sécurité, isolation et design de vos espaces."}	{"id": 7, "name": "Portes et menuiserie", "slug": "portes-et-menuiserie", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Portes et finitions bois", "createdAt": "2026-04-07T08:08:53.437Z", "sortOrder": 6, "updatedAt": "2026-04-07T08:09:04.624Z", "description": "Découvrez notre gamme de portes et solutions de menuiserie conçues pour allier sécurité, esthétique et durabilité. Portes intérieures, extérieures et éléments de finition s’intègrent harmonieusement à tous les styles d’aménagement.", "imageMediaId": 27, "subcategories": [{"id": 25, "name": "Portes coulissantes", "slug": "portes-coulissantes", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Gain d’espace moderne", "createdAt": "2026-04-07T08:08:53.442Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:09:04.626Z", "categoryId": 7, "description": "Optimisez vos espaces avec nos portes coulissantes au design contemporain. Pratiques et élégantes, elles permettent une circulation fluide tout en apportant une touche moderne à vos intérieurs.", "imageMediaId": 25, "descriptionSeo": "Portes coulissantes modernes pour intérieur : solutions pratiques et design pour optimiser l’espace et améliorer la circulation."}, {"id": 26, "name": "Portes en bois", "slug": "portes-en-bois", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Authenticité et chaleur", "createdAt": "2026-04-07T08:08:53.445Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:09:04.630Z", "categoryId": 7, "description": "Apportez du caractère à vos espaces avec nos portes en bois. Robustes et intemporelles, elles offrent une excellente isolation et s’intègrent parfaitement à tous les styles d’aménagement.", "imageMediaId": 26, "descriptionSeo": "Portes en bois pour intérieur et extérieur : design authentique, isolation et durabilité pour sublimer vos espaces."}], "descriptionSeo": "Portes intérieures et extérieures, éléments de menuiserie et finitions bois. Des solutions esthétiques et durables pour améliorer sécurité, isolation et design de vos espaces."}	2026-04-07 08:09:04.638
51	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	35	BRIQUE A06.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 35, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.033Z", "extension": "png", "sizeBytes": 85950, "updatedAt": "2026-04-07T08:13:50.033Z", "sha256Hash": "6e1051f164399697bf144adfbc617e3c436b65c354fa8feab1d180e8dc44e3c8", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b08f7a69-6cb7-4f45-a869-0ed2fc01f3f1-brique-a06.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A06.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.197
52	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	36	BRIQUE A08.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 36, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.266Z", "extension": "png", "sizeBytes": 115427, "updatedAt": "2026-04-07T08:13:50.266Z", "sha256Hash": "1e6ff50ac29a88c3de5e85cb18391ff009a4f7ff8030ddc118c78eae0b39cf31", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/11517d5a-f373-4ceb-810c-0a93391da767-brique-a08.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A08.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.282
53	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	37	BRIQUE A12.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 37, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.340Z", "extension": "png", "sizeBytes": 141284, "updatedAt": "2026-04-07T08:13:50.340Z", "sha256Hash": "25053a4702a7a85077c2041f80d993353e86501056e6027d6df81624f8ab649b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/a2e1f1cd-6911-4b93-a010-5d58052977c0-brique-a12.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A12.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.359
54	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	38	Brique Double cloison.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 38, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.407Z", "extension": "png", "sizeBytes": 192571, "updatedAt": "2026-04-07T08:13:50.407Z", "sha256Hash": "ecd03e436e5c0aec2999b9ee91f4b0ddd03c27f0e216cfa498a3b245a5caee78", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/e89b2cb8-80df-46d6-ac61-b04f46ae7ab7-brique-double-cloison.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Brique Double cloison.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.417
58	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	42	Famille Brique Hourdis.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 42, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.647Z", "extension": "png", "sizeBytes": 181107, "updatedAt": "2026-04-07T08:13:50.647Z", "sha256Hash": "8f4596637e0a138c5844f9347248a36da7140eff277e2696c766dd006e28d348", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/40c1a845-5cf2-49e0-814a-e32e9f92d99d-famille-brique-hourdis.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Hourdis.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.657
64	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	48	CEMII - B-L 32,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 48, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.045Z", "extension": "png", "sizeBytes": 346085, "updatedAt": "2026-04-07T08:13:51.045Z", "sha256Hash": "307647467198f97aa499f029074b6d54f09a6fb82a9281bffe2f182988ab5a00", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/65b3bde6-60ea-4aef-a81e-2fc1517875f1-cemii-b-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEMII - B-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.057
66	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	50	BORDURE DE TROTTOIR T2.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 50, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.173Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-07T08:13:51.173Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2a95a6e0-f31f-4db0-b934-bf461a459be9-bordure-de-trottoir-t2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.183
74	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	58	Ciment portland au calcaire CP II - A-L 32,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 58, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.674Z", "extension": "png", "sizeBytes": 292643, "updatedAt": "2026-04-07T08:13:51.674Z", "sha256Hash": "0ce902e3f87dfd5bd44ed2176132526386501f9ee2ae0d1b31000068d1f1950c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c5ffc022-5d94-4db1-9028-6c7a43684a57-ciment-portland-au-calcaire-cp-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment portland au calcaire CP II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.684
76	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	60	Pavé autobloquant Neapolis Gris.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 60, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.793Z", "extension": "png", "sizeBytes": 61006, "updatedAt": "2026-04-07T08:13:51.793Z", "sha256Hash": "e19857abc6b332e83d29a716ddeaae5395f4db8141ea31e11f1d0c1c1fae2a10", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/f4d6f38c-03e3-44fa-afa1-641353e7c0d5-pave-autobloquant-neapolis-gris.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Pavé autobloquant Neapolis Gris.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.803
55	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	39	BRIQUE HOURD 16.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 39, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.468Z", "extension": "png", "sizeBytes": 141053, "updatedAt": "2026-04-07T08:13:50.468Z", "sha256Hash": "799a7c45508011ee62de065dbbe54705e681fd04035f4e6ad799eab7d57a1cd6", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/8e5d2f0a-b34d-4e11-bdb1-c175d489b320-brique-hourd-16.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 16.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.477
56	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	40	BRIQUE HOURD 19.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 40, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.534Z", "extension": "png", "sizeBytes": 120133, "updatedAt": "2026-04-07T08:13:50.534Z", "sha256Hash": "6ce5c294579054398796d1622fc37262cc2c536a6958574a6e517cbdc26f3853", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/058a82ce-58e4-4d23-8d42-5f5ca768efa9-brique-hourd-19.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 19.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.545
57	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	41	BRIQUE PLATRIÈRE 8.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 41, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.587Z", "extension": "png", "sizeBytes": 106473, "updatedAt": "2026-04-07T08:13:50.587Z", "sha256Hash": "7fdf8bca9975598b89b03e6f5d41574f1452e3e18ede0f515386e0891e78c1f2", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/41ee203a-189f-410a-adba-706dc70fe10e-brique-platriere-8.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE PLATRIÈRE 8.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.597
59	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	43	Famille Brique Série A.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 43, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.703Z", "extension": "png", "sizeBytes": 339440, "updatedAt": "2026-04-07T08:13:50.703Z", "sha256Hash": "1b9125bc619c0e06427ede4fd00c42fa3489e03ab52f82d568634088e98d864e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/682c9174-f86f-4919-b54c-840aa399313e-famille-brique-serie-a.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Série A.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.714
60	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	44	CEM I 42,5 N SR-3.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 44, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.769Z", "extension": "png", "sizeBytes": 335728, "updatedAt": "2026-04-07T08:13:50.769Z", "sha256Hash": "5f757b25f4ce03b163e23d8d4de1ec1c2cd256405557418e343bee443c3b275f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cb47af98-5b4a-4ba3-8e20-c953a58e22c5-cem-i-42-5-n-sr-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N SR-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.781
61	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	45	CEM I 42,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 45, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.836Z", "extension": "png", "sizeBytes": 363709, "updatedAt": "2026-04-07T08:13:50.836Z", "sha256Hash": "0f455a7797ec9ecc2bcd1788286e722dd6903a4b39c40c2103e019f4b2836707", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5f26bd65-277b-4745-98f9-f1a96f291c8e-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.845
62	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	46	CEM II - A-L 32,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 46, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.906Z", "extension": "png", "sizeBytes": 357048, "updatedAt": "2026-04-07T08:13:50.906Z", "sha256Hash": "f18c2da99649de6fc916928911e8788c1317bea3d9b62fef98218ab27ade13fc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/457ba9e4-894f-47e5-8456-5a5306d1a5e2-cem-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.917
63	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	47	CEM II - A-L 42,5 R.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 47, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.973Z", "extension": "png", "sizeBytes": 371081, "updatedAt": "2026-04-07T08:13:50.973Z", "sha256Hash": "8103eb1c23d2e4a1a3ee95018d0a8da2ff9b218f1dc77404b0d4b121dd2eae46", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/30ed7570-3332-4caa-b278-0b79622dd0fa-cem-ii-a-l-42-5-r.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 42,5 R.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:50.983
67	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	51	BORDURE DE TROTTOIR T3.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 51, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.231Z", "extension": "png", "sizeBytes": 122579, "updatedAt": "2026-04-07T08:13:51.231Z", "sha256Hash": "6c593f5d50f782246ffe6df38cb2970a56201c64240ddb670f2bb6d27202e89e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7eaf76c1-0bab-4312-9eb4-5c48b31423c4-bordure-de-trottoir-t3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.24
69	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	53	BORDURE MINCE P2.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 53, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.357Z", "extension": "png", "sizeBytes": 165382, "updatedAt": "2026-04-07T08:13:51.357Z", "sha256Hash": "1682ce734b558c1d37ecc2b76f7077a9b3cafc0e05647931f16dcaf8c8b99ac0", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/182f74e7-b5c5-4e2c-bdeb-18a5a6e00785-bordure-mince-p2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE MINCE P2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.367
75	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	59	CIMENT PORTLAND CEM I 42,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 59, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.737Z", "extension": "png", "sizeBytes": 290564, "updatedAt": "2026-04-07T08:13:51.737Z", "sha256Hash": "8ad46ff77ec461ee98759334c75f6e8f27d91df668c2b59cf9456948e7945f81", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/02d594ac-d811-4f3f-a04e-f44107631579-ciment-portland-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CIMENT PORTLAND CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.747
79	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	63	CADRE 15 - ARMATURE FAÇONNÉE.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 63, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.973Z", "extension": "png", "sizeBytes": 201444, "updatedAt": "2026-04-07T08:13:51.973Z", "sha256Hash": "8a5ca670a7cad8320d3dcd73ae95a3c76f203e91cab200d37a0ec74bad4361dd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c7a174d5-f954-4731-adb1-a99afad02c4c-cadre-15-armature-faconnee.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CADRE 15 - ARMATURE FAÇONNÉE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.983
83	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	67	Treillis soudés 150-150-5.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 67, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.337Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-07T08:13:52.337Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cf1b60c2-ec57-48bc-b359-5ea06c8c6431-treillis-soudes-150-150-5.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-5.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:52.345
65	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	49	Famille Ciment de Gabès.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 49, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.118Z", "extension": "png", "sizeBytes": 510427, "updatedAt": "2026-04-07T08:13:51.118Z", "sha256Hash": "d4383e6ac67ed50f4ecc202aeb56c64edde05e7782704c186f6335802fabb51b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b9dfe6ec-320c-4c0d-b04d-d19a824791ff-famille-ciment-de-gabes.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Ciment de Gabès.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.126
72	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	56	Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 56, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.549Z", "extension": "png", "sizeBytes": 145211, "updatedAt": "2026-04-07T08:13:51.549Z", "sha256Hash": "e2c96f83a4402048f8e666f0c43b6bf80c837b45c0cc37d897cb4fda54086430", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4aabb8aa-298e-420a-9c91-e135484cba08-ciment-blanc-sotacib-cem-ll-a-l-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.558
68	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	52	BORDURE DE TROTTOIR T3-1.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 52, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.295Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-07T08:13:51.295Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b4aa4685-a439-4bda-a5cd-5dbfdf596e64-bordure-de-trottoir-t3-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3-1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.305
70	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	54	CANIVEAU DE CHAUSSÉ CS2.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 54, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.417Z", "extension": "png", "sizeBytes": 128006, "updatedAt": "2026-04-07T08:13:51.417Z", "sha256Hash": "eee090e199d63ac6547d579d6afb4bede1c2a90531099a0c3676eb5c51b93089", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d5bc1fd3-b45a-4d13-b408-339dcc6ef947-caniveau-de-chausse-cs2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CANIVEAU DE CHAUSSÉ CS2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.425
78	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	62	COFFRE EN TUNNEL POLY FINI 30CM.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 62, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.913Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-07T08:13:51.913Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/1543ccb9-6fcf-40eb-8eaf-2419cdfedf9f-coffre-en-tunnel-poly-fini-30cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 30CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.925
71	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	55	Ciment blanc SOTACIB CEM I 52,5 N.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 55, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.485Z", "extension": "png", "sizeBytes": 364341, "updatedAt": "2026-04-07T08:13:51.485Z", "sha256Hash": "e3e46f97ee2596f70464617b4616b91d7f30c50ea43ebd5e05348251dc4850b9", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3a029d5d-e6f4-4796-add7-246491ea832f-ciment-blanc-sotacib-cem-i-52-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM I 52,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.495
77	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	61	COFFRE EN TUNNEL POLY FINI 25CM.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 61, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.854Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-07T08:13:51.854Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3caa3d10-02aa-47a8-98b1-9e6275728766-coffre-en-tunnel-poly-fini-25cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 25CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.862
73	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	57	Ciment I 42,5 HRS 1.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 57, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.611Z", "extension": "png", "sizeBytes": 285185, "updatedAt": "2026-04-07T08:13:51.611Z", "sha256Hash": "9d269c9426bcc0f9675944d54faa02936453d19b7d93bd26f311341d8e4d7e31", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/9150e5b3-0d02-405d-aa00-e6bddf936216-ciment-i-42-5-hrs-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment I 42,5 HRS 1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:51.62
80	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	64	FIL RECUIT.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 64, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.037Z", "extension": "png", "sizeBytes": 194522, "updatedAt": "2026-04-07T08:13:52.037Z", "sha256Hash": "08c81f196211105e1e0f77798539214b5bf53a0b02ff53d8db06ec970aad2b0c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5108fdfa-6aed-4069-aa56-21d4d9ee364c-fil-recuit.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "FIL RECUIT.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:52.046
81	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	65	Treillis soudés 150-150-3.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 65, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.131Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-07T08:13:52.131Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4c4eb01b-c7a8-420f-b077-44e0a0f3eda5-treillis-soudes-150-150-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:52.141
82	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	66	Treillis soudés 150-150-4.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 66, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.236Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-07T08:13:52.236Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b53aab5e-0f15-45b9-a039-599d4b5f1612-treillis-soudes-150-150-4.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-4.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 08:13:52.248
84	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:37.112Z", "themeColor": null, "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:52:37.118Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:52:37.119Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:52:37.120Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:52:37.121Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T07:52:37.122Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T07:52:37.123Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:02.203Z", "themeColor": "Bleu acier", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:02.207Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:08:02.209Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:08:02.211Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:08:02.212Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:08:02.213Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:08:02.214Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-07 14:08:02.223
85	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:02.203Z", "themeColor": "Bleu acier", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:02.207Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:08:02.209Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:08:02.211Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:08:02.212Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:08:02.213Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:08:02.214Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:07.816Z", "themeColor": "Bleu acier clair", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:07.818Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:08:07.820Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:08:07.821Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:08:07.823Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:08:07.824Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:08:07.825Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-07 14:08:07.837
86	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:07.816Z", "themeColor": "Bleu acier clair", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:08:07.818Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:08:07.820Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:08:07.821Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:08:07.823Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:08:07.824Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:08:07.825Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:09:13.262Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:09:13.265Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:09:13.266Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:09:13.267Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:09:13.268Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 5, "name": "Chimie du bâtiment", "slug": "chimie-du-batiment", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Produits techniques spécialisés", "createdAt": "2026-04-07T07:52:21.363Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:09:13.269Z", "categoryId": 1, "description": "Notre sélection de produits de chimie du bâtiment regroupe des solutions techniques indispensables à la pose et à la durabilité de vos revêtements. Colles, joints, mortiers et traitements assurent performance, adhérence et protection.", "imageMediaId": 4, "descriptionSeo": "Chimie du bâtiment : colles, joints, mortiers et produits techniques pour la pose de carrelage et revêtements. Solutions fiables pour garantir performance et durabilité."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:09:13.270Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-07 14:09:13.278
87	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	2	Matériaux de construction	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 4}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:33.438Z", "themeColor": null, "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 5}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:33.440Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:33.441Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 8}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:59:33.442Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 1}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T07:59:33.443Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 4}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:09:41.568Z", "themeColor": "#FF8A00", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 5}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:09:41.570Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:09:41.571Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 8}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:09:41.573Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 1}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:09:41.574Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	2026-04-07 14:09:41.581
88	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	3	Isolation et étanchéité	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Protection thermique et étanche", "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 2, "updatedAt": "2026-04-07T07:59:26.399Z", "themeColor": null, "description": "Optimisez la performance de vos bâtiments grâce à nos solutions d’isolation et d’étanchéité. Protégez vos structures contre les infiltrations, améliorez le confort thermique et assurez la longévité de vos installations.", "imageMediaId": 10, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T07:59:26.401Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T07:59:26.402Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": "Solutions d’isolation et d’étanchéité pour bâtiments : protection contre l’humidité, amélioration thermique et durabilité des structures. Produits adaptés aux normes modernes de construction."}	{"id": 3, "name": "Isolation et étanchéité", "slug": "isolation-et-etancheite", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Protection thermique et étanche", "createdAt": "2026-04-07T07:58:55.821Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:11:41.267Z", "themeColor": "#00B894", "description": "Optimisez la performance de vos bâtiments grâce à nos solutions d’isolation et d’étanchéité. Protégez vos structures contre les infiltrations, améliorez le confort thermique et assurez la longévité de vos installations.", "imageMediaId": 10, "subcategories": [{"id": 11, "name": "Étanchéité", "slug": "etancheite", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection contre l’humidité", "createdAt": "2026-04-07T07:58:55.824Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:11:41.270Z", "categoryId": 3, "description": "Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.", "imageMediaId": 7, "descriptionSeo": "Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments."}, {"id": 12, "name": "Isolation thermique", "slug": "isolation-thermique", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et efficacité énergétique", "createdAt": "2026-04-07T07:58:55.825Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:11:41.271Z", "categoryId": 3, "description": "Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.", "imageMediaId": 11, "descriptionSeo": "Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation."}], "descriptionSeo": "Solutions d’isolation et d’étanchéité pour bâtiments : protection contre l’humidité, amélioration thermique et durabilité des structures. Produits adaptés aux normes modernes de construction."}	2026-04-07 14:11:41.275
89	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	4	Salle de bain et cuisine	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 4, "name": "Salle de bain et cuisine", "slug": "salle-de-bain-et-cuisine", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Équipements et robinetterie", "createdAt": "2026-04-07T08:02:47.901Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:54.426Z", "themeColor": null, "description": "Aménagez des espaces fonctionnels et élégants avec notre gamme dédiée à la salle de bain et à la cuisine. Robinetterie, équipements sanitaires et accessoires allient design contemporain et performance au quotidien.", "imageMediaId": 33, "subcategories": [{"id": 13, "name": "Éviers de cuisine", "slug": "eviers-de-cuisine", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Praticité au quotidien", "createdAt": "2026-04-07T08:02:47.905Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:02:54.428Z", "categoryId": 4, "description": "Découvrez notre sélection d’éviers de cuisine conçus pour répondre aux exigences du quotidien. Résistants, fonctionnels et esthétiques, ils s’intègrent parfaitement à tous les styles de cuisine.", "imageMediaId": 8, "descriptionSeo": "Éviers de cuisine modernes et résistants. Solutions pratiques et esthétiques pour un usage quotidien optimal."}, {"id": 14, "name": "Robinetterie", "slug": "robinetterie", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design et performance", "createdAt": "2026-04-07T08:02:47.906Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:02:54.430Z", "categoryId": 4, "description": "Notre gamme de robinetterie allie précision, durabilité et esthétique. Adaptée aux cuisines et salles de bain, elle garantit confort d’utilisation et performance au quotidien.", "imageMediaId": 31, "descriptionSeo": "Robinetterie pour salle de bain et cuisine : mitigeurs, mélangeurs et solutions modernes. Design élégant et performance durable."}, {"id": 15, "name": "Baignoires", "slug": "baignoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et détente", "createdAt": "2026-04-07T08:02:47.907Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:02:54.430Z", "categoryId": 4, "description": "Transformez votre salle de bain en espace de relaxation avec notre gamme de baignoires. Pensées pour le confort et le bien-être, elles combinent design contemporain et ergonomie.", "imageMediaId": 1, "descriptionSeo": "Baignoires modernes pour salle de bain : confort, design et durabilité. Idéal pour créer un espace de détente et de bien-être chez vous."}, {"id": 16, "name": "Jacuzzis", "slug": "jacuzzis", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Bien-être et hydromassage", "createdAt": "2026-04-07T08:02:47.908Z", "sortOrder": 3, "updatedAt": "2026-04-07T08:02:54.431Z", "categoryId": 4, "description": "Offrez-vous une expérience de relaxation haut de gamme avec nos jacuzzis. Équipés de systèmes d’hydromassage, ils créent un véritable espace de bien-être à domicile.", "imageMediaId": 12, "descriptionSeo": "Jacuzzis et spas pour maison : solutions de bien-être avec hydromassage. Idéal pour détente, confort et aménagement haut de gamme."}, {"id": 17, "name": "Lavabos et vasques", "slug": "lavabos-et-vasques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Élégance et fonctionnalité", "createdAt": "2026-04-07T08:02:47.909Z", "sortOrder": 4, "updatedAt": "2026-04-07T08:02:54.432Z", "categoryId": 4, "description": "Apportez une touche de modernité à votre salle de bain avec notre sélection de lavabos et vasques. Alliant design, praticité et qualité des matériaux, ils s’adaptent à tous les styles d’aménagement.", "imageMediaId": 13, "descriptionSeo": "Lavabos et vasques design pour salle de bain. Large choix de modèles modernes, pratiques et durables pour un espace élégant et fonctionnel."}, {"id": 18, "name": "Espace douche", "slug": "espace-douche", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions douche modernes", "createdAt": "2026-04-07T08:02:47.910Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:02:54.433Z", "categoryId": 4, "description": "Créez un espace douche fonctionnel et élégant avec nos solutions complètes. Parois, receveurs et équipements sont pensés pour allier confort, sécurité et design contemporain.", "imageMediaId": 6, "descriptionSeo": "Espace douche : parois, receveurs et équipements modernes pour salle de bain. Solutions design, pratiques et durables."}], "descriptionSeo": "Équipements pour salle de bain et cuisine : robinetterie, sanitaires, accessoires modernes et durables. Des solutions design pour améliorer confort et fonctionnalité."}	{"id": 4, "name": "Salle de bain et cuisine", "slug": "salle-de-bain-et-cuisine", "_count": {"subcategories": 6}, "isActive": true, "subtitle": "Équipements et robinetterie", "createdAt": "2026-04-07T08:02:47.901Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:12:29.785Z", "themeColor": "#3D9DF2", "description": "Aménagez des espaces fonctionnels et élégants avec notre gamme dédiée à la salle de bain et à la cuisine. Robinetterie, équipements sanitaires et accessoires allient design contemporain et performance au quotidien.", "imageMediaId": 33, "subcategories": [{"id": 13, "name": "Éviers de cuisine", "slug": "eviers-de-cuisine", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Praticité au quotidien", "createdAt": "2026-04-07T08:02:47.905Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:12:29.787Z", "categoryId": 4, "description": "Découvrez notre sélection d’éviers de cuisine conçus pour répondre aux exigences du quotidien. Résistants, fonctionnels et esthétiques, ils s’intègrent parfaitement à tous les styles de cuisine.", "imageMediaId": 8, "descriptionSeo": "Éviers de cuisine modernes et résistants. Solutions pratiques et esthétiques pour un usage quotidien optimal."}, {"id": 14, "name": "Robinetterie", "slug": "robinetterie", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design et performance", "createdAt": "2026-04-07T08:02:47.906Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:12:29.789Z", "categoryId": 4, "description": "Notre gamme de robinetterie allie précision, durabilité et esthétique. Adaptée aux cuisines et salles de bain, elle garantit confort d’utilisation et performance au quotidien.", "imageMediaId": 31, "descriptionSeo": "Robinetterie pour salle de bain et cuisine : mitigeurs, mélangeurs et solutions modernes. Design élégant et performance durable."}, {"id": 15, "name": "Baignoires", "slug": "baignoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et détente", "createdAt": "2026-04-07T08:02:47.907Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:12:29.790Z", "categoryId": 4, "description": "Transformez votre salle de bain en espace de relaxation avec notre gamme de baignoires. Pensées pour le confort et le bien-être, elles combinent design contemporain et ergonomie.", "imageMediaId": 1, "descriptionSeo": "Baignoires modernes pour salle de bain : confort, design et durabilité. Idéal pour créer un espace de détente et de bien-être chez vous."}, {"id": 16, "name": "Jacuzzis", "slug": "jacuzzis", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Bien-être et hydromassage", "createdAt": "2026-04-07T08:02:47.908Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:12:29.791Z", "categoryId": 4, "description": "Offrez-vous une expérience de relaxation haut de gamme avec nos jacuzzis. Équipés de systèmes d’hydromassage, ils créent un véritable espace de bien-être à domicile.", "imageMediaId": 12, "descriptionSeo": "Jacuzzis et spas pour maison : solutions de bien-être avec hydromassage. Idéal pour détente, confort et aménagement haut de gamme."}, {"id": 17, "name": "Lavabos et vasques", "slug": "lavabos-et-vasques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Élégance et fonctionnalité", "createdAt": "2026-04-07T08:02:47.909Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:12:29.792Z", "categoryId": 4, "description": "Apportez une touche de modernité à votre salle de bain avec notre sélection de lavabos et vasques. Alliant design, praticité et qualité des matériaux, ils s’adaptent à tous les styles d’aménagement.", "imageMediaId": 13, "descriptionSeo": "Lavabos et vasques design pour salle de bain. Large choix de modèles modernes, pratiques et durables pour un espace élégant et fonctionnel."}, {"id": 18, "name": "Espace douche", "slug": "espace-douche", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions douche modernes", "createdAt": "2026-04-07T08:02:47.910Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:12:29.793Z", "categoryId": 4, "description": "Créez un espace douche fonctionnel et élégant avec nos solutions complètes. Parois, receveurs et équipements sont pensés pour allier confort, sécurité et design contemporain.", "imageMediaId": 6, "descriptionSeo": "Espace douche : parois, receveurs et équipements modernes pour salle de bain. Solutions design, pratiques et durables."}], "descriptionSeo": "Équipements pour salle de bain et cuisine : robinetterie, sanitaires, accessoires modernes et durables. Des solutions design pour améliorer confort et fonctionnalité."}	2026-04-07 14:12:29.799
90	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	5	Peintures et décoration	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 4, "updatedAt": "2026-04-07T08:05:21.724Z", "themeColor": null, "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:05:21.726Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:05:21.728Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:05:21.730Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:13:26.621Z", "themeColor": "#9B5DE5", "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:13:26.623Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:13:26.625Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:13:26.626Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	2026-04-07 14:13:26.633
91	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	5	Peintures et décoration	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:13:26.621Z", "themeColor": "#9B5DE5", "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:13:26.623Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:13:26.625Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:13:26.626Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	{"id": 5, "name": "Peintures et décoration", "slug": "peintures-et-decoration", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Couleurs et finitions", "createdAt": "2026-04-07T08:05:13.588Z", "sortOrder": 4, "updatedAt": "2026-04-07T14:13:30.475Z", "themeColor": "#9B5DE5", "description": "Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.", "imageMediaId": 21, "subcategories": [{"id": 19, "name": "Béton ciré", "slug": "beton-cire", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finition moderne et minimaliste", "createdAt": "2026-04-07T08:05:13.593Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:13:30.477Z", "categoryId": 5, "description": "Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.", "imageMediaId": 2, "descriptionSeo": "Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain."}, {"id": 20, "name": "Peintures d'intérieur", "slug": "peintures-d-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Couleurs pour vos espaces", "createdAt": "2026-04-07T08:05:13.599Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:13:30.478Z", "categoryId": 5, "description": "Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.", "imageMediaId": 20, "descriptionSeo": "Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces."}, {"id": 21, "name": "Peintures d'extérieur", "slug": "peintures-d-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Protection et esthétique", "createdAt": "2026-04-07T08:05:13.601Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:13:30.479Z", "categoryId": 5, "description": "Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.", "imageMediaId": 19, "descriptionSeo": "Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique."}], "descriptionSeo": "Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style."}	2026-04-07 14:13:30.488
92	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	6	Piscine	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 6, "name": "Piscine", "slug": "piscine", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Aménagements extérieurs premium", "createdAt": "2026-04-07T08:06:49.862Z", "sortOrder": 5, "updatedAt": "2026-04-07T08:07:30.140Z", "themeColor": null, "description": "Créez un espace de détente unique avec notre sélection dédiée à l’univers de la piscine. Revêtements, équipements et accessoires sont pensés pour allier esthétique, confort et résistance en extérieur.", "imageMediaId": 23, "subcategories": [{"id": 24, "name": "Pierres de Bali", "slug": "pierres-de-bali", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Ambiance naturelle et exotique", "createdAt": "2026-04-07T08:07:30.142Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:07:30.142Z", "categoryId": 6, "description": "Créez une atmosphère unique avec les pierres de Bali, reconnues pour leurs reflets naturels et leur élégance. Idéales pour piscines et espaces extérieurs, elles apportent une touche haut de gamme et apaisante.", "imageMediaId": 22, "descriptionSeo": "Pierres de Bali pour piscine : revêtements naturels aux reflets uniques. Idéal pour créer une ambiance exotique et haut de gamme."}, {"id": 22, "name": "Margelles et finitions", "slug": "margelles-et-finitions", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Contours et finitions piscine", "createdAt": "2026-04-07T08:06:49.866Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:07:30.143Z", "categoryId": 6, "description": "Apportez la touche finale à votre piscine avec notre sélection de margelles et finitions. Conçues pour allier sécurité, résistance et esthétique, elles structurent élégamment vos espaces extérieurs.", "imageMediaId": 14, "descriptionSeo": "Margelles et finitions pour piscine : solutions esthétiques et antidérapantes pour sécuriser et sublimer les contours de votre bassin."}, {"id": 23, "name": "Mosaïques", "slug": "mosaiques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Revêtements décoratifs piscine", "createdAt": "2026-04-07T08:06:49.867Z", "sortOrder": 2, "updatedAt": "2026-04-07T08:07:30.144Z", "categoryId": 6, "description": "Personnalisez votre piscine avec nos mosaïques décoratives aux finitions raffinées. Résistantes à l’eau et aux produits chimiques, elles permettent de créer des designs uniques et lumineux.", "imageMediaId": 18, "descriptionSeo": "Mosaïques pour piscine : revêtements résistants et décoratifs pour personnaliser votre bassin avec élégance et durabilité."}], "descriptionSeo": "Produits pour piscine : revêtements, équipements et accessoires pour un aménagement extérieur durable et esthétique. Idéal pour créer un espace de détente haut de gamme."}	{"id": 6, "name": "Piscine", "slug": "piscine", "_count": {"subcategories": 3}, "isActive": true, "subtitle": "Aménagements extérieurs premium", "createdAt": "2026-04-07T08:06:49.862Z", "sortOrder": 5, "updatedAt": "2026-04-07T14:13:48.080Z", "themeColor": "#00C2FF", "description": "Créez un espace de détente unique avec notre sélection dédiée à l’univers de la piscine. Revêtements, équipements et accessoires sont pensés pour allier esthétique, confort et résistance en extérieur.", "imageMediaId": 23, "subcategories": [{"id": 24, "name": "Pierres de Bali", "slug": "pierres-de-bali", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Ambiance naturelle et exotique", "createdAt": "2026-04-07T08:07:30.142Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:13:48.082Z", "categoryId": 6, "description": "Créez une atmosphère unique avec les pierres de Bali, reconnues pour leurs reflets naturels et leur élégance. Idéales pour piscines et espaces extérieurs, elles apportent une touche haut de gamme et apaisante.", "imageMediaId": 22, "descriptionSeo": "Pierres de Bali pour piscine : revêtements naturels aux reflets uniques. Idéal pour créer une ambiance exotique et haut de gamme."}, {"id": 22, "name": "Margelles et finitions", "slug": "margelles-et-finitions", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Contours et finitions piscine", "createdAt": "2026-04-07T08:06:49.866Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:13:48.083Z", "categoryId": 6, "description": "Apportez la touche finale à votre piscine avec notre sélection de margelles et finitions. Conçues pour allier sécurité, résistance et esthétique, elles structurent élégamment vos espaces extérieurs.", "imageMediaId": 14, "descriptionSeo": "Margelles et finitions pour piscine : solutions esthétiques et antidérapantes pour sécuriser et sublimer les contours de votre bassin."}, {"id": 23, "name": "Mosaïques", "slug": "mosaiques", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Revêtements décoratifs piscine", "createdAt": "2026-04-07T08:06:49.867Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:13:48.084Z", "categoryId": 6, "description": "Personnalisez votre piscine avec nos mosaïques décoratives aux finitions raffinées. Résistantes à l’eau et aux produits chimiques, elles permettent de créer des designs uniques et lumineux.", "imageMediaId": 18, "descriptionSeo": "Mosaïques pour piscine : revêtements résistants et décoratifs pour personnaliser votre bassin avec élégance et durabilité."}], "descriptionSeo": "Produits pour piscine : revêtements, équipements et accessoires pour un aménagement extérieur durable et esthétique. Idéal pour créer un espace de détente haut de gamme."}	2026-04-07 14:13:48.094
93	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	7	Portes et menuiserie	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 7, "name": "Portes et menuiserie", "slug": "portes-et-menuiserie", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Portes et finitions bois", "createdAt": "2026-04-07T08:08:53.437Z", "sortOrder": 6, "updatedAt": "2026-04-07T08:09:04.624Z", "themeColor": null, "description": "Découvrez notre gamme de portes et solutions de menuiserie conçues pour allier sécurité, esthétique et durabilité. Portes intérieures, extérieures et éléments de finition s’intègrent harmonieusement à tous les styles d’aménagement.", "imageMediaId": 27, "subcategories": [{"id": 25, "name": "Portes coulissantes", "slug": "portes-coulissantes", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Gain d’espace moderne", "createdAt": "2026-04-07T08:08:53.442Z", "sortOrder": 0, "updatedAt": "2026-04-07T08:09:04.626Z", "categoryId": 7, "description": "Optimisez vos espaces avec nos portes coulissantes au design contemporain. Pratiques et élégantes, elles permettent une circulation fluide tout en apportant une touche moderne à vos intérieurs.", "imageMediaId": 25, "descriptionSeo": "Portes coulissantes modernes pour intérieur : solutions pratiques et design pour optimiser l’espace et améliorer la circulation."}, {"id": 26, "name": "Portes en bois", "slug": "portes-en-bois", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Authenticité et chaleur", "createdAt": "2026-04-07T08:08:53.445Z", "sortOrder": 1, "updatedAt": "2026-04-07T08:09:04.630Z", "categoryId": 7, "description": "Apportez du caractère à vos espaces avec nos portes en bois. Robustes et intemporelles, elles offrent une excellente isolation et s’intègrent parfaitement à tous les styles d’aménagement.", "imageMediaId": 26, "descriptionSeo": "Portes en bois pour intérieur et extérieur : design authentique, isolation et durabilité pour sublimer vos espaces."}], "descriptionSeo": "Portes intérieures et extérieures, éléments de menuiserie et finitions bois. Des solutions esthétiques et durables pour améliorer sécurité, isolation et design de vos espaces."}	{"id": 7, "name": "Portes et menuiserie", "slug": "portes-et-menuiserie", "_count": {"subcategories": 2}, "isActive": true, "subtitle": "Portes et finitions bois", "createdAt": "2026-04-07T08:08:53.437Z", "sortOrder": 6, "updatedAt": "2026-04-07T14:13:59.325Z", "themeColor": "#C97A40", "description": "Découvrez notre gamme de portes et solutions de menuiserie conçues pour allier sécurité, esthétique et durabilité. Portes intérieures, extérieures et éléments de finition s’intègrent harmonieusement à tous les styles d’aménagement.", "imageMediaId": 27, "subcategories": [{"id": 25, "name": "Portes coulissantes", "slug": "portes-coulissantes", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Gain d’espace moderne", "createdAt": "2026-04-07T08:08:53.442Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:13:59.327Z", "categoryId": 7, "description": "Optimisez vos espaces avec nos portes coulissantes au design contemporain. Pratiques et élégantes, elles permettent une circulation fluide tout en apportant une touche moderne à vos intérieurs.", "imageMediaId": 25, "descriptionSeo": "Portes coulissantes modernes pour intérieur : solutions pratiques et design pour optimiser l’espace et améliorer la circulation."}, {"id": 26, "name": "Portes en bois", "slug": "portes-en-bois", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Authenticité et chaleur", "createdAt": "2026-04-07T08:08:53.445Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:13:59.328Z", "categoryId": 7, "description": "Apportez du caractère à vos espaces avec nos portes en bois. Robustes et intemporelles, elles offrent une excellente isolation et s’intègrent parfaitement à tous les styles d’aménagement.", "imageMediaId": 26, "descriptionSeo": "Portes en bois pour intérieur et extérieur : design authentique, isolation et durabilité pour sublimer vos espaces."}], "descriptionSeo": "Portes intérieures et extérieures, éléments de menuiserie et finitions bois. Des solutions esthétiques et durables pour améliorer sécurité, isolation et design de vos espaces."}	2026-04-07 14:13:59.336
94	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	2	Matériaux de construction	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 4}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:09:41.568Z", "themeColor": "#FF8A00", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 5}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 0, "updatedAt": "2026-04-07T14:09:41.570Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 1, "updatedAt": "2026-04-07T14:09:41.571Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 8}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 2, "updatedAt": "2026-04-07T14:09:41.573Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 10}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 3, "updatedAt": "2026-04-07T14:09:41.574Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	{"id": 2, "name": "Matériaux de construction", "slug": "materiaux-de-construction", "_count": {"subcategories": 5}, "isActive": true, "subtitle": "Bases solides et fiables", "createdAt": "2026-04-07T07:54:22.136Z", "sortOrder": 1, "updatedAt": "2026-04-07T15:13:24.489Z", "themeColor": "#FF8A00", "description": "Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.", "imageMediaId": 15, "subcategories": [{"id": 7, "name": "Sables et graviers", "slug": "sables-et-graviers", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Granulats pour construction", "createdAt": "2026-04-07T07:54:22.140Z", "sortOrder": 2, "updatedAt": "2026-04-07T15:13:24.496Z", "categoryId": 2, "description": "Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.", "imageMediaId": 32, "descriptionSeo": "Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment."}, {"id": 10, "name": "Briques", "slug": "briques", "_count": {"productLinks": 5}, "isActive": true, "subtitle": "Maçonnerie et élévation", "createdAt": "2026-04-07T07:55:08.356Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:13:24.495Z", "categoryId": 2, "description": "Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.", "imageMediaId": 3, "descriptionSeo": "Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie."}, {"id": 8, "name": "Treillis soudés et fers à béton", "slug": "treillis-soudes-et-fers-a-beton", "_count": {"productLinks": 8}, "isActive": true, "subtitle": "Armatures et renforcement", "createdAt": "2026-04-07T07:54:22.141Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:13:24.497Z", "categoryId": 2, "description": "Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.", "imageMediaId": 34, "descriptionSeo": "Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton."}, {"id": 9, "name": "Ciments et produits en béton", "slug": "ciments-et-produits-en-beton", "_count": {"productLinks": 10}, "isActive": true, "subtitle": "Liants et solutions béton", "createdAt": "2026-04-07T07:54:22.142Z", "sortOrder": 4, "updatedAt": "2026-04-07T15:13:24.498Z", "categoryId": 2, "description": "Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.", "imageMediaId": 5, "descriptionSeo": "Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables."}, {"id": 27, "name": "Adjuvants", "slug": "adjuvants", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Amélioration des performances béton", "createdAt": "2026-04-07T15:13:24.492Z", "sortOrder": 5, "updatedAt": "2026-04-07T15:13:24.492Z", "categoryId": 2, "description": "Les adjuvants permettent d’optimiser les propriétés du béton selon les besoins du chantier. Ils améliorent la résistance, la maniabilité et la durabilité pour garantir des performances adaptées à chaque application.", "imageMediaId": null, "descriptionSeo": "Adjuvants pour béton : solutions pour améliorer résistance, durabilité et maniabilité. Idéal pour optimiser les performances des ouvrages en construction."}], "descriptionSeo": "Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers."}	2026-04-07 15:13:24.51
97	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	68	Admix-Cen-min.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 68, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1000, "folderId": 3, "heightPx": 1000, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:18:04.944Z", "extension": "png", "sizeBytes": 90173, "updatedAt": "2026-04-07T15:18:04.944Z", "sha256Hash": "4b8409f336940b46d50133b8a5622053bea1e1fb1e91378c584fe51c83a990ef", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/78d91b19-1592-4959-abbe-655820800c11-admix-cen-min.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Admix-Cen-min.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 15:18:05.02
98	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	69	admix-S2-min.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 69, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1000, "folderId": 3, "heightPx": 1000, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:18:05.096Z", "extension": "png", "sizeBytes": 143559, "updatedAt": "2026-04-07T15:18:05.096Z", "sha256Hash": "853fe755daea5e907b4282bcdd4f19a50947f901b39a0693937665b539392596", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4b3ae624-a1a9-44b2-8513-d4b7ab1e7187-admix-s2-min.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "admix-S2-min.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 15:18:05.113
99	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	70	SIKALATEX BIDON 1LITRE.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 70, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 3, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.505Z", "extension": "png", "sizeBytes": 181848, "updatedAt": "2026-04-07T15:46:13.505Z", "sha256Hash": "b2a11fbbfcb2886916c97e811148bc61438fd8ae63a8c9b4415a7319d9e910a8", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5a919aaf-0a2f-4217-bca5-47a2fe621eb3-sikalatex-bidon-1litre.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 1LITRE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 15:46:13.568
100	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	71	SIKALATEX BIDON 5LITRES.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 71, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 3, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.613Z", "extension": "png", "sizeBytes": 140025, "updatedAt": "2026-04-07T15:46:13.613Z", "sha256Hash": "a5ea25de0cfc92bc9bfd06f957b67c50b67235e2b992536f988bc4853194dc52", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cdf47d0c-6d96-4d42-8c2e-257763195fbf-sikalatex-bidon-5litres.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 5LITRES.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 15:46:13.629
101	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	72	SIKALATEX BIDON 20L.png	Import d'un média	\N	\N	\N	\N	\N	{"id": 72, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 3, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.668Z", "extension": "png", "sizeBytes": 140848, "updatedAt": "2026-04-07T15:46:13.668Z", "sha256Hash": "68aa3dd6826e7a862555da239169eabc12bc2980310fd7f4ad6fc48066aa6225", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d91d3468-877c-46a3-b3ab-c23daec66182-sikalatex-bidon-20l.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 20L.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-07 15:46:13.683
102	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 5}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-07T15:14:57.024Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 1, "name": "Revêtements de sol extérieur", "slug": "revetements-de-sol-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 0, "updatedAt": "2026-04-07T15:14:57.026Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Revêtements de sol intérieur", "slug": "revetements-de-sol-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 1, "updatedAt": "2026-04-07T15:14:57.027Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-07T15:14:57.028Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-07T15:14:57.029Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 4, "updatedAt": "2026-04-07T15:14:57.032Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 11}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:17:38.713Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 28, "name": "Produits de pose & finition", "slug": "produits-de-pose-finition", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions techniques essentielles", "createdAt": "2026-04-08T07:17:38.718Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:17:38.718Z", "categoryId": 1, "description": "Optimisez la pose et la durabilité de vos revêtements grâce à notre gamme de produits de pose et de finition. Colles, joints et accessoires assurent un résultat professionnel et durable.", "imageMediaId": null, "descriptionSeo": "Produits de pose et finition pour carrelage : colles, joints et solutions techniques pour une installation durable et professionnelle."}, {"id": 29, "name": "Grès effet parquet", "slug": "gres-effet-parquet", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Chaleur du bois, résistance du grès", "createdAt": "2026-04-08T07:17:38.727Z", "sortOrder": 1, "updatedAt": "2026-04-08T07:17:38.727Z", "categoryId": 1, "description": "Alliez l’esthétique chaleureuse du bois à la résistance du carrelage avec le grès effet parquet. Idéal pour toutes les pièces, il offre un rendu naturel sans les contraintes d’entretien du bois.", "imageMediaId": null, "descriptionSeo": "Grès effet parquet : carrelage imitation bois pour sols. Résistant, esthétique et facile à entretenir."}, {"id": 30, "name": "Grandes dalles", "slug": "grandes-dalles", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Formats larges et modernes", "createdAt": "2026-04-08T07:17:38.728Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:17:38.728Z", "categoryId": 1, "description": "Les grandes dalles apportent une esthétique contemporaine grâce à leurs formats généreux et leurs joints réduits. Elles créent des surfaces élégantes, homogènes et faciles à entretenir.", "imageMediaId": null, "descriptionSeo": "Grandes dalles de carrelage pour sols et murs. Formats modernes avec peu de joints pour un rendu esthétique, minimaliste et facile à entretenir."}, {"id": 31, "name": "Carrelage antidérapant R11", "slug": "carrelage-antiderapant-r11", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Sécurité et adhérence renforcée", "createdAt": "2026-04-08T07:17:38.730Z", "sortOrder": 3, "updatedAt": "2026-04-08T07:17:38.730Z", "categoryId": 1, "description": "Idéal pour les zones humides ou extérieures, le carrelage antidérapant R11 offre une excellente adhérence et garantit la sécurité au quotidien. Il allie performance technique et esthétique pour vos terrasses, piscines et espaces à fort passage.", "imageMediaId": null, "descriptionSeo": "Carrelage antidérapant R11 pour extérieur et zones humides. Revêtement sécurisé, résistant et esthétique pour terrasses, piscines et espaces publics."}, {"id": 32, "name": "Carrelage effet béton", "slug": "carrelage-effet-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Style urbain contemporain", "createdAt": "2026-04-08T07:17:38.732Z", "sortOrder": 4, "updatedAt": "2026-04-08T07:17:38.732Z", "categoryId": 1, "description": "Inspiré des ambiances industrielles, le carrelage effet béton offre un rendu moderne et épuré. Résistant et facile d’entretien, il est idéal pour créer des espaces élégants et minimalistes.", "imageMediaId": null, "descriptionSeo": "Carrelage effet béton pour intérieur et extérieur. Style industriel moderne, résistant et facile à entretenir."}, {"id": 33, "name": "Grès effet pierre naturelle", "slug": "gres-effet-pierre-naturelle", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Aspect naturel et authentique", "createdAt": "2026-04-08T07:17:38.733Z", "sortOrder": 5, "updatedAt": "2026-04-08T07:17:38.733Z", "categoryId": 1, "description": "Le grès effet pierre naturelle reproduit fidèlement l’aspect des pierres tout en offrant les avantages techniques du carrelage. Il apporte charme et authenticité à vos espaces intérieurs et extérieurs.", "imageMediaId": null, "descriptionSeo": "Grès effet pierre naturelle : carrelage au rendu authentique, résistant et durable pour sols et murs."}, {"id": 1, "name": "Carrelage extérieur", "slug": "carrelage-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 6, "updatedAt": "2026-04-08T07:17:38.735Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Carrelage intérieur", "slug": "carrelage-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 7, "updatedAt": "2026-04-08T07:17:38.736Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 8, "updatedAt": "2026-04-08T07:17:38.738Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 9, "updatedAt": "2026-04-08T07:17:38.739Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 10, "updatedAt": "2026-04-08T07:17:38.740Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-08 07:17:38.795
103	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 11}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:17:38.713Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 28, "name": "Produits de pose & finition", "slug": "produits-de-pose-finition", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions techniques essentielles", "createdAt": "2026-04-08T07:17:38.718Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:17:38.718Z", "categoryId": 1, "description": "Optimisez la pose et la durabilité de vos revêtements grâce à notre gamme de produits de pose et de finition. Colles, joints et accessoires assurent un résultat professionnel et durable.", "imageMediaId": null, "descriptionSeo": "Produits de pose et finition pour carrelage : colles, joints et solutions techniques pour une installation durable et professionnelle."}, {"id": 29, "name": "Grès effet parquet", "slug": "gres-effet-parquet", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Chaleur du bois, résistance du grès", "createdAt": "2026-04-08T07:17:38.727Z", "sortOrder": 1, "updatedAt": "2026-04-08T07:17:38.727Z", "categoryId": 1, "description": "Alliez l’esthétique chaleureuse du bois à la résistance du carrelage avec le grès effet parquet. Idéal pour toutes les pièces, il offre un rendu naturel sans les contraintes d’entretien du bois.", "imageMediaId": null, "descriptionSeo": "Grès effet parquet : carrelage imitation bois pour sols. Résistant, esthétique et facile à entretenir."}, {"id": 30, "name": "Grandes dalles", "slug": "grandes-dalles", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Formats larges et modernes", "createdAt": "2026-04-08T07:17:38.728Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:17:38.728Z", "categoryId": 1, "description": "Les grandes dalles apportent une esthétique contemporaine grâce à leurs formats généreux et leurs joints réduits. Elles créent des surfaces élégantes, homogènes et faciles à entretenir.", "imageMediaId": null, "descriptionSeo": "Grandes dalles de carrelage pour sols et murs. Formats modernes avec peu de joints pour un rendu esthétique, minimaliste et facile à entretenir."}, {"id": 31, "name": "Carrelage antidérapant R11", "slug": "carrelage-antiderapant-r11", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Sécurité et adhérence renforcée", "createdAt": "2026-04-08T07:17:38.730Z", "sortOrder": 3, "updatedAt": "2026-04-08T07:17:38.730Z", "categoryId": 1, "description": "Idéal pour les zones humides ou extérieures, le carrelage antidérapant R11 offre une excellente adhérence et garantit la sécurité au quotidien. Il allie performance technique et esthétique pour vos terrasses, piscines et espaces à fort passage.", "imageMediaId": null, "descriptionSeo": "Carrelage antidérapant R11 pour extérieur et zones humides. Revêtement sécurisé, résistant et esthétique pour terrasses, piscines et espaces publics."}, {"id": 32, "name": "Carrelage effet béton", "slug": "carrelage-effet-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Style urbain contemporain", "createdAt": "2026-04-08T07:17:38.732Z", "sortOrder": 4, "updatedAt": "2026-04-08T07:17:38.732Z", "categoryId": 1, "description": "Inspiré des ambiances industrielles, le carrelage effet béton offre un rendu moderne et épuré. Résistant et facile d’entretien, il est idéal pour créer des espaces élégants et minimalistes.", "imageMediaId": null, "descriptionSeo": "Carrelage effet béton pour intérieur et extérieur. Style industriel moderne, résistant et facile à entretenir."}, {"id": 33, "name": "Grès effet pierre naturelle", "slug": "gres-effet-pierre-naturelle", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Aspect naturel et authentique", "createdAt": "2026-04-08T07:17:38.733Z", "sortOrder": 5, "updatedAt": "2026-04-08T07:17:38.733Z", "categoryId": 1, "description": "Le grès effet pierre naturelle reproduit fidèlement l’aspect des pierres tout en offrant les avantages techniques du carrelage. Il apporte charme et authenticité à vos espaces intérieurs et extérieurs.", "imageMediaId": null, "descriptionSeo": "Grès effet pierre naturelle : carrelage au rendu authentique, résistant et durable pour sols et murs."}, {"id": 1, "name": "Carrelage extérieur", "slug": "carrelage-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 6, "updatedAt": "2026-04-08T07:17:38.735Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 2, "name": "Carrelage intérieur", "slug": "carrelage-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 7, "updatedAt": "2026-04-08T07:17:38.736Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 8, "updatedAt": "2026-04-08T07:17:38.738Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 9, "updatedAt": "2026-04-08T07:17:38.739Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 10, "updatedAt": "2026-04-08T07:17:38.740Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 11}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:19:49.438Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 2, "name": "Carrelage intérieur", "slug": "carrelage-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:19:49.449Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 1, "name": "Carrelage extérieur", "slug": "carrelage-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:19:49.448Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:19:49.450Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-08T07:19:49.451Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 4, "updatedAt": "2026-04-08T07:19:49.452Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}, {"id": 31, "name": "Carrelage antidérapant R11", "slug": "carrelage-antiderapant-r11", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Sécurité et adhérence renforcée", "createdAt": "2026-04-08T07:17:38.730Z", "sortOrder": 5, "updatedAt": "2026-04-08T07:19:49.445Z", "categoryId": 1, "description": "Idéal pour les zones humides ou extérieures, le carrelage antidérapant R11 offre une excellente adhérence et garantit la sécurité au quotidien. Il allie performance technique et esthétique pour vos terrasses, piscines et espaces à fort passage.", "imageMediaId": null, "descriptionSeo": "Carrelage antidérapant R11 pour extérieur et zones humides. Revêtement sécurisé, résistant et esthétique pour terrasses, piscines et espaces publics."}, {"id": 30, "name": "Grandes dalles", "slug": "grandes-dalles", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Formats larges et modernes", "createdAt": "2026-04-08T07:17:38.728Z", "sortOrder": 6, "updatedAt": "2026-04-08T07:19:49.443Z", "categoryId": 1, "description": "Les grandes dalles apportent une esthétique contemporaine grâce à leurs formats généreux et leurs joints réduits. Elles créent des surfaces élégantes, homogènes et faciles à entretenir.", "imageMediaId": null, "descriptionSeo": "Grandes dalles de carrelage pour sols et murs. Formats modernes avec peu de joints pour un rendu esthétique, minimaliste et facile à entretenir."}, {"id": 32, "name": "Carrelage effet béton", "slug": "carrelage-effet-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Style urbain contemporain", "createdAt": "2026-04-08T07:17:38.732Z", "sortOrder": 7, "updatedAt": "2026-04-08T07:19:49.446Z", "categoryId": 1, "description": "Inspiré des ambiances industrielles, le carrelage effet béton offre un rendu moderne et épuré. Résistant et facile d’entretien, il est idéal pour créer des espaces élégants et minimalistes.", "imageMediaId": null, "descriptionSeo": "Carrelage effet béton pour intérieur et extérieur. Style industriel moderne, résistant et facile à entretenir."}, {"id": 29, "name": "Grès effet parquet", "slug": "gres-effet-parquet", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Chaleur du bois, résistance du grès", "createdAt": "2026-04-08T07:17:38.727Z", "sortOrder": 8, "updatedAt": "2026-04-08T07:19:49.442Z", "categoryId": 1, "description": "Alliez l’esthétique chaleureuse du bois à la résistance du carrelage avec le grès effet parquet. Idéal pour toutes les pièces, il offre un rendu naturel sans les contraintes d’entretien du bois.", "imageMediaId": null, "descriptionSeo": "Grès effet parquet : carrelage imitation bois pour sols. Résistant, esthétique et facile à entretenir."}, {"id": 33, "name": "Grès effet pierre naturelle", "slug": "gres-effet-pierre-naturelle", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Aspect naturel et authentique", "createdAt": "2026-04-08T07:17:38.733Z", "sortOrder": 9, "updatedAt": "2026-04-08T07:19:49.447Z", "categoryId": 1, "description": "Le grès effet pierre naturelle reproduit fidèlement l’aspect des pierres tout en offrant les avantages techniques du carrelage. Il apporte charme et authenticité à vos espaces intérieurs et extérieurs.", "imageMediaId": null, "descriptionSeo": "Grès effet pierre naturelle : carrelage au rendu authentique, résistant et durable pour sols et murs."}, {"id": 28, "name": "Produits de pose & finition", "slug": "produits-de-pose-finition", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions techniques essentielles", "createdAt": "2026-04-08T07:17:38.718Z", "sortOrder": 10, "updatedAt": "2026-04-08T07:19:49.441Z", "categoryId": 1, "description": "Optimisez la pose et la durabilité de vos revêtements grâce à notre gamme de produits de pose et de finition. Colles, joints et accessoires assurent un résultat professionnel et durable.", "imageMediaId": null, "descriptionSeo": "Produits de pose et finition pour carrelage : colles, joints et solutions techniques pour une installation durable et professionnelle."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-08 07:19:49.459
104	cmnnfemzf00008wg9iwn6hacx	UPDATE	ProductCategory	1	Revêtements de sols et murs	Mise à jour d'une catégorie produit	\N	\N	\N	\N	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 11}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:19:49.438Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 2, "name": "Carrelage intérieur", "slug": "carrelage-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:19:49.449Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 1, "name": "Carrelage extérieur", "slug": "carrelage-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:19:49.448Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:19:49.450Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-08T07:19:49.451Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 4, "updatedAt": "2026-04-08T07:19:49.452Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}, {"id": 31, "name": "Carrelage antidérapant R11", "slug": "carrelage-antiderapant-r11", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Sécurité et adhérence renforcée", "createdAt": "2026-04-08T07:17:38.730Z", "sortOrder": 5, "updatedAt": "2026-04-08T07:19:49.445Z", "categoryId": 1, "description": "Idéal pour les zones humides ou extérieures, le carrelage antidérapant R11 offre une excellente adhérence et garantit la sécurité au quotidien. Il allie performance technique et esthétique pour vos terrasses, piscines et espaces à fort passage.", "imageMediaId": null, "descriptionSeo": "Carrelage antidérapant R11 pour extérieur et zones humides. Revêtement sécurisé, résistant et esthétique pour terrasses, piscines et espaces publics."}, {"id": 30, "name": "Grandes dalles", "slug": "grandes-dalles", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Formats larges et modernes", "createdAt": "2026-04-08T07:17:38.728Z", "sortOrder": 6, "updatedAt": "2026-04-08T07:19:49.443Z", "categoryId": 1, "description": "Les grandes dalles apportent une esthétique contemporaine grâce à leurs formats généreux et leurs joints réduits. Elles créent des surfaces élégantes, homogènes et faciles à entretenir.", "imageMediaId": null, "descriptionSeo": "Grandes dalles de carrelage pour sols et murs. Formats modernes avec peu de joints pour un rendu esthétique, minimaliste et facile à entretenir."}, {"id": 32, "name": "Carrelage effet béton", "slug": "carrelage-effet-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Style urbain contemporain", "createdAt": "2026-04-08T07:17:38.732Z", "sortOrder": 7, "updatedAt": "2026-04-08T07:19:49.446Z", "categoryId": 1, "description": "Inspiré des ambiances industrielles, le carrelage effet béton offre un rendu moderne et épuré. Résistant et facile d’entretien, il est idéal pour créer des espaces élégants et minimalistes.", "imageMediaId": null, "descriptionSeo": "Carrelage effet béton pour intérieur et extérieur. Style industriel moderne, résistant et facile à entretenir."}, {"id": 29, "name": "Grès effet parquet", "slug": "gres-effet-parquet", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Chaleur du bois, résistance du grès", "createdAt": "2026-04-08T07:17:38.727Z", "sortOrder": 8, "updatedAt": "2026-04-08T07:19:49.442Z", "categoryId": 1, "description": "Alliez l’esthétique chaleureuse du bois à la résistance du carrelage avec le grès effet parquet. Idéal pour toutes les pièces, il offre un rendu naturel sans les contraintes d’entretien du bois.", "imageMediaId": null, "descriptionSeo": "Grès effet parquet : carrelage imitation bois pour sols. Résistant, esthétique et facile à entretenir."}, {"id": 33, "name": "Grès effet pierre naturelle", "slug": "gres-effet-pierre-naturelle", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Aspect naturel et authentique", "createdAt": "2026-04-08T07:17:38.733Z", "sortOrder": 9, "updatedAt": "2026-04-08T07:19:49.447Z", "categoryId": 1, "description": "Le grès effet pierre naturelle reproduit fidèlement l’aspect des pierres tout en offrant les avantages techniques du carrelage. Il apporte charme et authenticité à vos espaces intérieurs et extérieurs.", "imageMediaId": null, "descriptionSeo": "Grès effet pierre naturelle : carrelage au rendu authentique, résistant et durable pour sols et murs."}, {"id": 28, "name": "Produits de pose & finition", "slug": "produits-de-pose-finition", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions techniques essentielles", "createdAt": "2026-04-08T07:17:38.718Z", "sortOrder": 10, "updatedAt": "2026-04-08T07:19:49.441Z", "categoryId": 1, "description": "Optimisez la pose et la durabilité de vos revêtements grâce à notre gamme de produits de pose et de finition. Colles, joints et accessoires assurent un résultat professionnel et durable.", "imageMediaId": null, "descriptionSeo": "Produits de pose et finition pour carrelage : colles, joints et solutions techniques pour une installation durable et professionnelle."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	{"id": 1, "name": "Revêtements de sols et murs", "slug": "revetements-de-sols-et-murs", "_count": {"subcategories": 11}, "isActive": true, "subtitle": "Sols, murs et finitions", "createdAt": "2026-04-07T07:52:21.354Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:20:14.281Z", "themeColor": "#00AEEF", "description": "Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.", "imageMediaId": 30, "subcategories": [{"id": 2, "name": "Carrelage intérieur", "slug": "carrelage-interieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Confort et design intérieur", "createdAt": "2026-04-07T07:52:21.361Z", "sortOrder": 0, "updatedAt": "2026-04-08T07:20:14.284Z", "categoryId": 1, "description": "Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.", "imageMediaId": 29, "descriptionSeo": "Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile."}, {"id": 1, "name": "Carrelage extérieur", "slug": "carrelage-exterieur", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Terrasses et espaces extérieurs", "createdAt": "2026-04-07T07:52:21.359Z", "sortOrder": 1, "updatedAt": "2026-04-08T07:20:14.285Z", "categoryId": 1, "description": "Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.", "imageMediaId": 28, "descriptionSeo": "Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs."}, {"id": 3, "name": "Faïence murale", "slug": "faience-murale", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Habillage mural décoratif", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 2, "updatedAt": "2026-04-08T07:20:14.286Z", "categoryId": 1, "description": "La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.", "imageMediaId": 9, "descriptionSeo": "Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes."}, {"id": 4, "name": "Plinthes et accessoires", "slug": "plinthes-et-accessoires", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Finitions et détails essentiels", "createdAt": "2026-04-07T07:52:21.362Z", "sortOrder": 3, "updatedAt": "2026-04-08T07:20:14.287Z", "categoryId": 1, "description": "Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.", "imageMediaId": 24, "descriptionSeo": "Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces."}, {"id": 6, "name": "Mosaïque à l’italienne", "slug": "mosaique-a-l-italienne", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Design artisanal haut de gamme", "createdAt": "2026-04-07T07:52:21.364Z", "sortOrder": 4, "updatedAt": "2026-04-08T07:20:14.288Z", "categoryId": 1, "description": "Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.", "imageMediaId": 17, "descriptionSeo": "Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable."}, {"id": 31, "name": "Carrelage antidérapant R11", "slug": "carrelage-antiderapant-r11", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Sécurité et adhérence renforcée", "createdAt": "2026-04-08T07:17:38.730Z", "sortOrder": 5, "updatedAt": "2026-04-08T07:20:14.289Z", "categoryId": 1, "description": "Idéal pour les zones humides ou extérieures, le carrelage antidérapant R11 offre une excellente adhérence et garantit la sécurité au quotidien. Il allie performance technique et esthétique pour vos terrasses, piscines et espaces à fort passage.", "imageMediaId": null, "descriptionSeo": "Carrelage antidérapant R11 pour extérieur et zones humides. Revêtement sécurisé, résistant et esthétique pour terrasses, piscines et espaces publics."}, {"id": 30, "name": "Grandes dalles", "slug": "grandes-dalles", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Formats larges et modernes", "createdAt": "2026-04-08T07:17:38.728Z", "sortOrder": 6, "updatedAt": "2026-04-08T07:20:14.290Z", "categoryId": 1, "description": "Les grandes dalles apportent une esthétique contemporaine grâce à leurs formats généreux et leurs joints réduits. Elles créent des surfaces élégantes, homogènes et faciles à entretenir.", "imageMediaId": null, "descriptionSeo": "Grandes dalles de carrelage pour sols et murs. Formats modernes avec peu de joints pour un rendu esthétique, minimaliste et facile à entretenir."}, {"id": 32, "name": "Carrelage effet béton", "slug": "carrelage-effet-beton", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Style urbain contemporain", "createdAt": "2026-04-08T07:17:38.732Z", "sortOrder": 7, "updatedAt": "2026-04-08T07:20:14.291Z", "categoryId": 1, "description": "Inspiré des ambiances industrielles, le carrelage effet béton offre un rendu moderne et épuré. Résistant et facile d’entretien, il est idéal pour créer des espaces élégants et minimalistes.", "imageMediaId": null, "descriptionSeo": "Carrelage effet béton pour intérieur et extérieur. Style industriel moderne, résistant et facile à entretenir."}, {"id": 33, "name": "Grès effet pierre naturelle", "slug": "gres-effet-pierre-naturelle", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Aspect naturel et authentique", "createdAt": "2026-04-08T07:17:38.733Z", "sortOrder": 8, "updatedAt": "2026-04-08T07:20:14.294Z", "categoryId": 1, "description": "Le grès effet pierre naturelle reproduit fidèlement l’aspect des pierres tout en offrant les avantages techniques du carrelage. Il apporte charme et authenticité à vos espaces intérieurs et extérieurs.", "imageMediaId": null, "descriptionSeo": "Grès effet pierre naturelle : carrelage au rendu authentique, résistant et durable pour sols et murs."}, {"id": 29, "name": "Grès effet parquet", "slug": "gres-effet-parquet", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Chaleur du bois, résistance du grès", "createdAt": "2026-04-08T07:17:38.727Z", "sortOrder": 9, "updatedAt": "2026-04-08T07:20:14.292Z", "categoryId": 1, "description": "Alliez l’esthétique chaleureuse du bois à la résistance du carrelage avec le grès effet parquet. Idéal pour toutes les pièces, il offre un rendu naturel sans les contraintes d’entretien du bois.", "imageMediaId": null, "descriptionSeo": "Grès effet parquet : carrelage imitation bois pour sols. Résistant, esthétique et facile à entretenir."}, {"id": 28, "name": "Produits de pose & finition", "slug": "produits-de-pose-finition", "_count": {"productLinks": 0}, "isActive": true, "subtitle": "Solutions techniques essentielles", "createdAt": "2026-04-08T07:17:38.718Z", "sortOrder": 10, "updatedAt": "2026-04-08T07:20:14.295Z", "categoryId": 1, "description": "Optimisez la pose et la durabilité de vos revêtements grâce à notre gamme de produits de pose et de finition. Colles, joints et accessoires assurent un résultat professionnel et durable.", "imageMediaId": null, "descriptionSeo": "Produits de pose et finition pour carrelage : colles, joints et solutions techniques pour une installation durable et professionnelle."}], "descriptionSeo": "Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement."}	2026-04-08 07:20:14.305
105	cmnnfemzf00008wg9iwn6hacx	CREATE	Media	73	isoline.pdf	Import d'un média	\N	\N	\N	\N	\N	{"id": 73, "kind": "DOCUMENT", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": null, "folderId": 2, "heightPx": null, "isActive": true, "mimeType": "application/pdf", "createdAt": "2026-04-08T08:59:41.112Z", "extension": "pdf", "sizeBytes": 324966, "updatedAt": "2026-04-08T08:59:41.112Z", "sha256Hash": "74c4dc24b60bce4822115db15cb0fcd17ede81fc218006c71586d6d82760dd28", "visibility": "PRIVATE", "description": null, "storagePath": "media/document/2026/04/b9ec2454-0956-4af2-bd66-903684673033-isoline.pdf", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "isoline.pdf", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 08:59:41.143
106	cmnnfemzf00008wg9iwn6hacx	DELETE	Media	69	admix-S2-min.png	Suppression forcee d'un media (1 reference(s) retirees)	\N	\N	\N	\N	{"id": 69, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1000, "folderId": 3, "heightPx": 1000, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:18:05.096Z", "extension": "png", "sizeBytes": 143559, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "853fe755daea5e907b4282bcdd4f19a50947f901b39a0693937665b539392596", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/4b3ae624-a1a9-44b2-8513-d4b7ab1e7187-admix-s2-min.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "admix-S2-min.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 69, "kind": "IMAGE", "title": null, "altText": null, "widthPx": 1000, "folderId": 3, "heightPx": 1000, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:18:05.096Z", "extension": "png", "sizeBytes": 143559, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "853fe755daea5e907b4282bcdd4f19a50947f901b39a0693937665b539392596", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/4b3ae624-a1a9-44b2-8513-d4b7ab1e7187-admix-s2-min.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "admix-S2-min.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:14:47.021
107	cmnnfemzf00008wg9iwn6hacx	DELETE	Media	68	Admix-Cen-min.png	Suppression forcee d'un media (1 reference(s) retirees)	\N	\N	\N	\N	{"id": 68, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 1000, "folderId": 3, "heightPx": 1000, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:18:04.944Z", "extension": "png", "sizeBytes": 90173, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "4b8409f336940b46d50133b8a5622053bea1e1fb1e91378c584fe51c83a990ef", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/78d91b19-1592-4959-abbe-655820800c11-admix-cen-min.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Admix-Cen-min.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 68, "kind": "IMAGE", "title": null, "altText": null, "widthPx": 1000, "folderId": 3, "heightPx": 1000, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:18:04.944Z", "extension": "png", "sizeBytes": 90173, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "4b8409f336940b46d50133b8a5622053bea1e1fb1e91378c584fe51c83a990ef", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/78d91b19-1592-4959-abbe-655820800c11-admix-cen-min.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Admix-Cen-min.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:14:47.053
108	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	73	isoline.pdf	Déplacement d'un média	\N	\N	\N	\N	{"id": 73, "kind": "DOCUMENT", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": null, "folderId": 2, "heightPx": null, "isActive": true, "mimeType": "application/pdf", "createdAt": "2026-04-08T08:59:41.112Z", "extension": "pdf", "sizeBytes": 324966, "updatedAt": "2026-04-08T08:59:41.112Z", "sha256Hash": "74c4dc24b60bce4822115db15cb0fcd17ede81fc218006c71586d6d82760dd28", "visibility": "PRIVATE", "description": null, "storagePath": "media/document/2026/04/b9ec2454-0956-4af2-bd66-903684673033-isoline.pdf", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "isoline.pdf", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 73, "kind": "DOCUMENT", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": null, "folderId": null, "heightPx": null, "isActive": true, "mimeType": "application/pdf", "createdAt": "2026-04-08T08:59:41.112Z", "extension": "pdf", "sizeBytes": 324966, "updatedAt": "2026-04-08T09:15:08.505Z", "sha256Hash": "74c4dc24b60bce4822115db15cb0fcd17ede81fc218006c71586d6d82760dd28", "visibility": "PRIVATE", "description": null, "storagePath": "media/document/2026/04/b9ec2454-0956-4af2-bd66-903684673033-isoline.pdf", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "isoline.pdf", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:15:08.513
109	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	73	isoline.pdf	Déplacement d'un média	\N	\N	\N	\N	{"id": 73, "kind": "DOCUMENT", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": null, "folderId": null, "heightPx": null, "isActive": true, "mimeType": "application/pdf", "createdAt": "2026-04-08T08:59:41.112Z", "extension": "pdf", "sizeBytes": 324966, "updatedAt": "2026-04-08T09:15:08.505Z", "sha256Hash": "74c4dc24b60bce4822115db15cb0fcd17ede81fc218006c71586d6d82760dd28", "visibility": "PRIVATE", "description": null, "storagePath": "media/document/2026/04/b9ec2454-0956-4af2-bd66-903684673033-isoline.pdf", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "isoline.pdf", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 73, "kind": "DOCUMENT", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": null, "folderId": 4, "heightPx": null, "isActive": true, "mimeType": "application/pdf", "createdAt": "2026-04-08T08:59:41.112Z", "extension": "pdf", "sizeBytes": 324966, "updatedAt": "2026-04-08T09:15:14.816Z", "sha256Hash": "74c4dc24b60bce4822115db15cb0fcd17ede81fc218006c71586d6d82760dd28", "visibility": "PRIVATE", "description": null, "storagePath": "media/document/2026/04/b9ec2454-0956-4af2-bd66-903684673033-isoline.pdf", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "isoline.pdf", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:15:14.825
110	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	72	SIKALATEX BIDON 20L.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 72, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 3, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.668Z", "extension": "png", "sizeBytes": 140848, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "68aa3dd6826e7a862555da239169eabc12bc2980310fd7f4ad6fc48066aa6225", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/d91d3468-877c-46a3-b3ab-c23daec66182-sikalatex-bidon-20l.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 20L.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 72, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": null, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.668Z", "extension": "png", "sizeBytes": 140848, "updatedAt": "2026-04-08T09:16:10.032Z", "sha256Hash": "68aa3dd6826e7a862555da239169eabc12bc2980310fd7f4ad6fc48066aa6225", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/d91d3468-877c-46a3-b3ab-c23daec66182-sikalatex-bidon-20l.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 20L.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.041
122	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	58	Ciment portland au calcaire CP II - A-L 32,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 58, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.674Z", "extension": "png", "sizeBytes": 292643, "updatedAt": "2026-04-07T08:13:51.674Z", "sha256Hash": "0ce902e3f87dfd5bd44ed2176132526386501f9ee2ae0d1b31000068d1f1950c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c5ffc022-5d94-4db1-9028-6c7a43684a57-ciment-portland-au-calcaire-cp-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment portland au calcaire CP II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 58, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.674Z", "extension": "png", "sizeBytes": 292643, "updatedAt": "2026-04-08T09:16:10.196Z", "sha256Hash": "0ce902e3f87dfd5bd44ed2176132526386501f9ee2ae0d1b31000068d1f1950c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c5ffc022-5d94-4db1-9028-6c7a43684a57-ciment-portland-au-calcaire-cp-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment portland au calcaire CP II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.2
111	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	71	SIKALATEX BIDON 5LITRES.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 71, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 3, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.613Z", "extension": "png", "sizeBytes": 140025, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "a5ea25de0cfc92bc9bfd06f957b67c50b67235e2b992536f988bc4853194dc52", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/cdf47d0c-6d96-4d42-8c2e-257763195fbf-sikalatex-bidon-5litres.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 5LITRES.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 71, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": null, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.613Z", "extension": "png", "sizeBytes": 140025, "updatedAt": "2026-04-08T09:16:10.054Z", "sha256Hash": "a5ea25de0cfc92bc9bfd06f957b67c50b67235e2b992536f988bc4853194dc52", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/cdf47d0c-6d96-4d42-8c2e-257763195fbf-sikalatex-bidon-5litres.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 5LITRES.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.057
112	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	70	SIKALATEX BIDON 1LITRE.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 70, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 3, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.505Z", "extension": "png", "sizeBytes": 181848, "updatedAt": "2026-04-08T07:22:32.430Z", "sha256Hash": "b2a11fbbfcb2886916c97e811148bc61438fd8ae63a8c9b4415a7319d9e910a8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/5a919aaf-0a2f-4217-bca5-47a2fe621eb3-sikalatex-bidon-1litre.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 1LITRE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 70, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": null, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.505Z", "extension": "png", "sizeBytes": 181848, "updatedAt": "2026-04-08T09:16:10.068Z", "sha256Hash": "b2a11fbbfcb2886916c97e811148bc61438fd8ae63a8c9b4415a7319d9e910a8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/5a919aaf-0a2f-4217-bca5-47a2fe621eb3-sikalatex-bidon-1litre.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 1LITRE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.07
113	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	67	Treillis soudés 150-150-5.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 67, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.337Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-07T08:13:52.337Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cf1b60c2-ec57-48bc-b359-5ea06c8c6431-treillis-soudes-150-150-5.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-5.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 67, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.337Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:10.080Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cf1b60c2-ec57-48bc-b359-5ea06c8c6431-treillis-soudes-150-150-5.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-5.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.083
114	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	66	Treillis soudés 150-150-4.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 66, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.236Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-07T08:13:52.236Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b53aab5e-0f15-45b9-a039-599d4b5f1612-treillis-soudes-150-150-4.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-4.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 66, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.236Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:10.095Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b53aab5e-0f15-45b9-a039-599d4b5f1612-treillis-soudes-150-150-4.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-4.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.098
121	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	59	CIMENT PORTLAND CEM I 42,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 59, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.737Z", "extension": "png", "sizeBytes": 290564, "updatedAt": "2026-04-07T08:13:51.737Z", "sha256Hash": "8ad46ff77ec461ee98759334c75f6e8f27d91df668c2b59cf9456948e7945f81", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/02d594ac-d811-4f3f-a04e-f44107631579-ciment-portland-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CIMENT PORTLAND CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 59, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.737Z", "extension": "png", "sizeBytes": 290564, "updatedAt": "2026-04-08T09:16:10.184Z", "sha256Hash": "8ad46ff77ec461ee98759334c75f6e8f27d91df668c2b59cf9456948e7945f81", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/02d594ac-d811-4f3f-a04e-f44107631579-ciment-portland-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CIMENT PORTLAND CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.186
115	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	65	Treillis soudés 150-150-3.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 65, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.131Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-07T08:13:52.131Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4c4eb01b-c7a8-420f-b077-44e0a0f3eda5-treillis-soudes-150-150-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 65, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.131Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:10.109Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4c4eb01b-c7a8-420f-b077-44e0a0f3eda5-treillis-soudes-150-150-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.111
116	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	64	FIL RECUIT.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 64, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.037Z", "extension": "png", "sizeBytes": 194522, "updatedAt": "2026-04-07T08:13:52.037Z", "sha256Hash": "08c81f196211105e1e0f77798539214b5bf53a0b02ff53d8db06ec970aad2b0c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5108fdfa-6aed-4069-aa56-21d4d9ee364c-fil-recuit.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "FIL RECUIT.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 64, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.037Z", "extension": "png", "sizeBytes": 194522, "updatedAt": "2026-04-08T09:16:10.121Z", "sha256Hash": "08c81f196211105e1e0f77798539214b5bf53a0b02ff53d8db06ec970aad2b0c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5108fdfa-6aed-4069-aa56-21d4d9ee364c-fil-recuit.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "FIL RECUIT.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.124
117	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	63	CADRE 15 - ARMATURE FAÇONNÉE.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 63, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 9, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.973Z", "extension": "png", "sizeBytes": 201444, "updatedAt": "2026-04-07T13:37:57.701Z", "sha256Hash": "8a5ca670a7cad8320d3dcd73ae95a3c76f203e91cab200d37a0ec74bad4361dd", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/c7a174d5-f954-4731-adb1-a99afad02c4c-cadre-15-armature-faconnee.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CADRE 15 - ARMATURE FAÇONNÉE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 63, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 9, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.973Z", "extension": "png", "sizeBytes": 201444, "updatedAt": "2026-04-08T09:16:10.134Z", "sha256Hash": "8a5ca670a7cad8320d3dcd73ae95a3c76f203e91cab200d37a0ec74bad4361dd", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/c7a174d5-f954-4731-adb1-a99afad02c4c-cadre-15-armature-faconnee.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CADRE 15 - ARMATURE FAÇONNÉE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.137
118	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	62	COFFRE EN TUNNEL POLY FINI 30CM.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 62, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.913Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-07T08:13:51.913Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/1543ccb9-6fcf-40eb-8eaf-2419cdfedf9f-coffre-en-tunnel-poly-fini-30cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 30CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 62, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.913Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-08T09:16:10.150Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/1543ccb9-6fcf-40eb-8eaf-2419cdfedf9f-coffre-en-tunnel-poly-fini-30cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 30CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.153
119	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	61	COFFRE EN TUNNEL POLY FINI 25CM.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 61, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.854Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-07T08:13:51.854Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3caa3d10-02aa-47a8-98b1-9e6275728766-coffre-en-tunnel-poly-fini-25cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 25CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 61, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.854Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-08T09:16:10.162Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3caa3d10-02aa-47a8-98b1-9e6275728766-coffre-en-tunnel-poly-fini-25cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 25CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.164
120	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	60	Pavé autobloquant Neapolis Gris.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 60, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.793Z", "extension": "png", "sizeBytes": 61006, "updatedAt": "2026-04-07T08:13:51.793Z", "sha256Hash": "e19857abc6b332e83d29a716ddeaae5395f4db8141ea31e11f1d0c1c1fae2a10", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/f4d6f38c-03e3-44fa-afa1-641353e7c0d5-pave-autobloquant-neapolis-gris.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Pavé autobloquant Neapolis Gris.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 60, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.793Z", "extension": "png", "sizeBytes": 61006, "updatedAt": "2026-04-08T09:16:10.172Z", "sha256Hash": "e19857abc6b332e83d29a716ddeaae5395f4db8141ea31e11f1d0c1c1fae2a10", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/f4d6f38c-03e3-44fa-afa1-641353e7c0d5-pave-autobloquant-neapolis-gris.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Pavé autobloquant Neapolis Gris.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.174
123	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	57	Ciment I 42,5 HRS 1.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 57, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.611Z", "extension": "png", "sizeBytes": 285185, "updatedAt": "2026-04-07T08:13:51.611Z", "sha256Hash": "9d269c9426bcc0f9675944d54faa02936453d19b7d93bd26f311341d8e4d7e31", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/9150e5b3-0d02-405d-aa00-e6bddf936216-ciment-i-42-5-hrs-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment I 42,5 HRS 1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 57, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.611Z", "extension": "png", "sizeBytes": 285185, "updatedAt": "2026-04-08T09:16:10.208Z", "sha256Hash": "9d269c9426bcc0f9675944d54faa02936453d19b7d93bd26f311341d8e4d7e31", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/9150e5b3-0d02-405d-aa00-e6bddf936216-ciment-i-42-5-hrs-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment I 42,5 HRS 1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.21
124	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	56	Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 56, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.549Z", "extension": "png", "sizeBytes": 145211, "updatedAt": "2026-04-07T08:13:51.549Z", "sha256Hash": "e2c96f83a4402048f8e666f0c43b6bf80c837b45c0cc37d897cb4fda54086430", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4aabb8aa-298e-420a-9c91-e135484cba08-ciment-blanc-sotacib-cem-ll-a-l-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 56, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.549Z", "extension": "png", "sizeBytes": 145211, "updatedAt": "2026-04-08T09:16:10.219Z", "sha256Hash": "e2c96f83a4402048f8e666f0c43b6bf80c837b45c0cc37d897cb4fda54086430", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4aabb8aa-298e-420a-9c91-e135484cba08-ciment-blanc-sotacib-cem-ll-a-l-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.228
125	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	55	Ciment blanc SOTACIB CEM I 52,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 55, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.485Z", "extension": "png", "sizeBytes": 364341, "updatedAt": "2026-04-07T08:13:51.485Z", "sha256Hash": "e3e46f97ee2596f70464617b4616b91d7f30c50ea43ebd5e05348251dc4850b9", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3a029d5d-e6f4-4796-add7-246491ea832f-ciment-blanc-sotacib-cem-i-52-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM I 52,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 55, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.485Z", "extension": "png", "sizeBytes": 364341, "updatedAt": "2026-04-08T09:16:10.238Z", "sha256Hash": "e3e46f97ee2596f70464617b4616b91d7f30c50ea43ebd5e05348251dc4850b9", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3a029d5d-e6f4-4796-add7-246491ea832f-ciment-blanc-sotacib-cem-i-52-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM I 52,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.24
126	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	54	CANIVEAU DE CHAUSSÉ CS2.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 54, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.417Z", "extension": "png", "sizeBytes": 128006, "updatedAt": "2026-04-07T08:13:51.417Z", "sha256Hash": "eee090e199d63ac6547d579d6afb4bede1c2a90531099a0c3676eb5c51b93089", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d5bc1fd3-b45a-4d13-b408-339dcc6ef947-caniveau-de-chausse-cs2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CANIVEAU DE CHAUSSÉ CS2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 54, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.417Z", "extension": "png", "sizeBytes": 128006, "updatedAt": "2026-04-08T09:16:10.248Z", "sha256Hash": "eee090e199d63ac6547d579d6afb4bede1c2a90531099a0c3676eb5c51b93089", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d5bc1fd3-b45a-4d13-b408-339dcc6ef947-caniveau-de-chausse-cs2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CANIVEAU DE CHAUSSÉ CS2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.251
127	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	53	BORDURE MINCE P2.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 53, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.357Z", "extension": "png", "sizeBytes": 165382, "updatedAt": "2026-04-07T08:13:51.357Z", "sha256Hash": "1682ce734b558c1d37ecc2b76f7077a9b3cafc0e05647931f16dcaf8c8b99ac0", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/182f74e7-b5c5-4e2c-bdeb-18a5a6e00785-bordure-mince-p2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE MINCE P2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 53, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.357Z", "extension": "png", "sizeBytes": 165382, "updatedAt": "2026-04-08T09:16:10.259Z", "sha256Hash": "1682ce734b558c1d37ecc2b76f7077a9b3cafc0e05647931f16dcaf8c8b99ac0", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/182f74e7-b5c5-4e2c-bdeb-18a5a6e00785-bordure-mince-p2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE MINCE P2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.262
128	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	52	BORDURE DE TROTTOIR T3-1.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 52, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.295Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-07T08:13:51.295Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b4aa4685-a439-4bda-a5cd-5dbfdf596e64-bordure-de-trottoir-t3-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3-1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 52, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.295Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-08T09:16:10.270Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b4aa4685-a439-4bda-a5cd-5dbfdf596e64-bordure-de-trottoir-t3-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3-1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.273
129	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	51	BORDURE DE TROTTOIR T3.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 51, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.231Z", "extension": "png", "sizeBytes": 122579, "updatedAt": "2026-04-07T08:13:51.231Z", "sha256Hash": "6c593f5d50f782246ffe6df38cb2970a56201c64240ddb670f2bb6d27202e89e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7eaf76c1-0bab-4312-9eb4-5c48b31423c4-bordure-de-trottoir-t3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 51, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.231Z", "extension": "png", "sizeBytes": 122579, "updatedAt": "2026-04-08T09:16:10.281Z", "sha256Hash": "6c593f5d50f782246ffe6df38cb2970a56201c64240ddb670f2bb6d27202e89e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7eaf76c1-0bab-4312-9eb4-5c48b31423c4-bordure-de-trottoir-t3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.283
130	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	50	BORDURE DE TROTTOIR T2.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 50, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.173Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-07T08:13:51.173Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2a95a6e0-f31f-4db0-b934-bf461a459be9-bordure-de-trottoir-t2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 50, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.173Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-08T09:16:10.291Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2a95a6e0-f31f-4db0-b934-bf461a459be9-bordure-de-trottoir-t2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.312
131	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	49	Famille Ciment de Gabès.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 49, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.118Z", "extension": "png", "sizeBytes": 510427, "updatedAt": "2026-04-07T08:13:51.118Z", "sha256Hash": "d4383e6ac67ed50f4ecc202aeb56c64edde05e7782704c186f6335802fabb51b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b9dfe6ec-320c-4c0d-b04d-d19a824791ff-famille-ciment-de-gabes.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Ciment de Gabès.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 49, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.118Z", "extension": "png", "sizeBytes": 510427, "updatedAt": "2026-04-08T09:16:10.320Z", "sha256Hash": "d4383e6ac67ed50f4ecc202aeb56c64edde05e7782704c186f6335802fabb51b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b9dfe6ec-320c-4c0d-b04d-d19a824791ff-famille-ciment-de-gabes.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Ciment de Gabès.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.324
132	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	48	CEMII - B-L 32,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 48, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.045Z", "extension": "png", "sizeBytes": 346085, "updatedAt": "2026-04-07T08:13:51.045Z", "sha256Hash": "307647467198f97aa499f029074b6d54f09a6fb82a9281bffe2f182988ab5a00", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/65b3bde6-60ea-4aef-a81e-2fc1517875f1-cemii-b-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEMII - B-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 48, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.045Z", "extension": "png", "sizeBytes": 346085, "updatedAt": "2026-04-08T09:16:10.332Z", "sha256Hash": "307647467198f97aa499f029074b6d54f09a6fb82a9281bffe2f182988ab5a00", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/65b3bde6-60ea-4aef-a81e-2fc1517875f1-cemii-b-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEMII - B-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.335
133	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	47	CEM II - A-L 42,5 R.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 47, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.973Z", "extension": "png", "sizeBytes": 371081, "updatedAt": "2026-04-07T08:13:50.973Z", "sha256Hash": "8103eb1c23d2e4a1a3ee95018d0a8da2ff9b218f1dc77404b0d4b121dd2eae46", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/30ed7570-3332-4caa-b278-0b79622dd0fa-cem-ii-a-l-42-5-r.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 42,5 R.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 47, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.973Z", "extension": "png", "sizeBytes": 371081, "updatedAt": "2026-04-08T09:16:10.342Z", "sha256Hash": "8103eb1c23d2e4a1a3ee95018d0a8da2ff9b218f1dc77404b0d4b121dd2eae46", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/30ed7570-3332-4caa-b278-0b79622dd0fa-cem-ii-a-l-42-5-r.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 42,5 R.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.345
134	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	46	CEM II - A-L 32,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 46, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.906Z", "extension": "png", "sizeBytes": 357048, "updatedAt": "2026-04-07T08:13:50.906Z", "sha256Hash": "f18c2da99649de6fc916928911e8788c1317bea3d9b62fef98218ab27ade13fc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/457ba9e4-894f-47e5-8456-5a5306d1a5e2-cem-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 46, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.906Z", "extension": "png", "sizeBytes": 357048, "updatedAt": "2026-04-08T09:16:10.353Z", "sha256Hash": "f18c2da99649de6fc916928911e8788c1317bea3d9b62fef98218ab27ade13fc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/457ba9e4-894f-47e5-8456-5a5306d1a5e2-cem-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.355
135	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	45	CEM I 42,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 45, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.836Z", "extension": "png", "sizeBytes": 363709, "updatedAt": "2026-04-07T08:13:50.836Z", "sha256Hash": "0f455a7797ec9ecc2bcd1788286e722dd6903a4b39c40c2103e019f4b2836707", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5f26bd65-277b-4745-98f9-f1a96f291c8e-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 45, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.836Z", "extension": "png", "sizeBytes": 363709, "updatedAt": "2026-04-08T09:16:10.363Z", "sha256Hash": "0f455a7797ec9ecc2bcd1788286e722dd6903a4b39c40c2103e019f4b2836707", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5f26bd65-277b-4745-98f9-f1a96f291c8e-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.366
136	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	44	CEM I 42,5 N SR-3.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 44, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.769Z", "extension": "png", "sizeBytes": 335728, "updatedAt": "2026-04-07T08:13:50.769Z", "sha256Hash": "5f757b25f4ce03b163e23d8d4de1ec1c2cd256405557418e343bee443c3b275f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cb47af98-5b4a-4ba3-8e20-c953a58e22c5-cem-i-42-5-n-sr-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N SR-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 44, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.769Z", "extension": "png", "sizeBytes": 335728, "updatedAt": "2026-04-08T09:16:10.374Z", "sha256Hash": "5f757b25f4ce03b163e23d8d4de1ec1c2cd256405557418e343bee443c3b275f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cb47af98-5b4a-4ba3-8e20-c953a58e22c5-cem-i-42-5-n-sr-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N SR-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.376
137	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	43	Famille Brique Série A.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 43, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.703Z", "extension": "png", "sizeBytes": 339440, "updatedAt": "2026-04-07T08:13:50.703Z", "sha256Hash": "1b9125bc619c0e06427ede4fd00c42fa3489e03ab52f82d568634088e98d864e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/682c9174-f86f-4919-b54c-840aa399313e-famille-brique-serie-a.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Série A.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 43, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.703Z", "extension": "png", "sizeBytes": 339440, "updatedAt": "2026-04-08T09:16:10.384Z", "sha256Hash": "1b9125bc619c0e06427ede4fd00c42fa3489e03ab52f82d568634088e98d864e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/682c9174-f86f-4919-b54c-840aa399313e-famille-brique-serie-a.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Série A.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.387
138	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	42	Famille Brique Hourdis.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 42, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.647Z", "extension": "png", "sizeBytes": 181107, "updatedAt": "2026-04-07T08:13:50.647Z", "sha256Hash": "8f4596637e0a138c5844f9347248a36da7140eff277e2696c766dd006e28d348", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/40c1a845-5cf2-49e0-814a-e32e9f92d99d-famille-brique-hourdis.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Hourdis.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 42, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.647Z", "extension": "png", "sizeBytes": 181107, "updatedAt": "2026-04-08T09:16:10.395Z", "sha256Hash": "8f4596637e0a138c5844f9347248a36da7140eff277e2696c766dd006e28d348", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/40c1a845-5cf2-49e0-814a-e32e9f92d99d-famille-brique-hourdis.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Hourdis.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.397
139	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	41	BRIQUE PLATRIÈRE 8.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 41, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.587Z", "extension": "png", "sizeBytes": 106473, "updatedAt": "2026-04-07T14:54:14.356Z", "sha256Hash": "7fdf8bca9975598b89b03e6f5d41574f1452e3e18ede0f515386e0891e78c1f2", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/41ee203a-189f-410a-adba-706dc70fe10e-brique-platriere-8.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE PLATRIÈRE 8.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 41, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.587Z", "extension": "png", "sizeBytes": 106473, "updatedAt": "2026-04-08T09:16:10.405Z", "sha256Hash": "7fdf8bca9975598b89b03e6f5d41574f1452e3e18ede0f515386e0891e78c1f2", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/41ee203a-189f-410a-adba-706dc70fe10e-brique-platriere-8.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE PLATRIÈRE 8.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.408
140	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	40	BRIQUE HOURD 19.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 40, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.534Z", "extension": "png", "sizeBytes": 120133, "updatedAt": "2026-04-07T08:13:50.534Z", "sha256Hash": "6ce5c294579054398796d1622fc37262cc2c536a6958574a6e517cbdc26f3853", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/058a82ce-58e4-4d23-8d42-5f5ca768efa9-brique-hourd-19.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 19.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 40, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.534Z", "extension": "png", "sizeBytes": 120133, "updatedAt": "2026-04-08T09:16:10.415Z", "sha256Hash": "6ce5c294579054398796d1622fc37262cc2c536a6958574a6e517cbdc26f3853", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/058a82ce-58e4-4d23-8d42-5f5ca768efa9-brique-hourd-19.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 19.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.418
141	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	39	BRIQUE HOURD 16.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 39, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.468Z", "extension": "png", "sizeBytes": 141053, "updatedAt": "2026-04-07T14:54:14.356Z", "sha256Hash": "799a7c45508011ee62de065dbbe54705e681fd04035f4e6ad799eab7d57a1cd6", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/8e5d2f0a-b34d-4e11-bdb1-c175d489b320-brique-hourd-16.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 16.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 39, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.468Z", "extension": "png", "sizeBytes": 141053, "updatedAt": "2026-04-08T09:16:10.426Z", "sha256Hash": "799a7c45508011ee62de065dbbe54705e681fd04035f4e6ad799eab7d57a1cd6", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/8e5d2f0a-b34d-4e11-bdb1-c175d489b320-brique-hourd-16.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 16.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.429
142	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	38	Brique Double cloison.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 38, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.407Z", "extension": "png", "sizeBytes": 192571, "updatedAt": "2026-04-07T08:13:50.407Z", "sha256Hash": "ecd03e436e5c0aec2999b9ee91f4b0ddd03c27f0e216cfa498a3b245a5caee78", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/e89b2cb8-80df-46d6-ac61-b04f46ae7ab7-brique-double-cloison.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Brique Double cloison.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 38, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.407Z", "extension": "png", "sizeBytes": 192571, "updatedAt": "2026-04-08T09:16:10.437Z", "sha256Hash": "ecd03e436e5c0aec2999b9ee91f4b0ddd03c27f0e216cfa498a3b245a5caee78", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/e89b2cb8-80df-46d6-ac61-b04f46ae7ab7-brique-double-cloison.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Brique Double cloison.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.439
143	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	37	BRIQUE A12.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 37, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.340Z", "extension": "png", "sizeBytes": 141284, "updatedAt": "2026-04-07T14:54:14.356Z", "sha256Hash": "25053a4702a7a85077c2041f80d993353e86501056e6027d6df81624f8ab649b", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/a2e1f1cd-6911-4b93-a010-5d58052977c0-brique-a12.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A12.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 37, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.340Z", "extension": "png", "sizeBytes": 141284, "updatedAt": "2026-04-08T09:16:10.447Z", "sha256Hash": "25053a4702a7a85077c2041f80d993353e86501056e6027d6df81624f8ab649b", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/a2e1f1cd-6911-4b93-a010-5d58052977c0-brique-a12.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A12.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.449
144	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	36	BRIQUE A08.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 36, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.266Z", "extension": "png", "sizeBytes": 115427, "updatedAt": "2026-04-07T14:54:14.356Z", "sha256Hash": "1e6ff50ac29a88c3de5e85cb18391ff009a4f7ff8030ddc118c78eae0b39cf31", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/11517d5a-f373-4ceb-810c-0a93391da767-brique-a08.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A08.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 36, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.266Z", "extension": "png", "sizeBytes": 115427, "updatedAt": "2026-04-08T09:16:10.456Z", "sha256Hash": "1e6ff50ac29a88c3de5e85cb18391ff009a4f7ff8030ddc118c78eae0b39cf31", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/11517d5a-f373-4ceb-810c-0a93391da767-brique-a08.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A08.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.459
145	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	35	BRIQUE A06.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 35, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 3, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.033Z", "extension": "png", "sizeBytes": 85950, "updatedAt": "2026-04-07T14:54:14.356Z", "sha256Hash": "6e1051f164399697bf144adfbc617e3c436b65c354fa8feab1d180e8dc44e3c8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/b08f7a69-6cb7-4f45-a869-0ed2fc01f3f1-brique-a06.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A06.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 35, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.033Z", "extension": "png", "sizeBytes": 85950, "updatedAt": "2026-04-08T09:16:10.467Z", "sha256Hash": "6e1051f164399697bf144adfbc617e3c436b65c354fa8feab1d180e8dc44e3c8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/b08f7a69-6cb7-4f45-a869-0ed2fc01f3f1-brique-a06.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A06.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:10.469
146	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	72	SIKALATEX BIDON 20L.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 72, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": null, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.668Z", "extension": "png", "sizeBytes": 140848, "updatedAt": "2026-04-08T09:16:10.032Z", "sha256Hash": "68aa3dd6826e7a862555da239169eabc12bc2980310fd7f4ad6fc48066aa6225", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/d91d3468-877c-46a3-b3ab-c23daec66182-sikalatex-bidon-20l.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 20L.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 72, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 5, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.668Z", "extension": "png", "sizeBytes": 140848, "updatedAt": "2026-04-08T09:16:22.737Z", "sha256Hash": "68aa3dd6826e7a862555da239169eabc12bc2980310fd7f4ad6fc48066aa6225", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/d91d3468-877c-46a3-b3ab-c23daec66182-sikalatex-bidon-20l.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 20L.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.746
147	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	71	SIKALATEX BIDON 5LITRES.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 71, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": null, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.613Z", "extension": "png", "sizeBytes": 140025, "updatedAt": "2026-04-08T09:16:10.054Z", "sha256Hash": "a5ea25de0cfc92bc9bfd06f957b67c50b67235e2b992536f988bc4853194dc52", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/cdf47d0c-6d96-4d42-8c2e-257763195fbf-sikalatex-bidon-5litres.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 5LITRES.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 71, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 5, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.613Z", "extension": "png", "sizeBytes": 140025, "updatedAt": "2026-04-08T09:16:22.758Z", "sha256Hash": "a5ea25de0cfc92bc9bfd06f957b67c50b67235e2b992536f988bc4853194dc52", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/cdf47d0c-6d96-4d42-8c2e-257763195fbf-sikalatex-bidon-5litres.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 5LITRES.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.762
148	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	70	SIKALATEX BIDON 1LITRE.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 70, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": null, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.505Z", "extension": "png", "sizeBytes": 181848, "updatedAt": "2026-04-08T09:16:10.068Z", "sha256Hash": "b2a11fbbfcb2886916c97e811148bc61438fd8ae63a8c9b4415a7319d9e910a8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/5a919aaf-0a2f-4217-bca5-47a2fe621eb3-sikalatex-bidon-1litre.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 1LITRE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 70, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 533, "folderId": 5, "heightPx": 533, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T15:46:13.505Z", "extension": "png", "sizeBytes": 181848, "updatedAt": "2026-04-08T09:16:22.771Z", "sha256Hash": "b2a11fbbfcb2886916c97e811148bc61438fd8ae63a8c9b4415a7319d9e910a8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/5a919aaf-0a2f-4217-bca5-47a2fe621eb3-sikalatex-bidon-1litre.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "SIKALATEX BIDON 1LITRE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.774
149	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	67	Treillis soudés 150-150-5.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 67, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.337Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:10.080Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cf1b60c2-ec57-48bc-b359-5ea06c8c6431-treillis-soudes-150-150-5.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-5.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 67, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.337Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:22.781Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cf1b60c2-ec57-48bc-b359-5ea06c8c6431-treillis-soudes-150-150-5.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-5.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.784
150	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	66	Treillis soudés 150-150-4.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 66, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.236Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:10.095Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b53aab5e-0f15-45b9-a039-599d4b5f1612-treillis-soudes-150-150-4.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-4.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 66, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.236Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:22.793Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b53aab5e-0f15-45b9-a039-599d4b5f1612-treillis-soudes-150-150-4.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-4.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.795
151	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	65	Treillis soudés 150-150-3.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 65, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.131Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:10.109Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4c4eb01b-c7a8-420f-b077-44e0a0f3eda5-treillis-soudes-150-150-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 65, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.131Z", "extension": "png", "sizeBytes": 1162322, "updatedAt": "2026-04-08T09:16:22.803Z", "sha256Hash": "ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4c4eb01b-c7a8-420f-b077-44e0a0f3eda5-treillis-soudes-150-150-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Treillis soudés 150-150-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.806
152	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	64	FIL RECUIT.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 64, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.037Z", "extension": "png", "sizeBytes": 194522, "updatedAt": "2026-04-08T09:16:10.121Z", "sha256Hash": "08c81f196211105e1e0f77798539214b5bf53a0b02ff53d8db06ec970aad2b0c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5108fdfa-6aed-4069-aa56-21d4d9ee364c-fil-recuit.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "FIL RECUIT.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 64, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:52.037Z", "extension": "png", "sizeBytes": 194522, "updatedAt": "2026-04-08T09:16:22.814Z", "sha256Hash": "08c81f196211105e1e0f77798539214b5bf53a0b02ff53d8db06ec970aad2b0c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5108fdfa-6aed-4069-aa56-21d4d9ee364c-fil-recuit.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "FIL RECUIT.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.816
153	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	63	CADRE 15 - ARMATURE FAÇONNÉE.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 63, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 9, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.973Z", "extension": "png", "sizeBytes": 201444, "updatedAt": "2026-04-08T09:16:10.134Z", "sha256Hash": "8a5ca670a7cad8320d3dcd73ae95a3c76f203e91cab200d37a0ec74bad4361dd", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/c7a174d5-f954-4731-adb1-a99afad02c4c-cadre-15-armature-faconnee.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CADRE 15 - ARMATURE FAÇONNÉE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 63, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 9, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.973Z", "extension": "png", "sizeBytes": 201444, "updatedAt": "2026-04-08T09:16:22.824Z", "sha256Hash": "8a5ca670a7cad8320d3dcd73ae95a3c76f203e91cab200d37a0ec74bad4361dd", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/c7a174d5-f954-4731-adb1-a99afad02c4c-cadre-15-armature-faconnee.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CADRE 15 - ARMATURE FAÇONNÉE.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.827
154	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	62	COFFRE EN TUNNEL POLY FINI 30CM.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 62, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.913Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-08T09:16:10.150Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/1543ccb9-6fcf-40eb-8eaf-2419cdfedf9f-coffre-en-tunnel-poly-fini-30cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 30CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 62, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.913Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-08T09:16:22.836Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/1543ccb9-6fcf-40eb-8eaf-2419cdfedf9f-coffre-en-tunnel-poly-fini-30cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 30CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.838
155	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	61	COFFRE EN TUNNEL POLY FINI 25CM.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 61, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.854Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-08T09:16:10.162Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3caa3d10-02aa-47a8-98b1-9e6275728766-coffre-en-tunnel-poly-fini-25cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 25CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 61, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.854Z", "extension": "png", "sizeBytes": 227470, "updatedAt": "2026-04-08T09:16:22.846Z", "sha256Hash": "c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3caa3d10-02aa-47a8-98b1-9e6275728766-coffre-en-tunnel-poly-fini-25cm.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "COFFRE EN TUNNEL POLY FINI 25CM.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.848
156	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	60	Pavé autobloquant Neapolis Gris.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 60, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.793Z", "extension": "png", "sizeBytes": 61006, "updatedAt": "2026-04-08T09:16:10.172Z", "sha256Hash": "e19857abc6b332e83d29a716ddeaae5395f4db8141ea31e11f1d0c1c1fae2a10", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/f4d6f38c-03e3-44fa-afa1-641353e7c0d5-pave-autobloquant-neapolis-gris.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Pavé autobloquant Neapolis Gris.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 60, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.793Z", "extension": "png", "sizeBytes": 61006, "updatedAt": "2026-04-08T09:16:22.856Z", "sha256Hash": "e19857abc6b332e83d29a716ddeaae5395f4db8141ea31e11f1d0c1c1fae2a10", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/f4d6f38c-03e3-44fa-afa1-641353e7c0d5-pave-autobloquant-neapolis-gris.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Pavé autobloquant Neapolis Gris.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.858
157	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	59	CIMENT PORTLAND CEM I 42,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 59, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.737Z", "extension": "png", "sizeBytes": 290564, "updatedAt": "2026-04-08T09:16:10.184Z", "sha256Hash": "8ad46ff77ec461ee98759334c75f6e8f27d91df668c2b59cf9456948e7945f81", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/02d594ac-d811-4f3f-a04e-f44107631579-ciment-portland-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CIMENT PORTLAND CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 59, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.737Z", "extension": "png", "sizeBytes": 290564, "updatedAt": "2026-04-08T09:16:22.866Z", "sha256Hash": "8ad46ff77ec461ee98759334c75f6e8f27d91df668c2b59cf9456948e7945f81", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/02d594ac-d811-4f3f-a04e-f44107631579-ciment-portland-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CIMENT PORTLAND CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.869
158	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	58	Ciment portland au calcaire CP II - A-L 32,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 58, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.674Z", "extension": "png", "sizeBytes": 292643, "updatedAt": "2026-04-08T09:16:10.196Z", "sha256Hash": "0ce902e3f87dfd5bd44ed2176132526386501f9ee2ae0d1b31000068d1f1950c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c5ffc022-5d94-4db1-9028-6c7a43684a57-ciment-portland-au-calcaire-cp-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment portland au calcaire CP II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 58, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.674Z", "extension": "png", "sizeBytes": 292643, "updatedAt": "2026-04-08T09:16:22.877Z", "sha256Hash": "0ce902e3f87dfd5bd44ed2176132526386501f9ee2ae0d1b31000068d1f1950c", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/c5ffc022-5d94-4db1-9028-6c7a43684a57-ciment-portland-au-calcaire-cp-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment portland au calcaire CP II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.88
159	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	57	Ciment I 42,5 HRS 1.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 57, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.611Z", "extension": "png", "sizeBytes": 285185, "updatedAt": "2026-04-08T09:16:10.208Z", "sha256Hash": "9d269c9426bcc0f9675944d54faa02936453d19b7d93bd26f311341d8e4d7e31", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/9150e5b3-0d02-405d-aa00-e6bddf936216-ciment-i-42-5-hrs-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment I 42,5 HRS 1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 57, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.611Z", "extension": "png", "sizeBytes": 285185, "updatedAt": "2026-04-08T09:16:22.888Z", "sha256Hash": "9d269c9426bcc0f9675944d54faa02936453d19b7d93bd26f311341d8e4d7e31", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/9150e5b3-0d02-405d-aa00-e6bddf936216-ciment-i-42-5-hrs-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment I 42,5 HRS 1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.89
160	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	56	Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 56, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.549Z", "extension": "png", "sizeBytes": 145211, "updatedAt": "2026-04-08T09:16:10.219Z", "sha256Hash": "e2c96f83a4402048f8e666f0c43b6bf80c837b45c0cc37d897cb4fda54086430", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4aabb8aa-298e-420a-9c91-e135484cba08-ciment-blanc-sotacib-cem-ll-a-l-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 56, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.549Z", "extension": "png", "sizeBytes": 145211, "updatedAt": "2026-04-08T09:16:22.899Z", "sha256Hash": "e2c96f83a4402048f8e666f0c43b6bf80c837b45c0cc37d897cb4fda54086430", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/4aabb8aa-298e-420a-9c91-e135484cba08-ciment-blanc-sotacib-cem-ll-a-l-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.902
161	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	55	Ciment blanc SOTACIB CEM I 52,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 55, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.485Z", "extension": "png", "sizeBytes": 364341, "updatedAt": "2026-04-08T09:16:10.238Z", "sha256Hash": "e3e46f97ee2596f70464617b4616b91d7f30c50ea43ebd5e05348251dc4850b9", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3a029d5d-e6f4-4796-add7-246491ea832f-ciment-blanc-sotacib-cem-i-52-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM I 52,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 55, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.485Z", "extension": "png", "sizeBytes": 364341, "updatedAt": "2026-04-08T09:16:22.909Z", "sha256Hash": "e3e46f97ee2596f70464617b4616b91d7f30c50ea43ebd5e05348251dc4850b9", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/3a029d5d-e6f4-4796-add7-246491ea832f-ciment-blanc-sotacib-cem-i-52-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Ciment blanc SOTACIB CEM I 52,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.912
162	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	54	CANIVEAU DE CHAUSSÉ CS2.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 54, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.417Z", "extension": "png", "sizeBytes": 128006, "updatedAt": "2026-04-08T09:16:10.248Z", "sha256Hash": "eee090e199d63ac6547d579d6afb4bede1c2a90531099a0c3676eb5c51b93089", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d5bc1fd3-b45a-4d13-b408-339dcc6ef947-caniveau-de-chausse-cs2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CANIVEAU DE CHAUSSÉ CS2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 54, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.417Z", "extension": "png", "sizeBytes": 128006, "updatedAt": "2026-04-08T09:16:22.920Z", "sha256Hash": "eee090e199d63ac6547d579d6afb4bede1c2a90531099a0c3676eb5c51b93089", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/d5bc1fd3-b45a-4d13-b408-339dcc6ef947-caniveau-de-chausse-cs2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CANIVEAU DE CHAUSSÉ CS2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.922
163	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	53	BORDURE MINCE P2.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 53, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.357Z", "extension": "png", "sizeBytes": 165382, "updatedAt": "2026-04-08T09:16:10.259Z", "sha256Hash": "1682ce734b558c1d37ecc2b76f7077a9b3cafc0e05647931f16dcaf8c8b99ac0", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/182f74e7-b5c5-4e2c-bdeb-18a5a6e00785-bordure-mince-p2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE MINCE P2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 53, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.357Z", "extension": "png", "sizeBytes": 165382, "updatedAt": "2026-04-08T09:16:22.931Z", "sha256Hash": "1682ce734b558c1d37ecc2b76f7077a9b3cafc0e05647931f16dcaf8c8b99ac0", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/182f74e7-b5c5-4e2c-bdeb-18a5a6e00785-bordure-mince-p2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE MINCE P2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.933
164	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	52	BORDURE DE TROTTOIR T3-1.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 52, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.295Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-08T09:16:10.270Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b4aa4685-a439-4bda-a5cd-5dbfdf596e64-bordure-de-trottoir-t3-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3-1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 52, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.295Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-08T09:16:22.941Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b4aa4685-a439-4bda-a5cd-5dbfdf596e64-bordure-de-trottoir-t3-1.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3-1.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.944
165	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	51	BORDURE DE TROTTOIR T3.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 51, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.231Z", "extension": "png", "sizeBytes": 122579, "updatedAt": "2026-04-08T09:16:10.281Z", "sha256Hash": "6c593f5d50f782246ffe6df38cb2970a56201c64240ddb670f2bb6d27202e89e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7eaf76c1-0bab-4312-9eb4-5c48b31423c4-bordure-de-trottoir-t3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 51, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.231Z", "extension": "png", "sizeBytes": 122579, "updatedAt": "2026-04-08T09:16:22.952Z", "sha256Hash": "6c593f5d50f782246ffe6df38cb2970a56201c64240ddb670f2bb6d27202e89e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/7eaf76c1-0bab-4312-9eb4-5c48b31423c4-bordure-de-trottoir-t3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.956
166	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	50	BORDURE DE TROTTOIR T2.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 50, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.173Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-08T09:16:10.291Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2a95a6e0-f31f-4db0-b934-bf461a459be9-bordure-de-trottoir-t2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 50, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.173Z", "extension": "png", "sizeBytes": 138543, "updatedAt": "2026-04-08T09:16:22.964Z", "sha256Hash": "c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/2a95a6e0-f31f-4db0-b934-bf461a459be9-bordure-de-trottoir-t2.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BORDURE DE TROTTOIR T2.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.966
167	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	49	Famille Ciment de Gabès.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 49, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.118Z", "extension": "png", "sizeBytes": 510427, "updatedAt": "2026-04-08T09:16:10.320Z", "sha256Hash": "d4383e6ac67ed50f4ecc202aeb56c64edde05e7782704c186f6335802fabb51b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b9dfe6ec-320c-4c0d-b04d-d19a824791ff-famille-ciment-de-gabes.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Ciment de Gabès.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 49, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.118Z", "extension": "png", "sizeBytes": 510427, "updatedAt": "2026-04-08T09:16:22.976Z", "sha256Hash": "d4383e6ac67ed50f4ecc202aeb56c64edde05e7782704c186f6335802fabb51b", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/b9dfe6ec-320c-4c0d-b04d-d19a824791ff-famille-ciment-de-gabes.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Ciment de Gabès.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.98
168	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	48	CEMII - B-L 32,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 48, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.045Z", "extension": "png", "sizeBytes": 346085, "updatedAt": "2026-04-08T09:16:10.332Z", "sha256Hash": "307647467198f97aa499f029074b6d54f09a6fb82a9281bffe2f182988ab5a00", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/65b3bde6-60ea-4aef-a81e-2fc1517875f1-cemii-b-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEMII - B-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 48, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:51.045Z", "extension": "png", "sizeBytes": 346085, "updatedAt": "2026-04-08T09:16:22.993Z", "sha256Hash": "307647467198f97aa499f029074b6d54f09a6fb82a9281bffe2f182988ab5a00", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/65b3bde6-60ea-4aef-a81e-2fc1517875f1-cemii-b-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEMII - B-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:22.995
169	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	47	CEM II - A-L 42,5 R.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 47, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.973Z", "extension": "png", "sizeBytes": 371081, "updatedAt": "2026-04-08T09:16:10.342Z", "sha256Hash": "8103eb1c23d2e4a1a3ee95018d0a8da2ff9b218f1dc77404b0d4b121dd2eae46", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/30ed7570-3332-4caa-b278-0b79622dd0fa-cem-ii-a-l-42-5-r.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 42,5 R.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 47, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.973Z", "extension": "png", "sizeBytes": 371081, "updatedAt": "2026-04-08T09:16:23.004Z", "sha256Hash": "8103eb1c23d2e4a1a3ee95018d0a8da2ff9b218f1dc77404b0d4b121dd2eae46", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/30ed7570-3332-4caa-b278-0b79622dd0fa-cem-ii-a-l-42-5-r.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 42,5 R.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.007
170	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	46	CEM II - A-L 32,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 46, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.906Z", "extension": "png", "sizeBytes": 357048, "updatedAt": "2026-04-08T09:16:10.353Z", "sha256Hash": "f18c2da99649de6fc916928911e8788c1317bea3d9b62fef98218ab27ade13fc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/457ba9e4-894f-47e5-8456-5a5306d1a5e2-cem-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 46, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.906Z", "extension": "png", "sizeBytes": 357048, "updatedAt": "2026-04-08T09:16:23.015Z", "sha256Hash": "f18c2da99649de6fc916928911e8788c1317bea3d9b62fef98218ab27ade13fc", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/457ba9e4-894f-47e5-8456-5a5306d1a5e2-cem-ii-a-l-32-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM II - A-L 32,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.017
171	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	45	CEM I 42,5 N.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 45, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.836Z", "extension": "png", "sizeBytes": 363709, "updatedAt": "2026-04-08T09:16:10.363Z", "sha256Hash": "0f455a7797ec9ecc2bcd1788286e722dd6903a4b39c40c2103e019f4b2836707", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5f26bd65-277b-4745-98f9-f1a96f291c8e-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 45, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.836Z", "extension": "png", "sizeBytes": 363709, "updatedAt": "2026-04-08T09:16:23.027Z", "sha256Hash": "0f455a7797ec9ecc2bcd1788286e722dd6903a4b39c40c2103e019f4b2836707", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/5f26bd65-277b-4745-98f9-f1a96f291c8e-cem-i-42-5-n.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.029
172	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	44	CEM I 42,5 N SR-3.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 44, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.769Z", "extension": "png", "sizeBytes": 335728, "updatedAt": "2026-04-08T09:16:10.374Z", "sha256Hash": "5f757b25f4ce03b163e23d8d4de1ec1c2cd256405557418e343bee443c3b275f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cb47af98-5b4a-4ba3-8e20-c953a58e22c5-cem-i-42-5-n-sr-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N SR-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 44, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.769Z", "extension": "png", "sizeBytes": 335728, "updatedAt": "2026-04-08T09:16:23.037Z", "sha256Hash": "5f757b25f4ce03b163e23d8d4de1ec1c2cd256405557418e343bee443c3b275f", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/cb47af98-5b4a-4ba3-8e20-c953a58e22c5-cem-i-42-5-n-sr-3.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "CEM I 42,5 N SR-3.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.04
173	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	43	Famille Brique Série A.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 43, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.703Z", "extension": "png", "sizeBytes": 339440, "updatedAt": "2026-04-08T09:16:10.384Z", "sha256Hash": "1b9125bc619c0e06427ede4fd00c42fa3489e03ab52f82d568634088e98d864e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/682c9174-f86f-4919-b54c-840aa399313e-famille-brique-serie-a.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Série A.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 43, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.703Z", "extension": "png", "sizeBytes": 339440, "updatedAt": "2026-04-08T09:16:23.048Z", "sha256Hash": "1b9125bc619c0e06427ede4fd00c42fa3489e03ab52f82d568634088e98d864e", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/682c9174-f86f-4919-b54c-840aa399313e-famille-brique-serie-a.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Série A.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.052
174	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	42	Famille Brique Hourdis.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 42, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.647Z", "extension": "png", "sizeBytes": 181107, "updatedAt": "2026-04-08T09:16:10.395Z", "sha256Hash": "8f4596637e0a138c5844f9347248a36da7140eff277e2696c766dd006e28d348", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/40c1a845-5cf2-49e0-814a-e32e9f92d99d-famille-brique-hourdis.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Hourdis.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 42, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.647Z", "extension": "png", "sizeBytes": 181107, "updatedAt": "2026-04-08T09:16:23.060Z", "sha256Hash": "8f4596637e0a138c5844f9347248a36da7140eff277e2696c766dd006e28d348", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/40c1a845-5cf2-49e0-814a-e32e9f92d99d-famille-brique-hourdis.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Famille Brique Hourdis.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.062
175	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	41	BRIQUE PLATRIÈRE 8.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 41, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.587Z", "extension": "png", "sizeBytes": 106473, "updatedAt": "2026-04-08T09:16:10.405Z", "sha256Hash": "7fdf8bca9975598b89b03e6f5d41574f1452e3e18ede0f515386e0891e78c1f2", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/41ee203a-189f-410a-adba-706dc70fe10e-brique-platriere-8.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE PLATRIÈRE 8.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 41, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.587Z", "extension": "png", "sizeBytes": 106473, "updatedAt": "2026-04-08T09:16:23.070Z", "sha256Hash": "7fdf8bca9975598b89b03e6f5d41574f1452e3e18ede0f515386e0891e78c1f2", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/41ee203a-189f-410a-adba-706dc70fe10e-brique-platriere-8.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE PLATRIÈRE 8.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.072
176	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	40	BRIQUE HOURD 19.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 40, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.534Z", "extension": "png", "sizeBytes": 120133, "updatedAt": "2026-04-08T09:16:10.415Z", "sha256Hash": "6ce5c294579054398796d1622fc37262cc2c536a6958574a6e517cbdc26f3853", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/058a82ce-58e4-4d23-8d42-5f5ca768efa9-brique-hourd-19.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 19.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 40, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.534Z", "extension": "png", "sizeBytes": 120133, "updatedAt": "2026-04-08T09:16:23.081Z", "sha256Hash": "6ce5c294579054398796d1622fc37262cc2c536a6958574a6e517cbdc26f3853", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/058a82ce-58e4-4d23-8d42-5f5ca768efa9-brique-hourd-19.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 19.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.083
177	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	39	BRIQUE HOURD 16.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 39, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.468Z", "extension": "png", "sizeBytes": 141053, "updatedAt": "2026-04-08T09:16:10.426Z", "sha256Hash": "799a7c45508011ee62de065dbbe54705e681fd04035f4e6ad799eab7d57a1cd6", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/8e5d2f0a-b34d-4e11-bdb1-c175d489b320-brique-hourd-16.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 16.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 39, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.468Z", "extension": "png", "sizeBytes": 141053, "updatedAt": "2026-04-08T09:16:23.092Z", "sha256Hash": "799a7c45508011ee62de065dbbe54705e681fd04035f4e6ad799eab7d57a1cd6", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/8e5d2f0a-b34d-4e11-bdb1-c175d489b320-brique-hourd-16.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE HOURD 16.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.094
178	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	38	Brique Double cloison.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 38, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.407Z", "extension": "png", "sizeBytes": 192571, "updatedAt": "2026-04-08T09:16:10.437Z", "sha256Hash": "ecd03e436e5c0aec2999b9ee91f4b0ddd03c27f0e216cfa498a3b245a5caee78", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/e89b2cb8-80df-46d6-ac61-b04f46ae7ab7-brique-double-cloison.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Brique Double cloison.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 38, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 0, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.407Z", "extension": "png", "sizeBytes": 192571, "updatedAt": "2026-04-08T09:16:23.103Z", "sha256Hash": "ecd03e436e5c0aec2999b9ee91f4b0ddd03c27f0e216cfa498a3b245a5caee78", "visibility": "PRIVATE", "description": null, "storagePath": "media/image/2026/04/e89b2cb8-80df-46d6-ac61-b04f46ae7ab7-brique-double-cloison.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "Brique Double cloison.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.105
179	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	37	BRIQUE A12.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 37, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.340Z", "extension": "png", "sizeBytes": 141284, "updatedAt": "2026-04-08T09:16:10.447Z", "sha256Hash": "25053a4702a7a85077c2041f80d993353e86501056e6027d6df81624f8ab649b", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/a2e1f1cd-6911-4b93-a010-5d58052977c0-brique-a12.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A12.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 37, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.340Z", "extension": "png", "sizeBytes": 141284, "updatedAt": "2026-04-08T09:16:23.114Z", "sha256Hash": "25053a4702a7a85077c2041f80d993353e86501056e6027d6df81624f8ab649b", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/a2e1f1cd-6911-4b93-a010-5d58052977c0-brique-a12.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A12.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.116
180	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	36	BRIQUE A08.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 36, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.266Z", "extension": "png", "sizeBytes": 115427, "updatedAt": "2026-04-08T09:16:10.456Z", "sha256Hash": "1e6ff50ac29a88c3de5e85cb18391ff009a4f7ff8030ddc118c78eae0b39cf31", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/11517d5a-f373-4ceb-810c-0a93391da767-brique-a08.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A08.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 36, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.266Z", "extension": "png", "sizeBytes": 115427, "updatedAt": "2026-04-08T09:16:23.124Z", "sha256Hash": "1e6ff50ac29a88c3de5e85cb18391ff009a4f7ff8030ddc118c78eae0b39cf31", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/11517d5a-f373-4ceb-810c-0a93391da767-brique-a08.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A08.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.126
181	cmnnfemzf00008wg9iwn6hacx	UPDATE	Media	35	BRIQUE A06.png	Déplacement d'un média	\N	\N	\N	\N	{"id": 35, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": null, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.033Z", "extension": "png", "sizeBytes": 85950, "updatedAt": "2026-04-08T09:16:10.467Z", "sha256Hash": "6e1051f164399697bf144adfbc617e3c436b65c354fa8feab1d180e8dc44e3c8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/b08f7a69-6cb7-4f45-a869-0ed2fc01f3f1-brique-a06.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A06.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	{"id": 35, "kind": "IMAGE", "title": null, "_count": {"brandLogoFor": 0, "articleCoverFor": 0, "articleMediaLinks": 0, "articleOgImageFor": 0, "productFamilyLinks": 0, "productVariantLinks": 1, "productFinishImageFor": 0, "staffProfileAvatarFor": 0, "productCategoryImageFor": 0, "productSubcategoryImageFor": 0}, "altText": null, "widthPx": 720, "folderId": 5, "heightPx": 720, "isActive": true, "mimeType": "image/png", "createdAt": "2026-04-07T08:13:50.033Z", "extension": "png", "sizeBytes": 85950, "updatedAt": "2026-04-08T09:16:23.134Z", "sha256Hash": "6e1051f164399697bf144adfbc617e3c436b65c354fa8feab1d180e8dc44e3c8", "visibility": "PUBLIC", "description": null, "storagePath": "media/image/2026/04/b08f7a69-6cb7-4f45-a869-0ed2fc01f3f1-brique-a06.png", "uploadedByUser": {"id": "cmnnfemzf00008wg9iwn6hacx", "email": "root@cobamgroup.com", "profile": {"lastName": "Cobam", "firstName": "Root"}}, "durationSeconds": null, "originalFilename": "BRIQUE A06.png", "uploadedByUserId": "cmnnfemzf00008wg9iwn6hacx"}	2026-04-08 09:16:23.137
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.media (id, folder_id, kind, visibility, storage_path, original_filename, mime_type, extension, alt_text, title, description, width_px, height_px, duration_seconds, size_bytes, sha256_hash, is_active, uploaded_by_user_id, updated_by_user_id, deleted_at, deleted_by_user_id, created_at, updated_at) FROM stdin;
32	1	IMAGE	PUBLIC	media/image/2026/04/1cb974b0-1faa-4f97-b22e-225a3f59a9d1-sables-et-graviers.png	Sables et graviers.png	image/png	png	\N	\N	\N	1280	720	\N	2194414	5d8c9a8c51ab3354a3f8a9d25dbb87846db462f3edd7b045e5ca736a6b85ca8b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.514	2026-04-08 10:02:50.787
20	1	IMAGE	PUBLIC	media/image/2026/04/48f5aabc-fa2e-445c-a81d-d0fc7b27829f-peinture-d-interieur.png	Peinture d'intérieur.png	image/png	png	\N	\N	\N	1280	720	\N	537735	6b01278478950bd807b4d88a61ab3a19bb4a194aa4d5fa66c2585fd57ebabf2f	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.474	2026-04-08 10:02:50.787
17	1	IMAGE	PUBLIC	media/image/2026/04/8e89580d-f485-41bb-8b94-00196b602c8a-mosaique-a-l-italienne.png	Mosaïque à l'italienne.png	image/png	png	\N	\N	\N	1280	720	\N	1734506	e3b27029257dea57abb2675e68a145447d198d8ead434d3fd4757b00c6948a3b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.243	2026-04-08 10:02:50.787
14	1	IMAGE	PUBLIC	media/image/2026/04/a53d752f-731a-41d2-b3c1-5c50536ba229-margelles-et-finitions.png	Margelles et finitions.png	image/png	png	\N	\N	\N	1280	720	\N	2102233	25e7553b3adee5b4ba8ee1be604bef9eda01713637cb73834d28dbb509cca844	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.981	2026-04-08 10:02:50.787
73	4	DOCUMENT	PRIVATE	media/document/2026/04/b9ec2454-0956-4af2-bd66-903684673033-isoline.pdf	isoline.pdf	application/pdf	pdf	\N	\N	\N	\N	\N	\N	324966	74c4dc24b60bce4822115db15cb0fcd17ede81fc218006c71586d6d82760dd28	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-08 08:59:41.112	2026-04-08 09:15:14.816
16	1	IMAGE	PRIVATE	media/image/2026/04/426a4fd2-822a-4d4c-a600-26cc7276462e-meubles-de-salle-de-bain.png	Meubles de salle de bain.png	image/png	png	\N	\N	\N	1280	720	\N	954376	ac0f241d5bb8c3a9ce077e5bec00938a7112887c95bc87f16db6453945c0e2af	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.144	2026-04-07 07:48:34.144
18	1	IMAGE	PUBLIC	media/image/2026/04/40ade6b5-ca01-43f8-a960-2a8bb81f467b-mosaiques.png	Mosaïques.png	image/png	png	\N	\N	\N	1280	720	\N	1630485	0659ad4d593d4a00097289f82273b2b0715ddbd8694644dcbc38d4d2d95ccdef	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.337	2026-04-08 10:02:50.787
13	1	IMAGE	PUBLIC	media/image/2026/04/ca8492ec-dd89-4976-ad9d-7a854eebf4cb-lavabos-et-vasques.png	Lavabos et vasques.png	image/png	png	\N	\N	\N	1280	720	\N	701970	29b4a4fe9496e4f134003ad8934a7005fd08b524eff805c0a4a6323c8718d700	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.863	2026-04-08 10:02:50.787
72	5	IMAGE	PUBLIC	media/image/2026/04/d91d3468-877c-46a3-b3ab-c23daec66182-sikalatex-bidon-20l.png	SIKALATEX BIDON 20L.png	image/png	png	\N	\N	\N	533	533	\N	140848	68aa3dd6826e7a862555da239169eabc12bc2980310fd7f4ad6fc48066aa6225	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 15:46:13.668	2026-04-08 09:16:22.737
70	5	IMAGE	PUBLIC	media/image/2026/04/5a919aaf-0a2f-4217-bca5-47a2fe621eb3-sikalatex-bidon-1litre.png	SIKALATEX BIDON 1LITRE.png	image/png	png	\N	\N	\N	533	533	\N	181848	b2a11fbbfcb2886916c97e811148bc61438fd8ae63a8c9b4415a7319d9e910a8	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 15:46:13.505	2026-04-08 09:16:22.771
37	5	IMAGE	PUBLIC	media/image/2026/04/a2e1f1cd-6911-4b93-a010-5d58052977c0-brique-a12.png	BRIQUE A12.png	image/png	png	\N	\N	\N	720	720	\N	141284	25053a4702a7a85077c2041f80d993353e86501056e6027d6df81624f8ab649b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.34	2026-04-08 09:16:23.114
36	5	IMAGE	PUBLIC	media/image/2026/04/11517d5a-f373-4ceb-810c-0a93391da767-brique-a08.png	BRIQUE A08.png	image/png	png	\N	\N	\N	720	720	\N	115427	1e6ff50ac29a88c3de5e85cb18391ff009a4f7ff8030ddc118c78eae0b39cf31	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.266	2026-04-08 09:16:23.124
8	1	IMAGE	PUBLIC	media/image/2026/04/75923ec2-8a79-4c7f-b731-df4f09ddbf6d-eviers-de-cuisine.png	Éviers de cuisine.png	image/png	png	\N	\N	\N	1280	720	\N	932093	7c5f0b14107ebef12a5da5d0c77f1e2ac70092b0deea6d3bb811764bf070f610	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.476	2026-04-08 10:02:50.787
24	1	IMAGE	PUBLIC	media/image/2026/04/4b6a0679-422b-4bc8-9a0f-7ee30a9f20ef-plinthes-et-accessoires.png	Plinthes et accessoires.png	image/png	png	\N	\N	\N	1280	720	\N	1075457	342cbe5afc3afa6f6d08f4d1378cda5462d7b3a7de33c4698c5b4bae0e95511a	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.822	2026-04-08 10:02:50.787
21	1	IMAGE	PUBLIC	media/image/2026/04/7e78a0ce-3adb-4337-96ce-b10e71ecf41c-peinture-et-decoration.png	Peinture et Décoration.png	image/png	png	\N	\N	\N	1280	720	\N	1342244	f5aa8a6ce9f7290aa840c9609782a217730df7188857da3f131f35915030334b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.559	2026-04-08 10:02:50.787
71	5	IMAGE	PUBLIC	media/image/2026/04/cdf47d0c-6d96-4d42-8c2e-257763195fbf-sikalatex-bidon-5litres.png	SIKALATEX BIDON 5LITRES.png	image/png	png	\N	\N	\N	533	533	\N	140025	a5ea25de0cfc92bc9bfd06f957b67c50b67235e2b992536f988bc4853194dc52	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 15:46:13.613	2026-04-08 09:16:22.758
15	1	IMAGE	PUBLIC	media/image/2026/04/34648392-49b5-4aef-8305-401e94d2c6dd-materiaux-de-construction.png	Matériaux de construction.png	image/png	png	\N	\N	\N	1280	720	\N	1529814	49f6c14efb4300dc93a212de88df70b63f22d80009cd313fa4b731cc2781d1a9	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.072	2026-04-08 10:02:50.787
22	1	IMAGE	PUBLIC	media/image/2026/04/3a3736a8-ff54-441a-8213-d8ee0292a5e2-pierres-de-bali.png	Pierres de Bali.png	image/png	png	\N	\N	\N	1280	720	\N	1902473	66115706697f235c272f0cbb38abdd677b07321886196c5aaaa425a2d5563041	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.652	2026-04-08 10:02:50.787
9	1	IMAGE	PUBLIC	media/image/2026/04/06a71cce-af5c-434f-8982-b9cdcced0a78-faience-murale.png	Faïence murale.png	image/png	png	\N	\N	\N	1280	720	\N	425349	c738c9d7fc8bb6215b7af4fbdd1f8d5e5a418a0450c803aca6ae202b7d82bfe8	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.547	2026-04-08 10:02:50.787
31	1	IMAGE	PUBLIC	media/image/2026/04/729b52b7-edda-403f-abcb-2689c7cb6111-robinetterie.png	Robinetterie.png	image/png	png	\N	\N	\N	1280	720	\N	1298177	189f6a5daf040e111ea688f22f31266d6d9342a0562cf42f587e46a3cf692fdc	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.41	2026-04-08 10:02:50.787
6	1	IMAGE	PUBLIC	media/image/2026/04/c3a33fe4-3115-48af-9184-113a7a278e5c-espace-douche.png	Espace douche.png	image/png	png	\N	\N	\N	1280	720	\N	927734	ba71c086c7549c04f0fa883e6f68cc4e07fdd620a7b181fbc16d012a35caf058	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.293	2026-04-08 10:02:50.787
1	1	IMAGE	PUBLIC	media/image/2026/04/0bbde244-f5c8-412a-b880-b1b7b4f5cc70-baignoires.png	Baignoires.png	image/png	png	\N	\N	\N	1280	720	\N	644506	780557b54fee5731678dde407afe22bd1bc71bd5833767f4ee3c3599d1cd08dc	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:32.716	2026-04-08 10:02:50.787
56	5	IMAGE	PRIVATE	media/image/2026/04/4aabb8aa-298e-420a-9c91-e135484cba08-ciment-blanc-sotacib-cem-ll-a-l-42-5-n.png	Ciment blanc SOTACIB CEM ll-A-L 42,5 N.png	image/png	png	\N	\N	\N	720	720	\N	145211	e2c96f83a4402048f8e666f0c43b6bf80c837b45c0cc37d897cb4fda54086430	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.549	2026-04-08 09:16:22.899
10	1	IMAGE	PUBLIC	media/image/2026/04/2eef7fca-a9eb-4880-a040-750ed8d165ea-isolation-et-etancheite.png	Isolation et étanchéité.png	image/png	png	\N	\N	\N	1280	720	\N	1269942	d604f643b3821f7de0644d8d61ff58ec5d9448555a4f6baa7fe5d75dea3c81b5	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.639	2026-04-08 10:02:50.787
55	5	IMAGE	PRIVATE	media/image/2026/04/3a029d5d-e6f4-4796-add7-246491ea832f-ciment-blanc-sotacib-cem-i-52-5-n.png	Ciment blanc SOTACIB CEM I 52,5 N.png	image/png	png	\N	\N	\N	720	720	\N	364341	e3e46f97ee2596f70464617b4616b91d7f30c50ea43ebd5e05348251dc4850b9	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.485	2026-04-08 09:16:22.909
54	5	IMAGE	PRIVATE	media/image/2026/04/d5bc1fd3-b45a-4d13-b408-339dcc6ef947-caniveau-de-chausse-cs2.png	CANIVEAU DE CHAUSSÉ CS2.png	image/png	png	\N	\N	\N	720	720	\N	128006	eee090e199d63ac6547d579d6afb4bede1c2a90531099a0c3676eb5c51b93089	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.417	2026-04-08 09:16:22.92
53	5	IMAGE	PRIVATE	media/image/2026/04/182f74e7-b5c5-4e2c-bdeb-18a5a6e00785-bordure-mince-p2.png	BORDURE MINCE P2.png	image/png	png	\N	\N	\N	720	720	\N	165382	1682ce734b558c1d37ecc2b76f7077a9b3cafc0e05647931f16dcaf8c8b99ac0	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.357	2026-04-08 09:16:22.931
52	5	IMAGE	PRIVATE	media/image/2026/04/b4aa4685-a439-4bda-a5cd-5dbfdf596e64-bordure-de-trottoir-t3-1.png	BORDURE DE TROTTOIR T3-1.png	image/png	png	\N	\N	\N	720	720	\N	138543	c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.295	2026-04-08 09:16:22.941
51	5	IMAGE	PRIVATE	media/image/2026/04/7eaf76c1-0bab-4312-9eb4-5c48b31423c4-bordure-de-trottoir-t3.png	BORDURE DE TROTTOIR T3.png	image/png	png	\N	\N	\N	720	720	\N	122579	6c593f5d50f782246ffe6df38cb2970a56201c64240ddb670f2bb6d27202e89e	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.231	2026-04-08 09:16:22.952
50	5	IMAGE	PRIVATE	media/image/2026/04/2a95a6e0-f31f-4db0-b934-bf461a459be9-bordure-de-trottoir-t2.png	BORDURE DE TROTTOIR T2.png	image/png	png	\N	\N	\N	720	720	\N	138543	c3eb224ec0860878f84259f49b3828f395c9386be77cc50765433cd917f3e57b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.173	2026-04-08 09:16:22.964
49	5	IMAGE	PRIVATE	media/image/2026/04/b9dfe6ec-320c-4c0d-b04d-d19a824791ff-famille-ciment-de-gabes.png	Famille Ciment de Gabès.png	image/png	png	\N	\N	\N	720	720	\N	510427	d4383e6ac67ed50f4ecc202aeb56c64edde05e7782704c186f6335802fabb51b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.118	2026-04-08 09:16:22.976
48	5	IMAGE	PRIVATE	media/image/2026/04/65b3bde6-60ea-4aef-a81e-2fc1517875f1-cemii-b-l-32-5-n.png	CEMII - B-L 32,5 N.png	image/png	png	\N	\N	\N	720	720	\N	346085	307647467198f97aa499f029074b6d54f09a6fb82a9281bffe2f182988ab5a00	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.045	2026-04-08 09:16:22.993
47	5	IMAGE	PRIVATE	media/image/2026/04/30ed7570-3332-4caa-b278-0b79622dd0fa-cem-ii-a-l-42-5-r.png	CEM II - A-L 42,5 R.png	image/png	png	\N	\N	\N	720	720	\N	371081	8103eb1c23d2e4a1a3ee95018d0a8da2ff9b218f1dc77404b0d4b121dd2eae46	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.973	2026-04-08 09:16:23.004
46	5	IMAGE	PRIVATE	media/image/2026/04/457ba9e4-894f-47e5-8456-5a5306d1a5e2-cem-ii-a-l-32-5-n.png	CEM II - A-L 32,5 N.png	image/png	png	\N	\N	\N	720	720	\N	357048	f18c2da99649de6fc916928911e8788c1317bea3d9b62fef98218ab27ade13fc	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.906	2026-04-08 09:16:23.015
45	5	IMAGE	PRIVATE	media/image/2026/04/5f26bd65-277b-4745-98f9-f1a96f291c8e-cem-i-42-5-n.png	CEM I 42,5 N.png	image/png	png	\N	\N	\N	720	720	\N	363709	0f455a7797ec9ecc2bcd1788286e722dd6903a4b39c40c2103e019f4b2836707	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.836	2026-04-08 09:16:23.027
44	5	IMAGE	PRIVATE	media/image/2026/04/cb47af98-5b4a-4ba3-8e20-c953a58e22c5-cem-i-42-5-n-sr-3.png	CEM I 42,5 N SR-3.png	image/png	png	\N	\N	\N	720	720	\N	335728	5f757b25f4ce03b163e23d8d4de1ec1c2cd256405557418e343bee443c3b275f	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.769	2026-04-08 09:16:23.037
43	5	IMAGE	PRIVATE	media/image/2026/04/682c9174-f86f-4919-b54c-840aa399313e-famille-brique-serie-a.png	Famille Brique Série A.png	image/png	png	\N	\N	\N	720	720	\N	339440	1b9125bc619c0e06427ede4fd00c42fa3489e03ab52f82d568634088e98d864e	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.703	2026-04-08 09:16:23.048
42	5	IMAGE	PRIVATE	media/image/2026/04/40c1a845-5cf2-49e0-814a-e32e9f92d99d-famille-brique-hourdis.png	Famille Brique Hourdis.png	image/png	png	\N	\N	\N	720	720	\N	181107	8f4596637e0a138c5844f9347248a36da7140eff277e2696c766dd006e28d348	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.647	2026-04-08 09:16:23.06
41	5	IMAGE	PUBLIC	media/image/2026/04/41ee203a-189f-410a-adba-706dc70fe10e-brique-platriere-8.png	BRIQUE PLATRIÈRE 8.png	image/png	png	\N	\N	\N	720	720	\N	106473	7fdf8bca9975598b89b03e6f5d41574f1452e3e18ede0f515386e0891e78c1f2	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.587	2026-04-08 09:16:23.07
40	5	IMAGE	PRIVATE	media/image/2026/04/058a82ce-58e4-4d23-8d42-5f5ca768efa9-brique-hourd-19.png	BRIQUE HOURD 19.png	image/png	png	\N	\N	\N	720	720	\N	120133	6ce5c294579054398796d1622fc37262cc2c536a6958574a6e517cbdc26f3853	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.534	2026-04-08 09:16:23.081
39	5	IMAGE	PUBLIC	media/image/2026/04/8e5d2f0a-b34d-4e11-bdb1-c175d489b320-brique-hourd-16.png	BRIQUE HOURD 16.png	image/png	png	\N	\N	\N	720	720	\N	141053	799a7c45508011ee62de065dbbe54705e681fd04035f4e6ad799eab7d57a1cd6	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.468	2026-04-08 09:16:23.092
38	5	IMAGE	PRIVATE	media/image/2026/04/e89b2cb8-80df-46d6-ac61-b04f46ae7ab7-brique-double-cloison.png	Brique Double cloison.png	image/png	png	\N	\N	\N	720	720	\N	192571	ecd03e436e5c0aec2999b9ee91f4b0ddd03c27f0e216cfa498a3b245a5caee78	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.407	2026-04-08 09:16:23.103
35	5	IMAGE	PUBLIC	media/image/2026/04/b08f7a69-6cb7-4f45-a869-0ed2fc01f3f1-brique-a06.png	BRIQUE A06.png	image/png	png	\N	\N	\N	720	720	\N	85950	6e1051f164399697bf144adfbc617e3c436b65c354fa8feab1d180e8dc44e3c8	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:50.033	2026-04-08 09:16:23.134
11	1	IMAGE	PUBLIC	media/image/2026/04/bc5f6a79-f887-4567-a874-87d889135bc6-isolation-thermique.png	Isolation thermique.png	image/png	png	\N	\N	\N	1280	720	\N	556200	f1337225a459bcd8308ecc2fbd4c040413dcf7659ff5434afc6609d01f88747d	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.714	2026-04-08 10:02:50.787
26	1	IMAGE	PUBLIC	media/image/2026/04/38862d27-5e5b-4dc7-8791-adae110a7eaa-portes-en-bois.png	Portes en bois.png	image/png	png	\N	\N	\N	1280	720	\N	1550963	c21b3fae96ff5e6aab26881c9f4c501f428a2d8e2aae1bb1e265893fa610ace5	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.987	2026-04-08 10:02:50.787
57	5	IMAGE	PRIVATE	media/image/2026/04/9150e5b3-0d02-405d-aa00-e6bddf936216-ciment-i-42-5-hrs-1.png	Ciment I 42,5 HRS 1.png	image/png	png	\N	\N	\N	720	720	\N	285185	9d269c9426bcc0f9675944d54faa02936453d19b7d93bd26f311341d8e4d7e31	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.611	2026-04-08 09:16:22.888
33	1	IMAGE	PUBLIC	media/image/2026/04/b7ae17d7-ef4e-4608-b92e-0e82fe09c4e0-salle-de-bain-et-cuisine.png	Salle de bain et cuisine.png	image/png	png	\N	\N	\N	1280	720	\N	728332	e85df3cbea536202dc4ff7de89341fd95d318f9c9b9fb04fe87e518f1aa78452	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.582	2026-04-08 10:02:50.787
27	1	IMAGE	PUBLIC	media/image/2026/04/818a8464-44e4-47af-a933-fe2cf58bf973-portes-et-menuiserie.png	Portes et menuiserie.png	image/png	png	\N	\N	\N	1280	720	\N	959337	31760241a02ff44613f8627a10744686deceb217a755f4e36d7a5c4df7298a8e	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.065	2026-04-08 10:02:50.787
67	5	IMAGE	PRIVATE	media/image/2026/04/cf1b60c2-ec57-48bc-b359-5ea06c8c6431-treillis-soudes-150-150-5.png	Treillis soudés 150-150-5.png	image/png	png	\N	\N	\N	720	720	\N	1162322	ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:52.337	2026-04-08 09:16:22.781
66	5	IMAGE	PRIVATE	media/image/2026/04/b53aab5e-0f15-45b9-a039-599d4b5f1612-treillis-soudes-150-150-4.png	Treillis soudés 150-150-4.png	image/png	png	\N	\N	\N	720	720	\N	1162322	ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:52.236	2026-04-08 09:16:22.793
64	5	IMAGE	PRIVATE	media/image/2026/04/5108fdfa-6aed-4069-aa56-21d4d9ee364c-fil-recuit.png	FIL RECUIT.png	image/png	png	\N	\N	\N	720	720	\N	194522	08c81f196211105e1e0f77798539214b5bf53a0b02ff53d8db06ec970aad2b0c	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:52.037	2026-04-08 09:16:22.814
60	5	IMAGE	PRIVATE	media/image/2026/04/f4d6f38c-03e3-44fa-afa1-641353e7c0d5-pave-autobloquant-neapolis-gris.png	Pavé autobloquant Neapolis Gris.png	image/png	png	\N	\N	\N	720	720	\N	61006	e19857abc6b332e83d29a716ddeaae5395f4db8141ea31e11f1d0c1c1fae2a10	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.793	2026-04-08 09:16:22.856
58	5	IMAGE	PRIVATE	media/image/2026/04/c5ffc022-5d94-4db1-9028-6c7a43684a57-ciment-portland-au-calcaire-cp-ii-a-l-32-5-n.png	Ciment portland au calcaire CP II - A-L 32,5 N.png	image/png	png	\N	\N	\N	720	720	\N	292643	0ce902e3f87dfd5bd44ed2176132526386501f9ee2ae0d1b31000068d1f1950c	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.674	2026-04-08 09:16:22.877
5	1	IMAGE	PUBLIC	media/image/2026/04/27d2587b-5336-4692-9a66-8ca5650f0c08-ciments-et-produits-en-beton.png	Ciments et produits en béton.png	image/png	png	\N	\N	\N	1280	720	\N	2426143	836b8f3566a50408c4e15b6ab936d4ee1d50dccdda25dbb91aaf636a28ba40f1	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.209	2026-04-08 10:02:50.787
28	1	IMAGE	PUBLIC	media/image/2026/04/ae5c0bff-aea1-455c-878e-c1d43dae1824-revetements-de-sol-exterieur.png	Revêtements de sol extérieur.png	image/png	png	\N	\N	\N	1280	720	\N	1407786	4e7e2273c768ba6786b876178553229f75aefce990d14c15cf07c6738d3d4c8f	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.173	2026-04-08 10:02:50.787
65	5	IMAGE	PRIVATE	media/image/2026/04/4c4eb01b-c7a8-420f-b077-44e0a0f3eda5-treillis-soudes-150-150-3.png	Treillis soudés 150-150-3.png	image/png	png	\N	\N	\N	720	720	\N	1162322	ff75bb617c0e623431b903a0dc29bc0fff2a34442cf60371ded47158b99e69bc	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:52.131	2026-04-08 09:16:22.803
63	5	IMAGE	PUBLIC	media/image/2026/04/c7a174d5-f954-4731-adb1-a99afad02c4c-cadre-15-armature-faconnee.png	CADRE 15 - ARMATURE FAÇONNÉE.png	image/png	png	\N	\N	\N	720	720	\N	201444	8a5ca670a7cad8320d3dcd73ae95a3c76f203e91cab200d37a0ec74bad4361dd	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.973	2026-04-08 09:16:22.824
61	5	IMAGE	PRIVATE	media/image/2026/04/3caa3d10-02aa-47a8-98b1-9e6275728766-coffre-en-tunnel-poly-fini-25cm.png	COFFRE EN TUNNEL POLY FINI 25CM.png	image/png	png	\N	\N	\N	720	720	\N	227470	c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.854	2026-04-08 09:16:22.846
59	5	IMAGE	PRIVATE	media/image/2026/04/02d594ac-d811-4f3f-a04e-f44107631579-ciment-portland-cem-i-42-5-n.png	CIMENT PORTLAND CEM I 42,5 N.png	image/png	png	\N	\N	\N	720	720	\N	290564	8ad46ff77ec461ee98759334c75f6e8f27d91df668c2b59cf9456948e7945f81	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.737	2026-04-08 09:16:22.866
25	1	IMAGE	PUBLIC	media/image/2026/04/19104ead-0fd1-47c0-8925-9c39a2271687-portes-coulissantes.png	Portes coulissantes.png	image/png	png	\N	\N	\N	1280	720	\N	1319529	50388f87b6c1d3c9f41eeb4b8a4ed739dcd0c98357f078d0e7fd09cca890ee92	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.898	2026-04-08 10:02:50.787
34	1	IMAGE	PUBLIC	media/image/2026/04/66f29a6b-c640-4066-9893-3f7de22b149a-treillis-soudes-et-fers-a-beton.png	Treillis soudés et fers à béton.png	image/png	png	\N	\N	\N	1280	720	\N	2022216	d22566b4922c003f604e17a7ddb69ff4ba618cc1bc59354f98399a1d9cdc80d1	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.68	2026-04-08 10:02:50.787
29	1	IMAGE	PUBLIC	media/image/2026/04/2b692957-2b7c-4707-9efc-c2c356709ed6-revetements-de-sol-interieur.png	Revêtements de sol intérieur.png	image/png	png	\N	\N	\N	1280	720	\N	936879	2352390a47156197059ec6cfece180110b99c92bcaad22d21a5e0c6dce96788c	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.243	2026-04-08 10:02:50.787
62	5	IMAGE	PRIVATE	media/image/2026/04/1543ccb9-6fcf-40eb-8eaf-2419cdfedf9f-coffre-en-tunnel-poly-fini-30cm.png	COFFRE EN TUNNEL POLY FINI 30CM.png	image/png	png	\N	\N	\N	720	720	\N	227470	c72d3af68d8150680e12efd530cc1d40723dae34cde64d1bb69f0211f802e4fd	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 08:13:51.913	2026-04-08 09:16:22.836
23	1	IMAGE	PUBLIC	media/image/2026/04/c3071540-c48f-4af1-b941-205ec26fefba-piscine.png	Piscine.png	image/png	png	\N	\N	\N	1280	720	\N	1769350	c9ee66b44e65fe6a74d9fb659ee27a79c0146afe142ae796d02041d3c819d2b5	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.746	2026-04-08 10:02:50.787
3	1	IMAGE	PUBLIC	media/image/2026/04/9d5bd9c4-772c-46a8-9d2d-6419600dc44f-briques.png	Briques.png	image/png	png	\N	\N	\N	1280	720	\N	2004042	75c2c76b26e9ea37efd7ffcca3201f1341f4b95147d57ba165d840236b612894	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:32.983	2026-04-08 10:02:50.787
7	1	IMAGE	PUBLIC	media/image/2026/04/7bddfb83-5b54-4688-bd59-34bf4036d078-etancheite.png	Étanchéité.png	image/png	png	\N	\N	\N	1280	720	\N	1733314	ac7cf895eed4ffe432e4fc0e447fa7b58c46d223b614c2b851a806fa90bbad15	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.397	2026-04-08 10:02:50.787
12	1	IMAGE	PUBLIC	media/image/2026/04/083563f3-2bf6-4731-99cb-307ec3a20aae-jaccuzis.png	Jaccuzis.png	image/png	png	\N	\N	\N	1280	720	\N	1181606	44c0a8a5f469c24cb43884f2130c8f2b9620c5ee8d67fb0dc4012cb560687622	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.795	2026-04-08 10:02:50.787
19	1	IMAGE	PUBLIC	media/image/2026/04/d002ddea-0060-4ec1-bf33-defb5fb9ce4c-peinture-d-exterieur.png	Peinture d'extérieur.png	image/png	png	\N	\N	\N	1280	720	\N	503502	ae0ba63d551815fe564f6cb3da0e699cbc4aff79e0ebb785c3321e1602719c05	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:34.404	2026-04-08 10:02:50.787
2	1	IMAGE	PUBLIC	media/image/2026/04/d2780870-2a89-47db-b78c-015fa1b230cb-beton-cire.png	Béton Ciré.png	image/png	png	\N	\N	\N	1280	720	\N	1481066	461863e318c9fffab9ba10aa83c02f85f453c202671a048f73a30c03b7bff31a	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:32.871	2026-04-08 10:02:50.787
30	1	IMAGE	PUBLIC	media/image/2026/04/4d038235-8923-480f-a132-55c2ec7c4ac2-revetements-de-sols-et-murs.png	Revêtements de sols et murs.png	image/png	png	\N	\N	\N	1280	720	\N	1292907	ca5cf90cd7bff266d50283253ea400494f27bab6509c41436e55fb118b9d180b	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:35.326	2026-04-08 10:02:50.787
4	1	IMAGE	PUBLIC	media/image/2026/04/2dc7f78d-dd9a-4e87-9f5b-b690f00303f4-chimie-du-batiment.png	Chimie du bâtiment.png	image/png	png	\N	\N	\N	1280	720	\N	1311713	f0a07b245c480503fe0e9d9bbacbc8c934d3ff8d31376ae1e21118bc9fb2a504	t	cmnnfemzf00008wg9iwn6hacx	cmnnfemzf00008wg9iwn6hacx	\N	\N	2026-04-07 07:48:33.098	2026-04-08 10:02:50.787
\.


--
-- Data for Name: media_folders; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.media_folders (id, parent_id, name, created_by_user_id, created_at, updated_at) FROM stdin;
1	\N	Catégories Produits	cmnnfemzf00008wg9iwn6hacx	2026-04-07 07:48:05.283	2026-04-07 07:48:05.283
2	\N	Produits	cmnnfemzf00008wg9iwn6hacx	2026-04-07 08:12:50.293	2026-04-07 08:12:50.293
4	2	Fiches techniques	cmnnfemzf00008wg9iwn6hacx	2026-04-08 09:15:05.399	2026-04-08 09:15:05.399
5	2	Images	cmnnfemzf00008wg9iwn6hacx	2026-04-08 09:16:02.224	2026-04-08 09:16:02.224
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.permissions (id, key, label, resource, action, scope, description, created_at, updated_at) FROM stdin;
23	products.view.all	Voir tous les produits	products	view	all	\N	2026-04-06 16:47:17.187	2026-04-08 10:02:51.52
24	products.view.own	Voir mes produits	products	view	own	\N	2026-04-06 16:47:17.189	2026-04-08 10:02:51.521
25	products.update.all	Modifier tous les produits	products	update	all	Les produits publiés restent protégés par la logique métier.	2026-04-06 16:47:17.19	2026-04-08 10:02:51.523
26	products.update.below_role	Modifier les produits sous mon rôle	products	update	below_role	Les produits publiés restent protégés par la logique métier.	2026-04-06 16:47:17.191	2026-04-08 10:02:51.524
27	products.update.own	Modifier mes produits	products	update	own	Les produits publiés restent protégés par la logique métier.	2026-04-06 16:47:17.192	2026-04-08 10:02:51.526
28	products.delete.all	Supprimer tous les produits	products	delete	all	\N	2026-04-06 16:47:17.193	2026-04-08 10:02:51.527
29	products.delete.below_role	Supprimer les produits sous mon rôle	products	delete	below_role	\N	2026-04-06 16:47:17.194	2026-04-08 10:02:51.528
30	products.delete.own	Supprimer mes produits	products	delete	own	\N	2026-04-06 16:47:17.195	2026-04-08 10:02:51.529
31	products.feature.all	Mettre en avant tous les produits	products	feature	all	\N	2026-04-06 16:47:17.196	2026-04-08 10:02:51.531
32	products.feature.below_role	Mettre en avant les produits sous mon rôle	products	feature	below_role	\N	2026-04-06 16:47:17.2	2026-04-08 10:02:51.534
33	products.feature.own	Mettre en avant mes produits	products	feature	own	\N	2026-04-06 16:47:17.201	2026-04-08 10:02:51.536
34	products.unfeature.all	Retirer la mise en avant de tous les produits	products	unfeature	all	\N	2026-04-06 16:47:17.202	2026-04-08 10:02:51.537
35	products.unfeature.below_role	Retirer la mise en avant des produits sous mon rôle	products	unfeature	below_role	\N	2026-04-06 16:47:17.203	2026-04-08 10:02:51.538
36	products.unfeature.own	Retirer la mise en avant de mes produits	products	unfeature	own	\N	2026-04-06 16:47:17.204	2026-04-08 10:02:51.54
37	products.publish.all	Publier tous les produits	products	publish	all	\N	2026-04-06 16:47:17.206	2026-04-08 10:02:51.541
38	products.publish.below_role	Publier les produits sous mon rôle	products	publish	below_role	\N	2026-04-06 16:47:17.207	2026-04-08 10:02:51.543
39	products.publish.own	Publier mes produits	products	publish	own	\N	2026-04-06 16:47:17.208	2026-04-08 10:02:51.545
40	products.unpublish.all	Dépublier tous les produits	products	unpublish	all	\N	2026-04-06 16:47:17.209	2026-04-08 10:02:51.546
41	products.unpublish.below_role	Dépublier les produits sous mon rôle	products	unpublish	below_role	\N	2026-04-06 16:47:17.211	2026-04-08 10:02:51.547
42	products.unpublish.own	Dépublier mes produits	products	unpublish	own	\N	2026-04-06 16:47:17.212	2026-04-08 10:02:51.548
43	tags.create	Créer un tag	tags	create	\N	\N	2026-04-06 16:47:17.213	2026-04-08 10:02:51.549
44	tags.view.all	Voir tous les tags	tags	view	all	\N	2026-04-06 16:47:17.214	2026-04-08 10:02:51.55
45	tags.view.own	Voir mes tags	tags	view	own	\N	2026-04-06 16:47:17.215	2026-04-08 10:02:51.551
46	tags.update.all	Modifier tous les tags	tags	update	all	\N	2026-04-06 16:47:17.216	2026-04-08 10:02:51.552
47	tags.update.below_role	Modifier les tags sous mon rôle	tags	update	below_role	\N	2026-04-06 16:47:17.217	2026-04-08 10:02:51.554
48	tags.update.own	Modifier mes tags	tags	update	own	\N	2026-04-06 16:47:17.218	2026-04-08 10:02:51.555
49	tags.delete.all	Supprimer tous les tags	tags	delete	all	\N	2026-04-06 16:47:17.219	2026-04-08 10:02:51.556
50	tags.delete.below_role	Supprimer les tags sous mon rôle	tags	delete	below_role	\N	2026-04-06 16:47:17.221	2026-04-08 10:02:51.557
51	tags.delete.own	Supprimer mes tags	tags	delete	own	\N	2026-04-06 16:47:17.222	2026-04-08 10:02:51.558
52	product_categories.create	Créer une catégorie produit	product_categories	create	\N	\N	2026-04-06 16:47:17.223	2026-04-08 10:02:51.559
53	product_categories.view.all	Voir toutes les catégories produit	product_categories	view	all	\N	2026-04-06 16:47:17.224	2026-04-08 10:02:51.56
54	product_categories.view.own	Voir mes catégories produit	product_categories	view	own	\N	2026-04-06 16:47:17.225	2026-04-08 10:02:51.562
55	product_categories.update.all	Modifier toutes les catégories produit	product_categories	update	all	\N	2026-04-06 16:47:17.227	2026-04-08 10:02:51.563
106	media.view.all	Voir tous les médias	media	view	all	\N	2026-04-06 16:47:17.287	2026-04-08 10:02:51.623
2	account.update.self	Modifier mes informations personnelles	account	update	self	\N	2026-04-06 16:47:17.154	2026-04-08 10:02:51.486
4	users.view_non_banned.all	Voir les utilisateurs non bannis	users	view_non_banned	all	\N	2026-04-06 16:47:17.158	2026-04-08 10:02:51.49
5	users.view_non_banned.below_role	Voir les utilisateurs non bannis sous mon rôle	users	view_non_banned	below_role	\N	2026-04-06 16:47:17.16	2026-04-08 10:02:51.493
6	users.view_banned.all	Voir les utilisateurs bannis	users	view_banned	all	\N	2026-04-06 16:47:17.162	2026-04-08 10:02:51.494
7	users.view_banned.below_role	Voir les utilisateurs bannis sous mon rôle	users	view_banned	below_role	\N	2026-04-06 16:47:17.164	2026-04-08 10:02:51.496
8	users.create.below_role	Créer des utilisateurs sous mon rôle	users	create	below_role	\N	2026-04-06 16:47:17.165	2026-04-08 10:02:51.497
9	users.update_profile.all	Modifier les profils utilisateurs	users	update_profile	all	\N	2026-04-06 16:47:17.166	2026-04-08 10:02:51.498
10	users.update_profile.below_role	Modifier les profils utilisateurs sous mon rôle	users	update_profile	below_role	\N	2026-04-06 16:47:17.168	2026-04-08 10:02:51.5
11	users.update_credentials.all	Modifier les identifiants utilisateurs	users	update_credentials	all	\N	2026-04-06 16:47:17.169	2026-04-08 10:02:51.501
12	users.update_credentials.below_role	Modifier les identifiants utilisateurs sous mon rôle	users	update_credentials	below_role	\N	2026-04-06 16:47:17.17	2026-04-08 10:02:51.503
13	users.ban.below_role	Bannir des utilisateurs sous mon rôle	users	ban	below_role	\N	2026-04-06 16:47:17.171	2026-04-08 10:02:51.505
14	users.unban.below_role	Réhabiliter des utilisateurs sous mon rôle	users	unban	below_role	\N	2026-04-06 16:47:17.173	2026-04-08 10:02:51.507
15	users.delete.below_role	Supprimer des utilisateurs sous mon rôle	users	delete	below_role	La suppression reste bloquée si le compte possède du contenu lié.	2026-04-06 16:47:17.175	2026-04-08 10:02:51.509
16	roles.view.all	Voir tous les rôles	roles	view	all	\N	2026-04-06 16:47:17.177	2026-04-08 10:02:51.51
17	roles.view.below_role	Voir les rôles sous mon rôle	roles	view	below_role	\N	2026-04-06 16:47:17.178	2026-04-08 10:02:51.512
18	roles.create.all	Créer des rôles	roles	create	all	\N	2026-04-06 16:47:17.18	2026-04-08 10:02:51.513
19	roles.update.all	Modifier des rôles	roles	update	all	\N	2026-04-06 16:47:17.181	2026-04-08 10:02:51.515
20	roles.delete.all	Supprimer des rôles	roles	delete	all	\N	2026-04-06 16:47:17.182	2026-04-08 10:02:51.516
22	products.create	Créer un produit	products	create	\N	\N	2026-04-06 16:47:17.186	2026-04-08 10:02:51.519
77	articles.delete.below_role	Supprimer les articles sous mon rôle	articles	delete	below_role	\N	2026-04-06 16:47:17.253	2026-04-08 10:02:51.588
78	articles.delete.own	Supprimer mes articles	articles	delete	own	\N	2026-04-06 16:47:17.254	2026-04-08 10:02:51.589
79	articles.feature.all	Mettre en avant tous les articles	articles	feature	all	\N	2026-04-06 16:47:17.255	2026-04-08 10:02:51.59
80	articles.feature.below_role	Mettre en avant les articles sous mon rôle	articles	feature	below_role	\N	2026-04-06 16:47:17.257	2026-04-08 10:02:51.591
81	articles.feature.own	Mettre en avant mes articles	articles	feature	own	\N	2026-04-06 16:47:17.258	2026-04-08 10:02:51.593
82	articles.unfeature.all	Retirer la mise en avant de tous les articles	articles	unfeature	all	\N	2026-04-06 16:47:17.259	2026-04-08 10:02:51.594
83	articles.unfeature.below_role	Retirer la mise en avant des articles sous mon rôle	articles	unfeature	below_role	\N	2026-04-06 16:47:17.26	2026-04-08 10:02:51.595
84	articles.unfeature.own	Retirer la mise en avant de mes articles	articles	unfeature	own	\N	2026-04-06 16:47:17.261	2026-04-08 10:02:51.597
85	articles.publish.all	Publier tous les articles	articles	publish	all	\N	2026-04-06 16:47:17.264	2026-04-08 10:02:51.598
86	articles.publish.below_role	Publier les articles sous mon rôle	articles	publish	below_role	\N	2026-04-06 16:47:17.265	2026-04-08 10:02:51.599
87	articles.publish.own	Publier mes articles	articles	publish	own	\N	2026-04-06 16:47:17.266	2026-04-08 10:02:51.6
88	articles.unpublish.all	Dépublier tous les articles	articles	unpublish	all	\N	2026-04-06 16:47:17.267	2026-04-08 10:02:51.601
89	articles.unpublish.below_role	Dépublier les articles sous mon rôle	articles	unpublish	below_role	\N	2026-04-06 16:47:17.268	2026-04-08 10:02:51.602
90	articles.unpublish.own	Dépublier mes articles	articles	unpublish	own	\N	2026-04-06 16:47:17.27	2026-04-08 10:02:51.604
91	articles.authors_update.all	Modifier les auteurs de tous les articles	articles	authors_update	all	Ajout et retrait d'auteurs sur un article.	2026-04-06 16:47:17.271	2026-04-08 10:02:51.605
92	articles.authors_update.below_role	Modifier les auteurs des articles sous mon rôle	articles	authors_update	below_role	Ajout et retrait d'auteurs sur un article.	2026-04-06 16:47:17.272	2026-04-08 10:02:51.606
93	articles.authors_update.own	Modifier les auteurs de mes articles	articles	authors_update	own	Ajout et retrait d'auteurs sur un article.	2026-04-06 16:47:17.273	2026-04-08 10:02:51.607
94	article_categories.view	Voir les catégories d'articles	article_categories	view	\N	\N	2026-04-06 16:47:17.274	2026-04-08 10:02:51.608
95	article_categories.create	Créer des catégories d'articles	article_categories	create	\N	\N	2026-04-06 16:47:17.275	2026-04-08 10:02:51.609
96	article_categories.delete.all	Supprimer toutes les catégories d'articles	article_categories	delete	all	\N	2026-04-06 16:47:17.276	2026-04-08 10:02:51.61
97	article_categories.delete.below_role	Supprimer les catégories d'articles sous mon rôle	article_categories	delete	below_role	\N	2026-04-06 16:47:17.277	2026-04-08 10:02:51.612
98	article_categories.delete.own	Supprimer mes catégories d'articles	article_categories	delete	own	\N	2026-04-06 16:47:17.278	2026-04-08 10:02:51.613
99	article_categories.force_remove.all	Forcer la suppression de toutes les catégories d'articles	article_categories	force_remove	all	Détache les articles liés avant de supprimer définitivement la catégorie.	2026-04-06 16:47:17.279	2026-04-08 10:02:51.615
100	article_categories.force_remove.below_role	Forcer la suppression des catégories d'articles sous mon rôle	article_categories	force_remove	below_role	Détache les articles liés avant de supprimer définitivement la catégorie.	2026-04-06 16:47:17.28	2026-04-08 10:02:51.616
101	article_categories.force_remove.own	Forcer la suppression de mes catégories d'articles	article_categories	force_remove	own	Détache les articles liés avant de supprimer définitivement la catégorie.	2026-04-06 16:47:17.281	2026-04-08 10:02:51.617
102	audit.read.self	Voir mes journaux d'audit	audit	read	self	\N	2026-04-06 16:47:17.283	2026-04-08 10:02:51.618
103	audit.read.all	Voir tous les journaux d'audit	audit	read	all	\N	2026-04-06 16:47:17.284	2026-04-08 10:02:51.619
104	audit.read.below_role	Voir les journaux d'audit sous mon rôle	audit	read	below_role	\N	2026-04-06 16:47:17.285	2026-04-08 10:02:51.621
105	media.create	Ajouter un média	media	create	\N	\N	2026-04-06 16:47:17.286	2026-04-08 10:02:51.622
57	product_categories.update.own	Modifier mes catégories produit	product_categories	update	own	\N	2026-04-06 16:47:17.23	2026-04-08 10:02:51.565
58	product_categories.delete.all	Supprimer toutes les catégories produit	product_categories	delete	all	La suppression reste bloquée si la catégorie est encore attachée à un produit.	2026-04-06 16:47:17.231	2026-04-08 10:02:51.566
60	product_categories.delete.own	Supprimer mes catégories produit	product_categories	delete	own	La suppression reste bloquée si la catégorie est encore attachée à un produit.	2026-04-06 16:47:17.234	2026-04-08 10:02:51.568
61	brands.create	Créer une marque	brands	create	\N	\N	2026-04-06 16:47:17.235	2026-04-08 10:02:51.569
62	brands.view.all	Voir toutes les marques	brands	view	all	\N	2026-04-06 16:47:17.236	2026-04-08 10:02:51.57
63	brands.view.own	Voir mes marques	brands	view	own	\N	2026-04-06 16:47:17.237	2026-04-08 10:02:51.571
64	brands.update.all	Modifier toutes les marques	brands	update	all	\N	2026-04-06 16:47:17.239	2026-04-08 10:02:51.573
65	brands.update.below_role	Modifier les marques sous mon rôle	brands	update	below_role	\N	2026-04-06 16:47:17.24	2026-04-08 10:02:51.574
66	brands.update.own	Modifier mes marques	brands	update	own	\N	2026-04-06 16:47:17.241	2026-04-08 10:02:51.575
67	brands.delete.all	Supprimer toutes les marques	brands	delete	all	La suppression reste bloquée si la marque est encore attachée à un produit.	2026-04-06 16:47:17.242	2026-04-08 10:02:51.576
68	brands.delete.below_role	Supprimer les marques sous mon rôle	brands	delete	below_role	La suppression reste bloquée si la marque est encore attachée à un produit.	2026-04-06 16:47:17.243	2026-04-08 10:02:51.578
69	brands.delete.own	Supprimer mes marques	brands	delete	own	La suppression reste bloquée si la marque est encore attachée à un produit.	2026-04-06 16:47:17.244	2026-04-08 10:02:51.579
70	articles.create	Créer un article	articles	create	\N	\N	2026-04-06 16:47:17.245	2026-04-08 10:02:51.58
71	articles.view.all	Voir tous les articles	articles	view	all	\N	2026-04-06 16:47:17.246	2026-04-08 10:02:51.582
72	articles.view.own	Voir mes articles	articles	view	own	\N	2026-04-06 16:47:17.247	2026-04-08 10:02:51.583
73	articles.update.all	Modifier tous les articles	articles	update	all	\N	2026-04-06 16:47:17.248	2026-04-08 10:02:51.584
74	articles.update.below_role	Modifier les articles sous mon rôle	articles	update	below_role	\N	2026-04-06 16:47:17.25	2026-04-08 10:02:51.585
75	articles.update.own	Modifier mes articles	articles	update	own	\N	2026-04-06 16:47:17.251	2026-04-08 10:02:51.586
76	articles.delete.all	Supprimer tous les articles	articles	delete	all	\N	2026-04-06 16:47:17.252	2026-04-08 10:02:51.587
1	account.read.self	Voir mon compte	account	read	self	\N	2026-04-06 16:47:17.145	2026-04-08 10:02:51.48
3	account.credentials.update.self	Modifier mes identifiants	account	update_credentials	self	\N	2026-04-06 16:47:17.156	2026-04-08 10:02:51.488
21	roles.assign.below_role	Attribuer des rôles sous mon rôle	roles	assign	below_role	Le rôle attribué et l'utilisateur cible doivent tous deux être sous votre rôle effectif.	2026-04-06 16:47:17.184	2026-04-08 10:02:51.517
56	product_categories.update.below_role	Modifier les catégories produit sous mon rôle	product_categories	update	below_role	\N	2026-04-06 16:47:17.228	2026-04-08 10:02:51.564
59	product_categories.delete.below_role	Supprimer les catégories produit sous mon rôle	product_categories	delete	below_role	La suppression reste bloquée si la catégorie est encore attachée à un produit.	2026-04-06 16:47:17.232	2026-04-08 10:02:51.567
107	media.view.own	Voir mes médias	media	view	own	\N	2026-04-06 16:47:17.288	2026-04-08 10:02:51.624
108	media.delete.all	Supprimer tous les médias	media	delete	all	\N	2026-04-06 16:47:17.29	2026-04-08 10:02:51.625
109	media.delete.below_role	Supprimer les médias sous mon rôle	media	delete	below_role	\N	2026-04-06 16:47:17.291	2026-04-08 10:02:51.626
110	media.delete.own	Supprimer mes médias	media	delete	own	\N	2026-04-06 16:47:17.292	2026-04-08 10:02:51.63
111	media.force_remove	Forcer la suppression d'un média référencé	media	force_remove	\N	Déréférence un média encore utilisé avant de le supprimer définitivement. Nécessite aussi l'accès et la gestion des médias.	2026-04-06 16:47:17.293	2026-04-08 10:02:51.632
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_attributes (product_id, value, sort_order, kind) FROM stdin;
22	25	0	WEIGHT_KG
20	25	0	WEIGHT_KG
26	1	0	WEIGHT_KG
27	1	0	WEIGHT_KG
38	1	0	VOLUME_M3
41	1	0	VOLUME_M3
40	1	0	VOLUME_M3
39	1	0	VOLUME_M3
43	1	0	VOLUME_M3
42	1	0	VOLUME_M3
47	40	0	THICKNESS_MM
46	20	0	THICKNESS_MM
37	10	0	WEIGHT_KG
21	25	0	WEIGHT_KG
48	1	0	Volume
49	5	0	Volume
50	20	0	Volume
\.


--
-- Data for Name: product_families; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_families (id, slug, name, subtitle, description, description_seo, main_image_media_id, default_product_id, created_at, updated_at) FROM stdin;
1	sikalatex	SikaLatex	\N	{"type":"doc","content":[{"type":"paragraph"}]}	\N	\N	48	2026-04-08 09:30:07.144	2026-04-08 09:40:48.654
\.


--
-- Data for Name: product_family_members; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_family_members (family_id, product_id, sort_order) FROM stdin;
1	48	0
1	49	1
1	50	2
\.


--
-- Data for Name: product_media_links; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_media_links (product_id, media_id, sort_order) FROM stdin;
1	35	0
3	37	0
4	39	0
5	41	0
2	36	0
7	63	0
6	63	0
8	63	0
9	63	0
10	63	0
12	63	0
11	63	0
14	63	0
13	63	0
\.


--
-- Data for Name: product_pack_lines; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_pack_lines (pack_product_id, product_id, quantity, sort_order) FROM stdin;
\.


--
-- Data for Name: product_subcategories; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_subcategories (id, category_id, name, subtitle, slug, description, description_seo, image_media_id, sort_order, is_active, created_at, updated_at) FROM stdin;
7	2	Sables et graviers	Granulats pour construction	sables-et-graviers	Indispensables à tous vos travaux de construction, nos sables et graviers sont sélectionnés pour leur qualité et leur conformité. Ils garantissent une base solide pour le béton, les mortiers et les travaux d’aménagement.	Sables et graviers pour construction et maçonnerie. Granulats de qualité pour béton, mortier et travaux d’aménagement, adaptés aux exigences du bâtiment.	32	0	t	2026-04-07 07:54:22.14	2026-04-07 15:14:27.426
8	2	Treillis soudés et fers à béton	Armatures et renforcement	treillis-soudes-et-fers-a-beton	Assurez la solidité de vos structures grâce à notre gamme de treillis soudés et fers à béton. Ces armatures garantissent résistance mécanique et durabilité pour tous vos projets de construction.	Treillis soudés et fers à béton pour renforcer vos structures. Armatures essentielles pour garantir solidité, stabilité et durabilité des ouvrages en béton.	34	2	t	2026-04-07 07:54:22.141	2026-04-07 15:14:27.428
2	1	Carrelage intérieur	Confort et design intérieur	carrelage-interieur	Apportez élégance et confort à vos espaces avec notre sélection de revêtements de sol intérieur. Adaptés à tous les styles, ces produits combinent design, résistance et facilité d’entretien pour un usage quotidien optimal.	Revêtements de sol intérieur : carrelage, grès cérame et solutions décoratives pour maison et bureau. Design moderne, résistance et entretien facile.	29	0	t	2026-04-07 07:52:21.361	2026-04-08 07:20:14.284
1	1	Carrelage extérieur	Terrasses et espaces extérieurs	carrelage-exterieur	Conçus pour résister aux conditions extérieures les plus exigeantes, nos revêtements de sol extérieur allient robustesse, sécurité et esthétique. Idéals pour terrasses, jardins et zones autour des piscines, ils offrent une excellente durabilité dans le temps.	Revêtements de sol extérieur pour terrasses, jardins et piscines. Carrelage et matériaux résistants aux intempéries, durables et esthétiques pour vos aménagements extérieurs.	28	1	t	2026-04-07 07:52:21.359	2026-04-08 07:20:14.285
3	1	Faïence murale	Habillage mural décoratif	faience-murale	La faïence murale est idéale pour habiller vos murs avec style tout en assurant protection et facilité d’entretien. Parfaite pour cuisines, salles de bain et espaces décoratifs, elle apporte une touche raffinée à vos intérieurs.	Faïence murale pour salle de bain et cuisine. Revêtements muraux esthétiques, résistants à l’humidité et faciles à entretenir pour des espaces modernes.	9	2	t	2026-04-07 07:52:21.362	2026-04-08 07:20:14.286
4	1	Plinthes et accessoires	Finitions et détails essentiels	plinthes-et-accessoires	Complétez vos revêtements avec notre gamme de plinthes et accessoires. Ces éléments assurent une finition soignée, protègent vos murs et garantissent une transition harmonieuse entre les surfaces.	Plinthes et accessoires pour revêtements de sol et murs. Finitions esthétiques et solutions pratiques pour protéger et valoriser vos espaces.	24	3	t	2026-04-07 07:52:21.362	2026-04-08 07:20:14.287
6	1	Mosaïque à l’italienne	Design artisanal haut de gamme	mosaique-a-l-italienne	Apportez une touche d’élégance et de raffinement avec la mosaïque à l’italienne. Inspirée du savoir-faire artisanal, elle permet de créer des compositions uniques et des espaces au caractère exceptionnel.	Mosaïque à l’italienne : revêtements décoratifs haut de gamme pour sols et murs. Idéal pour créer des designs uniques avec une finition élégante et durable.	17	4	t	2026-04-07 07:52:21.364	2026-04-08 07:20:14.288
10	2	Briques	Maçonnerie et élévation	briques	Les briques constituent un élément essentiel pour la construction de murs et structures. Robustes et polyvalentes, elles offrent isolation, résistance et facilité de mise en œuvre.	Briques de construction pour murs et structures. Matériaux résistants, isolants et durables pour tous vos projets de maçonnerie.	3	1	t	2026-04-07 07:55:08.356	2026-04-07 15:14:27.427
9	2	Ciments et produits en béton	Liants et solutions béton	ciments-et-produits-en-beton	Notre sélection de ciments et produits en béton répond aux besoins des professionnels comme des particuliers. Adaptés à divers usages, ils assurent performance, résistance et longévité des constructions.	Ciments et produits en béton pour tous types de travaux. Solutions fiables pour maçonnerie, fondations et structures durables.	5	3	t	2026-04-07 07:54:22.142	2026-04-07 15:14:27.429
12	3	Isolation thermique	Confort et efficacité énergétique	isolation-thermique	Améliorez le confort de vos espaces et réduisez vos consommations énergétiques grâce à nos solutions d’isolation thermique. Adaptées aux constructions neuves et aux rénovations, elles assurent une performance optimale été comme hiver.	Isolation thermique pour bâtiments : solutions performantes pour améliorer le confort et réduire la consommation énergétique. Idéal pour constructions neuves et rénovation.	11	1	t	2026-04-07 07:58:55.825	2026-04-07 14:11:41.271
13	4	Éviers de cuisine	Praticité au quotidien	eviers-de-cuisine	Découvrez notre sélection d’éviers de cuisine conçus pour répondre aux exigences du quotidien. Résistants, fonctionnels et esthétiques, ils s’intègrent parfaitement à tous les styles de cuisine.	Éviers de cuisine modernes et résistants. Solutions pratiques et esthétiques pour un usage quotidien optimal.	8	0	t	2026-04-07 08:02:47.905	2026-04-07 14:12:29.787
11	3	Étanchéité	Protection contre l’humidité	etancheite	Protégez vos structures contre les infiltrations d’eau grâce à nos solutions d’étanchéité adaptées à tous types de surfaces. Toitures, terrasses, murs ou fondations, nos produits garantissent une protection durable et une parfaite résistance aux conditions extérieures.	Solutions d’étanchéité pour toitures, terrasses, murs et fondations. Produits efficaces contre l’humidité et les infiltrations pour garantir la durabilité des bâtiments.	7	0	t	2026-04-07 07:58:55.824	2026-04-07 14:11:41.27
14	4	Robinetterie	Design et performance	robinetterie	Notre gamme de robinetterie allie précision, durabilité et esthétique. Adaptée aux cuisines et salles de bain, elle garantit confort d’utilisation et performance au quotidien.	Robinetterie pour salle de bain et cuisine : mitigeurs, mélangeurs et solutions modernes. Design élégant et performance durable.	31	1	t	2026-04-07 08:02:47.906	2026-04-07 14:12:29.789
15	4	Baignoires	Confort et détente	baignoires	Transformez votre salle de bain en espace de relaxation avec notre gamme de baignoires. Pensées pour le confort et le bien-être, elles combinent design contemporain et ergonomie.	Baignoires modernes pour salle de bain : confort, design et durabilité. Idéal pour créer un espace de détente et de bien-être chez vous.	1	2	t	2026-04-07 08:02:47.907	2026-04-07 14:12:29.79
16	4	Jacuzzis	Bien-être et hydromassage	jacuzzis	Offrez-vous une expérience de relaxation haut de gamme avec nos jacuzzis. Équipés de systèmes d’hydromassage, ils créent un véritable espace de bien-être à domicile.	Jacuzzis et spas pour maison : solutions de bien-être avec hydromassage. Idéal pour détente, confort et aménagement haut de gamme.	12	3	t	2026-04-07 08:02:47.908	2026-04-07 14:12:29.791
19	5	Béton ciré	Finition moderne et minimaliste	beton-cire	Le béton ciré offre une esthétique contemporaine et épurée pour vos sols et murs. Apprécié pour sa continuité visuelle et sa résistance, il s’intègre parfaitement dans les projets modernes et haut de gamme.	Béton ciré pour sols et murs : finition moderne, résistante et esthétique. Idéal pour un design minimaliste et contemporain.	2	0	t	2026-04-07 08:05:13.593	2026-04-07 14:13:30.477
21	5	Peintures d'extérieur	Protection et esthétique	peintures-d-exterieur	Protégez et embellissez vos façades avec nos peintures d’extérieur conçues pour résister aux conditions climatiques. Elles offrent durabilité, tenue des couleurs et protection contre les agressions extérieures.	Peintures d’extérieur résistantes aux intempéries. Idéal pour façades, murs et surfaces extérieures avec protection durable et rendu esthétique.	19	2	t	2026-04-07 08:05:13.601	2026-04-07 14:13:30.479
24	6	Pierres de Bali	Ambiance naturelle et exotique	pierres-de-bali	Créez une atmosphère unique avec les pierres de Bali, reconnues pour leurs reflets naturels et leur élégance. Idéales pour piscines et espaces extérieurs, elles apportent une touche haut de gamme et apaisante.	Pierres de Bali pour piscine : revêtements naturels aux reflets uniques. Idéal pour créer une ambiance exotique et haut de gamme.	22	0	t	2026-04-07 08:07:30.142	2026-04-07 14:13:48.082
22	6	Margelles et finitions	Contours et finitions piscine	margelles-et-finitions	Apportez la touche finale à votre piscine avec notre sélection de margelles et finitions. Conçues pour allier sécurité, résistance et esthétique, elles structurent élégamment vos espaces extérieurs.	Margelles et finitions pour piscine : solutions esthétiques et antidérapantes pour sécuriser et sublimer les contours de votre bassin.	14	1	t	2026-04-07 08:06:49.866	2026-04-07 14:13:48.083
17	4	Lavabos et vasques	Élégance et fonctionnalité	lavabos-et-vasques	Apportez une touche de modernité à votre salle de bain avec notre sélection de lavabos et vasques. Alliant design, praticité et qualité des matériaux, ils s’adaptent à tous les styles d’aménagement.	Lavabos et vasques design pour salle de bain. Large choix de modèles modernes, pratiques et durables pour un espace élégant et fonctionnel.	13	4	t	2026-04-07 08:02:47.909	2026-04-07 14:12:29.792
18	4	Espace douche	Solutions douche modernes	espace-douche	Créez un espace douche fonctionnel et élégant avec nos solutions complètes. Parois, receveurs et équipements sont pensés pour allier confort, sécurité et design contemporain.	Espace douche : parois, receveurs et équipements modernes pour salle de bain. Solutions design, pratiques et durables.	6	5	t	2026-04-07 08:02:47.91	2026-04-07 14:12:29.793
23	6	Mosaïques	Revêtements décoratifs piscine	mosaiques	Personnalisez votre piscine avec nos mosaïques décoratives aux finitions raffinées. Résistantes à l’eau et aux produits chimiques, elles permettent de créer des designs uniques et lumineux.	Mosaïques pour piscine : revêtements résistants et décoratifs pour personnaliser votre bassin avec élégance et durabilité.	18	2	t	2026-04-07 08:06:49.867	2026-04-07 14:13:48.084
25	7	Portes coulissantes	Gain d’espace moderne	portes-coulissantes	Optimisez vos espaces avec nos portes coulissantes au design contemporain. Pratiques et élégantes, elles permettent une circulation fluide tout en apportant une touche moderne à vos intérieurs.	Portes coulissantes modernes pour intérieur : solutions pratiques et design pour optimiser l’espace et améliorer la circulation.	25	0	t	2026-04-07 08:08:53.442	2026-04-07 14:13:59.327
26	7	Portes en bois	Authenticité et chaleur	portes-en-bois	Apportez du caractère à vos espaces avec nos portes en bois. Robustes et intemporelles, elles offrent une excellente isolation et s’intègrent parfaitement à tous les styles d’aménagement.	Portes en bois pour intérieur et extérieur : design authentique, isolation et durabilité pour sublimer vos espaces.	26	1	t	2026-04-07 08:08:53.445	2026-04-07 14:13:59.328
20	5	Peintures d'intérieur	Couleurs pour vos espaces	peintures-d-interieur	Donnez vie à vos espaces intérieurs avec notre sélection de peintures alliant qualité, couvrance et richesse des couleurs. Idéales pour créer des ambiances uniques, elles s’adaptent à tous les styles décoratifs.	Peintures d’intérieur de qualité : large choix de couleurs, finitions mates, satinées ou brillantes. Idéal pour décorer et personnaliser vos espaces.	20	1	t	2026-04-07 08:05:13.599	2026-04-07 14:13:30.478
27	2	Adjuvants	Amélioration des performances béton	adjuvants	Les adjuvants permettent d’optimiser les propriétés du béton selon les besoins du chantier. Ils améliorent la résistance, la maniabilité et la durabilité pour garantir des performances adaptées à chaque application.	Adjuvants pour béton : solutions pour améliorer résistance, durabilité et maniabilité. Idéal pour optimiser les performances des ouvrages en construction.	4	4	t	2026-04-07 15:13:24.492	2026-04-07 15:14:27.43
29	1	Grès effet parquet	Chaleur du bois, résistance du grès	gres-effet-parquet	Alliez l’esthétique chaleureuse du bois à la résistance du carrelage avec le grès effet parquet. Idéal pour toutes les pièces, il offre un rendu naturel sans les contraintes d’entretien du bois.	Grès effet parquet : carrelage imitation bois pour sols. Résistant, esthétique et facile à entretenir.	\N	9	t	2026-04-08 07:17:38.727	2026-04-08 07:20:14.292
28	1	Produits de pose & finition	Solutions techniques essentielles	produits-de-pose-finition	Optimisez la pose et la durabilité de vos revêtements grâce à notre gamme de produits de pose et de finition. Colles, joints et accessoires assurent un résultat professionnel et durable.	Produits de pose et finition pour carrelage : colles, joints et solutions techniques pour une installation durable et professionnelle.	\N	10	t	2026-04-08 07:17:38.718	2026-04-08 07:20:14.295
31	1	Carrelage antidérapant R11	Sécurité et adhérence renforcée	carrelage-antiderapant-r11	Idéal pour les zones humides ou extérieures, le carrelage antidérapant R11 offre une excellente adhérence et garantit la sécurité au quotidien. Il allie performance technique et esthétique pour vos terrasses, piscines et espaces à fort passage.	Carrelage antidérapant R11 pour extérieur et zones humides. Revêtement sécurisé, résistant et esthétique pour terrasses, piscines et espaces publics.	\N	5	t	2026-04-08 07:17:38.73	2026-04-08 07:20:14.289
30	1	Grandes dalles	Formats larges et modernes	grandes-dalles	Les grandes dalles apportent une esthétique contemporaine grâce à leurs formats généreux et leurs joints réduits. Elles créent des surfaces élégantes, homogènes et faciles à entretenir.	Grandes dalles de carrelage pour sols et murs. Formats modernes avec peu de joints pour un rendu esthétique, minimaliste et facile à entretenir.	\N	6	t	2026-04-08 07:17:38.728	2026-04-08 07:20:14.29
32	1	Carrelage effet béton	Style urbain contemporain	carrelage-effet-beton	Inspiré des ambiances industrielles, le carrelage effet béton offre un rendu moderne et épuré. Résistant et facile d’entretien, il est idéal pour créer des espaces élégants et minimalistes.	Carrelage effet béton pour intérieur et extérieur. Style industriel moderne, résistant et facile à entretenir.	\N	7	t	2026-04-08 07:17:38.732	2026-04-08 07:20:14.291
33	1	Grès effet pierre naturelle	Aspect naturel et authentique	gres-effet-pierre-naturelle	Le grès effet pierre naturelle reproduit fidèlement l’aspect des pierres tout en offrant les avantages techniques du carrelage. Il apporte charme et authenticité à vos espaces intérieurs et extérieurs.	Grès effet pierre naturelle : carrelage au rendu authentique, résistant et durable pour sols et murs.	\N	8	t	2026-04-08 07:17:38.733	2026-04-08 07:20:14.294
\.


--
-- Data for Name: product_subcategory_links; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_subcategory_links (product_id, subcategory_id) FROM stdin;
1	10
3	10
4	10
5	10
2	10
7	8
6	8
8	8
9	8
12	8
11	8
14	8
15	9
13	8
18	9
19	9
22	9
20	9
16	9
17	9
24	9
23	9
25	9
26	27
27	27
28	8
29	8
30	8
31	8
32	8
33	8
38	9
41	7
40	7
39	7
43	7
42	7
44	28
44	11
45	28
45	11
47	12
46	12
37	8
21	9
48	27
49	27
50	27
\.


--
-- Data for Name: product_types; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.product_types (id, name, subtitle, slug, description, description_seo, image_media_id, sort_order, is_active, created_at, updated_at, theme_color) FROM stdin;
3	Isolation et étanchéité	Protection thermique et étanche	isolation-et-etancheite	Optimisez la performance de vos bâtiments grâce à nos solutions d’isolation et d’étanchéité. Protégez vos structures contre les infiltrations, améliorez le confort thermique et assurez la longévité de vos installations.	Solutions d’isolation et d’étanchéité pour bâtiments : protection contre l’humidité, amélioration thermique et durabilité des structures. Produits adaptés aux normes modernes de construction.	10	2	t	2026-04-07 07:58:55.821	2026-04-07 14:11:41.267	#00B894
7	Portes et menuiserie	Portes et finitions bois	portes-et-menuiserie	Découvrez notre gamme de portes et solutions de menuiserie conçues pour allier sécurité, esthétique et durabilité. Portes intérieures, extérieures et éléments de finition s’intègrent harmonieusement à tous les styles d’aménagement.	Portes intérieures et extérieures, éléments de menuiserie et finitions bois. Des solutions esthétiques et durables pour améliorer sécurité, isolation et design de vos espaces.	27	6	t	2026-04-07 08:08:53.437	2026-04-07 14:13:59.325	#C97A40
4	Salle de bain et cuisine	Équipements et robinetterie	salle-de-bain-et-cuisine	Aménagez des espaces fonctionnels et élégants avec notre gamme dédiée à la salle de bain et à la cuisine. Robinetterie, équipements sanitaires et accessoires allient design contemporain et performance au quotidien.	Équipements pour salle de bain et cuisine : robinetterie, sanitaires, accessoires modernes et durables. Des solutions design pour améliorer confort et fonctionnalité.	33	3	t	2026-04-07 08:02:47.901	2026-04-07 14:12:29.785	#3D9DF2
1	Revêtements de sols et murs	Sols, murs et finitions	revetements-de-sols-et-murs	Explorez notre sélection de revêtements de sols et murs conçus pour allier esthétique, durabilité et facilité d’entretien. Du carrelage intérieur aux solutions extérieures, en passant par la faïence et les finitions décoratives, chaque produit est choisi pour sublimer vos espaces.	Découvrez nos revêtements de sols et murs : carrelage intérieur et extérieur, faïence murale, mosaïque et finitions décoratives. Des solutions durables et esthétiques pour tous vos projets d’aménagement.	30	0	t	2026-04-07 07:52:21.354	2026-04-08 07:20:14.281	#00AEEF
5	Peintures et décoration	Couleurs et finitions	peintures-et-decoration	Apportez du caractère à vos espaces avec notre gamme de peintures et produits de décoration. Couleurs, textures et effets s’adaptent à tous les styles pour créer des ambiances uniques et harmonieuses.	Peintures intérieures et extérieures, produits décoratifs et finitions murales. Large choix de couleurs et effets pour personnaliser vos espaces avec style.	21	4	t	2026-04-07 08:05:13.588	2026-04-07 14:13:30.475	#9B5DE5
6	Piscine	Aménagements extérieurs premium	piscine	Créez un espace de détente unique avec notre sélection dédiée à l’univers de la piscine. Revêtements, équipements et accessoires sont pensés pour allier esthétique, confort et résistance en extérieur.	Produits pour piscine : revêtements, équipements et accessoires pour un aménagement extérieur durable et esthétique. Idéal pour créer un espace de détente haut de gamme.	23	5	t	2026-04-07 08:06:49.862	2026-04-07 14:13:48.08	#00C2FF
2	Matériaux de construction	Bases solides et fiables	materiaux-de-construction	Retrouvez tous les matériaux essentiels pour vos projets de construction, de la structure aux fondations. Sables, graviers, ciments et aciers sont sélectionnés pour garantir résistance, qualité et conformité aux exigences du bâtiment.	Vente de matériaux de construction : sable, gravier, ciment, fer à béton et treillis soudés. Des produits fiables pour assurer la solidité et la durabilité de vos chantiers.	15	1	t	2026-04-07 07:54:22.136	2026-04-07 15:14:27.424	#FF8A00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.products (id, sku, slug, kind, name, description, description_seo, base_price_amount, vat_rate, stock, stock_unit, visibility, price_visibility, stock_visibility, lifecycle, commercial_mode, tags, created_at, updated_at, brand_code, datasheet_media_id) FROM stdin;
11	00221160	cadre-17-30-en-fer-de-05	SINGLE	Cadre 17/30 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.770	19	40.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Cadre Fer 17/30 05	2026-04-07 13:16:46.868	2026-04-07 13:19:57.259	\N	\N
1	B06	brique-de-06-680-pl	SINGLE	Brique de 06 (680/PL)	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.380	19	4014.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Brique A 06	2026-04-07 10:42:53.089	2026-04-07 12:56:54.801	\N	\N
3	00178273	brique-de-12-bcm-depot	SINGLE	Brique de 12 BCM DEPOT	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.950	19	3333.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Brique A 12 BCM DEPOT	2026-04-07 12:56:20.875	2026-04-07 12:57:43.259	\N	\N
14	00225762	cadre-25-30-en-fer-de-05	SINGLE	Cadre 25/30 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.950	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Cadre Fer 25/30 05	2026-04-07 13:36:01.17	2026-04-07 13:36:11.739	\N	\N
15	SOT05CBL2	ciment-blanc-sac-rouge	SINGLE	Ciment blanc sac rouge	{"type":"doc","content":[{"type":"paragraph"}]}	\N	29.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment blanc sac rouge	2026-04-07 13:41:00.228	2026-04-07 13:41:00.228	\N	\N
4	H16	brique-de-h16-bcm-sbm-depot	SINGLE	Brique de H16 BCM/SBM DEPOT	{"type":"doc","content":[{"type":"paragraph"}]}	\N	1.450	19	1572.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Brique H 16 BCM SBM DEPOT	2026-04-07 13:00:53.387	2026-04-07 13:04:39.95	\N	\N
5	PLATR	brique-platiere-essahel-depot	SINGLE	Brique platière ESSAHEL DEPOT	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.815	19	5954.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Brique Platière ESSAHEL DEPOT	2026-04-07 13:03:07.069	2026-04-07 13:04:44.288	\N	\N
2	B08	brique-de-08-essahel-depot	SINGLE	Brique de 08 ESSAHEL DEPOT	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.820	19	5858.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Brique A 08 ESSAHEL DEPOT	2026-04-07 12:54:56.765	2026-04-07 13:06:46.233	\N	\N
7	00004005	cadre-10-15-en-fer-de-05	SINGLE	Cadre 10/15 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.420	19	1621.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer Cadre 10/15 05	2026-04-07 13:09:50.192	2026-04-07 13:09:50.192	\N	\N
6	00207768	cadre-10-10-en-fer-de-05	SINGLE	Cadre 10/10 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.360	19	30.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer Cadre 10/10 05	2026-04-07 13:07:58.719	2026-04-07 13:10:30.562	\N	\N
8	00004006	cadre-15-15-en-fer-de-05	SINGLE	Cadre 15/15 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.490	19	255.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer Cadre 15/15 05	2026-04-07 13:12:06.561	2026-04-07 13:12:06.561	\N	\N
9	00184984	cadre-15-30-en-fer-de-05	SINGLE	Cadre 15/30 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.730	19	7.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer Cadre 15/30 05	2026-04-07 13:13:33.687	2026-04-07 13:13:33.687	\N	\N
10	DIV01CADR40	cadre-15-40-en-fer-de-05	SINGLE	Cadre 15/40 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.910	19	200.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Cadre 15/40 Fer 05	2026-04-07 13:14:35.578	2026-04-07 13:14:35.578	\N	\N
12	00237574	cadre-20-35-en-fer-de-05	SINGLE	Cadre 20/35 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.950	19	190.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer Cadre 05 20/35	2026-04-07 13:18:16.594	2026-04-07 13:18:16.594	\N	\N
13	00219853	cadre-25-25-en-fer-de-05	SINGLE	Cadre 25/25 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.810	19	450.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Cadre Fer 05 25/25	2026-04-07 13:21:06.379	2026-04-07 13:55:20.137	\N	\N
18	00201575	ciment-colle-fm2000-blanc	SINGLE	Ciment colle FM2000 blanc	{"type":"doc","content":[{"type":"paragraph"}]}	\N	25.263	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle FM2000 blanc	2026-04-07 14:26:45.782	2026-04-07 14:26:45.782	DEUTSCH_COLOR	\N
19	00201568	ciment-colle-fm3000-piscine	SINGLE	Ciment colle FM3000 (Piscine)	{"type":"doc","content":[{"type":"paragraph"}]}	\N	40.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle FM 3000 Piscine	2026-04-07 14:28:26.776	2026-04-07 14:30:29.574	DEUTSCH_COLOR	\N
22	00227926	ciment-colle-sika-ceram-206-blanc-sac-25kg	SINGLE	Ciment colle Sika céram 206 blanc sac 25KG	{"type":"doc","content":[{"type":"paragraph"}]}	\N	43.684	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle céram blanc sac 25KG	2026-04-07 14:34:43.225	2026-04-07 14:34:43.225	SIKA	\N
20	00227896	ciment-colle-sika-ceram-103-blanc-sac-25kg	SINGLE	Ciment colle Sika céram 103 blanc sac 25KG	{"type":"doc","content":[{"type":"paragraph"}]}	\N	15.265	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle Céram 103 25KG sac	2026-04-07 14:30:17.026	2026-04-07 14:35:06.054	SIKA	\N
16	00201599	ciment-colle-fm-eco-blanc	SINGLE	Ciment colle FM-ECO blanc	{"type":"doc","content":[{"type":"paragraph"}]}	\N	12.630	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle FM-ECO blanc	2026-04-07 14:23:43.316	2026-04-07 14:39:17.446	DEUTSCH_COLOR	\N
17	00201582	ciment-colle-fm1000-blanc	SINGLE	Ciment colle FM1000 blanc	{"type":"doc","content":[{"type":"paragraph"}]}	\N	16.842	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle FM 1000 blanc	2026-04-07 14:25:35.747	2026-04-07 14:59:48.486	DEUTSCH_COLOR	\N
24	HRSGABES	ciment-de-gabes-h-r-s-par-sac	SINGLE	Ciment de Gabès H.R.S par sac	{"type":"doc","content":[{"type":"paragraph"}]}	\N	21.843	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment Gabès HRS sac	2026-04-07 15:04:28.142	2026-04-07 15:04:28.142	CIMENT_DE_GABES	\N
23	CPAGABES	ciment-de-gabes-cpa-par-sac	SINGLE	Ciment de Gabès CPA par sac	{"type":"doc","content":[{"type":"paragraph"}]}	\N	20.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment Gabès CPA sac	2026-04-07 15:02:17.4	2026-04-07 15:04:57.602	CIMENT_DE_GABES	\N
25	NORMALGABES	ciment-gabes-normal-32-5-par-sac	SINGLE	Ciment Gabès normal 32.5 par sac	{"type":"doc","content":[{"type":"paragraph"}]}	\N	18.684	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment Gabès normal 32.5 sac	2026-04-07 15:06:18.096	2026-04-07 15:06:18.096	CIMENT_DE_GABES	\N
26	00223607	admix-ciment-1kg-par-sachet	SINGLE	Admix ciment 1KG par sachet	{"type":"doc","content":[{"type":"paragraph"}]}	\N	7.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Admix ciment 1KG sachet	2026-04-07 15:16:43.537	2026-04-07 15:26:23.778	DEUTSCH_COLOR	\N
27	00219631	admix-s2-bidon-1kg	SINGLE	Admix S2 bidon 1KG	{"type":"doc","content":[{"type":"paragraph"}]}	\N	12.500	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	S2 Admix Bidon 1KG	2026-04-07 15:20:38.838	2026-04-07 15:26:29.875	DEUTSCH_COLOR	\N
28	F06	fer-a-beton-de-06	SINGLE	Fer à béton de 06	{"type":"doc","content":[{"type":"paragraph"}]}	\N	3.110	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer béton 06	2026-04-07 15:32:08.759	2026-04-07 15:32:08.759	\N	\N
29	F08	fer-a-beton-de-08	SINGLE	Fer à béton de 08	{"type":"doc","content":[{"type":"paragraph"}]}	\N	14.950	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer béton 08	2026-04-07 15:33:23.564	2026-04-07 15:33:23.564	\N	\N
30	F10	fer-a-beton-de-10	SINGLE	Fer à béton de 10	{"type":"doc","content":[{"type":"paragraph"}]}	\N	21.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer béton 10	2026-04-07 15:34:09.073	2026-04-07 15:34:09.073	\N	\N
32	00183581	etrier-4-30-en-fer-de-05	SINGLE	Etrier 4/30 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.580	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	étrier fer 05 4/30	2026-04-07 15:39:01.227	2026-04-07 15:39:01.227	\N	\N
33	00199278	etrier-4-40-en-fer-de-05	SINGLE	Etrier 4/40 en fer de 05	{"type":"doc","content":[{"type":"paragraph"}]}	\N	0.750	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	fer étrier 4/40 05	2026-04-07 15:39:56.429	2026-04-07 15:39:56.429	\N	\N
37	FIL	fil-de-recuit-rouleau-de-10kg	SINGLE	Fil de recuit rouleau de 10KG	{"type":"doc","content":[{"type":"paragraph"}]}	\N	49.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fil recuit rouleau 10KG	2026-04-08 07:53:20.694	2026-04-08 09:12:12.036	\N	\N
31	F12	fer-a-beton-de-12	SINGLE	Fer à béton de 12	{"type":"doc","content":[{"type":"paragraph"}]}	\N	29.500	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fer béton 12	2026-04-07 15:34:53.37	2026-04-07 15:51:17.954	\N	\N
38	GBETON	fourn-g-beton-1m	SINGLE	Fourn G.Béton 1M	{"type":"doc","content":[{"type":"paragraph"}]}	\N	56.842	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fourniture gros béton	2026-04-08 07:57:30.554	2026-04-08 07:57:30.554	\N	\N
48	00194792	sikalatex-bidon-1l	VARIANT	SikaLatex Bidon 1L	{"type":"doc","content":[{"type":"paragraph"}]}	\N	19.180	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Latex Bidon SikaLatex	2026-04-08 09:30:07.148	2026-04-08 09:40:48.629	SIKA	\N
21	00227902	ciment-colle-sika-ceram-106-blanc-sac-25kg	SINGLE	Ciment colle Sika céram 106 blanc sac 25KG	{"type":"doc","content":[{"type":"paragraph"}]}	\N	26.316	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Ciment colle céram 106 25KG sac	2026-04-07 14:31:33.026	2026-04-08 09:12:45.722	SIKA	\N
41	CONCASSAGE	fourn-sable-concassage-04-1m	SINGLE	Fourn sable concassage 04 1M	{"type":"doc","content":[{"type":"paragraph"}]}	\N	36.315	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fourniture sable concassage 04	2026-04-08 08:01:33.334	2026-04-08 08:01:33.334	\N	\N
40	GRAVIER	fourn-gravier-4-15-1m	SINGLE	Fourn Gravier 4/15 1M	{"type":"doc","content":[{"type":"paragraph"}]}	\N	71.052	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fourniture gravier 4/15	2026-04-08 08:00:09.205	2026-04-08 08:01:42.925	\N	\N
39	00005524	fourn-gravier-4-08-1m	SINGLE	Fourn Gravier 4/08 1M	{"type":"doc","content":[{"type":"paragraph"}]}	\N	84.210	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fourniture gravier 4/08	2026-04-08 07:58:55.198	2026-04-08 08:02:00.233	\N	\N
49	00229470	sikalatex-bidon-5l	VARIANT	SikaLatex Bidon 5L	{"type":"doc","content":[{"type":"paragraph"}]}	\N	93.500	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Latex SikaLatex Bidon 5L	2026-04-08 09:30:07.165	2026-04-08 09:40:48.64	SIKA	\N
50	00194785	sikalatex-bidon-20l	VARIANT	SikaLatex Bidon 20L	{"type":"doc","content":[{"type":"paragraph"}]}	\N	345.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Latex SikaLatex Bidon 20L	2026-04-08 09:30:07.17	2026-04-08 09:40:48.647	SIKA	\N
42	DOUIRET	fourn-sable-douiret-1m	SINGLE	FOURN SABLE DOUIRET 1M	{"type":"doc","content":[{"type":"paragraph"}]}	\N	55.790	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Fourniture sable douiret	2026-04-08 08:04:11.818	2026-04-08 08:13:59.335	\N	\N
43	OUDHREF	fourn-sable-ouedh-crible-1m	SINGLE	FOURN SABLE OUEDH. CRIBLE 1M	{"type":"doc","content":[{"type":"paragraph"}]}	\N	44.737	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	SABLE Fourniture OUEDH. CRIBLE 1M	2026-04-08 08:13:21.194	2026-04-08 08:14:02.091	\N	\N
44	00180146	grillage-en-fibre-30-cm-50-ml	SINGLE	Grillage en fibre 30 CM / 50 ML	{"type":"doc","content":[{"type":"paragraph"}]}	\N	25.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	GRILLAGE FIBRE 30/50	2026-04-08 08:19:02.811	2026-04-08 08:19:07.49	\N	\N
45	00000640	grillage-en-fibre-50-cm-50-ml	SINGLE	Grillage en fibre 50 CM / 50 ML	{"type":"doc","content":[{"type":"paragraph"}]}	\N	35.000	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Grillage fibre 50/50	2026-04-08 08:20:54.127	2026-04-08 08:26:26.528	\N	\N
47	00180047	isolation-polystyrene-100-100-ep4	SINGLE	Isolation polystyrène 100/100 EP4	{"type":"doc","content":[{"type":"paragraph"}]}	\N	10.500	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Isolation polystyrène 100/100 EP4 polystère thermique	2026-04-08 08:57:33.097	2026-04-08 08:57:33.097	\N	\N
46	00197243	isolation-polystyrene-100-100-ep2	SINGLE	Isolation polystyrène 100/100 EP2	{"type":"doc","content":[{"type":"paragraph"}]}	\N	6.500	19	1000.000	ITEM	t	t	t	ACTIVE	ON_REQUEST_ONLY	Isolation polystyrène 100/100 EP2 polystère thermique	2026-04-08 08:56:31.85	2026-04-08 09:11:44.566	\N	\N
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.profiles (id, user_id, first_name, last_name, job_title, phone, bio, birth_date, avatar_media_id) FROM stdin;
1	cmnnfemzf00008wg9iwn6hacx	Root	Cobam	Root	\N	\N	\N	\N
2	cmnnfemzo00018wg93ssib9qo	Admin	Cobam	Administrator	\N	\N	\N	\N
3	cmnnfemzs00028wg92jrzb08t	Product	Manager	Product Manager	\N	\N	\N	\N
4	cmnnfemzy00038wg9nwedxp86	Author	Manager	Author Manager	\N	\N	\N	\N
5	cmnnfen0100048wg9umtxrwus	Product	Editor	Product Editor	\N	\N	\N	\N
6	cmnnfen0600058wg920vuscbf	Article	Author	Author	\N	\N	\N	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.refresh_tokens (id, token_hash, user_id, expires_at, created_at, revoked_at, last_used_at, created_by_ip_address, created_by_user_agent, replaced_by_token_id) FROM stdin;
f00f3b34-2cd8-457b-81cf-fadcdbe197d8	cf59cda2040813ca8bd304bedf6f5b08a45e4831dabce1b0ade894e7a8f5f369	cmnnfemzf00008wg9iwn6hacx	2026-05-06 16:50:57.84	2026-04-06 16:50:57.842	2026-04-06 19:11:08.609	\N	\N	\N	\N
7fa45998-3324-4a70-a026-cb903cb4a75a	c23d1a5e84c2050a91f2b444eb60813e203f976d9ba0e89482a9bcdaf7cdc4d4	cmnnfemzf00008wg9iwn6hacx	2026-05-06 19:11:08.609	2026-04-06 19:11:08.617	2026-04-07 07:16:34.864	\N	\N	\N	\N
5a5db04c-3230-48a3-bda9-435a7a69ef28	b64c8d1af0fbf100b7d467cb79be25200088753bc755475f4a9b7e9808fc71c7	cmnnfemzf00008wg9iwn6hacx	2026-05-07 13:46:14.83	2026-04-07 13:46:14.833	\N	\N	\N	\N	\N
a1b6b2c8-e076-499e-9c1d-5862f272199f	72ad853d069a8780154ce76cdc04299f23f8e809f799dbc21fcc97b84cce6939	cmnnfemzf00008wg9iwn6hacx	2026-05-07 07:18:27.899	2026-04-07 07:18:27.903	\N	\N	\N	\N	\N
66651452-d634-498a-b270-9f3600bc3cf6	be6ca2838d7609ecf2c079d9d005707c8da94705794258848a1509f248b09f02	cmnnfemzf00008wg9iwn6hacx	2026-05-07 07:16:34.864	2026-04-07 07:16:34.869	2026-04-07 07:18:27.907	\N	\N	\N	\N
dbf5661a-55ac-4882-8d8a-9a4ef5bc6060	c9eedfc0b3fd2cb8ec8d648708153da87f07cc335d97f967f94cb8d0b5f0805f	cmnnfemzf00008wg9iwn6hacx	2026-05-07 07:18:27.907	2026-04-07 07:18:27.91	2026-04-07 07:48:32.61	\N	\N	\N	\N
9c433721-1d8d-4a61-91b3-50cae2301203	6e60e165b46e89e475d0ae95d876e1f0be8da6a8517faff911eaac336cbdfbe5	cmnnfemzf00008wg9iwn6hacx	2026-05-07 07:48:32.61	2026-04-07 07:48:32.613	2026-04-07 08:20:17.343	\N	\N	\N	\N
06800753-1b1f-40a9-babd-720d3d67524b	a45d8d79a14dea7299c9ea6785fdc5697f985ec6599fd22b81c7ec315f4f4616	cmnnfemzf00008wg9iwn6hacx	2026-05-07 08:20:17.343	2026-04-07 08:20:17.346	\N	\N	\N	\N	\N
a44df9d1-32b8-4e26-b159-4a71ca9f1a61	354ec3e031bba48d9e4c142344f959a7566706401133e690ed8f5f3abd15ebf1	cmnnfemzf00008wg9iwn6hacx	2026-05-07 08:20:51.424	2026-04-07 08:20:51.425	2026-04-07 09:04:22.021	\N	\N	\N	\N
e18b55d4-d137-46e0-b87f-90311fdffd71	4751ff5162da4c37e7c073ab7f0780473c25640371b332e3968f30ad4b382ba1	cmnnfemzf00008wg9iwn6hacx	2026-05-07 09:04:22.021	2026-04-07 09:04:22.027	2026-04-07 09:35:50.413	\N	\N	\N	\N
6569d43f-14e5-468c-a463-0df4e50537ac	a32d97898786b17aae02df44cfa1da89b17a883160509629e9c57297b0726950	cmnnfemzf00008wg9iwn6hacx	2026-05-07 09:35:50.413	2026-04-07 09:35:50.416	\N	\N	\N	\N	\N
b9a3216e-233f-4e90-95d0-6ca999d2e24c	3b972a32fc053449408ad47bb0655ee0e51e3beac085e5645f5eb567e0257efb	cmnnfemzf00008wg9iwn6hacx	2026-05-07 13:13:24.408	2026-04-07 13:13:24.411	2026-04-07 13:46:14.831	\N	\N	\N	\N
258aa392-90af-40ed-ae7f-c9d51662dfa7	3abfbad881c95e35d27b71e8ab1324a44afbe31393999d2d9d7250fd16ce9bda	cmnnfemzf00008wg9iwn6hacx	2026-05-07 10:25:26.99	2026-04-07 10:25:26.993	\N	\N	\N	\N	\N
fe876d57-8f1c-44f9-a8a0-c18e244ebcc4	90fc20ec4e18cd161acf4f943ec517ef00d9c13b78c9768e8803ec16adf1c4b1	cmnnfemzf00008wg9iwn6hacx	2026-05-07 09:38:31.729	2026-04-07 09:38:31.729	2026-04-07 10:25:26.995	\N	\N	\N	\N
b719a3f1-87ac-4779-afa6-c0eff8c75f99	0470f769e82c1c9238a62442a52220eac6f7324e70b6b9bd750a3210167a3d6a	cmnnfemzf00008wg9iwn6hacx	2026-05-07 10:25:26.995	2026-04-07 10:25:26.998	2026-04-07 10:29:24.592	\N	\N	\N	\N
7930e0e9-d4ff-4cda-b780-ae38be3f9c8a	f26de6342e152f95f1f123188c25fa66f7e9da774ed3d1921e532bc996ac75b5	cmnnfemzf00008wg9iwn6hacx	2026-05-07 10:29:24.592	2026-04-07 10:29:24.596	\N	\N	\N	\N	\N
f4e719ef-3251-4ec2-99b7-5dd78024091f	07e630ff9ac6bd2b728a7044cb0bc781a4fb23c18559d2a5440c7fe45f92c1bd	cmnnfemzf00008wg9iwn6hacx	2026-05-07 10:30:27.59	2026-04-07 10:30:27.59	\N	\N	\N	\N	\N
89ebacbc-9f3e-4d41-b33f-d8b27288918b	4f14230626d8cf054c3989e1d01b9a12119ce7a9055046c497b8e691976e3a21	cmnnfemzf00008wg9iwn6hacx	2026-05-07 10:42:22.796	2026-04-07 10:42:22.798	2026-04-07 11:11:13.58	\N	\N	\N	\N
ca298254-d43b-450e-b720-f7ead0418145	3985c65677e79feffcafa955dfe2491bcfe3a54f63a3ae0328f55c56166ee1c4	cmnnfemzf00008wg9iwn6hacx	2026-05-07 11:11:13.58	2026-04-07 11:11:13.587	\N	\N	\N	\N	\N
1fbcff2a-5170-470c-976e-8d4c12b8a6f1	6de31f331ba83319515202a1631b2b015831769cce9f820e56d2a8b6d5ead1c9	cmnnfemzf00008wg9iwn6hacx	2026-05-07 13:46:14.832	2026-04-07 13:46:14.838	\N	\N	\N	\N	\N
df2d7b32-c766-46c8-8f0d-39dcdd4f9cb7	9d015c2a4bac8d8c2c109b71d58560a9b2151cf4addc250a6a75fdbc245b2ddb	cmnnfemzf00008wg9iwn6hacx	2026-05-07 11:41:52.319	2026-04-07 11:41:52.327	\N	\N	\N	\N	\N
51db734a-3777-4f51-83e7-68af9cb910a5	e3792d95ae86f3f6482800c098b98876f55a739a72ce9a0b45e89c045cf078b9	cmnnfemzf00008wg9iwn6hacx	2026-05-07 11:11:16.397	2026-04-07 11:11:16.398	2026-04-07 11:41:52.324	\N	\N	\N	\N
615cfa61-f825-4244-ab2f-5ac9375d420b	2ab9209e979a516c20366b80bdf2804bf19981da1225267aff2cce78b9425bd4	cmnnfemzf00008wg9iwn6hacx	2026-05-07 11:41:52.324	2026-04-07 11:41:52.331	2026-04-07 12:42:50.287	\N	\N	\N	\N
d7c55e95-7d12-4d65-b65c-c7d1d6b7231e	fe063a1e5c88a919dcf1f537a77b7873ace88a77305c176662567c1b5dfca4a4	cmnnfemzf00008wg9iwn6hacx	2026-05-07 12:42:50.288	2026-04-07 12:42:50.29	2026-04-07 12:42:54.09	\N	\N	\N	\N
3c7449bb-9f7f-4be8-9625-0bbea8dbb878	831c847d2311bd02cd7a6bd193bbc57b717f29b7ccc5135dbfeace935c0b01ce	cmnnfemzf00008wg9iwn6hacx	2026-05-07 12:42:54.09	2026-04-07 12:42:54.096	2026-04-07 13:13:24.408	\N	\N	\N	\N
d20aebe8-6b17-4f36-8f3f-4add7afd51f2	33d4fa92b082cdbf9af26459de195df2af8e742ecd6efe63447757392fc4e35c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 07:50:21.495	2026-04-08 07:50:21.497	2026-04-08 08:20:53.938	\N	\N	\N	\N
4269e43e-a221-49be-b377-010c535b4c23	7205bb7aa5168556956d59d27ea48b99acd85544517607db5dcbb6d31caf40a3	cmnnfemzf00008wg9iwn6hacx	2026-05-07 13:52:37.456	2026-04-07 13:52:37.457	2026-04-07 14:23:43.261	\N	\N	\N	\N
267163d2-2c29-4609-9da0-0e0e43d4528d	80163b064952dc7aff44eacc215890b7a078d70e0576cdf6c2eea8a61b37396c	cmnnfemzf00008wg9iwn6hacx	2026-05-07 14:23:43.261	2026-04-07 14:23:43.266	2026-04-07 14:55:15.343	\N	\N	\N	\N
c8f20ba9-64ec-4ece-b504-6e32714ea1f6	cb4eba5d6c668d54a132d227feca4f7f64d4ae19449e96e29c9f08c12b3ec5d9	cmnnfemzf00008wg9iwn6hacx	2026-05-07 14:55:15.343	2026-04-07 14:55:15.345	2026-04-07 15:25:52.011	\N	\N	\N	\N
ec5a3b3f-108c-4aad-b713-0dd249e7cc2b	4784a1f7c8d9ac06f42b1f6f15069ea5351c1f491dd9ab505f34be7b79f660db	cmnnfemzf00008wg9iwn6hacx	2026-05-07 19:03:15.556	2026-04-07 19:03:15.557	\N	\N	\N	\N	\N
2d72aa50-3c44-4af5-8a2c-eb3c93e1d01e	8669c015118ba84cecfec224a668966d823d8182d3022285242fa96632d264a9	cmnnfemzf00008wg9iwn6hacx	2026-05-07 15:25:52.011	2026-04-07 15:25:52.013	2026-04-07 19:15:19.763	\N	\N	\N	\N
bfe15996-4276-4699-82be-0590994d6e67	0b7fc4aaab248729f4424b05704abd27ba5fe8e1f8c39c1fe832f39e9d4cb847	cmnnfemzf00008wg9iwn6hacx	2026-05-07 19:15:19.763	2026-04-07 19:15:19.768	2026-04-08 07:13:16.198	\N	\N	\N	\N
490e4b73-6379-4ed3-b8c2-c2b999775844	683f77be24ec17e602e4901921cbf8970b0f60dbe39ac78a526ec943944ee934	cmnnfemzf00008wg9iwn6hacx	2026-05-08 07:13:16.198	2026-04-08 07:13:16.205	2026-04-08 07:50:21.495	\N	\N	\N	\N
1ddd6776-6e7c-4b91-aeae-b684a3b07071	6f12451ad5ca0ec74cb24d55f0d9b794417efdc52071ee9c308af164c1ec3913	cmnnfemzf00008wg9iwn6hacx	2026-05-08 08:20:53.938	2026-04-08 08:20:53.941	2026-04-08 08:51:06.621	\N	\N	\N	\N
688ebc7f-62ab-45d9-825c-5aa1c9f559b1	ffeecdebb3d3d2bfa1dfaec4d9478657569c7f548a3a9b15462eb40a93cbacd6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.109	2026-04-08 09:53:48.115	2026-04-08 09:53:48.149	\N	\N	\N	\N
8f71eed9-24ce-4f83-94dc-cd09197ab0ce	fdf84c208292092f94bbf7c7b56dea20928d9f6f2c1e4f07b0befb8444a88d9c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:23:48.308	2026-04-08 09:23:48.314	\N	\N	\N	\N	\N
749f14d9-95d7-4932-b05f-c12290924519	9316a5f15af25416a460a03a3e93268b2d96f153f6c7540c214adbe1d7398b4f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 08:51:06.621	2026-04-08 08:51:06.624	2026-04-08 09:23:48.312	\N	\N	\N	\N
f4717856-6567-455f-af99-457ed04b1fe9	eb78d7a1fa10ebeefb2ebf4ba01d604e07612cf4d1f037b58fcb134068fc6d79	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.057	2026-04-08 09:53:48.069	\N	\N	\N	\N	\N
560fc198-d8b1-445c-b2db-76bdb5192677	c63e8383a7c365218fe698385da5dc6119f782fe526bdd90d474b43d4c0a2a29	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:23:48.312	2026-04-08 09:23:48.319	2026-04-08 09:53:48.067	\N	\N	\N	\N
58a2ed86-ad7f-4d8a-9173-8ecf69842c37	eddff11972ab64492c5f19b9b8a9db2f285a0a945bac674ab0dc93fdea60dd61	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.067	2026-04-08 09:53:48.078	2026-04-08 09:53:48.118	\N	\N	\N	\N
9e6ecf75-92cb-45c2-be97-447c796eb6b4	2640b24c1cfef283ea46393ea1fcbb2bda333b402eff4962a00c79dc4ea5875c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.149	2026-04-08 09:53:48.152	2026-04-08 09:53:48.225	\N	\N	\N	\N
3e72860f-2c1f-4ac4-9c32-5c3322380fcd	1cef3e840b58a692fc6db7ab62f0b06945bacd8648b94fcf38c6720ec315854b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.225	2026-04-08 09:53:48.236	\N	\N	\N	\N	\N
dca43be5-ed13-4028-ab11-f69bfd9a81d5	e3867bfb723b276d819627af392119aeb8efc87f1dcbb33dd4126dd5b87647c4	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.177	2026-04-08 09:53:48.188	2026-04-08 09:53:48.24	\N	\N	\N	\N
0676b542-4b50-4626-b3d7-12c189bfc5d4	8a24c19d92f5bc13067e19bf80b0ba99e5c9ce20e835ab70dfe2a4b9e244de20	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.198	2026-04-08 09:53:48.207	\N	\N	\N	\N	\N
b5c44f8e-eba5-4c34-b428-d2bafc404a37	3f858cb726e5190ddc9b6dfcc64af04a99eca7c79d0fb3dcf7d79f1c5d5ba9a5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.252	2026-04-08 09:53:48.26	\N	\N	\N	\N	\N
d4a8097c-00bd-4e8f-8b07-6f83777ba56c	7cf1da1577de6998e3998e54f9dc17dd09f4167439c36fc4780fefb3d2e3e999	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.118	2026-04-08 09:53:48.128	2026-04-08 09:53:48.209	\N	\N	\N	\N
1959bb36-b2b4-400b-bcae-91a77b1b68a9	a7ee60665033871720d0f9a4b8d8925911bd635ea777a652fc7109f01e4fdc6b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.24	2026-04-08 09:53:48.249	\N	\N	\N	\N	\N
3494ad0a-2ca5-4044-ae92-739c177355f6	cd6616393d421391ec7e7d75364ba13c9f9140f37266912de6a153c8a92192b5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.481	2026-04-08 09:53:48.487	2026-04-08 09:53:48.521	\N	\N	\N	\N
068b6286-67d7-470a-8c7f-23e0dbca0a71	b442189002955104d098a3d2695c0722c8777cd1031b5f9b85871dad47f109fd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.209	2026-04-08 09:53:48.222	2026-04-08 09:53:48.278	\N	\N	\N	\N
acf7a7e7-f674-4194-b0e6-06680b73f45c	2892038c8d3dd7cd5c5dc23c423943d573270e98a3c40e11c4632e9a320712ab	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.27	2026-04-08 09:53:48.282	2026-04-08 09:53:48.315	\N	\N	\N	\N
833c59ac-23bf-4f4f-a917-1c8c721d876a	e9b37711ec9b00d4f6131e0dd0beeb0a10b39145d84ece4208f460185ac663f8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.315	2026-04-08 09:53:48.322	\N	\N	\N	\N	\N
de825756-5f34-41c8-8e5a-297e0fce3893	de11c739b2bb3eeb9af6980428424dc1a23e087f1b79c0246f848fad726454f9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.499	2026-04-08 09:53:48.503	2026-04-08 09:53:48.526	\N	\N	\N	\N
2f6b7d03-238a-4fff-8a42-1c13746643d6	8c7aab3b998ea40e313c8d6ea7a453dc66d5fa8bc5a9a3cbf932c3e4d80f21b8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.278	2026-04-08 09:53:48.292	2026-04-08 09:53:48.338	\N	\N	\N	\N
59707ce0-fed2-43b7-97ac-480f5768eb55	f4eda94077bd9e5931043e6502d7d3281da25b8d2ddcd74c2a37126103b40429	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.325	2026-04-08 09:53:48.333	2026-04-08 09:53:48.36	\N	\N	\N	\N
429cc29e-ad8a-438d-8b64-af8c3875eb87	a5a280fce902a11186cf1e41603a2591beb5d4e61f1bb1f540e63e0803ce8291	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.338	2026-04-08 09:53:48.345	2026-04-08 09:53:48.384	\N	\N	\N	\N
af78a5f1-3496-40b0-90d0-57dbeb1b250e	f5b03e40dd7f3f7ab027e8bf457551041f623d176e3af7c01b38a03a16d41031	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.36	2026-04-08 09:53:48.367	2026-04-08 09:53:48.395	\N	\N	\N	\N
b27815e5-4560-4971-acd4-8eafd6eaf310	7a11c5c8e72561995d3c0e11ccccfc9ee3b1faba843ea6d588a61cfd42a4b33f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.37	2026-04-08 09:53:48.379	2026-04-08 09:53:48.407	\N	\N	\N	\N
73905605-250c-4cd3-843c-ab9cca68e41c	8208c02af7f9acfd84adc7ceac8adc89c640ba2782646f7b7aaa61740c3ca8a5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.384	2026-04-08 09:53:48.391	2026-04-08 09:53:48.425	\N	\N	\N	\N
ff072382-f252-45e2-8112-b0c69fffaf0f	41309e64e5e59bbcb5d8444e8432e073d807c3049ae589d14693ea1e29e6d0ef	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.395	2026-04-08 09:53:48.402	2026-04-08 09:53:48.437	\N	\N	\N	\N
a1878642-4ce6-4854-b948-e264337c20f3	d99955f1045c8332c33c8b507e167a3375a4eee30d8ff6adbf8bd7ba812666d8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.407	2026-04-08 09:53:48.415	2026-04-08 09:53:48.448	\N	\N	\N	\N
d445d0d4-5688-47bd-a0ba-2cb528a1b267	4472fe8d46668935f5435968bc53ad9b2319fd4245b749f0ef08a7647865f85c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.425	2026-04-08 09:53:48.432	2026-04-08 09:53:48.459	\N	\N	\N	\N
0ff7d8b1-8cc9-466f-8c6b-b81ffb2dc244	49dcfa50f56c750ba0373b45775c5bbf539156ff9f42ed85a619dadb2a6a63f8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.437	2026-04-08 09:53:48.444	2026-04-08 09:53:48.47	\N	\N	\N	\N
52119388-e8e2-4651-976c-cebb564dd41e	37b9d8bbcd1a41b7452a1893b656105d42eb31b9b75ca55955bff105ded4c1b6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.448	2026-04-08 09:53:48.455	2026-04-08 09:53:48.481	\N	\N	\N	\N
25d872e8-8ed3-4dbd-811a-35a900bc7852	8b08eb466da66596dcd58b8a9d2199c3740e1f696744c391f273ac8465d41ba1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.459	2026-04-08 09:53:48.465	2026-04-08 09:53:48.499	\N	\N	\N	\N
7b5a6d40-81fe-483b-ae30-bd8333477195	e1e2f62206c2e057ef3ccb25c4f24a7afc9296d2f42a2a9dd55deaccda25a57e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.47	2026-04-08 09:53:48.477	2026-04-08 09:53:48.509	\N	\N	\N	\N
209d1afa-1a28-4af3-85ec-eeaf01776575	961b01cc4f9969f828ace8182a43d08c48b54c334fc4b23fefe651ca8394874b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.509	2026-04-08 09:53:48.513	2026-04-08 09:53:48.539	\N	\N	\N	\N
5751a43a-94cb-4750-b96c-f4bbb1cca03b	c6113d2ffd32737d57c05df6bf7f4c8c3219e980b1c8395bbf9e11c8be332a2e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.521	2026-04-08 09:53:48.524	2026-04-08 09:53:48.55	\N	\N	\N	\N
cce7188f-d07e-4a87-b433-fd0384a4d0bc	83fe08fa6b0503b53ccd56387f66667f7502f9df0477f6ee8ed249d033e0542c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.526	2026-04-08 09:53:48.534	2026-04-08 09:53:48.565	\N	\N	\N	\N
b670b6ca-11ca-44b0-9dc7-ba8f969e78d3	45290f990dd5c68d29eca15b59e46784cc1496b703ef5e2cf8afc3e40e49a7b1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.539	2026-04-08 09:53:48.546	2026-04-08 09:53:48.576	\N	\N	\N	\N
431531f0-9a1d-43ca-a631-da1123e3b33c	bc22696fb9a7ebc824a004cff81b9304cf2e865aad938b848eb2485b86746961	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.551	2026-04-08 09:53:48.56	2026-04-08 09:53:48.587	\N	\N	\N	\N
8aad59ab-55b1-44e3-96ff-0e1b0ce2655d	2b50ed32e3554de0ebb1dc4ed4e6eb40e5bb11b30f3e97c7f77802bd265b6163	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.565	2026-04-08 09:53:48.572	2026-04-08 09:53:48.598	\N	\N	\N	\N
46c88a81-ace9-472c-8cc6-708d59a9f1ac	aa4e5c18ad75ae629ff707ca9c2a7ee1b03d5a213b93934ba546dde947b213dd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.576	2026-04-08 09:53:48.583	2026-04-08 09:53:48.609	\N	\N	\N	\N
3dc27c5c-a26f-4900-8f03-353b0144cad5	743e06adeb74bab619558acdfc3705f184a1499d16f5bb50d3ed23b7a391d4ac	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.587	2026-04-08 09:53:48.593	2026-04-08 09:53:48.622	\N	\N	\N	\N
c0280308-77be-4070-9a92-f03165266cfe	8bdee8db83f744135ce023c3ab7006ad02ddccbca250a977e241df421f170e93	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.598	2026-04-08 09:53:48.605	2026-04-08 09:53:48.633	\N	\N	\N	\N
a25749ae-c5b2-467c-bf8f-a90b69de2cef	deeef3d80011880ae88a4046cfd883f1d137d178498d3fd560ec07a723277b9d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.609	2026-04-08 09:53:48.615	2026-04-08 09:53:48.644	\N	\N	\N	\N
f03781ab-9584-4d9c-8db2-eff4d6315f91	2df1b7433dc5d09d3ede32ea2a2c94fc63daa03b0bd4de0906c7b7eb214c336f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.622	2026-04-08 09:53:48.629	2026-04-08 09:53:48.66	\N	\N	\N	\N
2ccf3758-d22e-4b10-87e9-b7e36cb264ff	cda33fc90e7ce18a6d8696d296298da0eddd8c32330fb4c7b36666ecf31dd3e9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.633	2026-04-08 09:53:48.64	2026-04-08 09:53:48.665	\N	\N	\N	\N
82ad7688-ea10-4f1f-bb4c-07790aad5ee7	7910db9bc33ce3048020afff2505f1ef5aa24fd4b1832a4279901b4c61e8709a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.644	2026-04-08 09:53:48.651	2026-04-08 09:53:48.683	\N	\N	\N	\N
5b79453e-cde1-4465-8b15-6f83b144bc46	d33bf7091be05254088cd558a012a68341331e579422ad45535b77966a80d92f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.66	2026-04-08 09:53:48.663	2026-04-08 09:53:48.692	\N	\N	\N	\N
761ee7e8-475b-4eec-bc21-30ad02492528	4ca92388c5e384458c97e561eb7b6bd169b2336cd170e7ea11de6a8c07d6a58a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.666	2026-04-08 09:53:48.674	2026-04-08 09:53:48.703	\N	\N	\N	\N
027b3560-8177-405d-8ec2-ad5f824b1985	f5c0e80549d9957488ebbd92eebb4d935bc326d96bf66f8479f08831f259c0db	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.683	2026-04-08 09:53:48.688	2026-04-08 09:53:48.715	\N	\N	\N	\N
dc0502c0-d0ad-48e8-b8e9-595888438e85	ab5aea80bb3eba4fc8e72cbfea84ece9d7dc963fa2fbcebe6d77e5b6a2e59642	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.692	2026-04-08 09:53:48.699	2026-04-08 09:53:48.725	\N	\N	\N	\N
05f5d43e-b714-4056-bb89-ac2a3874914b	dc45cbd62323d2581d4bf1c51d573baca9068dbab4b00588481d63ec0c2b8d65	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.703	2026-04-08 09:53:48.71	2026-04-08 09:53:48.737	\N	\N	\N	\N
8ea2fe68-b2ec-49f8-aeec-490dac4b9a29	07951740c938cc76d7849cf564ed69eb0a99f11f844ef9dd6641776c71b95e12	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.715	2026-04-08 09:53:48.721	2026-04-08 09:53:48.748	\N	\N	\N	\N
7290bdab-6f94-49f9-b3e4-63caf90d91ff	2804e2c94d58dde28b1372a54b72e6fad752c076bd982a8f3ea2232ce39cc0d8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.726	2026-04-08 09:53:48.733	2026-04-08 09:53:48.761	\N	\N	\N	\N
350099ad-082e-4028-89eb-40c0ee87b36a	e71767ced2a8db48b3cf6510b93d6a18fb258dbd86f95376ac62042ff880a4f9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.737	2026-04-08 09:53:48.743	2026-04-08 09:53:48.772	\N	\N	\N	\N
fa6b241b-d579-4d02-a7ee-0d2a6d33ecf8	44aceb2417044f067bf3c944128ba0e1ece42e4429627513179ec6578596c852	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.748	2026-04-08 09:53:48.757	2026-04-08 09:53:48.783	\N	\N	\N	\N
ebcd210c-2f75-4d33-a40a-af069b21a8fe	8366d2d00eae9205030a26c710d25d867dc98b05f2c1fcf331ae4dbb3036bdab	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.761	2026-04-08 09:53:48.768	2026-04-08 09:53:48.794	\N	\N	\N	\N
0e9bdc82-6583-4430-8da7-314569dbba48	c1f3a0c846a82fe780b22f6acd6c28bcfbeff3cdbbd25fd474cc980bdee0a6c5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.772	2026-04-08 09:53:48.779	2026-04-08 09:53:48.81	\N	\N	\N	\N
2be7c574-0060-4de8-80cb-fdcfcfe23652	a418b90c3fabcabf12026fa04499e07b0579e80cf73c38644316cf7a09581d70	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.783	2026-04-08 09:53:48.79	2026-04-08 09:53:48.828	\N	\N	\N	\N
9973cd34-e75a-47b3-8d30-d08c36748d09	4abc67b9286bc8cfaf7eadf6bbc285f31daaf07b6d88401143ed6a132e1298e6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.794	2026-04-08 09:53:48.801	2026-04-08 09:53:48.843	\N	\N	\N	\N
7647650d-e611-414d-aa25-ef2afc90472c	3ade824d34e098d808e2927f67e5afd711cfbe1a988b1dca1b349da2a4882739	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.81	2026-04-08 09:53:48.822	2026-04-08 09:53:48.855	\N	\N	\N	\N
f43d552a-b2d1-444a-9cf5-cd32c815ed5a	13388543e8639ae9c0e60626cc7a4735aa4932cfdf810a2228d7dc28877afbae	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.892	2026-04-08 09:53:48.898	2026-04-08 09:53:48.926	\N	\N	\N	\N
54966cf8-bdef-4bc3-ae15-24b8a0560463	3f2edf3c9e38eaff7f546b90ad5e5f0d8167fb59710ad9930090397347525fee	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.902	2026-04-08 09:53:48.91	2026-04-08 09:53:48.938	\N	\N	\N	\N
ac1fb833-cf86-4947-bc77-f23fa08ff188	76e56189f56e3fca668a8ed652311d0751cc477c063837d5e646753e2a690ccd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.919	2026-04-08 09:53:48.922	2026-04-08 09:53:48.949	\N	\N	\N	\N
c329c4a9-b356-4fd1-aed0-b0fb3bb26660	3420a1b47db27f25089f7b25b06637c9fac9b1ea4348611b17d89a06047c9bdc	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.926	2026-04-08 09:53:48.933	2026-04-08 09:53:48.96	\N	\N	\N	\N
5aeb99a5-3437-42f3-8cb4-13c7e9971842	0cca96a21e3b43039f2791f286d8e02bfd2f21efc5afce60db183d2c6c980efe	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.938	2026-04-08 09:53:48.945	2026-04-08 09:53:48.975	\N	\N	\N	\N
9c3fff12-aeb3-49e1-ab68-59b8098c7e1d	d3980a40455933c42bbdd7bc17bce39f102c5d0d8041265a0de52f513288d0c7	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.949	2026-04-08 09:53:48.956	2026-04-08 09:53:48.986	\N	\N	\N	\N
cb87ca3b-c39e-465f-9960-ce8bafc8ccd6	9e7ecb1ece62402c703092e3b99c224e732c9b2d43d1c942add56c09aeb8dba6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.96	2026-04-08 09:53:48.971	2026-04-08 09:53:48.997	\N	\N	\N	\N
973a0007-ea8d-449c-990f-a08101f0012f	61ea2d09dd168a7d696d9d1ec9e03193cf5a4ba1364046e585898efd43057048	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.975	2026-04-08 09:53:48.982	2026-04-08 09:53:49.01	\N	\N	\N	\N
6861b3cb-71e6-41fb-9a74-8fd0604c3648	11f24f86565b5bac40a3f43a2020c028d979d3aece820f390ce3fdd7dd7d05d7	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.986	2026-04-08 09:53:48.992	2026-04-08 09:53:49.021	\N	\N	\N	\N
9694f963-fc59-4053-b344-3f6c42cad9b1	db098dc82913003ac47a0b677cd3c825e625a9ae66963341a1ad6fb52bfb487b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.997	2026-04-08 09:53:49.005	2026-04-08 09:53:49.034	\N	\N	\N	\N
6acace1b-8821-4d76-912a-3746b2abd7e2	9788562dcf323d164fba8ba7ea9ec411ed9f34150fff9a07bf68bcc8e939fd56	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.01	2026-04-08 09:53:49.017	2026-04-08 09:53:49.046	\N	\N	\N	\N
064802cd-79e0-41d3-a8f9-f41118e1055f	9ea7eceb0239f69556c964700c8195a643f43ed030f4342a6314961a15c850ff	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.021	2026-04-08 09:53:49.028	2026-04-08 09:53:49.057	\N	\N	\N	\N
07523b3b-685d-463c-95ed-e850a9b26fda	9ddb95558b737082315b464caefc4d9e0e486db95a37c43688111028b284bb85	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.034	2026-04-08 09:53:49.041	2026-04-08 09:53:49.068	\N	\N	\N	\N
8ce7a191-ad1b-4641-83a5-d5fcf4b2280b	2f6569fc57a15776050b63d92a580e0b0312a7e74f5020cf909f7b2b6dd02cda	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.046	2026-04-08 09:53:49.052	2026-04-08 09:53:49.079	\N	\N	\N	\N
3bf7d9fa-3d71-4fb9-9279-ef89a382d413	4f65c1dd56ebe77c70cce7f58bb3bd2e860400325250270a18a117e748fe5f60	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.057	2026-04-08 09:53:49.063	2026-04-08 09:53:49.09	\N	\N	\N	\N
77a8b8f2-f371-40cf-9208-4054614c0b20	72ec98d1941bee6ab049f906e88d0d9db897e1b19bc65b1728b5808b6eac37ad	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.068	2026-04-08 09:53:49.075	2026-04-08 09:53:49.104	\N	\N	\N	\N
0230787e-3514-4eea-8cd1-961ae5c91da3	597fc687c2c8bb452a10cf60d0b4e33526bef610e519b0a63b9b91dd01ea78c6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.079	2026-04-08 09:53:49.086	2026-04-08 09:53:49.115	\N	\N	\N	\N
d637496b-07eb-4f46-9ca8-46c1fe66f175	1834df052584c7070df8cc0afd90274cb42defc631bbef91ac6655c53679c028	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.09	2026-04-08 09:53:49.097	2026-04-08 09:53:49.128	\N	\N	\N	\N
d71fb5fe-585e-4478-8847-19a3f09dc959	7976015da9c435e371fc1b9c379767bfbbd589d0965be4e7093889a915cf0af1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.104	2026-04-08 09:53:49.111	2026-04-08 09:53:49.139	\N	\N	\N	\N
e0b02310-f428-4e2c-be69-6476ab9efc8e	62443c2d9d30fc49ea89d0ffd82293ba4a9dae68c37485ccbcf33ae28f59f083	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.115	2026-04-08 09:53:49.123	2026-04-08 09:53:49.151	\N	\N	\N	\N
b316c368-3655-4b00-b6bc-49c951a47996	a2f41bc64c92e5e687f575d4a67b3625c61d245fa9d4211b8cb6056d4f43ec35	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.128	2026-04-08 09:53:49.135	2026-04-08 09:53:49.163	\N	\N	\N	\N
bb4c7ede-9466-4efb-b700-44ac1a273a87	e4cfb76c6384222d908b0f1b46108d557be8ce877dca83542f738335ea98f831	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.139	2026-04-08 09:53:49.146	2026-04-08 09:53:49.177	\N	\N	\N	\N
e532d6b9-02c6-444e-8356-11c13c87ff42	e1dd92307027c7b0d3caaa53aacdd7de6f7b7be383c7a226b0382dbc5246f190	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.151	2026-04-08 09:53:49.158	2026-04-08 09:53:49.188	\N	\N	\N	\N
6c91974a-cb30-487d-b901-dc8fc8ce5f00	1fa713bc4ca7a4c1cca48ed59aa7c6a3bae00d1b2db64c4a8b79182e9065b6e9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.163	2026-04-08 09:53:49.172	2026-04-08 09:53:49.198	\N	\N	\N	\N
2edfc762-65b5-48ec-a9fc-0caffb7d7db2	72fb029a5304874a71783ccd9f87207861a44a4606306abe9d55e0d8bfb275d2	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.177	2026-04-08 09:53:49.184	2026-04-08 09:53:49.209	\N	\N	\N	\N
07b87c8f-7d29-4fd8-afdd-6faff6676e93	0fd8c5f1c115c7d8b3c01af17f5f89ac0cec0ff0790ea7ad35bc4054c8d612b1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.188	2026-04-08 09:53:49.194	2026-04-08 09:53:49.22	\N	\N	\N	\N
3d9a2cb8-b4ff-4506-b224-e96e7475e53b	89f083c6d249b9768adc3fdadab90b567984056511a64a2f25b912a8a5ccf499	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.198	2026-04-08 09:53:49.205	2026-04-08 09:53:49.231	\N	\N	\N	\N
bde97730-4d84-440b-94c4-f3680fb186df	89834ff9ad619b73b2c6ac5f470e9446434fc4d2c930139149dc2be6de4c1032	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.209	2026-04-08 09:53:49.215	2026-04-08 09:53:49.245	\N	\N	\N	\N
44cec380-788e-4f45-9990-60c18b1c5bea	b55cddac9705b88e5339bfc8204d56ec6fc229ab9c0ea3aa3dc1fe8dba453194	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.22	2026-04-08 09:53:49.227	2026-04-08 09:53:49.256	\N	\N	\N	\N
3ae12719-c645-4565-823b-44db3b5a2a13	70f58a527cd66e603b128de2c34be1a3e48cf63e25754e475704c04f920a4de3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.231	2026-04-08 09:53:49.241	2026-04-08 09:53:49.267	\N	\N	\N	\N
92b2d6db-c375-4789-8d60-e348abbb7038	35df360eb45d3bbbed5e9cfef96bcca87e35baa6c4bad5923cfce2e0fc15fe33	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.245	2026-04-08 09:53:49.252	2026-04-08 09:53:49.278	\N	\N	\N	\N
54568a72-d912-48ff-a4ab-f35c307258a3	f650f2ba587adb8047238337166df311f4eb749c8afc88cd88e93b4573c520e2	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.256	2026-04-08 09:53:49.263	2026-04-08 09:53:49.289	\N	\N	\N	\N
64232f6b-e1e1-4fc2-b698-d1cdc2f0199f	7fb206b1ea54126bd841a6ef6b6620d8360da2291473dcfd50e7844a50c39862	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.267	2026-04-08 09:53:49.274	2026-04-08 09:53:49.303	\N	\N	\N	\N
09cf28bc-ab6e-4eb5-b18c-b9bbc0fe7ee7	e319427a79a89d9af74ddce4e35d7c0079f2ba9f70a21f662df786da58b85ad9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.278	2026-04-08 09:53:49.285	2026-04-08 09:53:49.315	\N	\N	\N	\N
3c4d149e-65fb-43ca-b4d1-15ad02d46668	dc896299dc44e6a3036da5405607666cb255d61fdbe498555c448d732540a74d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.29	2026-04-08 09:53:49.296	2026-04-08 09:53:49.326	\N	\N	\N	\N
5a5daa04-640f-4ed2-b55c-63c4845b386f	b106f228595adb8ddfaac0ae93503bf152956c7e173185d3caf1d82854ed2dbb	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.829	2026-04-08 09:53:48.839	2026-04-08 09:53:48.866	\N	\N	\N	\N
f2433bf9-5150-4b6f-9b35-32dd530f1208	d6fab0ef5865f5ef7fea175b12d52b48e3ca33e1f5493618ba4722a8f4f27fca	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.843	2026-04-08 09:53:48.85	2026-04-08 09:53:48.877	\N	\N	\N	\N
55060a32-d453-4091-9507-d3eae0508ee7	acd3c54ca27f03c85d32abbdd8d706815cb719f484936188c7181ce5bca42afc	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.855	2026-04-08 09:53:48.861	2026-04-08 09:53:48.892	\N	\N	\N	\N
290cbd7d-c1a8-4b76-bf57-df3e844efc81	4c3d42c329770fce98745f7989ab57752c32deb538fbb779f38bfb4f4dcd48bf	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.866	2026-04-08 09:53:48.873	2026-04-08 09:53:48.902	\N	\N	\N	\N
73020190-ea7d-49b9-b26e-6ba0f7e9f0c0	4ed356929f5cd0fcad896aa27c365b7bd808bc4cb9d37aef313c983d5a284541	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:48.877	2026-04-08 09:53:48.883	2026-04-08 09:53:48.919	\N	\N	\N	\N
c537f975-1980-47b9-86cf-72a548c3c8fb	68cdb495d78cb43aeeb6e3a31b5ed2db3fb5b0faaf7441f91f1c4828f0970b49	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.452	2026-04-08 09:53:49.458	2026-04-08 09:53:49.488	\N	\N	\N	\N
49d5654e-24e5-44b7-9d83-e4cbeee4cd53	993109cc4a3783157ce63530bd1ca664be8613b685d2cd7f984fa32a53c03146	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.471	2026-04-08 09:53:49.474	2026-04-08 09:53:49.502	\N	\N	\N	\N
03af1af6-6f1b-4ed1-badf-c6adaaf34132	a67b2cd269a4fa2a5e97ea515d8744248a22d9e509d2d3bf9929909b93b32bf2	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.646	2026-04-08 09:53:49.653	2026-04-08 09:53:49.682	\N	\N	\N	\N
dcfa4a6a-2450-43c8-94c6-8487902ccf10	26ddc21e98371b96e15a724a91160b5bd0a34b78869d177a0ac251368837c59e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.657	2026-04-08 09:53:49.665	2026-04-08 09:53:49.694	\N	\N	\N	\N
18cc6ab9-e9ad-479e-b126-3d7d4660b06e	84b3a248bf296911032056def32ca1edf8b11586be0d9959a9cca5c020ad8d6e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.67	2026-04-08 09:53:49.677	2026-04-08 09:53:49.712	\N	\N	\N	\N
31bdb060-7a43-4791-aacf-81b33a8620a7	884ede088d2d7a58a805807c7559f5447326dea1c6348e29d577a4d01ca2e136	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.682	2026-04-08 09:53:49.688	2026-04-08 09:53:49.719	\N	\N	\N	\N
90a373be-0d86-4594-8ddf-b39bc49cfb25	dc0d1c84e0db1d58406dfad8198562db559e4cb6b43ec86ac4c8795c465ec940	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.694	2026-04-08 09:53:49.701	2026-04-08 09:53:49.731	\N	\N	\N	\N
cc04e7a2-4d28-494d-b1b7-6d936b673dfa	5839d590105db4c8b2529260f5921bd09bf51385b006ac04c471b3186eedd1a3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.712	2026-04-08 09:53:49.716	2026-04-08 09:53:49.745	\N	\N	\N	\N
ef5d2cee-a02b-49ee-8334-1f269df26ce5	e67ae695329e01fe377ae1e56a9179d852853f965f9aebe99d76be20d47e5c4c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.719	2026-04-08 09:53:49.727	2026-04-08 09:53:49.756	\N	\N	\N	\N
e015e7ef-2a2c-48a6-9b62-cdd220cf7bc1	5657480c2ed05863c8b32dd7b77ebba86c04b97a304d6aaaf26122002653121f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.731	2026-04-08 09:53:49.74	2026-04-08 09:53:49.768	\N	\N	\N	\N
c43c2a0f-ca9a-42cc-8aa0-beb75a29ff19	a08a44181eefde0a97e64f0b467fab5e99db669cbba639f956dd94c56afff3a5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.745	2026-04-08 09:53:49.752	2026-04-08 09:53:49.783	\N	\N	\N	\N
e50aec87-0442-4c17-b771-95f44d56cb75	38e8438cc26934a174f4e270bca62c6214d95b4af9a9a5fe69e2e64cb8e554d8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.756	2026-04-08 09:53:49.764	2026-04-08 09:53:49.795	\N	\N	\N	\N
e4aa0dc2-41aa-4e78-b85e-98c1d03ecc5a	f5ce97c547241daefa962e2c27e5b93e1bba4dd5b34456d3749fb1692944d9ad	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.768	2026-04-08 09:53:49.778	2026-04-08 09:53:49.807	\N	\N	\N	\N
f3fca3a1-6996-40c4-a16f-f0de171d3670	59210dd44455cbd71a1486778f134c4a4c6eedfdc006eecf3e224bbcc8b8608f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.783	2026-04-08 09:53:49.79	2026-04-08 09:53:49.819	\N	\N	\N	\N
62b6738f-eeff-4cf5-9be6-89d59abfad49	668c5933d2999b250ba3fc96eaeebdddeee5f76d5e3ac1bfb07909aa26dfd32e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.795	2026-04-08 09:53:49.802	2026-04-08 09:53:49.83	\N	\N	\N	\N
12150893-e662-4e23-a2fe-2ce7a8d2236c	8e0d3b3604a217879d51559a25d2fb74fd8f96e61df153d3f90a97fe770c541f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.807	2026-04-08 09:53:49.814	2026-04-08 09:53:49.844	\N	\N	\N	\N
356667c9-301f-408d-8f38-a4e7ead7ac72	489d94c9d109dd3b2f492104275ebc58894d32a1530707406965674751385a9f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.819	2026-04-08 09:53:49.826	2026-04-08 09:53:49.855	\N	\N	\N	\N
da4a8a9c-a15d-4ce0-8320-3ece6a82496b	a942ceb059021d7d5a45829c2b7910996545541d8b842d7e9f692013e6935edb	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.83	2026-04-08 09:53:49.837	2026-04-08 09:53:49.867	\N	\N	\N	\N
1d913eaa-c14e-4d2b-9dc7-3bf9c588db4a	b8c4daed5ee1769c32d50c5407140a513d5e53ce159f7696eab36082465db487	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.844	2026-04-08 09:53:49.851	2026-04-08 09:53:49.885	\N	\N	\N	\N
77ee55c2-1c2b-4fdc-a424-428f63ebea49	e278ebff1dfebd9ebc4193e68e0ba430fa13e3e77c9637da32a556727fde300d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.855	2026-04-08 09:53:49.862	2026-04-08 09:53:49.896	\N	\N	\N	\N
740a3236-0778-4b9d-9366-3335e336c3c3	d4e2a316940312ceeaa66dfe2710e0d5d048d6964d8a7f4e12b1d6dce73bc4e3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.867	2026-04-08 09:53:49.88	2026-04-08 09:53:49.907	\N	\N	\N	\N
10132062-a435-4c73-adc6-4bfeaa21c966	ce0c154f8f960b796a532dcbe53dfca5d9346195c64df4b0369d30897b36313c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.885	2026-04-08 09:53:49.891	2026-04-08 09:53:49.92	\N	\N	\N	\N
b8d65a94-0396-479a-992a-035db42ca4f3	7f3c6865a9ca77d1c2a278c5f4566794e111f741df1de4961eac5fcbbd05152c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.896	2026-04-08 09:53:49.903	2026-04-08 09:53:49.931	\N	\N	\N	\N
9db5458c-d99d-4f2c-a84f-f81636debccb	87df21e53fc9eb8f262cca54d700366cb2e042b05499fe0aa8eeee2c647982af	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.153	2026-04-08 09:53:50.159	2026-04-08 09:53:50.196	\N	\N	\N	\N
13a658d5-8572-40c6-a64d-41ad9b439d06	a2079dd4888602e1007b2008f5d5f9aac5b935d64ee3101344a2c0489fa76dc3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.164	2026-04-08 09:53:50.174	2026-04-08 09:53:50.213	\N	\N	\N	\N
0a28594d-d65e-443d-a843-cccfe4f36d34	d958bff234814f09e9b38773928628ef4f8725f0fb7e8ea48a42f597fe36d519	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.184	2026-04-08 09:53:50.193	2026-04-08 09:53:50.221	\N	\N	\N	\N
479467c1-1bb3-4725-a728-636af6c2b982	e84ac9726c869d91c387917f974ceadd23f38522e7bf375cc176b944963416d2	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.214	2026-04-08 09:53:50.217	2026-04-08 09:53:50.243	\N	\N	\N	\N
9c18a1e5-52c9-4a23-80d0-71744d9c23e6	15dea7b05db6c501cb9bf6296fd44897d578822722235282f804092ab6d793cc	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.221	2026-04-08 09:53:50.228	2026-04-08 09:53:50.257	\N	\N	\N	\N
3a633f55-211b-414c-a02e-787ddc95bcd1	bbfa2ca7dda5cbef925568bce3697e001c78059587ba8c28d781b4c58041da82	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.232	2026-04-08 09:53:50.239	2026-04-08 09:53:50.269	\N	\N	\N	\N
b1935360-0bee-4a27-9752-d4896c6ef0f4	c87273dddf6585dbbdef293a4b1997a41feaa6a5a9be8770fdb7216475638ba8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.243	2026-04-08 09:53:50.251	2026-04-08 09:53:50.28	\N	\N	\N	\N
9e0d055a-1065-4e67-9bf1-ef945ac68dec	edcfda40393bca53d12d0091f783fa2a1668f79d27dbf94f2d727219dd56a860	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.257	2026-04-08 09:53:50.264	2026-04-08 09:53:50.291	\N	\N	\N	\N
8bbc798c-ac91-4867-b530-9946b28a6ed4	f335dc93e9cd718694bc1e9c0feb4f3de0ec83705ebb7695389c60ac924f7ce8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.269	2026-04-08 09:53:50.276	2026-04-08 09:53:50.301	\N	\N	\N	\N
1796227a-f58e-49f7-9f0a-55478cd23ac3	7f4b098108a3cf76b34132de0772f167d175da023e0acac149e089a2fb66340f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.28	2026-04-08 09:53:50.287	2026-04-08 09:53:50.313	\N	\N	\N	\N
280075ba-a10f-48b4-8106-6e1618cac897	196a450d1d576e295d74405c5a46e94fddbf0658d847be359247163b51a3e3a1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.291	2026-04-08 09:53:50.298	2026-04-08 09:53:50.327	\N	\N	\N	\N
e51c5604-ec9e-49c9-9f78-720cf93286ad	78ba7b34e80fd4275030db0a9e279d0fa13303bc6616580878b161cc1f4f75a1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.301	2026-04-08 09:53:50.309	2026-04-08 09:53:50.337	\N	\N	\N	\N
e176ebd1-1e35-4067-982c-f4d90927ba25	677bca0b2769d0d978ebf91fce7f64af85bfba0468d4c0ada4a67f686a49cdfe	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.313	2026-04-08 09:53:50.32	2026-04-08 09:53:50.348	\N	\N	\N	\N
70b6bc18-ea9c-4470-a1f3-8eef7184133d	580c27f0f52d4007028abf7207d735fbb359cb3482264a011a8656fbd8c5bf6e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.303	2026-04-08 09:53:49.31	2026-04-08 09:53:49.338	\N	\N	\N	\N
0a28eb8b-7d5e-4319-ac2c-d9370cdb2a62	a7be9be55bf0f50b0f0c4fac3ebf6b9f76a57b862a6a316eeb9f62dfca63e5f6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.315	2026-04-08 09:53:49.322	2026-04-08 09:53:49.348	\N	\N	\N	\N
f0b75821-c85b-4b3c-a0bb-a37827053a09	4715dd4d172b24903ea2e4bac9bf25b522f8ef214d46d9cf0ad7523fa1783fc8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.326	2026-04-08 09:53:49.333	2026-04-08 09:53:49.359	\N	\N	\N	\N
19e3b120-8824-44f4-9c1e-343ea59314b6	d0baa494370cc5aa55a6fe43e093823f86ab3d7e3c637eb63db7c76f01a2217e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.338	2026-04-08 09:53:49.344	2026-04-08 09:53:49.372	\N	\N	\N	\N
bcbe7203-1e22-448a-ac40-0f9ef2e68d8e	18f57207048197db843627acd26130601c342157f61ce9de230a60ca34a21747	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.348	2026-04-08 09:53:49.355	2026-04-08 09:53:49.383	\N	\N	\N	\N
b63a321c-03d7-4b09-888d-fc57b57f267b	09b102badbe04dd965724505b8009b21e5d5cabcc958d7c843055285e0de80a4	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.359	2026-04-08 09:53:49.368	2026-04-08 09:53:49.394	\N	\N	\N	\N
5fcf34b1-c918-4348-a363-74f369fcc960	00fb0a650a9c4fdc23bf685975b3184df944799b59d64234ac6ec5ef3b52b4c4	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.372	2026-04-08 09:53:49.379	2026-04-08 09:53:49.404	\N	\N	\N	\N
e5649798-cabe-4891-96fc-bc4ba8f006e2	e66d7acb3579b1a03d9ea320ce9888571e37f73f038595c8bdae829ca4fd3058	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.383	2026-04-08 09:53:49.39	2026-04-08 09:53:49.416	\N	\N	\N	\N
f0d81d45-8433-43db-8834-4e9f149fbb32	604ccee7dcd0b9aee2b76bf133aba1bfa6899595557ab5c02a0569205f003838	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.394	2026-04-08 09:53:49.4	2026-04-08 09:53:49.43	\N	\N	\N	\N
8b7fee9e-fe49-4976-9c77-e3397d70b554	80e32b909f545f34b7288fcc954084a6a7f2d8fb8ef48f3dcae8348c5e2e127f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.43	2026-04-08 09:53:49.437	\N	\N	\N	\N	\N
ed3333b0-2de3-449b-9c75-2bdc009f6d68	1273319185f09766f3303e6e27d4a2c0222f5934b80545d29d85807cb46cae83	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.404	2026-04-08 09:53:49.412	2026-04-08 09:53:49.441	\N	\N	\N	\N
500b156b-788e-4a65-b597-cf11aa8b988a	582c3202d70f6dfdfb0d0e52c32636c7959a7428a79d161f7e3a75d20796d522	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.416	2026-04-08 09:53:49.423	2026-04-08 09:53:49.452	\N	\N	\N	\N
db95b178-de4e-4b55-874b-0796d6ef5aeb	84ca46ca694f626034599008aa5ba247f5f113519a00596d67def3eb75d229af	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.441	2026-04-08 09:53:49.443	2026-04-08 09:53:49.476	\N	\N	\N	\N
720ca43e-1bb3-43ee-9576-979265691156	fa9d54640104544dab6c0fa6666a59a06d8bec8938b0128f9f6048e0ce4f04b3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.476	2026-04-08 09:53:49.484	2026-04-08 09:53:49.514	\N	\N	\N	\N
e20e1b7f-f213-4c22-b2ca-70a795b5ea2a	3b0fdfc636177c7076a715bc28566bd951029fc0c7ebcd0947cb688d2289526d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.488	2026-04-08 09:53:49.495	2026-04-08 09:53:49.525	\N	\N	\N	\N
ec494756-0781-4a56-a999-cfaf09b5487f	873013dee2c3483537397ea53e8536b3119069e236e9b0d00f13bffd7a4b3c6e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.502	2026-04-08 09:53:49.51	2026-04-08 09:53:49.537	\N	\N	\N	\N
4f51c252-4eb5-4e9b-bd83-56cb8ff174fe	1b4736d71cb3e84d6081551086d992c53d8caedea70b074b4b121a233af65ddf	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.514	2026-04-08 09:53:49.521	2026-04-08 09:53:49.548	\N	\N	\N	\N
ce573080-851e-470f-97d1-680dfe2995fe	188240f5a0bca7b5f71c053c248370772d000a22caae88ecff1c98dd776e1d88	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.525	2026-04-08 09:53:49.532	2026-04-08 09:53:49.559	\N	\N	\N	\N
e9349ff5-ce1e-4136-a81e-c3e53809c8b3	60609e0ad3417f2d80207a230a7cd2d8e3944579bbf5475069711f4be087bdd5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.537	2026-04-08 09:53:49.543	2026-04-08 09:53:49.573	\N	\N	\N	\N
76a71101-9288-4139-af66-729ef098f3d9	cb36c2019f53fa868e29887ae1beddea8b2558a3bc9d23a27058e45176ce607d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.548	2026-04-08 09:53:49.555	2026-04-08 09:53:49.59	\N	\N	\N	\N
fc972197-8ea2-4782-9164-a1a3e56eeffd	5b0ff48cda6e007bbfc5886ebc3f3240587b14ae2c3d9b1a9c3b401f73e5da4f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.559	2026-04-08 09:53:49.568	2026-04-08 09:53:49.6	\N	\N	\N	\N
8152cf8e-99bf-486e-9fc8-5f4e3119d8b7	1e0f2e0c3dca96a4745d25a437f0ecea042eb9bc5c1c6a3f9529fd8a4ed8de59	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.573	2026-04-08 09:53:49.58	2026-04-08 09:53:49.613	\N	\N	\N	\N
10421774-7d00-4631-acc0-6bc9e38d1299	b316dbcf30db6e77222478444f9e1f35eaf54a9c42c88b1981bb76b78c55702d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.59	2026-04-08 09:53:49.594	2026-04-08 09:53:49.62	\N	\N	\N	\N
6034371f-f1ec-461c-9163-85c0e625a7d1	a13f7ce83b0f4b0d07f74e475dfdc83bb93f124b214fb1256329df17438e186b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.6	2026-04-08 09:53:49.605	2026-04-08 09:53:49.632	\N	\N	\N	\N
f866ee32-d26a-414f-af02-302d3a2e2305	059a4ddf428ebe12e570e582297e0ad505430ca61adf81a1a72847fc3f1a12ce	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.613	2026-04-08 09:53:49.616	2026-04-08 09:53:49.646	\N	\N	\N	\N
68c4eadd-dd55-4f98-9ef3-c5d6b2106469	343dedcf229a827c67983430257b24f3a1f6b8e84b70271da0d95aada8c18caf	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.62	2026-04-08 09:53:49.627	2026-04-08 09:53:49.657	\N	\N	\N	\N
c55623ef-7b66-4c26-84ca-8632f0b2a404	b611bbc1b5f24b5ab1a8c4b0d07c2c8b5087770527b94da1e018d700183df701	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.632	2026-04-08 09:53:49.641	2026-04-08 09:53:49.67	\N	\N	\N	\N
71d1c94c-b971-48f0-86d7-cea59a73f19b	e13c651dec5d1b73c110628a1885757206b35e5587c03db5417011842a9fe85e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.907	2026-04-08 09:53:49.913	2026-04-08 09:53:49.942	\N	\N	\N	\N
534ed66a-e982-4f61-b319-01a133231489	f359e859ef78d510410b77a7ae28e04a98953187b0394cb397a2c7deb83da2ce	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.92	2026-04-08 09:53:49.927	2026-04-08 09:53:49.953	\N	\N	\N	\N
1949e023-c4c6-42a7-8e61-6ea3b99921de	388f6090ae50e4c372b40e2af1fce3d358032adc7dc64842cd1a6aae53c97ea0	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.931	2026-04-08 09:53:49.938	2026-04-08 09:53:49.965	\N	\N	\N	\N
fa9529e2-50fe-4894-97c7-0a4eafefce92	70b7115779617d7ade160e1576628dac19c21dacc6e9c041bf95ce91b70d0c98	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.942	2026-04-08 09:53:49.949	2026-04-08 09:53:49.976	\N	\N	\N	\N
48698da9-fc74-4581-9ee8-d8597a605779	03c4771fd72da6506483ab08e7abb70b78e9d5d95eafc0ef15dd484225a8382d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.953	2026-04-08 09:53:49.96	2026-04-08 09:53:49.99	\N	\N	\N	\N
410b5b19-c76a-4a29-8fc9-3ff8b7d76abb	958dbe5d309cec49830756d1b7ecc39778b8cbe5c1d4c03e7ec64d78d89f71fc	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.965	2026-04-08 09:53:49.972	2026-04-08 09:53:50.001	\N	\N	\N	\N
f436914d-6936-4a2c-ad15-1df346158a7c	86efbba0b5b3adf542907741c6b0fa11617750591566861f60f3ab6f2eda28c5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.976	2026-04-08 09:53:49.986	2026-04-08 09:53:50.013	\N	\N	\N	\N
b5060e6b-64b2-49f4-8217-e4d7bbbd66c3	3a0a5d60d55214004dbad1e6cbdf9e8bbca3870b21504ee3511f5a4e164c934d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:49.991	2026-04-08 09:53:49.997	2026-04-08 09:53:50.024	\N	\N	\N	\N
a536ae8d-41ea-4162-a0f9-1bc8e0fb6df2	2815c6e922f064a1535ed7edf9a18e5ba1f5b5c33b23c16c658f1d1aa1cde8f7	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.001	2026-04-08 09:53:50.008	2026-04-08 09:53:50.035	\N	\N	\N	\N
5c1d8d5d-7772-4991-86a7-5032753c1642	ffe9b687dc30391e0a7b33174e44b25b892250f83a1df992e2ac3260dac00d3a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.013	2026-04-08 09:53:50.02	2026-04-08 09:53:50.048	\N	\N	\N	\N
9ccbb89e-d94a-42b9-96f5-ed700db53f91	d5d98a38c16581291202c757dff404a1c0310fa5f2bb9ef0a7228628c3a97448	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.024	2026-04-08 09:53:50.031	2026-04-08 09:53:50.059	\N	\N	\N	\N
b6c6678e-cd4a-41f7-865d-8622302898af	cc4da138858fa89c9381250b0b311f3205554d5840b1ce482e3d89930fba1301	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.035	2026-04-08 09:53:50.041	2026-04-08 09:53:50.07	\N	\N	\N	\N
5d94d611-0a24-403b-a6b5-dbb8dde771d8	4785b643cc1073d063e9e1d92fe87c8c3fdc4e9692d325b66aaf1e971c8e3fc6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.048	2026-04-08 09:53:50.055	2026-04-08 09:53:50.081	\N	\N	\N	\N
4fb00363-4437-4837-a4ea-711aba3b566d	969d4f4a52773380955c169557f06b3112f4d949b82a2047e902fa6abc77c963	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.059	2026-04-08 09:53:50.066	2026-04-08 09:53:50.093	\N	\N	\N	\N
62d33d2a-cdfb-47a2-b8f3-f323fb75dd86	2ef98971d62966ff5cde428efd7bf542bdd7ee7bd5d28997da82831c5c98b922	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.07	2026-04-08 09:53:50.077	2026-04-08 09:53:50.104	\N	\N	\N	\N
0246cdfd-781f-4b45-8346-7a9ed49fb5d3	d4d0aa7a614caaa76a620bdb6d596fe26fe8d3cf66fe73619d82ce34d1cf0619	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.081	2026-04-08 09:53:50.088	2026-04-08 09:53:50.118	\N	\N	\N	\N
2fdb18d6-f8c1-4e5e-9dc1-76e3da6e3251	4e2cece095c4fcfb9751924ba5cafdb924955bcd6265c306715b2efc8e9aaecd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.093	2026-04-08 09:53:50.1	2026-04-08 09:53:50.134	\N	\N	\N	\N
183d1614-b934-496e-a28b-8d4860974634	935b96445e3a7f7e1093cb632e0ef673dcfc59ec56ee2de8aefede9b77cf425f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.104	2026-04-08 09:53:50.111	2026-04-08 09:53:50.142	\N	\N	\N	\N
8fe45212-654e-49ac-8868-5f4375c1f3d6	11b58ba7b675b019864a287e745f6b8d3397eec16521dc5eecb8454dbab054b9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.118	2026-04-08 09:53:50.125	2026-04-08 09:53:50.153	\N	\N	\N	\N
0b85a9c2-7b00-426e-9763-5a0c7534e788	3a06ca39b6ff071579f62c585a88f1df383dbc32bd6f7bcc7453442e932c4ca0	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.134	2026-04-08 09:53:50.138	2026-04-08 09:53:50.163	\N	\N	\N	\N
571be579-1549-437a-8c99-2e521d57da45	96f0ae53ac8a12e31bf2341738338205af3bbaa2f6197185f38f55aed8b64588	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.142	2026-04-08 09:53:50.148	2026-04-08 09:53:50.184	\N	\N	\N	\N
b5230f7e-cba5-4af8-bc57-40213a99eaca	bc7ee4cf794f4e4d732fd1a0151fa174b08ec2e580587b244b3fe535da08030e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.196	2026-04-08 09:53:50.205	2026-04-08 09:53:50.232	\N	\N	\N	\N
c322661c-4069-4d4d-8efd-f3559f46f43a	99b91e76a38b171304a99ff3c4e8b2c72d51db49fd1eb93f4fbfef5c3025e6bd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.882	2026-04-08 09:53:50.885	\N	\N	\N	\N	\N
0f7aa51f-2447-4f86-a302-ea3912b84336	402ec3f0f14e09613640216f2146838d76c1e8e510469c5499fb45f1bdea318c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.327	2026-04-08 09:53:50.333	2026-04-08 09:53:50.359	\N	\N	\N	\N
f0d3fecf-3f09-420d-83c4-df713734dcfa	b2e39822b8f0ca79e2cbc35aaad697bb38bd9714275eccfc1c27aefd22a14b67	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.338	2026-04-08 09:53:50.344	2026-04-08 09:53:50.37	\N	\N	\N	\N
5eb217e1-2d87-4939-bdcb-8b6ecff74cf6	ac71ed7585760f21de30845be3737a9117c5859595ed13ae8ba4eea767cc33f3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.348	2026-04-08 09:53:50.355	2026-04-08 09:53:50.382	\N	\N	\N	\N
90491052-ee9e-4377-9a25-157f212c2397	6f52d563132206d26951a888c195d2db3565470e7c3872d0c9eda06575bd7ab3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.359	2026-04-08 09:53:50.366	2026-04-08 09:53:50.396	\N	\N	\N	\N
93341276-295b-4a17-b448-87db229917ec	3dac7adfae98e828fe6caf1445783180c595f1c877b49f7cb1045e6fec66cac7	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.37	2026-04-08 09:53:50.377	2026-04-08 09:53:50.407	\N	\N	\N	\N
41736230-49f2-4e84-b7c8-610633d4cb84	4f387d0ca6c89f599e7e03de2bc8a87f77d9bbc2565a759682f91a7b90039eec	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.382	2026-04-08 09:53:50.392	2026-04-08 09:53:50.418	\N	\N	\N	\N
c3b2815f-716a-430c-b283-87c31c81095b	4d5839e0427df7d9d89c99d8082c694113fe3d6158073ac02c078ed0e16ef2ea	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.396	2026-04-08 09:53:50.402	2026-04-08 09:53:50.434	\N	\N	\N	\N
70e8e61d-8a46-4796-a593-53fb3f3a3a3a	9794893720937633e4844d3860c5b4651a94f73f8a315c3ac2e68121e483a358	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.407	2026-04-08 09:53:50.413	2026-04-08 09:53:50.441	\N	\N	\N	\N
e388d3bc-2457-4e01-ba2c-e17a4e045e46	f3449caa3dcf69166c92caf4902f943694147ac1e3e31eb31e3f1a358c05abf8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.418	2026-04-08 09:53:50.425	2026-04-08 09:53:50.455	\N	\N	\N	\N
54d85892-1a95-4c50-b2f5-f55a10ad4c87	b737b415b829225ca082c669e2a036368620fde0297812d763352fcad8404b5b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.434	2026-04-08 09:53:50.438	2026-04-08 09:53:50.472	\N	\N	\N	\N
3af04fa4-93b6-4267-8698-877c672ac2c1	abf01a75083d4c1b4738bb4dff5dd781f6ceb9bc7a8ca4687dbaa22f1b4ea3bf	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.441	2026-04-08 09:53:50.449	2026-04-08 09:53:50.48	\N	\N	\N	\N
c30b06eb-5967-48be-92a1-09e4e288110d	bd1b51b710398b7f1a2059ee5796055e0eb8f834992c9ceb646dff9c54f011b5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.455	2026-04-08 09:53:50.463	2026-04-08 09:53:50.492	\N	\N	\N	\N
8ea96347-b00a-4ee4-a58e-8673932d3f46	36e2a017462545f044ac214476c890089ca7adc556d58ef12cf5267a08b0ba44	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.472	2026-04-08 09:53:50.475	2026-04-08 09:53:50.504	\N	\N	\N	\N
e367e59f-852a-4d25-8cf9-02404f77d01b	3702b94dfd34d9303c926f508c530664fd1a227c922e835a6bc3b407635e6adb	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.48	2026-04-08 09:53:50.487	2026-04-08 09:53:50.516	\N	\N	\N	\N
c13a419c-a2ed-4c73-9471-d3f3e2a27415	1fca5590ca08278a596d269c2fcd31ee237cabd3b8fefcf252fdb31b79d65027	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.492	2026-04-08 09:53:50.5	2026-04-08 09:53:50.53	\N	\N	\N	\N
fc3dc23f-003f-4dee-964f-264c031220de	67916e97e5cf89b21da66e20e804477850e51873ae5770d2f51faa10547e1707	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.505	2026-04-08 09:53:50.512	2026-04-08 09:53:50.546	\N	\N	\N	\N
15dad92b-8016-492f-b41c-c6db27952541	b1a037890069a479eda3e7eac437f10f4690bf64e3f26cacb6fb59231107b5ab	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.516	2026-04-08 09:53:50.523	2026-04-08 09:53:50.553	\N	\N	\N	\N
2316874d-4de9-45d7-a8a3-ed8bf6b9b7b0	8f2ba905b158d0283276e7f7639e5c99d0f3b603899db0640d708190ae48b662	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.53	2026-04-08 09:53:50.537	2026-04-08 09:53:50.564	\N	\N	\N	\N
dc25e3a1-900f-4944-8bc6-d45c62d4d69e	9b9258419688c34bb4dce46aafb3e55106040f541d334cd9cb3c0bd0fa364172	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.546	2026-04-08 09:53:50.549	2026-04-08 09:53:50.575	\N	\N	\N	\N
213aa205-4a51-419e-b2b9-a2e75dc90b6c	f0cc8b50b2556c3c65a731197b7e37e2d8dad1c147436921b838f8d44105afc4	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.553	2026-04-08 09:53:50.56	2026-04-08 09:53:50.587	\N	\N	\N	\N
a0f5b695-e97d-4771-9442-6a27167a10ac	efc2ee6957da86fe2176523d3d102d14d7d78ca9a3d9b2148cf6069fc6672b62	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.564	2026-04-08 09:53:50.571	2026-04-08 09:53:50.6	\N	\N	\N	\N
fa8789fb-2a50-430c-8143-bf67188729a9	f340ed52af24d4c180d1f65073ad2f75c53a78c6a027300b4fb320089e0070aa	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.575	2026-04-08 09:53:50.582	2026-04-08 09:53:50.611	\N	\N	\N	\N
07205123-0ddb-42d8-9698-9a35abf4f30d	cbf2c382cddaa7885c4d3ee53fd38d53ddaad0ab9d67ff9495090bb0f1e3fd66	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.587	2026-04-08 09:53:50.597	2026-04-08 09:53:50.622	\N	\N	\N	\N
135ac89e-4262-471e-969a-696df94b39b9	a343264cc449f27cd486efbd54a5eec7f5af4d1c5939fe22bcbc0c7b57f2b5e6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.601	2026-04-08 09:53:50.607	2026-04-08 09:53:50.634	\N	\N	\N	\N
c8372456-3fe0-471a-988e-912c1a993f29	e95d8690ad88218f51b3c3626d8e28177af04a18260c127048e998cd17aaf74e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.611	2026-04-08 09:53:50.618	2026-04-08 09:53:50.646	\N	\N	\N	\N
e0d3f52a-48d5-4025-b465-b0fa38b7c807	2f8165cf9a20be1a95567e83699feff25ea673b6c4c5ce66dc921127c9da5180	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.622	2026-04-08 09:53:50.63	2026-04-08 09:53:50.66	\N	\N	\N	\N
b8bb3086-72c5-48ad-9e26-de958febc06a	33fee32c463d7fe5b71180dc61a020463fd64c4867ff13ff73a20b25fb87d15f	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.634	2026-04-08 09:53:50.642	2026-04-08 09:53:50.672	\N	\N	\N	\N
f2d9cbaa-8c3c-4a2d-ba34-8ec83b77087e	7a899d76a04d4bb5a1e443fb4592efccfef76847b15f60feec205a0b312d5d3d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.646	2026-04-08 09:53:50.654	2026-04-08 09:53:50.683	\N	\N	\N	\N
b6b333d0-450a-4cc7-aecf-98a09952c39e	13a8c155a06853d1b1a9e6afda9272120ea6a2ac615d326e64191669551eee85	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.66	2026-04-08 09:53:50.667	2026-04-08 09:53:50.695	\N	\N	\N	\N
d039b05d-2432-46b5-a87c-5bb577f6e860	531d524d98acee2a1ea30a5a35d2a09eb98eacd19750be801c0b68efbd017237	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.672	2026-04-08 09:53:50.678	2026-04-08 09:53:50.705	\N	\N	\N	\N
dc031cdb-3603-4414-9015-fc53fd248947	12aa9b0bb4e3d5e7c7f630eaa42f615d673d9d09eeefaaf7b8a9a71ef9718434	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.683	2026-04-08 09:53:50.69	2026-04-08 09:53:50.717	\N	\N	\N	\N
916d4164-638d-41f9-a0d0-e239cdc66fb3	e533e6dc68e46304bf17bf5000b9aeba12669bb64b4834570e24d7cc0eaffaa8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.695	2026-04-08 09:53:50.701	2026-04-08 09:53:50.734	\N	\N	\N	\N
e4ca49e8-122b-4dbd-8eee-fe608ce755d3	703f57fa858026d598b337b77ec2cfc6b4d2c3e8737029b4da93c200c37c4ea5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.705	2026-04-08 09:53:50.712	2026-04-08 09:53:50.743	\N	\N	\N	\N
bb72eb26-9b93-473f-be1c-d7d98626eb06	75e5069c1684169df601e49207cc3eac18de2e33eaf8c5666272e4d89529159d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.717	2026-04-08 09:53:50.724	2026-04-08 09:53:50.754	\N	\N	\N	\N
3aa07809-e7ef-4a9c-958b-b9ee6c78d3d9	8525d4540d7499990dc62e61a0a18b8c56af6473801c4b0371e637a0eaefa111	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.734	2026-04-08 09:53:50.739	2026-04-08 09:53:50.765	\N	\N	\N	\N
77cc2f67-a2d4-4230-a4c9-4fb733c03eec	2747b61fdab21b6ad0d5b87ff83dc2fd2733ada9d5b7bf3dc56f3481f260559d	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.743	2026-04-08 09:53:50.749	2026-04-08 09:53:50.776	\N	\N	\N	\N
1ef0fecc-8f22-4623-8058-fbc719df6aca	011842325f7eba12f20785e5ee8f2b8418773c2549dad34d4b1dd53bc23716e6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.754	2026-04-08 09:53:50.76	2026-04-08 09:53:50.787	\N	\N	\N	\N
6b0deda9-8b32-4c12-a380-75b719bd2819	8721b2713ff66de504121cab815c4c5402478792827c0c3e1b75cb273b2f7034	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.765	2026-04-08 09:53:50.772	2026-04-08 09:53:50.8	\N	\N	\N	\N
9be52cda-d67b-42f6-8841-6fa873f07fc3	75abfe06def4c8406d24677dfd6c7aefd19657bea874b3b42a33c556e63af5a7	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.776	2026-04-08 09:53:50.783	2026-04-08 09:53:50.812	\N	\N	\N	\N
bda6f31b-d468-4736-b8b5-12def1f5a10a	17c39d966cad57028836fd107775d4ed0b90af4496d60e1cf4471a9d4f760be5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.787	2026-04-08 09:53:50.797	2026-04-08 09:53:50.825	\N	\N	\N	\N
b6f9b8fc-559a-485e-a088-a836169ca831	09efe63e04ec36882598d5237ed1505ae575ea9fb4238403e5c1e4c9f2e58508	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.8	2026-04-08 09:53:50.808	2026-04-08 09:53:50.836	\N	\N	\N	\N
97f5347a-7bd8-4429-aee0-98f113ed52d6	261bb65b26de4bd7a68c3d14cb229dd2f14f25dd97499b5130c1b8cfcbcc1281	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.836	2026-04-08 09:53:50.843	\N	\N	\N	\N	\N
2ea535b9-d1d5-41cc-8db0-faafe5128d91	aa249ec536d36008c6d7a37148acda3a065a1fda7a204350f8d2d088e45bdccc	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.812	2026-04-08 09:53:50.82	2026-04-08 09:53:50.848	\N	\N	\N	\N
5f92ef6f-1f62-40b0-8dfe-52e773cb3eb8	3398f1dfb6995b3e0e93972509721e04fc3d657f1fa05aa74a6150a9aa073799	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.825	2026-04-08 09:53:50.832	2026-04-08 09:53:50.859	\N	\N	\N	\N
937dde0c-8840-4abd-b91a-3ab1af1f25bc	83bc3fba7eb76a2ffa9097704b86c0581e6de17ab2551f987b6c80c266a42589	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.848	2026-04-08 09:53:50.855	2026-04-08 09:53:50.882	\N	\N	\N	\N
bc785a98-af20-4e22-a829-a79a3a31c896	d3e4d358c58f78f4731f92bedeb1a51d46cc42e56518c1cf8433ec67742239ab	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.053	2026-04-08 09:53:51.059	2026-04-08 09:53:51.089	\N	\N	\N	\N
5d0ead7b-c318-48cf-af46-71ee7b8748fc	a9bd328cd113b31e35d06e73561f5a8915f70c1a901b1f9471b2ae3ccfa32b0e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.859	2026-04-08 09:53:50.863	2026-04-08 09:53:50.898	\N	\N	\N	\N
ccc84301-652c-4c0c-ba5a-8b95b0039395	accb22d75d4d32fdd1a18b35afac6c3e69d4d56f09165813fcd1934843bbd84e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.885	2026-04-08 09:53:50.892	2026-04-08 09:53:50.92	\N	\N	\N	\N
0b857959-82e4-4c01-8949-2af1600284e4	3da42aaccae72fd3b1dbc8de2ca43c55c0cdaafa020f8078b433326a25f3f10c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.898	2026-04-08 09:53:50.906	2026-04-08 09:53:50.946	\N	\N	\N	\N
3b657531-4973-47d5-aa23-20ac38cea2d5	43387fb65eb8c4726fff52aeb38b2debf77e7ef61634c51dccd3bef6c54eb220	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.92	2026-04-08 09:53:50.927	2026-04-08 09:53:50.958	\N	\N	\N	\N
d20e2518-7093-4163-b295-1a37b3d67f59	82c9bc3f593c054a1eab7f895a1c79106aabc0d799c43e945690124f9d9672e3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.934	2026-04-08 09:53:50.942	2026-04-08 09:53:50.97	\N	\N	\N	\N
3229f735-b13a-41af-9d7b-8b6d37d4e377	fece9cec9c7150705d324303ac9f09ddfd335d891472fea6bad9e63f8ceda1d6	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.946	2026-04-08 09:53:50.953	2026-04-08 09:53:50.982	\N	\N	\N	\N
165c03cf-5e80-42c7-8cad-5bde6f058cd7	3f374ba18de1938d7e32c728f1dd6f5a48e8239b6ec3c6ca50453f624f142bf8	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.958	2026-04-08 09:53:50.966	2026-04-08 09:53:50.994	\N	\N	\N	\N
65e66994-8e10-4f70-a95d-bf687c2db4d6	a5f6a7c67a1e33051829f74839e263aaeadd31641b5a8a3d4b60ffba0aa2fc98	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.97	2026-04-08 09:53:50.977	2026-04-08 09:53:51.007	\N	\N	\N	\N
c4c256a9-41f8-4c5e-a3df-c72f7f610c4e	d7ede73b2e842ddca4b160176c4d5da438aa00b1be099cab43f5fc73be8447c2	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.982	2026-04-08 09:53:50.99	2026-04-08 09:53:51.018	\N	\N	\N	\N
c17f3297-c304-4590-a506-8d034cf6ab45	dc02f9470b9dc072622984276d9a784fe542483559e398587fdca87d27b1380e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:50.994	2026-04-08 09:53:51.003	2026-04-08 09:53:51.029	\N	\N	\N	\N
ef1870fb-97d0-4d7c-844e-14fa5f025b01	8d7db4c04d0d8620a361c8ee21ded195ad0fab6b72ec35c86c902ee5a52e67f4	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.007	2026-04-08 09:53:51.014	2026-04-08 09:53:51.04	\N	\N	\N	\N
0d42ee9c-4512-4509-bd59-a40f0843a753	dc20c82a09f7562759177b7326afcfa79037ee117cd4cbce6b6b21dbe918eebd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.018	2026-04-08 09:53:51.025	2026-04-08 09:53:51.052	\N	\N	\N	\N
87795b68-b4ab-4679-90e8-290bc6612126	c328d99622f1f108f8637b32393fbf56a596fb00cc31985c8e673a67d3c28a7a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.029	2026-04-08 09:53:51.036	2026-04-08 09:53:51.063	\N	\N	\N	\N
d1c88f66-fe82-4846-96d0-4b1b2e097f93	7b3012a7eef1d05fdfdc2bc26c73fc0b313c9c3e182343584ac3e93a4c10d697	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.041	2026-04-08 09:53:51.048	2026-04-08 09:53:51.077	\N	\N	\N	\N
b7fd0ea0-950b-46a4-8586-71822b9fd853	1aa43a19b9a429ed09bc45121ab3891ab9522059550c90f56fa2f677d1124b16	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.063	2026-04-08 09:53:51.072	2026-04-08 09:53:51.105	\N	\N	\N	\N
aafd6079-2aab-4810-8905-5fc6455ac8dd	e055510b09bb99712b66fdd2ce7126708001267bcfabf1a8bb7b68ab135f3174	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.077	2026-04-08 09:53:51.084	2026-04-08 09:53:51.112	\N	\N	\N	\N
70732361-6b5d-439a-9811-8a224de2aeca	c1d1fd789b0ce5b5c18c24f4fdfb1701ce8e83b6b5890b5342bdf2b73826c2f1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.089	2026-04-08 09:53:51.096	2026-04-08 09:53:51.128	\N	\N	\N	\N
7eb26387-2784-42ca-8dff-eb4bdc39d11b	bb09fe138beb19dda035c29891723bb118ea46d5979effb9920f18fa8328924c	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.105	2026-04-08 09:53:51.108	2026-04-08 09:53:51.135	\N	\N	\N	\N
471619b6-34ab-40fd-ab5f-c9ac0a052e01	4a8e5d95349305abe416e38da29efc39a5d265a3d503d6c00d867f34eb9d108e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.112	2026-04-08 09:53:51.119	2026-04-08 09:53:51.149	\N	\N	\N	\N
20b35ac9-3bfd-40d7-8077-22b37939180c	bd8c4aca7293d4beb2b4d90d9a13c74bd58ff16b167c3edbc5b6fc0860997c10	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.128	2026-04-08 09:53:51.131	2026-04-08 09:53:51.16	\N	\N	\N	\N
d1f60dd6-3225-4b09-a55b-c260507e7113	38f7130bc4423faff1d7efd1788cba5dcd0261e23b26b6e317eab93b9c71b9aa	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.135	2026-04-08 09:53:51.145	2026-04-08 09:53:51.172	\N	\N	\N	\N
0d11d42f-afab-42c3-b379-b4e410a09859	402f2fc35bcb1cc004f675cf29fce485d89a0e6a684cdf814577d77bc33b30bf	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.149	2026-04-08 09:53:51.156	2026-04-08 09:53:51.184	\N	\N	\N	\N
dae69235-9cba-48eb-8940-96965530e454	b8dd5c810bc8bf9b3ad471126ea4f2da21fea579f73673208ae522d66d9484f5	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.16	2026-04-08 09:53:51.168	2026-04-08 09:53:51.195	\N	\N	\N	\N
a6f8ecd7-87f0-4c0e-8b0e-1e8e9adb375f	0d62685433a6d9bb9e6696591731f5e13c2c8d0ecd329cfb4d6964fe9b8870a0	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.172	2026-04-08 09:53:51.18	2026-04-08 09:53:51.207	\N	\N	\N	\N
ef36a3d0-6141-4a27-8468-9c70eed6fc8c	e622524966da460c95f750c6700aadfc6f25494b8ecb8d6fbc9ccceaafd540bd	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.184	2026-04-08 09:53:51.191	2026-04-08 09:53:51.221	\N	\N	\N	\N
ecfcffd8-fe29-4467-bd38-aded5233850d	59058db2094aa05aab94e380dff5e4c648c8b3d9065dfd298b746e1ca083b541	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.196	2026-04-08 09:53:51.203	2026-04-08 09:53:51.232	\N	\N	\N	\N
5e3bdadc-65c3-4b51-ad1a-2e2243e02702	d132b63a7bebb47a1a7a8a696b3aca28bedec2d02fd1a61ab5a71688fff2bbc3	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.207	2026-04-08 09:53:51.216	2026-04-08 09:53:51.244	\N	\N	\N	\N
88db9bcd-fad1-4f9f-a928-9df7409114a1	30d518bac433b8e3e48582cf3e6db0d814e29a61095c96bf87c6f5734eaa4937	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.221	2026-04-08 09:53:51.228	2026-04-08 09:53:51.256	\N	\N	\N	\N
1c0362e6-e91a-4261-97fc-d48bdc518427	28a483504fb1f518af1fa48c4521a2e9e423d01b39c3ef2e7d00d5005b4a86d7	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.232	2026-04-08 09:53:51.24	2026-04-08 09:53:51.267	\N	\N	\N	\N
b39b91d5-12fa-4abc-b30e-24745c74cb23	83ba8e598b731c6da479c6f65a61866abb2be08f8ca9dbecce9012c0ad9d9644	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.244	2026-04-08 09:53:51.251	2026-04-08 09:53:51.28	\N	\N	\N	\N
714fa019-6301-4aca-aec9-7bde8ad883ec	8365dee9554f9e770d116903c4d2a853eacb632089720867bf41789317feb9e9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.256	2026-04-08 09:53:51.262	2026-04-08 09:53:51.292	\N	\N	\N	\N
4b37a72d-3786-4787-b6cb-dc72ca60ff5f	6df706fae213ac0cf61bed58fddbc23418dbff4d7944bf433fc6f0470780da4a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.267	2026-04-08 09:53:51.274	2026-04-08 09:53:51.303	\N	\N	\N	\N
23fd4b9b-9bed-4b40-9c72-1bb18266796e	6e4cd3b1f57eec2a16653dc119cce774062e04f219b65d28fd556ef223122887	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.28	2026-04-08 09:53:51.288	2026-04-08 09:53:51.315	\N	\N	\N	\N
15de887e-1cfb-4ff6-862f-1c1bb7a1db5e	dc40be04d708379795db5e4f4772cc2e61fbca78f3747f437a6cc6af73b148cf	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.292	2026-04-08 09:53:51.298	2026-04-08 09:53:51.327	\N	\N	\N	\N
881af43c-66f1-4989-a539-19d4025662ad	8351fc2abcdded6126c7c19f87a26ecc19dfbe4a7602fd2042b098b0270bf125	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.303	2026-04-08 09:53:51.31	2026-04-08 09:53:51.34	\N	\N	\N	\N
77e5f5bd-6f31-4722-a4c5-cc319f0617b6	b1405856b4f79ed504db500d5bea5d5846394a4c49cdf993dd0bd03a7a111460	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.315	2026-04-08 09:53:51.323	2026-04-08 09:53:51.354	\N	\N	\N	\N
48286fee-77b8-401c-8592-5bb11bbfe8bf	810527204afa173266f4bb626f8b37465488060e3c38aaf9cc3903d05c5738d9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.327	2026-04-08 09:53:51.335	2026-04-08 09:53:51.367	\N	\N	\N	\N
0788a9f5-56ca-4b5a-9564-b2530d1005e7	fc7383417ed3c6aa9151a3eb26fbb2ee0c12dadf39c102428db703fe0294ee21	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.367	2026-04-08 09:53:51.382	\N	\N	\N	\N	\N
745ac4f5-d39d-449f-ba37-e883a74daeba	41a35c27b10167ccdb21599543cf41bb32df33f3dffe53b6e7f4b693bc2a6a6a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.34	2026-04-08 09:53:51.35	2026-04-08 09:53:51.392	\N	\N	\N	\N
1a0101ff-7a69-4d61-abe6-9289f4b8d7d6	9cbefb0b7c19a32710f143a8a393c9184a5101ac7a6f7410cc3c304b8116fe3e	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.354	2026-04-08 09:53:51.362	2026-04-08 09:53:51.417	\N	\N	\N	\N
f4815bea-ed86-405d-8be9-189f9ac53686	26a1d4ce9ed3e16335704da8034f4a2f799e9710b7f52b45f5fdd6161b568999	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.392	2026-04-08 09:53:51.399	2026-04-08 09:53:51.429	\N	\N	\N	\N
0fec670a-3165-4da8-a217-1fe3c01d8479	a211e68dce00e0880db83e311582b4dd1054d777f10228f749a8eca61ade3b86	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.405	2026-04-08 09:53:51.412	2026-04-08 09:53:51.443	\N	\N	\N	\N
737b5b47-fc81-4b18-acce-37571f954ec3	e7bb2ee484d33662a7a0f397d8bfc2be25a0224aec8e771699997ed891f0fbd1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.417	2026-04-08 09:53:51.424	2026-04-08 09:53:51.455	\N	\N	\N	\N
b502c3f2-69a3-4ce3-a473-0ee3c6d76890	3770ae8316481f825fd2661801959e9034c181f119d9ccecf9c17b68506b337b	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.429	2026-04-08 09:53:51.439	2026-04-08 09:53:51.472	\N	\N	\N	\N
3114c382-25c0-4744-bd76-a4abc30be2d3	ec8f8011a51db247260518149bbf67c8dee5fa31628a14ccadd842115500c6f1	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.444	2026-04-08 09:53:51.45	2026-04-08 09:53:51.48	\N	\N	\N	\N
dad36b39-d27f-4922-b376-4552a3749433	dcc000e21e21a28e6c61b73a0f961243a330fd25eb202d5be80d9784d0823b92	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.455	2026-04-08 09:53:51.463	2026-04-08 09:53:51.492	\N	\N	\N	\N
27ead3aa-95a9-4e3f-9499-a088b3611120	cc015c7766b1265260eb3dd854a74d7617cd18e2b4ebb02af14374299e6ff876	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.472	2026-04-08 09:53:51.476	2026-04-08 09:53:51.505	\N	\N	\N	\N
15423782-91fb-49ac-9117-7f6bd2c53bf3	217e957662baf14ff11fee757a1a9bf82b3e6c270c676dbcd3ae24def6aa7018	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.48	2026-04-08 09:53:51.487	2026-04-08 09:53:51.519	\N	\N	\N	\N
efdd6e80-d648-4a9f-aeaa-d9231480733d	e0be1e5239ca0fbc6f09fb77350e58acc0d0adcbbbbee12cb6877f35574b4d22	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.519	2026-04-08 09:53:51.526	\N	\N	\N	\N	\N
62ada08c-802e-417f-9eb8-9fc6d7c0eba8	c8d49c6a26de974f12df793b48d121ef7d5f8fe0c0f1c65b27fe592c44aabc31	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.492	2026-04-08 09:53:51.5	2026-04-08 09:53:51.531	\N	\N	\N	\N
91cca5a1-59bc-4a48-b138-d77e3bd1a3ed	d5adf2b53edbf0de5cd2e6b324bfb9bc3af893e98254cba73d569a1171a8615a	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.531	2026-04-08 09:53:51.538	\N	\N	\N	\N	\N
4abe09cc-2b23-4c6d-bfce-af7a298a7608	3e9ba04f3484a34880e507200826f86e830aa6f676aade69567c58248782bd49	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.505	2026-04-08 09:53:51.514	2026-04-08 09:53:51.544	\N	\N	\N	\N
8c1f6b28-108b-4648-9dd7-38b15970e9e8	30cd9ce304994e6b8355a1f7030d30ba75dd008d0154c913dc85f95ab17af1d9	cmnnfemzf00008wg9iwn6hacx	2026-05-08 09:53:51.544	2026-04-08 09:53:51.549	\N	\N	\N	\N	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.role_permissions (role_id, permission_id, allowed) FROM stdin;
1	17	t
1	21	t
1	5	t
1	8	t
1	10	t
1	12	t
1	22	t
1	23	t
1	25	t
1	28	t
1	31	t
1	34	t
1	37	t
1	40	t
1	52	t
1	53	t
1	55	t
1	58	t
1	61	t
1	62	t
1	64	t
1	67	t
1	43	t
1	44	t
1	46	t
1	49	t
1	105	t
1	106	t
1	108	t
2	17	t
2	21	t
2	5	t
2	8	t
2	10	t
2	12	t
2	70	t
2	71	t
2	73	t
2	76	t
2	79	t
2	82	t
2	85	t
2	88	t
2	91	t
2	43	t
2	44	t
2	46	t
2	49	t
2	105	t
2	106	t
2	108	t
3	22	t
3	23	t
3	27	t
3	30	t
3	53	t
3	62	t
3	43	t
3	44	t
3	48	t
3	51	t
3	105	t
3	106	t
3	110	t
4	70	t
4	71	t
4	75	t
4	78	t
4	87	t
4	90	t
4	43	t
4	44	t
4	48	t
4	51	t
4	105	t
4	106	t
4	110	t
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.roles (id, key, name, color, priority_index, description, is_active, created_at, updated_at) FROM stdin;
1	PRODUCT_MANAGER	Product Manager	#0f766e	20	Responsable du catalogue produits, de sa publication et des contributeurs produit.	t	2026-04-06 16:47:17.323	2026-04-06 16:47:17.323
2	AUTHOR_MANAGER	Author Manager	#b45309	20	Responsable editorial, publication des articles et encadrement des auteurs.	t	2026-04-06 16:47:17.344	2026-04-06 16:47:17.344
3	PRODUCT_EDITOR	Product Editor	#2563eb	40	Contributeur catalogue avec accès de création et édition produit.	t	2026-04-06 16:47:17.35	2026-04-06 16:47:17.35
4	AUTHOR	Author	#be185d	40	Contributeur éditorial avec accès à ses propres articles et contenus associés.	t	2026-04-06 16:47:17.356	2026-04-06 16:47:17.356
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tags (id, name, slug, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_role_assignments; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.user_role_assignments (id, user_id, role_id, granted_by_user_id, revoked_by_user_id, granted_at, revoked_at, reason) FROM stdin;
1	cmnnfemzs00028wg92jrzb08t	1	\N	\N	2026-04-06 16:50:03.116	\N	\N
2	cmnnfemzy00038wg9nwedxp86	2	\N	\N	2026-04-06 16:50:03.12	\N	\N
3	cmnnfen0100048wg9umtxrwus	3	\N	\N	2026-04-06 16:50:03.124	\N	\N
4	cmnnfen0600058wg920vuscbf	4	\N	\N	2026-04-06 16:50:03.128	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password_hash, portal, power_type, status, banned_at, banned_reason, closed_at, last_login_at, password_changed_at, created_at, updated_at) FROM stdin;
cmnnfemzf00008wg9iwn6hacx	root@cobamgroup.com	$2b$12$Npb0ptQLr6/I/8x0pC6un.rfw9qtIXw/0R7Wn5I5uXvfEhmN/lZm6	STAFF	ROOT	ACTIVE	\N	\N	\N	\N	\N	2026-04-06 16:50:03.099	2026-04-06 16:50:03.099
cmnnfemzo00018wg93ssib9qo	admin@cobamgroup.com	$2b$12$Npb0ptQLr6/I/8x0pC6un.rfw9qtIXw/0R7Wn5I5uXvfEhmN/lZm6	STAFF	ADMIN	ACTIVE	\N	\N	\N	\N	\N	2026-04-06 16:50:03.108	2026-04-06 16:50:03.108
cmnnfemzs00028wg92jrzb08t	product.manager@cobamgroup.com	$2b$12$Npb0ptQLr6/I/8x0pC6un.rfw9qtIXw/0R7Wn5I5uXvfEhmN/lZm6	STAFF	STAFF	ACTIVE	\N	\N	\N	\N	\N	2026-04-06 16:50:03.113	2026-04-06 16:50:03.113
cmnnfemzy00038wg9nwedxp86	author.manager@cobamgroup.com	$2b$12$Npb0ptQLr6/I/8x0pC6un.rfw9qtIXw/0R7Wn5I5uXvfEhmN/lZm6	STAFF	STAFF	ACTIVE	\N	\N	\N	\N	\N	2026-04-06 16:50:03.118	2026-04-06 16:50:03.118
cmnnfen0100048wg9umtxrwus	product.editor@cobamgroup.com	$2b$12$Npb0ptQLr6/I/8x0pC6un.rfw9qtIXw/0R7Wn5I5uXvfEhmN/lZm6	STAFF	STAFF	ACTIVE	\N	\N	\N	\N	\N	2026-04-06 16:50:03.122	2026-04-06 16:50:03.122
cmnnfen0600058wg920vuscbf	author@cobamgroup.com	$2b$12$Npb0ptQLr6/I/8x0pC6un.rfw9qtIXw/0R7Wn5I5uXvfEhmN/lZm6	STAFF	STAFF	ACTIVE	\N	\N	\N	\N	\N	2026-04-06 16:50:03.126	2026-04-06 16:50:03.126
\.


--
-- Name: article_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.article_categories_id_seq', 1, false);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.articles_id_seq', 1, false);


--
-- Name: audit_log_field_changes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_log_field_changes_id_seq', 1, false);


--
-- Name: audit_log_relation_changes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_log_relation_changes_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 181, true);


--
-- Name: media_folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.media_folders_id_seq', 5, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.media_id_seq', 73, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.permissions_id_seq', 2331, true);


--
-- Name: product_families_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.product_families_id_seq', 1, true);


--
-- Name: product_subcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.product_subcategories_id_seq', 33, true);


--
-- Name: product_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.product_types_id_seq', 7, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.products_id_seq', 50, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.profiles_id_seq', 6, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.user_role_assignments_id_seq', 4, true);


--
-- Name: article_author_links article_author_links_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_author_links
    ADD CONSTRAINT article_author_links_pkey PRIMARY KEY (article_id, user_id);


--
-- Name: article_categories article_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_pkey PRIMARY KEY (id);


--
-- Name: article_category_links article_category_links_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_category_links
    ADD CONSTRAINT article_category_links_pkey PRIMARY KEY (article_id, category_id);


--
-- Name: article_media_links article_media_links_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_media_links
    ADD CONSTRAINT article_media_links_pkey PRIMARY KEY (article_id, media_id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: audit_log_field_changes audit_log_field_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log_field_changes
    ADD CONSTRAINT audit_log_field_changes_pkey PRIMARY KEY (id);


--
-- Name: audit_log_relation_changes audit_log_relation_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log_relation_changes
    ADD CONSTRAINT audit_log_relation_changes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (product_id, kind);


--
-- Name: product_families product_families_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT product_families_pkey PRIMARY KEY (id);


--
-- Name: product_family_members product_family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_family_members
    ADD CONSTRAINT product_family_members_pkey PRIMARY KEY (family_id, product_id);


--
-- Name: product_media_links product_media_links_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_pkey PRIMARY KEY (product_id, media_id);


--
-- Name: product_pack_lines product_pack_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_pack_lines
    ADD CONSTRAINT product_pack_lines_pkey PRIMARY KEY (pack_product_id, product_id);


--
-- Name: product_subcategories product_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategories
    ADD CONSTRAINT product_subcategories_pkey PRIMARY KEY (id);


--
-- Name: product_subcategory_links product_subcategory_links_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategory_links
    ADD CONSTRAINT product_subcategory_links_pkey PRIMARY KEY (product_id, subcategory_id);


--
-- Name: product_types product_types_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_types
    ADD CONSTRAINT product_types_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: user_role_assignments user_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: article_author_links_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX article_author_links_user_id_idx ON public.article_author_links USING btree (user_id);


--
-- Name: article_categories_created_by_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX article_categories_created_by_user_id_idx ON public.article_categories USING btree (created_by_user_id);


--
-- Name: article_categories_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX article_categories_slug_key ON public.article_categories USING btree (slug);


--
-- Name: article_categories_updated_by_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX article_categories_updated_by_user_id_idx ON public.article_categories USING btree (updated_by_user_id);


--
-- Name: article_category_links_category_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX article_category_links_category_id_idx ON public.article_category_links USING btree (category_id);


--
-- Name: article_media_links_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX article_media_links_media_id_idx ON public.article_media_links USING btree (media_id);


--
-- Name: articles_author_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX articles_author_id_idx ON public.articles USING btree (author_id);


--
-- Name: articles_cover_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX articles_cover_media_id_idx ON public.articles USING btree (cover_media_id);


--
-- Name: articles_og_image_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX articles_og_image_media_id_idx ON public.articles USING btree (og_image_media_id);


--
-- Name: articles_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX articles_slug_key ON public.articles USING btree (slug);


--
-- Name: articles_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX articles_status_idx ON public.articles USING btree (status);


--
-- Name: audit_log_field_changes_audit_log_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_log_field_changes_audit_log_id_idx ON public.audit_log_field_changes USING btree (audit_log_id);


--
-- Name: audit_log_relation_changes_audit_log_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_log_relation_changes_audit_log_id_idx ON public.audit_log_relation_changes USING btree (audit_log_id);


--
-- Name: audit_log_relation_changes_left_entity_type_left_entity_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_log_relation_changes_left_entity_type_left_entity_id_idx ON public.audit_log_relation_changes USING btree (left_entity_type, left_entity_id);


--
-- Name: audit_log_relation_changes_right_entity_type_right_entity_i_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_log_relation_changes_right_entity_type_right_entity_i_idx ON public.audit_log_relation_changes USING btree (right_entity_type, right_entity_id);


--
-- Name: audit_logs_action_type_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_logs_action_type_idx ON public.audit_logs USING btree (action_type);


--
-- Name: audit_logs_actor_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_logs_actor_user_id_idx ON public.audit_logs USING btree (actor_user_id);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX audit_logs_entity_type_entity_id_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: media_deleted_at_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX media_deleted_at_idx ON public.media USING btree (deleted_at);


--
-- Name: media_folder_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX media_folder_id_idx ON public.media USING btree (folder_id);


--
-- Name: media_folders_created_by_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX media_folders_created_by_user_id_idx ON public.media_folders USING btree (created_by_user_id);


--
-- Name: media_folders_parent_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX media_folders_parent_id_idx ON public.media_folders USING btree (parent_id);


--
-- Name: media_uploaded_by_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX media_uploaded_by_user_id_idx ON public.media USING btree (uploaded_by_user_id);


--
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- Name: permissions_resource_action_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX permissions_resource_action_idx ON public.permissions USING btree (resource, action);


--
-- Name: product_attributes_sort_order_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_attributes_sort_order_idx ON public.product_attributes USING btree (sort_order);


--
-- Name: product_families_default_product_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_families_default_product_id_idx ON public.product_families USING btree (default_product_id);


--
-- Name: product_families_main_image_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_families_main_image_media_id_idx ON public.product_families USING btree (main_image_media_id);


--
-- Name: product_families_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX product_families_slug_key ON public.product_families USING btree (slug);


--
-- Name: product_family_members_product_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX product_family_members_product_id_key ON public.product_family_members USING btree (product_id);


--
-- Name: product_family_members_sort_order_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_family_members_sort_order_idx ON public.product_family_members USING btree (sort_order);


--
-- Name: product_media_links_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_media_links_media_id_idx ON public.product_media_links USING btree (media_id);


--
-- Name: product_media_links_sort_order_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_media_links_sort_order_idx ON public.product_media_links USING btree (sort_order);


--
-- Name: product_pack_lines_product_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_pack_lines_product_id_idx ON public.product_pack_lines USING btree (product_id);


--
-- Name: product_pack_lines_sort_order_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_pack_lines_sort_order_idx ON public.product_pack_lines USING btree (sort_order);


--
-- Name: product_subcategories_category_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_subcategories_category_id_idx ON public.product_subcategories USING btree (category_id);


--
-- Name: product_subcategories_category_id_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX product_subcategories_category_id_slug_key ON public.product_subcategories USING btree (category_id, slug);


--
-- Name: product_subcategories_image_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_subcategories_image_media_id_idx ON public.product_subcategories USING btree (image_media_id);


--
-- Name: product_subcategories_is_active_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_subcategories_is_active_idx ON public.product_subcategories USING btree (is_active);


--
-- Name: product_subcategories_sort_order_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_subcategories_sort_order_idx ON public.product_subcategories USING btree (sort_order);


--
-- Name: product_subcategory_links_subcategory_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_subcategory_links_subcategory_id_idx ON public.product_subcategory_links USING btree (subcategory_id);


--
-- Name: product_types_image_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_types_image_media_id_idx ON public.product_types USING btree (image_media_id);


--
-- Name: product_types_is_active_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_types_is_active_idx ON public.product_types USING btree (is_active);


--
-- Name: product_types_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX product_types_slug_key ON public.product_types USING btree (slug);


--
-- Name: product_types_sort_order_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX product_types_sort_order_idx ON public.product_types USING btree (sort_order);


--
-- Name: products_brand_code_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_brand_code_idx ON public.products USING btree (brand_code);


--
-- Name: products_commercial_mode_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_commercial_mode_idx ON public.products USING btree (commercial_mode);


--
-- Name: products_datasheet_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_datasheet_media_id_idx ON public.products USING btree (datasheet_media_id);


--
-- Name: products_kind_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_kind_idx ON public.products USING btree (kind);


--
-- Name: products_lifecycle_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_lifecycle_idx ON public.products USING btree (lifecycle);


--
-- Name: products_price_visibility_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_price_visibility_idx ON public.products USING btree (price_visibility);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: products_stock_visibility_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_stock_visibility_idx ON public.products USING btree (stock_visibility);


--
-- Name: products_visibility_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX products_visibility_idx ON public.products USING btree (visibility);


--
-- Name: profiles_avatar_media_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX profiles_avatar_media_id_idx ON public.profiles USING btree (avatar_media_id);


--
-- Name: profiles_user_id_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: role_permissions_permission_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX role_permissions_permission_id_idx ON public.role_permissions USING btree (permission_id);


--
-- Name: role_permissions_role_id_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX role_permissions_role_id_idx ON public.role_permissions USING btree (role_id);


--
-- Name: roles_is_active_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX roles_is_active_idx ON public.roles USING btree (is_active);


--
-- Name: roles_key_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX roles_key_key ON public.roles USING btree (key);


--
-- Name: roles_priority_index_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX roles_priority_index_idx ON public.roles USING btree (priority_index);


--
-- Name: tags_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: user_role_assignments_role_id_revoked_at_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX user_role_assignments_role_id_revoked_at_idx ON public.user_role_assignments USING btree (role_id, revoked_at);


--
-- Name: user_role_assignments_user_id_revoked_at_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX user_role_assignments_user_id_revoked_at_idx ON public.user_role_assignments USING btree (user_id, revoked_at);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_power_type_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX users_power_type_idx ON public.users USING btree (power_type);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: article_author_links article_author_links_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_author_links
    ADD CONSTRAINT article_author_links_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_author_links article_author_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_author_links
    ADD CONSTRAINT article_author_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_categories article_categories_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: article_categories article_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.article_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: article_categories article_categories_updated_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_categories
    ADD CONSTRAINT article_categories_updated_by_user_id_fkey FOREIGN KEY (updated_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: article_category_links article_category_links_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_category_links
    ADD CONSTRAINT article_category_links_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_category_links article_category_links_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_category_links
    ADD CONSTRAINT article_category_links_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.article_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: article_media_links article_media_links_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_media_links
    ADD CONSTRAINT article_media_links_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_media_links article_media_links_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.article_media_links
    ADD CONSTRAINT article_media_links_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: articles articles_cover_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_cover_media_id_fkey FOREIGN KEY (cover_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: articles articles_og_image_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_og_image_media_id_fkey FOREIGN KEY (og_image_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_log_field_changes audit_log_field_changes_audit_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log_field_changes
    ADD CONSTRAINT audit_log_field_changes_audit_log_id_fkey FOREIGN KEY (audit_log_id) REFERENCES public.audit_logs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_log_relation_changes audit_log_relation_changes_audit_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log_relation_changes
    ADD CONSTRAINT audit_log_relation_changes_audit_log_id_fkey FOREIGN KEY (audit_log_id) REFERENCES public.audit_logs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: media media_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.media_folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: media_folders media_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: media media_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_attributes product_attributes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_families product_families_default_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT product_families_default_product_id_fkey FOREIGN KEY (default_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_families product_families_main_image_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT product_families_main_image_media_id_fkey FOREIGN KEY (main_image_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_family_members product_family_members_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_family_members
    ADD CONSTRAINT product_family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.product_families(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_family_members product_family_members_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_family_members
    ADD CONSTRAINT product_family_members_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_media_links product_media_links_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_media_links product_media_links_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_media_links
    ADD CONSTRAINT product_media_links_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_pack_lines product_pack_lines_pack_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_pack_lines
    ADD CONSTRAINT product_pack_lines_pack_product_id_fkey FOREIGN KEY (pack_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_pack_lines product_pack_lines_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_pack_lines
    ADD CONSTRAINT product_pack_lines_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_subcategories product_subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategories
    ADD CONSTRAINT product_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_subcategories product_subcategories_image_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategories
    ADD CONSTRAINT product_subcategories_image_media_id_fkey FOREIGN KEY (image_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_subcategory_links product_subcategory_links_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategory_links
    ADD CONSTRAINT product_subcategory_links_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_subcategory_links product_subcategory_links_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_subcategory_links
    ADD CONSTRAINT product_subcategory_links_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.product_subcategories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_types product_types_image_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.product_types
    ADD CONSTRAINT product_types_image_media_id_fkey FOREIGN KEY (image_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_datasheet_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_datasheet_media_id_fkey FOREIGN KEY (datasheet_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: profiles profiles_avatar_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_avatar_media_id_fkey FOREIGN KEY (avatar_media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role_assignments user_role_assignments_granted_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_granted_by_user_id_fkey FOREIGN KEY (granted_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_revoked_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_revoked_by_user_id_fkey FOREIGN KEY (revoked_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role_assignments user_role_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict KJOxrinPHfgm7qjeWTdeBqzb8oBvKAglwpgpmQqSuXcshYRkSLUWMQQJTdnMB2G

