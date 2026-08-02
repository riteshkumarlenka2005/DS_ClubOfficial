import supabase from '../config/supabase';
import { MembershipApplication } from '../types';
import { logger } from '../utils/logger';

export const membershipService = {
  /**
   * Submit a new membership application
   */
  async submit(data: {
    user_id?: string;
    full_name: string;
    email: string;
    academic_year: number;
    interests: string;
  }): Promise<MembershipApplication> {
    const { data: app, error } = await supabase
      .from('membership_applications')
      .insert({
        user_id: data.user_id || null,
        full_name: data.full_name,
        email: data.email,
        academic_year: data.academic_year,
        interests: data.interests,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Error submitting membership application', error);
      throw new Error('Failed to submit application');
    }

    return app as MembershipApplication;
  },

  /**
   * Check if a user or email already has a pending/approved application
   */
  async findExisting(email: string, userId?: string): Promise<MembershipApplication | null> {
    let query = supabase
      .from('membership_applications')
      .select('*')
      .in('status', ['pending', 'approved']);

    if (userId) {
      // Check by user_id OR email
      query = query.or(`user_id.eq.${userId},email.eq.${email}`);
    } else {
      query = query.eq('email', email);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

    if (error) {
      logger.error('Error checking existing application', error);
      throw new Error('Failed to check application status');
    }

    return data && data.length > 0 ? (data[0] as MembershipApplication) : null;
  },

  /**
   * Get application status by email (public)
   */
  async getStatusByEmail(email: string): Promise<MembershipApplication | null> {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      logger.error('Error fetching application status', error);
      throw new Error('Failed to fetch application status');
    }

    return data && data.length > 0 ? (data[0] as MembershipApplication) : null;
  },

  /**
   * Get all applications (admin)
   */
  async getAll(): Promise<MembershipApplication[]> {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all applications', error);
      throw new Error('Failed to fetch applications');
    }

    return data as MembershipApplication[];
  },

  /**
   * Update application status (admin)
   */
  async updateStatus(
    applicationId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string
  ): Promise<MembershipApplication> {
    const { data, error } = await supabase
      .from('membership_applications')
      .update({
        status,
        reviewed_by: reviewedBy,
      })
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating application status', error);
      throw new Error('Failed to update application');
    }

    return data as MembershipApplication;
  },
};
