/*
 * TEMPLATE for a remote sync adapter. Copy this file, fill it in, then switch
 * it on in ../config.js. The rest of the app does not change.
 *
 * The whole tracker is ONE small JSON document (well under 1 MB), so any
 * key/value or document store works: Supabase, Firebase Firestore, PocketBase,
 * Cloudflare KV, a GitHub Gist, etc.
 *
 * An adapter is an object with three methods:
 *
 *   connect(): Promise<void>
 *     Sign in / open the connection. Throw (or reject) if sync is not
 *     possible; the app then quietly stays on "This device".
 *
 *   subscribe(onData, onError): void
 *     Call onData(doc) with the latest document from the server as soon as
 *     you have it, and again whenever another device changes it.
 *     Pass null if the document does not exist yet.
 *     Only pass data that really came from the server (not a local echo).
 *     If you cannot listen live, just call onData once after fetching, and
 *     optionally again on a timer or when the tab becomes visible.
 *     Call onError(err) if the connection is lost for good.
 *
 *   save(doc): Promise<void>
 *     Replace the stored document with `doc` (a plain JSON object that
 *     always has an `updated` timestamp in ms). Reject on failure.
 */
export function createTemplateAdapter(/* options */) {
  return {
    async connect() {
      throw new Error('Template adapter: not implemented');
    },
    subscribe(onData, onError) {
      // e.g. fetch the document, then onData(docOrNull)
    },
    async save(doc) {
      // e.g. upsert { id: userId, data: doc }
    },
  };
}

/*
 * Example sketch for Supabase (free tier), after `npm install @supabase/supabase-js`
 * and creating a table:  create table tracker (user_id uuid primary key
 * references auth.users, data jsonb not null);  with row level security
 * allowing each user to read/write only their own row.
 *
 * import {createClient} from '@supabase/supabase-js';
 * export function createSupabaseAdapter({url, anonKey}) {
 *   const sb = createClient(url, anonKey);
 *   let uid = null;
 *   return {
 *     async connect() {
 *       const {data} = await sb.auth.getSession();
 *       if (!data.session) throw new Error('not signed in');
 *       uid = data.session.user.id;
 *     },
 *     subscribe(onData, onError) {
 *       const pull = async () => {
 *         const {data, error} = await sb.from('tracker').select('data').eq('user_id', uid).maybeSingle();
 *         if (error) return onError(error);
 *         onData(data ? data.data : null);
 *       };
 *       pull();
 *       sb.channel('tracker').on('postgres_changes',
 *         {event: '*', schema: 'public', table: 'tracker', filter: 'user_id=eq.' + uid},
 *         p => onData(p.new && p.new.data)).subscribe();
 *       document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });
 *     },
 *     async save(doc) {
 *       const {error} = await sb.from('tracker').upsert({user_id: uid, data: doc});
 *       if (error) throw error;
 *     },
 *   };
 * }
 */
