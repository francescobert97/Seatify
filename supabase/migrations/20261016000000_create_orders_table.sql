-- =====================================================================
-- Supabase SQL Schema: public.orders Table
-- =====================================================================

create extension if not exists "pgcrypto";

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.orders (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  order_reference text not null,
  purchase_date timestamp with time zone not null default now(),
  status text not null default 'pending'::text,
  event_id text not null,
  event_name text not null,
  event_date timestamp with time zone not null,
  venue text not null,
  city text not null,
  image_url text null,
  tickets jsonb not null default '[]'::jsonb,
  total_amount numeric(10, 2) not null,
  currency text not null default 'EUR'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_order_reference_key unique (order_reference),
  constraint orders_user_id_fkey foreign key (user_id)
    references auth.users (id) on delete CASCADE,
  constraint orders_status_check check (
    status = any (
      array[
        'pending'::text,
        'completed'::text,
        'refund_requested'::text,
        'refunded'::text,
        'canceled'::text
      ]
    )
  )
);

create index if not exists idx_orders_user_id
  on public.orders using btree (user_id);

create index if not exists idx_orders_event_date
  on public.orders using btree (event_date);

create index if not exists idx_orders_status
  on public.orders using btree (status);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- Policies for Row Level Security
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Service role full access" on public.orders;
create policy "Service role full access"
  on public.orders for all
  to service_role
  using (true)
  with check (true);
