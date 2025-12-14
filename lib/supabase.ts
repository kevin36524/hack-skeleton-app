import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_api_key";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
} else {
  console.log('Supabase environment variables loaded', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TestAccount = {
  id: string;
  email: string;
  oauth_token: string;
  created_at: string;
  is_active: boolean;
};
