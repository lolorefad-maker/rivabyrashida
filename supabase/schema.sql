-- ════════════════════════════════════════════════════════════════════
--  RÍVA — Supabase schema (run once in Supabase → SQL Editor)
--  Tables: products, orders, admins   ·   Storage bucket: products
-- ════════════════════════════════════════════════════════════════════

-- 1) Admin accounts (emails allowed into the admin panel)
create table if not exists public.admins (
  email text primary key
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Products
create table if not exists public.products (
  id          text primary key,
  data        jsonb   not null default '{}'::jsonb,   -- names, notes, images, price…
  stock       integer not null default 0 check (stock >= 0),
  available   boolean not null default true,
  sections    jsonb   not null default '{"hero":false,"collection":true,"bestsellers":false,"fan":true,"gallery":true}'::jsonb,
  sort        integer not null default 999,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3) Orders
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  status      text not null default 'pending' check (status in ('pending','confirmed','delivered','rejected')),
  customer    jsonb not null,            -- {name, phone, city, address, notes}
  items       jsonb not null,            -- [{productId, name, size, quantity, price}]
  subtotal    numeric(10,2) not null default 0,
  shipping    numeric(10,2) not null default 0,
  total       numeric(10,2) not null default 0,
  lang        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Prices are recalculated on the server so a customer cannot change them in the browser
create or replace function public.price_order() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  it jsonb; p record; q int; unit numeric; sub numeric := 0; fixed jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) = 0 then
    raise exception 'Order has no items';
  end if;
  for it in select * from jsonb_array_elements(new.items) loop
    select * into p from public.products where id = it ->> 'productId';
    if not found then raise exception 'Unknown product %', it ->> 'productId'; end if;
    q := greatest(1, least(20, coalesce((it ->> 'quantity')::int, 1)));
    unit := round(((p.data ->> 'price')::numeric) * (case when it ->> 'size' = '50 ML' then 0.7 else 1 end), 2);
    sub := sub + unit * q;
    fixed := fixed || jsonb_build_object('productId', p.id, 'name', p.data ->> 'nameEn', 'size', coalesce(it ->> 'size', '100 ML'),
                                         'quantity', q, 'price', unit, 'image', p.data ->> 'bottleImage');
  end loop;
  new.items    := fixed;
  new.subtotal := sub;
  new.shipping := case when sub >= 60 then 0 else 3 end;
  new.total    := sub + new.shipping;
  new.status   := 'pending';
  if coalesce(length(new.customer ->> 'name'), 0) < 2 or coalesce(length(new.customer ->> 'phone'), 0) < 7 then
    raise exception 'Name and phone are required';
  end if;
  return new;
end $$;
drop trigger if exists orders_price on public.orders;
create trigger orders_price before insert on public.orders for each row execute function public.price_order();

-- Confirm / reject an order. Confirming takes the quantities out of stock; un-confirming gives them back.
create or replace function public.set_order_status(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare o record; it jsonb; was boolean; will boolean;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  select * into o from public.orders where id = p_id for update;
  if not found then raise exception 'Order not found'; end if;
  was  := o.status in ('confirmed','delivered');
  will := p_status in ('confirmed','delivered');
  if was <> will then
    for it in select * from jsonb_array_elements(o.items) loop
      update public.products
         set stock = greatest(0, stock + (case when will then -1 else 1 end) * (it ->> 'quantity')::int),
             updated_at = now()
       where id = it ->> 'productId';
    end loop;
  end if;
  update public.orders set status = p_status, updated_at = now() where id = p_id;
end $$;
grant execute on function public.set_order_status(uuid, text) to authenticated;

-- Only one product can be the hero
create or replace function public.set_hero(p_id text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  update public.products set sections = jsonb_set(sections, '{hero}', 'false'::jsonb) where id <> p_id;
end $$;
grant execute on function public.set_hero(text) to authenticated;

-- 4) Row Level Security
alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "public sees live products" on public.products;
create policy "public sees live products" on public.products for select
  using (available and stock > 0);                 -- sold out / hidden products never reach the website
drop policy if exists "admins see all products" on public.products;
create policy "admins see all products" on public.products for select using (public.is_admin());
drop policy if exists "admins write products" on public.products;
create policy "admins write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone can place an order" on public.orders;
create policy "anyone can place an order" on public.orders for insert to anon, authenticated with check (true);
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins for select using (public.is_admin());

-- 5) Live updates for the admin panel
do $$ begin
  begin alter publication supabase_realtime add table public.orders;   exception when others then null; end;
  begin alter publication supabase_realtime add table public.products; exception when others then null; end;
end $$;

-- 6) Image storage (public bucket, only admins can upload)
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "admins change product images" on storage.objects;
create policy "admins change product images" on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_admin());
drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- 7) Make YOUR email an admin (change it, then run this line)
-- insert into public.admins (email) values ('pinpexel@gmail.com') on conflict do nothing;
