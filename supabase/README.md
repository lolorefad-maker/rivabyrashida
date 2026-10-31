# RÍVA — Admin panel & database setup

The admin panel lives at **`/#/admin`** (e.g. `http://localhost:3000/#/admin`).

## Two modes

| | Local mode (default) | Supabase mode |
|---|---|---|
| Setup | none | 5 minutes (below) |
| Orders from customers' phones reach you | ❌ only orders placed in the same browser | ✅ instantly, with a sound alert |
| Images | saved in the browser (limited) | Supabase Storage |
| Login | password `riva-admin` (or `VITE_ADMIN_PASSWORD`) | the shared admin password (email + password if `VITE_ADMIN_EMAIL` is not set) |

Use local mode to try everything. **Before going live, connect Supabase.**

## Connect Supabase (once)

1. Create a free project at https://supabase.com
2. **SQL Editor →** paste and run `supabase/schema.sql`
3. **SQL Editor →** paste and run `supabase/seed.sql` (adds the 12 zodiac perfumes, 20 bottles each)
4. **Authentication → Users → Add user** — create your admin email + password
5. **SQL Editor →** run (with your email):
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
6. **Authentication → Sign In / Providers →** turn off "Allow new users to sign up" (only you should have an account)
7. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API),
   and `VITE_ADMIN_EMAIL` with the admin email from step 4 — the login page then asks only for the password,
   so anyone you give the password to can sign in
8. `npm install` then `npm run dev` → open `/#/admin` and sign in

When you deploy (Render / Vercel / Netlify), add the same three variables in the host's environment settings.

To change the shared password later: **SQL Editor →**
```sql
update auth.users set encrypted_password = extensions.crypt('NEW-PASSWORD', extensions.gen_salt('bf')) where email = 'you@example.com';
```

## How it works

- **Customer checks out** → order saved as **New** (prices are re-calculated on the server, so they can't be tampered with).
- **✓ Confirm** → quantities are taken out of stock and the customer (name, phone, city, address) is added to **Customers**.
- **✗ Reject** → order closed. Cancelling a confirmed order puts the bottles back in stock.
- **Stock 0** → product disappears from the website automatically (the database itself refuses to send sold-out or hidden products to visitors). Add stock again and it comes back.
- **Available switch** → hide/show a product manually.
- **Sections page** → tick ✓ / ✗ where each product appears: Hero, Collection grid, Bestsellers, Fan carousel, Clothes-line gallery.
- **Add product** → upload main photo (white background), hover photo, and optionally a transparent bottle PNG for the floating animations.
