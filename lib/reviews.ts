import { supabase, Review } from './supabase';

/**
 * Get reviews for a shop
 */
export async function getShopReviews(shopId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users:user_id(name, email)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get shop reviews error:', error);
    return [];
  }
}

/**
 * Get user's reviews
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user reviews error:', error);
    return [];
  }
}

/**
 * Create a review
 */
export async function createReview(
  shopId: string,
  userId: string,
  rating: number,
  comment?: string
) {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        shop_id: shopId,
        user_id: userId,
        rating,
        comment: comment || '',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  rating?: number,
  comment?: string
) {
  try {
    const updates: any = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update review error:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  } catch (error) {
    console.error('Delete review error:', error);
    throw error;
  }
}

/**
 * Check if user has reviewed a shop
 */
export async function userHasReviewed(
  userId: string,
  shopId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('shop_id', shopId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('User has reviewed error:', error);
    return false;
  }
}

/**
 * Get average rating and review count for a shop
 */
export async function getShopRating(shopId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('shop_id', shopId);

    if (error) throw error;

    const reviews = data || [];
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    };
  } catch (error) {
    console.error('Get shop rating error:', error);
    return { averageRating: 0, reviewCount: 0 };
  }
}
