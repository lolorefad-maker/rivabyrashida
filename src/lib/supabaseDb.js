/**
 * SUPABASE MODE — real database, image storage, admin login and live updates.
 * Enabled automatically when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (.env).
 * Run /supabase/schema.sql once in the Supabase SQL editor first.
 */
import { createClient } from '@supabase/supabase-js';
import { normalizeProduct } from './catalog';
import { compressImage } from './images';

// accept the URL as copied from the dashboard's Data API page too (…supabase.co/rest/v1/)
const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL).trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const supabase = createClient(SUPABASE_URL, String(import.meta.env.VITE_SUPABASE_ANON_KEY).trim());
const BUCKET = 'products';

const fromRow = (r) =>
  normalizeProduct({ ...(r.data || {}), id: r.id, stock: r.stock, available: r.available, sections: r.sections, sort: r.sort, createdAt: r.created_at });
const toRow = (p) => {
  const { id, stock, available, sections, sort, createdAt, ...data } = normalizeProduct(p);
  return { id, stock, available, sections, sort, data };
};
const orderFromRow = (r) => ({
  id: r.id,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  customer: r.customer,
  items: r.items,
  subtotal: Number(r.subtotal),
  shipping: Number(r.shipping),
  total: Number(r.total),
  lang: r.lang,
});
const check = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

export const supabaseDb = {
  mode: 'supabase',
  client: supabase,

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session ? { email: data.session.user.email } : null;
  },
  async signIn(email, password) {
    const data = check(await supabase.auth.signInWithPassword({ email, password }));
    const ok = check(await supabase.rpc('is_admin'));
    if (!ok) {
      await supabase.auth.signOut();
      throw new Error('This account is not an admin');
    }
    return { email: data.user.email };
  },
  async signOut() {
    await supabase.auth.signOut();
  },

  async listProducts() {
    // public visitors only receive live products (RLS); admins receive everything
    return check(await supabase.from('products').select('*').order('sort', { ascending: true })).map(fromRow);
  },
  async saveProduct(p) {
    const row = toRow(p);
    if (!p.sort && p.sort !== 0) row.sort = 999;
    const saved = check(await supabase.from('products').upsert(row).select().single());
    if (row.sections.hero) {
      await supabase.rpc('set_hero', { p_id: row.id });
    }
    return fromRow(saved);
  },
  async updateProducts(patches) {
    for (const { id, ...patch } of patches) {
      const cur = check(await supabase.from('products').select('*').eq('id', id).single());
      const merged = toRow({ ...fromRow(cur), ...patch, sections: { ...cur.sections, ...(patch.sections || {}) } });
      check(await supabase.from('products').update(merged).eq('id', id));
      if (patch.sections?.hero) await supabase.rpc('set_hero', { p_id: id });
    }
  },
  async deleteProduct(id) {
    check(await supabase.from('products').delete().eq('id', id));
  },
  async uploadImage(file, opts) {
    const blob = await compressImage(file, opts);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    check(await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', upsert: false }));
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },

  async createOrder(order) {
    // insert only (customers cannot read orders back)
    const id = crypto.randomUUID();
    check(
      await supabase.from('orders').insert({
        id,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        lang: order.lang,
      })
    );
    return { ...order, id, status: 'pending', createdAt: new Date().toISOString() };
  },
  async listOrders() {
    return check(await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500)).map(orderFromRow);
  },
  async setOrderStatus(id, status) {
    // stock is adjusted atomically in the database (see set_order_status in schema.sql)
    check(await supabase.rpc('set_order_status', { p_id: id, p_status: status }));
  },
  async deleteOrder(id) {
    check(await supabase.from('orders').delete().eq('id', id));
  },

  subscribe(cb) {
    const ch = supabase
      .channel('riva-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => cb('products'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => cb('orders'))
      .subscribe();
    return () => supabase.removeChannel(ch);
  },
};
