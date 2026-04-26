import { supabase, Shop, Category } from './supabase';

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get categories error:', error);
    return [];
  }
}

/**
 * Get shops near a location
 */
export async function getShopsNearby(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Shop[]> {
  try {
    // Get all active shops
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('is_active', true)
      .order('avg_rating', { ascending: false });

    if (error) throw error;

    // Filter by distance
    const filtered = (data || []).filter((shop) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        shop.latitude,
        shop.longitude
      );
      return distance <= radiusKm;
    });

    return filtered;
  } catch (error) {
    console.error('Get shops nearby error:', error);
    return [];
  }
}

/**
 * Get shops by category
 */
export async function getShopsByCategory(category: string): Promise<Shop[]> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('avg_rating', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get shops by category error:', error);
    return [];
  }
}

/**
 * Get shop by ID
 */
export async function getShop(shopId: string): Promise<Shop | null> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get shop error:', error);
    return null;
  }
}

/**
 * Get shops by vendor
 */
export async function getVendorShops(vendorId: string): Promise<Shop[]> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get vendor shops error:', error);
    return [];
  }
}

/**
 * Update shop
 */
export async function updateShop(shopId: string, updates: Partial<Shop>) {
  try {
    const { error } = await supabase
      .from('shops')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shopId);

    if (error) throw error;
  } catch (error) {
    console.error('Update shop error:', error);
    throw error;
  }
}

/**
 * Search shops by name
 */
export async function searchShops(query: string): Promise<Shop[]> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('avg_rating', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Search shops error:', error);
    return [];
  }
}

/**
 * Get popular/new shops
 */
export async function getPopularShops(limit: number = 6): Promise<Shop[]> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('is_active', true)
      .order('avg_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get popular shops error:', error);
    return [];
  }
}

/**
 * Get new shops
 */
export async function getNewShops(limit: number = 6): Promise<Shop[]> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('is_active', true)
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get new shops error:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get user's current location
 */
export function getUserLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
