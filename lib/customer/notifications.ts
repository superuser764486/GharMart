import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  related_order_id?: string
  is_read: boolean
  created_at: string
  read_at?: string
}

export async function getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data || []
  } catch (error) {
    console.error('[v0] Error fetching notifications:', error)
    return []
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    return count || 0
  } catch (error) {
    return 0
  }
}

export async function markAsRead(userId: string, notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error marking notification as read:', error)
    return { success: false, error }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error marking all as read:', error)
    return { success: false, error }
  }
}

export async function deleteNotification(userId: string, notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting notification:', error)
    return { success: false, error }
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedOrderId?: string
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_order_id: relatedOrderId,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error creating notification:', error)
    return { success: false, error }
  }
}
