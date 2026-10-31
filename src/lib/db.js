/**
 * Data access used by the storefront and the admin panel.
 * Supabase when configured (.env), otherwise the local browser store.
 */
import { localDb } from './localDb';

export const HAS_SUPABASE = Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);

let dbPromise;
export function getDb() {
  if (!dbPromise) {
    dbPromise = HAS_SUPABASE ? import('./supabaseDb').then((m) => m.supabaseDb) : Promise.resolve(localDb);
  }
  return dbPromise;
}
