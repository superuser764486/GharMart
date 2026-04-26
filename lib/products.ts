import { supabase, Product } from './supabase';

/**
 * Get products for a shop
 */
export async function getShopProducts(shopId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get shop products error:', error);
    return [];
  }
}

/**
 * Get product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get product error:', error);
    return null;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get products by category error:', error);
    return [];
  }
}

/**
 * Search products by name
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
}

/**
 * Create product (for vendors)
 */
export async function createProduct(
  shopId: string,
  vendorId: string,
  product: Omit<Product, 'id' | 'shop_id' | 'vendor_id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        shop_id: shopId,
        vendor_id: vendorId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
}

/**
 * Update product (for vendors)
 */
export async function updateProduct(productId: string, updates: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
}

/**
 * Delete product (for vendors)
 */
export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
}

/**
 * Get vendor products
 */
export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get vendor products error:', error);
    return [];
  }
}
