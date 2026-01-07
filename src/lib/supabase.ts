import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Owner = {
  id: string;
  full_name: string;
  national_id: string | null;
  contact_number: string | null;
  address: string | null;
  created_at: string;
};

export type Land = {
  id: string;
  land_number: string;
  location: string;
  area_size: number;
  boundaries: string | null;
  original_owner_id: string | null;
  current_owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type OwnershipTransfer = {
  id: string;
  land_id: string;
  from_owner_id: string | null;
  to_owner_id: string;
  transfer_date: string;
  sale_amount: number | null;
  transfer_notes: string | null;
  created_at: string;
};
