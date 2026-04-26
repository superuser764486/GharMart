import { supabase } from '@/lib/supabase'

export interface Address {
  id: string
  user_id: string
  label: string
  full_address: string
  city: string
  state: string
  pincode: string
  latitude?: number
  longitude?: number
  is_default: boolean
  created_at: string
}

export async function getAddresses(userId: string): Promise<Address[]> {
  try {
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })

    return data || []
  } catch (error) {
    console.error('[v0] Error fetching addresses:', error)
    return []
  }
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  try {
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    return data
  } catch (error) {
    return null
  }
}

export async function addAddress(userId: string, addressData: Omit<Address, 'id' | 'user_id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        ...addressData,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error adding address:', error)
    return { success: false, error }
  }
}

export async function updateAddress(userId: string, addressId: string, addressData: Partial<Address>) {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .update(addressData)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error updating address:', error)
    return { success: false, error }
  }
}

export async function setDefaultAddress(userId: string, addressId: string) {
  try {
    // Unset all other defaults
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Set the new default
    const { data, error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error setting default address:', error)
    return { success: false, error }
  }
}

export async function deleteAddress(userId: string, addressId: string) {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting address:', error)
    return { success: false, error }
  }
}
