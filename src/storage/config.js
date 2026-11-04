/*
 * Choose where data is synced. `null` means this device only (localStorage).
 *
 * To sync between phone and laptop, write an adapter (see
 * adapters/template.js) and export it here, for example:
 *
 *   import {createSupabaseAdapter} from './adapters/supabase.js';
 *   export const remoteAdapter = createSupabaseAdapter({
 *     url: import.meta.env.VITE_SUPABASE_URL,
 *     anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
 *   });
 */
export const remoteAdapter = null;
