import { supabase, Order, OrderItem } from './supabase';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Create an order
 */
export async function createOrder(
  userId: string,
  shopId: string,
  vendorId: string,
  items: CartItem[],
  deliveryAddress: string,
  pincode: string,
  notes?: string
) {
  try {
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        shop_id: shopId,
        vendor_id: vendorId,
        total_amount: totalAmount,
        status: 'pending',
        delivery_address: deliveryAddress,
        pincode: pincode,
        delivery_time_estimate: 45,
        notes: notes || '',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderData;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user orders error:', error);
    return [];
  }
}

/**
 * Get vendor's orders
 */
export async function getVendorOrders(vendorId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get vendor orders error:', error);
    return [];
  }
}

/**
 * Get order by ID with items
 */
export async function getOrderWithItems(orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products:product_id(*)')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return { order, items };
  } catch (error) {
    console.error('Get order with items error:', error);
    return null;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string) {
  try {
    return await updateOrderStatus(orderId, 'cancelled');
  } catch (error) {
    console.error('Cancel order error:', error);
    throw error;
  }
}

/**
 * Get order items
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get order items error:', error);
    return [];
  }
}

/**
 * Get shop orders for a specific date range
 */
export async function getShopOrdersInRange(
  shopId: string,
  startDate: string,
  endDate: string
): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get shop orders in range error:', error);
    return [];
  }
}

/**
 * Get order statistics for vendor
 */
export async function getVendorOrderStats(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    const orders = data || [];
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      completedOrders: orders.filter((o) => o.status === 'delivered').length,
      cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    };

    return stats;
  } catch (error) {
    console.error('Get vendor order stats error:', error);
    return null;
  }
}
