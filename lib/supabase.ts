import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function supabaseClient(): any {
  if (!_client) {
    // use service role key server-side to bypass RLS — app auth is handled by proxy
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
  }
  return _client
}
