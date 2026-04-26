import { supabase, User } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'customer' | 'vendor';
  shopName?: string;
  shopCategory?: string;
  address?: string;
  pincode?: string;
  city?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up a new user (customer or vendor)
 */
export async function signUp(data: SignUpData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          user_type: data.userType,
          name: data.name,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      user_type: data.userType,
      address: data.address,
      pincode: data.pincode,
      city: data.city,
    });

    if (profileError) throw profileError;

    // If vendor, create shop record
    if (data.userType === 'vendor' && data.shopName && data.shopCategory) {
      // Use vendor's location or default to major metros
      let latitude = 28.6139;  // Delhi default
      let longitude = 77.2090;
      
      // Map common cities to approximate coordinates
      const cityCoordinates: Record<string, [number, number]> = {
        'Delhi': [28.6139, 77.2090],
        'Mumbai': [19.0760, 72.8777],
        'Bangalore': [12.9716, 77.5946],
        'Chennai': [13.0827, 80.2707],
        'Kolkata': [22.5726, 88.3639],
        'Hyderabad': [17.3850, 78.4867],
        'Pune': [18.5204, 73.8567],
        'Ahmedabad': [23.0225, 72.5714],
      };
      
      if (data.city && cityCoordinates[data.city]) {
        [latitude, longitude] = cityCoordinates[data.city];
      }
      
      const { error: shopError } = await supabase.from('shops').insert({
        vendor_id: authData.user.id,
        name: data.shopName,
        category: data.shopCategory,
        address: data.address || '',
        pincode: data.pincode || '',
        city: data.city || 'Delhi',
        latitude,
        longitude,
        is_active: true,
      });

      if (shopError) throw shopError;
    }

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user and their profile
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
}

/**
 * Reset password request
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window?.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

/**
 * Update password with reset token
 */
export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}

/**
 * Watch auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });

  return subscription;
}
