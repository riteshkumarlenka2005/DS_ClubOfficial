import supabase from '../config/supabase';
import { User, UserRole } from '../types';
import { logger } from '../utils/logger';
import { teamService } from './team.service';

export const userService = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Error fetching user profile');
    }
    return data as User;
  },

  /**
   * Update own profile (limited fields)
   */
  async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      bio?: string;
      department?: string;
      batch_year?: number;
      github_url?: string;
      linkedin_url?: string;
      portfolio_url?: string;
    }
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating profile', error);
      throw new Error('Error updating user profile');
    }

    const user = data as User;

    // Sync relevant fields to team_members table (for About page)
    try {
      if (user.email) {
        let teamMember = await teamService.findByEmail(user.email);

        // If not linked yet, try to auto-link now
        if (!teamMember && (user.role === 'member' || user.role === 'admin')) {
          const match = await teamService.findUnlinkedMatch(user.email, user.full_name);
          if (match) {
            await teamService.update(match.id, { email: user.email });
            teamMember = match;
            logger.info(`Auto-linked team member "${match.name}" → ${user.email} during profile update`);
          }
        }

        if (teamMember) {
          const teamUpdates: Record<string, any> = {};
          if (updates.full_name) teamUpdates.name = updates.full_name;
          if (updates.bio !== undefined) teamUpdates.bio = updates.bio;
          if (updates.github_url !== undefined) teamUpdates.github_url = updates.github_url;
          if (updates.linkedin_url !== undefined) teamUpdates.linkedin_url = updates.linkedin_url;
          if (updates.portfolio_url !== undefined) teamUpdates.portfolio_url = updates.portfolio_url;
          if (Object.keys(teamUpdates).length > 0) {
            await teamService.update(teamMember.id, teamUpdates);
            logger.info(`Synced profile updates to team_members for ${user.email}`);
          }
        }
      }
    } catch (syncErr) {
      // Non-critical: log but don't fail the profile update
      logger.warn('Failed to sync profile to team_members', syncErr);
    }

    return user;
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching users');
    }

    return data as User[];
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(
    targetUserId: string,
    newRole: UserRole
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', targetUserId)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating role', error);
      throw new Error('Error updating user role');
    }

    return data as User;
  },

  /**
   * Toggle user active status (admin only)
   */
  async toggleActive(
    targetUserId: string,
    isActive: boolean
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', targetUserId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Error toggling user status');
    }

    return data as User;
  },
};

