-- Copper Oak Asset Group — initial schema mirroring the existing Airtable base
-- ("Copper Oak Asset Group": Properties, Monthly Funding, Partner Access).
--
-- This is a 1:1 mirror of the Airtable schema as described, not the fully normalized
-- states/counties/assignments schema from the developer brief (Module 04) — that's a separate,
-- larger piece of work (role-based RLS, county/state FK tables for assignment scoping) that
-- hasn't been signed off yet. This migration just gets the data model into Postgres.
--
-- RLS is enabled with NO policies below (fail-closed): until Module 04's policies are written
-- and signed off, nobody — including the anon/publishable key used by the browser — can read or
-- write these tables via the API. That's deliberate; leaving RLS off on a table reachable with a
-- public key is an open endpoint.

-- Safe to re-run from scratch: these tables are empty (0 rows in Airtable's Monthly Funding
-- and Partner Access, and Properties hasn't been migrated yet), so dropping and recreating
-- loses nothing. This guards against whatever partially applied from the failed first attempt.
drop table if exists public.properties cascade;
drop table if exists public.monthly_funding cascade;
drop table if exists public.partner_access cascade;

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- Self-contained updated_at trigger (avoids depending on the `moddatetime` extension being
-- enabled on this project).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================================================
-- Table 1 — Properties (113 records / 45 fields in Airtable)
-- =========================================================================================

create table public.properties (
  id                     uuid primary key default gen_random_uuid(),
  airtable_record_id     text unique, -- traces back to the Airtable record during the staged migration

  -- Property Section
  address                text not null,
  location               text check (location in ('Unrated','Low','Medium','High','DNB','Auction.com','Courthouse')),
  state                  text,
  county                 text,
  city                   text,
  zip                    text,
  sale_date              date,
  clear_title            text check (clear_title in ('Unknown','Clear','Clear 2','Do NOT Bid','Request Title','Not Found','Clear (1st Lien)','Clear (2nd Lien)')),
  mortgage_balance       numeric,
  open_bid               numeric,
  arv                    numeric,
  arv_2nd                numeric,
  max_bid                numeric,
  reno_cost              numeric,
  auction_outcome        text check (auction_outcome in ('Unknown','Cancelled','3rd Party','We Won','Reverted Back')),
  trustee_name           text,
  trustee_phone          text,
  trustee_email          text,
  notes                  text,
  drive_report_notes     text,
  photos                 jsonb not null default '[]'::jsonb,       -- [{id, url, filename}]
  status                 text check (status in ('New','Researching','Bid Ready','Bid Submitted','Won','Lost','DNB','Postponed','Cancelled')) default 'New',
  winning_bid            numeric,
  property_status        text check (property_status in ('Acquired','Renovating','Listed For Sale','Under Contract','Sold','Refund Pending','Refunded')),
  expected_refund_amount numeric,
  payment_method         text check (payment_method in ('Auction.com', 'Cashier''s Check (On-Site)')),
  reno_spent             numeric,
  contract_price         numeric,
  sale_price             numeric,
  holding_costs          numeric,
  acquired_date          date,
  listed_date            date,
  closed_date            date,
  beds                   integer,
  baths                  numeric,
  sq_ft                  integer,
  year_built             integer,
  buyer_side             text,
  occupancy              text check (occupancy in ('Vacant','Occupied','Unknown')),
  expected_closing_date  date,
  deed_recorded          boolean not null default false,
  title_report           jsonb not null default '[]'::jsonb,       -- [{id, url, filename}]

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Formula fields, computed the same way Airtable does (per the schema as described).
-- NOTE: this differs from the frontend's own computeProfit()/profitOf(), which use ARV rather
-- than Winning Bid as the base — see the migration notes on that discrepancy.
-- to_char() depends on session locale/DateStyle settings, so Postgres won't accept it in a
-- generated column (must be strictly immutable). extract() + lpad() is locale-independent.
alter table public.properties add column auction_month text
  generated always as (
    case when sale_date is null then 'Unscheduled'
      else extract(year from sale_date)::text || '-' || lpad(extract(month from sale_date)::text, 2, '0')
    end
  ) stored;

alter table public.properties add column variance numeric
  generated always as (
    case when winning_bid is not null and max_bid is not null then winning_bid - max_bid else null end
  ) stored;

alter table public.properties add column profit numeric
  generated always as (
    case when winning_bid is not null and max_bid is not null
      then (winning_bid * 0.89) - max_bid - coalesce(reno_cost, 0)
      else null end
  ) stored;

create index properties_county_idx on public.properties (county);
create index properties_state_idx on public.properties (state);
create index properties_sale_date_idx on public.properties (sale_date);
create index properties_auction_outcome_idx on public.properties (auction_outcome);

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

alter table public.properties enable row level security;
alter table public.properties force row level security;

-- =========================================================================================
-- Table 2 — Monthly Funding (0 records / 3 fields in Airtable)
-- =========================================================================================

create table public.monthly_funding (
  id                     uuid primary key default gen_random_uuid(),
  airtable_record_id     text unique,
  month                  text not null unique, -- 'YYYY-MM', matches properties.auction_month
  auction_com_amount     numeric,
  cashier_checks_amount  numeric,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger monthly_funding_set_updated_at
  before update on public.monthly_funding
  for each row execute function public.set_updated_at();

alter table public.monthly_funding enable row level security;
alter table public.monthly_funding force row level security;

-- =========================================================================================
-- Table 3 — Partner Access (0 records / 4 fields in Airtable)
-- =========================================================================================

create table public.partner_access (
  id                 uuid primary key default gen_random_uuid(),
  airtable_record_id text unique,
  partner_name       text not null,
  access_code        text not null unique,
  allowed_counties   text, -- comma-separated, matching County spelling in properties
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger partner_access_set_updated_at
  before update on public.partner_access
  for each row execute function public.set_updated_at();

alter table public.partner_access enable row level security;
alter table public.partner_access force row level security;

-- No policies are created in this migration — see the header note. Module 04 (role-based
-- permissions) adds the actual select/insert/update/delete policies once the permission matrix
-- in the developer brief is signed off.
