import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
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
