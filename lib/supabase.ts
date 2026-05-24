// Lazy Supabase client initialization
// The actual createClient is never called at module load time
// This prevents build errors when env vars are missing

let supabaseClientInstance: any = null;

function initSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  try {
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('Supabase environment variables not set. Some features may not work.');
      return null;
    }

    supabaseClientInstance = createClient(url, key);
    return supabaseClientInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

// Dummy object that returns null safely if Supabase isn't available
export const supabase = {
  from: (table: string) => {
    const client = initSupabaseClient();
    if (!client) return null;
    return client.from(table);
  },
  auth: {
    user: null as any,
    session: null as any,
    getUser: async () => {
      const client = initSupabaseClient();
      if (!client) return { data: { user: null }, error: null };
      try {
        return await client.auth.getUser();
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    onAuthStateChange: (callback: any) => {
      const client = initSupabaseClient();
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
      return client.auth.onAuthStateChange(callback);
    },
    signOut: async () => {
      const client = initSupabaseClient();
      if (!client) return { error: null };
      return client.auth.signOut();
    },
  },
  rpc: (fn: string, params?: any) => {
    const client = initSupabaseClient();
    if (!client) throw new Error('Supabase not initialized');
    return client.rpc(fn, params);
  },
} as any;

// Export types for TypeScript
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  address?: string;
  pincode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  user_type: 'customer' | 'vendor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  pincode: string;
  city: string;
  latitude: number;
  longitude: number;
  opening_time?: string;
  closing_time?: string;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_radius_km: number;
  is_open: boolean;
  is_new: boolean;
  is_active: boolean;
  avg_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  vendor_id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  quantity: number;
  sku?: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  created_at: string;
}

export interface Review {
  id: string;
  shop_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  shop_id: string;
  vendor_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';
  delivery_address: string;
  pincode: string;
  delivery_time_estimate?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
}
