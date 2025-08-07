import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might want to show a friendlier error message to the user.
  // For development, throwing an error is clear and effective.
  throw new Error("Supabase URL or Anon Key is missing. Make sure it's set in your .env.local file and prefixed with REACT_APP_");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: window.location.origin,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
