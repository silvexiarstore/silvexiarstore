import { createClient } from '@supabase/supabase-js';

// هادو جيبهم من Supabase Settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const configuredStorageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim();

export const supabaseStorageBucket = configuredStorageBucket || "products";

export const supabase = createClient(supabaseUrl, supabaseKey);