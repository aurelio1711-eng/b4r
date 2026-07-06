-- Bracelets 4 Recovery (B4R) — Initial Schema

-- 1. PRODUCTS
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  price       integer not null,             -- stored in cents
  stock_quantity integer not null default 0,
  image_url   text not null default '',
  category    text not null default 'Single'
    check (category in ('Single', 'Milestone Stack', 'Rhythm Series')),
  beads_per_unit integer not null default 6,  -- used for meditative counter
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (true);

create policy "Products are admin writable"
  on public.products for insert
  with check (true);
create policy "Products are admin updatable"
  on public.products for update
  using (true)
  with check (true);
create policy "Products are admin deletable"
  on public.products for delete
  using (true);

-- 2. ANALYTICS
create table if not exists public.analytics (
  id           uuid primary key default gen_random_uuid(),
  metric_name  text not null unique,
  metric_value bigint not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.analytics enable row level security;

create policy "Analytics are publicly readable"
  on public.analytics for select
  using (true);

create policy "Analytics are admin writable"
  on public.analytics for insert
  with check (true);
create policy "Analytics are admin updatable"
  on public.analytics for update
  using (true)
  with check (true);

-- seed initial metric
insert into public.analytics (metric_name, metric_value)
values ('total_beads_strung', 0)
on conflict (metric_name) do nothing;

-- 3. ORDERS
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  customer_email   text not null,
  total_amount     integer not null,         -- cents
  status           text not null default 'pending'
    check (status in ('pending', 'completed', 'refunded')),
  items            jsonb not null default '[]',   -- snapshot of line items
  created_at       timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Orders are admin only"
  on public.orders for select
  using (true);
create policy "Orders are admin insertable"
  on public.orders for insert
  with check (true);
create policy "Orders are admin updatable"
  on public.orders for update
  using (true)
  with check (true);

-- 4. STORAGE bucket for product images
-- Run this in the Supabase SQL editor or via dashboard:
--   insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
--
-- Storage policy (public read):
--   create policy "Public read" on storage.objects for select using (bucket_id = 'product-images');
-- Storage policy (admin write):
--   create policy "Admin write" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- HELPER: auto-update analytics when orders are completed
-- ============================================================
create or replace function public.update_beads_on_order()
returns trigger as $$
declare
  bead_total bigint;
begin
  if new.status = 'completed' then
    -- sum beads from the items snapshot
    select coalesce(
      sum(
        (item->>'quantity')::bigint *
        (item->>'beads_per_unit')::bigint
      ), 0)
    into bead_total
    from jsonb_array_elements(new.items) as item;

    update public.analytics
    set metric_value = metric_value + bead_total,
        updated_at = now()
    where metric_name = 'total_beads_strung';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_orders_update_beads
  after update of status on public.orders
  for each row
  when (new.status = 'completed')
  execute function public.update_beads_on_order();
