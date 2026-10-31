import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDb } from '../lib/db';

/** Loads products + orders for the admin, keeps them live, and exposes actions */
export function useAdminData(onNewOrder) {
  const [db, setDb] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const known = useRef(null);

  const load = useCallback(async (d) => {
    const dbi = d || (await getDb());
    try {
      const [p, o] = await Promise.all([dbi.listProducts(), dbi.listOrders()]);
      setProducts(p);
      setOrders(o);
      // detect orders that arrived while the panel is open
      if (known.current) {
        const fresh = o.filter((x) => !known.current.has(x.id) && x.status === 'pending');
        if (fresh.length && onNewOrder) onNewOrder(fresh);
      }
      known.current = new Set(o.map((x) => x.id));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onNewOrder]);

  useEffect(() => {
    let off = () => {};
    let poll;
    getDb().then((d) => {
      setDb(d);
      load(d);
      off = d.subscribe(() => load(d));
      poll = setInterval(() => load(d), 30000); // safety net
    });
    return () => {
      off();
      clearInterval(poll);
    };
  }, [load]);

  const run = async (fn) => {
    try {
      await fn();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      await load();
    }
  };

  const actions = useMemo(
    () => ({
      saveProduct: (p) => run(() => db.saveProduct(p)),
      patchProduct: (id, patch) => {
        setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch, sections: { ...p.sections, ...(patch.sections || {}) } } : patch.sections?.hero ? { ...p, sections: { ...p.sections, hero: false } } : p)));
        return run(() => db.updateProducts([{ id, ...patch }]));
      },
      deleteProduct: (id) => run(() => db.deleteProduct(id)),
      uploadImage: (file, opts) => db.uploadImage(file, opts),
      setOrderStatus: (id, status) => {
        setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
        return run(() => db.setOrderStatus(id, status));
      },
      deleteOrder: (id) => run(() => db.deleteOrder(id)),
      refresh: () => load(),
    }),
    [db, load]
  );

  // customers = everyone with at least one confirmed / delivered order
  const customers = useMemo(() => {
    const map = new Map();
    orders
      .filter((o) => o.status === 'confirmed' || o.status === 'delivered')
      .forEach((o) => {
        const key = (o.customer?.phone || o.id).replace(/\D/g, '').slice(-9);
        const c = map.get(key) || { key, ...o.customer, orders: 0, spent: 0, first: o.createdAt, last: o.createdAt, items: 0 };
        c.orders += 1;
        c.spent += Number(o.total) || 0;
        c.items += o.items.reduce((s, i) => s + i.quantity, 0);
        if (o.createdAt > c.last) {
          c.last = o.createdAt;
          Object.assign(c, o.customer); // latest address wins
        }
        if (o.createdAt < c.first) c.first = o.createdAt;
        map.set(key, c);
      });
    return [...map.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
  }, [orders]);

  return { db, mode: db?.mode, products, orders, customers, loading, error, setError, ...actions };
}
