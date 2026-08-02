import supabase from '../config/supabase';
import { logger } from '../utils/logger';

interface LogActivityParams {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export const activityService = {
  /**
   * Log an activity (non-blocking — fire and forget)
   */
  async log(params: LogActivityParams): Promise<void> {
    try {
      await supabase.from('activity_log').insert({
        user_id: params.userId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        metadata: params.metadata || {},
      });
    } catch (error) {
      // Don't throw — logging should never break the app
      logger.error('Failed to log activity', error);
    }
  },

  /**
   * Get activity logs (admin only)
   */
  async getAll(limit: number = 100, offset: number = 0) {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        users:user_id (full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Error fetching activity logs');
    }

    return data;
  },
};

