/**
 * LOCAL MODE — works with no backend, data saved in this browser (localStorage).
 * Good for trying the admin panel. For real customers use Supabase (see /supabase/README.md),
 * otherwise orders placed on a customer's phone never reach your admin panel.
 */
import { normalizeProduct, seedCatalog } from './catalog';
import { compressImage, blobToDataUrl } from './images';

const KP = 'riva.products.v1';
const KO = 'riva.orders.v1';
const KA = 'riva.admin.session';
const bus = new EventTarget();

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    throw new Error('Browser storage is full — connect Supabase to store more images.');
  }
  bus.dispatchEvent(new Event('change'));
};
window.addEventListener?.('storage', (e) => {
  if (e.key === KP || e.key === KO) bus.dispatchEvent(new Event('change'));
});

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

function products() {
  let list = read(KP, null);
  if (!list) {
    list = seedCatalog();
    write(KP, list);
  }
  return list.map(normalizeProduct);
}

export const localDb = {
  mode: 'local',

  // ── auth (demo password) ──
  async getSession() {
    return read(KA, null);
  },
  async signIn(_email, password) {
    const expected = import.meta.env?.VITE_ADMIN_PASSWORD || 'riva-admin';
    if (password !== expected) throw new Error('Wrong password');
    const s = { email: _email || 'admin', at: Date.now() };
    localStorage.setItem(KA, JSON.stringify(s));
    return s;
  },
  async signOut() {
    localStorage.removeItem(KA);
  },

  // ── products ──
  async listProducts() {
    return products().sort((a, b) => a.sort - b.sort);
  },
  async saveProduct(p) {
    const list = products();
    const item = normalizeProduct(p);
    const i = list.findIndex((x) => x.id === item.id);
    if (i >= 0) list[i] = item;
    else list.push({ ...item, sort: list.length });
    // only one hero
    if (item.sections.hero) list.forEach((x) => x.id !== item.id && (x.sections = { ...x.sections, hero: false }));
    write(KP, list);
    return item;
  },
  async updateProducts(patches) {
    const list = products();
    patches.forEach(({ id, ...patch }) => {
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list[i] = normalizeProduct({ ...list[i], ...patch, sections: { ...list[i].sections, ...(patch.sections || {}) } });
    });
    write(KP, list);
  },
  async deleteProduct(id) {
    write(KP, products().filter((p) => p.id !== id));
  },
  async uploadImage(file, opts) {
    const blob = await compressImage(file, { max: 1000, quality: 0.8, ...opts });
    return blobToDataUrl(blob);
  },

  // ── orders ──
  async createOrder(order) {
    const o = { ...order, id: uid(), status: 'pending', createdAt: new Date().toISOString() };
    write(KO, [o, ...read(KO, [])]);
    return o;
  },
  async listOrders() {
    return read(KO, []);
  },
  async setOrderStatus(id, status) {
    const orders = read(KO, []);
    const o = orders.find((x) => x.id === id);
    if (!o) throw new Error('Order not found');
    const was = o.status === 'confirmed' || o.status === 'delivered';
    const will = status === 'confirmed' || status === 'delivered';
    if (was !== will) {
      // confirm → take from stock; un-confirm (reject) → give back
      const list = products();
      o.items.forEach((it) => {
        const p = list.find((x) => x.id === it.productId);
        if (p) p.stock = Math.max(0, p.stock + (will ? -it.quantity : it.quantity));
      });
      write(KP, list);
    }
    o.status = status;
    o.updatedAt = new Date().toISOString();
    write(KO, orders);
    return o;
  },
  async deleteOrder(id) {
    write(KO, read(KO, []).filter((o) => o.id !== id));
  },

  subscribe(cb) {
    const h = () => cb();
    bus.addEventListener('change', h);
    return () => bus.removeEventListener('change', h);
  },
};
