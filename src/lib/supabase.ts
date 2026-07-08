import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Typed anon client (restricted by RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Typed admin client (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
