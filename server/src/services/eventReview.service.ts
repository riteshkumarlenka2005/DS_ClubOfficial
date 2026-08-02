import supabase from '../config/supabase';
import { logger } from '../utils/logger';
import { EventReview } from '../types';

export const eventReviewService = {
  /**
   * Create a new review
   */
  async create(data: {
    event_id: string;
    user_id: string;
    rating: number;
    review_text: string;
  }): Promise<EventReview> {
    const { data: result, error } = await supabase
      .from('event_reviews')
      .insert({
        ...data,
        is_approved: false // Default to false for admin review
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already reviewed this event');
      }
      logger.error('Error creating review', error);
      throw new Error('Failed to create review');
    }

    return result as EventReview;
  },

  /**
   * Get all reviews for a specific event (optionally only approved)
   * Also calculates average rating and total count
   */
  async getByEventId(eventId: string, onlyApproved: boolean = true) {
    let query = supabase
      .from('event_reviews')
      .select(`
        *,
        user:users!event_reviews_user_id_fkey(
          id, full_name, avatar_url, student_id
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (onlyApproved) {
      query = query.eq('is_approved', true);
    }

    const { data: reviews, error } = await query;

    if (error) {
      logger.error('Error fetching event reviews', error);
      throw new Error('Failed to fetch event reviews');
    }

    // Calculate aggregated stats
    const totalCount = reviews?.length || 0;
    let averageRating = 0;
    
    if (totalCount > 0) {
      const sum = reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
      averageRating = Number((sum / totalCount).toFixed(1));
    }

    return {
      reviews,
      stats: {
        averageRating,
        totalCount
      }
    };
  },

  /**
   * Admin: Get all reviews
   */
  async getAll() {
    const { data, error } = await supabase
      .from('event_reviews')
      .select(`
        *,
        user:users!event_reviews_user_id_fkey(
          id, full_name, avatar_url, student_id
        ),
        event:events(
          id, title, slug
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all reviews', error);
      throw new Error('Failed to fetch all reviews');
    }

    return data;
  },

  /**
   * Admin: Update review approval status
   */
  async updateStatus(reviewId: string, isApproved: boolean): Promise<EventReview> {
    const { data, error } = await supabase
      .from('event_reviews')
      .update({ is_approved: isApproved })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating review status', error);
      throw new Error('Failed to update review status');
    }

    return data as EventReview;
  },

  /**
   * Admin: Delete a review
   */
  async delete(reviewId: string) {
    const { error } = await supabase
      .from('event_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      logger.error('Error deleting review', error);
      throw new Error('Failed to delete review');
    }

    return true;
  },
  
  /**
   * Check if a user is eligible to review an event
   */
  async checkEligibility(eventId: string, userId: string) {
    // 1. Verify event is "past" / "completed"
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('status')
      .eq('id', eventId)
      .single();
      
    if (eventError || !event) {
      throw new Error('Event not found');
    }
    
    if (event.status !== 'completed' && event.status !== 'past') {
      return { eligible: false, reason: 'Reviews are only allowed after event completion' };
    }
    
    // 2. Check if already reviewed
    const { data: existingReview, error: reviewError } = await supabase
      .from('event_reviews')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
      
    if (existingReview) {
      return { eligible: false, reason: 'You have already reviewed this event' };
    }
    
    // 3. Check registration/attendance (fallback to registered)
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('status, has_attended')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
      
    if (regError || !registration) {
      return { eligible: false, reason: 'You must be registered for this event to write a review' };
    }
    
    // If we have an attendance system, we can enforce it:
    // if (registration.status === 'registered' && registration.has_attended === false) { ... }
    
    if (registration.status === 'cancelled') {
        return { eligible: false, reason: 'Your registration was cancelled' };
    }

    return { eligible: true, reason: null };
  }
};
