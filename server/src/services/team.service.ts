import supabase from '../config/supabase';
import { TeamMember } from '../types';
import { logger } from '../utils/logger';

export const teamService = {
  /**
   * Get all visible team members (public)
   * Ordered by department priority, tier hierarchy, then display_order
   */
  async getVisible(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching team members', error);
      throw new Error('Failed to fetch team members');
    }

    return data as TeamMember[];
  },

  /**
   * Get all team members (admin)
   */
  async getAll(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('department', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching all team members', error);
      throw new Error('Failed to fetch team members');
    }

    return data as TeamMember[];
  },

  /**
   * Get single team member by ID
   */
  async getById(id: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch team member');
    }

    return data as TeamMember;
  },

  /**
   * Create team member (admin)
   */
  async create(memberData: {
    name: string;
    student_id: string;
    role: string;
    department: string;
    tier: string;
    sub_category?: string | null;
    bio?: string;
    avatar_url?: string;
    img_seed?: string;
    linkedin_url?: string;
    github_url?: string;
    instagram_url?: string;
    email?: string;
    display_order?: number;
  }): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        ...memberData,
        is_visible: true,
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Error creating team member', error);
      throw new Error('Failed to create team member');
    }

    return data as TeamMember;
  },

  /**
   * Update team member (admin)
   */
  async update(
    id: string,
    updates: Partial<{
      name: string;
      student_id: string;
      role: string;
      department: string;
      tier: string;
      sub_category: string | null;
      bio: string;
      avatar_url: string;
      img_seed: string;
      linkedin_url: string;
      github_url: string;
      instagram_url: string;
      email: string;
      display_order: number;
    }>
  ): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating team member', error);
      throw new Error('Failed to update team member');
    }

    return data as TeamMember;
  },

  /**
   * Toggle visibility (admin)
   */
  async toggleVisibility(
    id: string,
    isVisible: boolean
  ): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({ is_visible: isVisible })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to update visibility');
    }

    return data as TeamMember;
  },

  /**
   * Find team member by email (for self-service)
   */
  async findByEmail(email: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error finding team member by email', error);
      throw new Error('Failed to find team member');
    }

    return data as TeamMember;
  },

  /**
   * Find an unlinked team member using multiple matching strategies.
   * Tries: student-ID from email, email-derived name, full name — all normalised.
   */
  async findUnlinkedMatch(
    email: string,
    fullName: string
  ): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .is('email', null);

    if (error || !data || data.length === 0) return null;

    // Helpers
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normId = (s: string) =>
      s.toLowerCase().replace(/o/g, '0').replace(/[^a-z0-9]/g, '');

    // Extract parts from email  e.g. "24cse143.riteshkumarlenka@giet.edu"
    const localPart = email.split('@')[0]; // "24cse143.riteshkumarlenka"
    const dotIdx = localPart.indexOf('.');
    const emailPrefix = dotIdx > 0 ? localPart.slice(0, dotIdx) : ''; // "24cse143"
    const emailNamePart = dotIdx > 0 ? localPart.slice(dotIdx + 1) : ''; // "riteshkumarlenka"
    const normEmailName = norm(emailNamePart);
    const normFullName = norm(fullName);

    for (const m of data) {
      const normMemberName = norm(m.name);

      // Strategy 1: student_id from email prefix (normalise 0/o confusion)
      if (emailPrefix && normId(emailPrefix) === normId(m.student_id)) {
        logger.info(`Matched team member "${m.name}" via student_id from email`);
        return m as TeamMember;
      }

      // Strategy 2: name portion of email vs team_member name
      if (normEmailName && normEmailName === normMemberName) {
        logger.info(`Matched team member "${m.name}" via email-derived name`);
        return m as TeamMember;
      }

      // Strategy 3: Google full_name vs team_member name
      if (normFullName && normFullName === normMemberName) {
        logger.info(`Matched team member "${m.name}" via Google full name`);
        return m as TeamMember;
      }
    }

    return null;
  },

  /**
   * Bulk auto-link: wire emails into team_members for all official members.
   * Idempotent — only touches rows where email IS NULL.
   * Called once at server startup.
   */
  async linkAllMembers(): Promise<void> {
    try {
      // Fetch all users who are members/admins
      const { data: users, error: uErr } = await supabase
        .from('users')
        .select('*')
        .in('role', ['member', 'admin']);

      if (uErr || !users || users.length === 0) return;

      // Fetch all unlinked team members
      const { data: unlinked, error: tErr } = await supabase
        .from('team_members')
        .select('*')
        .is('email', null);

      if (tErr || !unlinked || unlinked.length === 0) return;

      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normId = (s: string) =>
        s.toLowerCase().replace(/o/g, '0').replace(/[^a-z0-9]/g, '');

      let linked = 0;

      for (const user of users) {
        // Check if already linked
        const alreadyLinked = await this.findByEmail(user.email);
        if (alreadyLinked) continue;

        const localPart = user.email.split('@')[0];
        const dotIdx = localPart.indexOf('.');
        const emailPrefix = dotIdx > 0 ? localPart.slice(0, dotIdx) : '';
        const emailNamePart = dotIdx > 0 ? localPart.slice(dotIdx + 1) : '';
        const normEmailName = norm(emailNamePart);
        const normFullName = norm(user.full_name);

        let match: any = null;
        for (const m of unlinked) {
          if (m.email) continue; // already linked by a previous iteration
          const normMemberName = norm(m.name);

          if (
            (emailPrefix && normId(emailPrefix) === normId(m.student_id)) ||
            (normEmailName && normEmailName === normMemberName) ||
            (normFullName && normFullName === normMemberName)
          ) {
            match = m;
            break;
          }
        }

        if (match) {
          const updates: Record<string, any> = { email: user.email };
          // Also sync current profile fields to team_members
          if (user.full_name) updates.name = user.full_name;
          if (user.bio) updates.bio = user.bio;
          if (user.avatar_url) updates.avatar_url = user.avatar_url;
          if (user.github_url) updates.github_url = user.github_url;
          if (user.linkedin_url) updates.linkedin_url = user.linkedin_url;

          await this.update(match.id, updates);
          match.email = user.email; // mark as linked for this loop
          linked++;
          logger.success(`Bulk-linked "${match.name}" → ${user.email}`);
        }
      }

      if (linked > 0) {
        logger.success(`Bulk auto-link complete: ${linked} team members linked`);
      }
    } catch (err) {
      logger.warn('Bulk auto-link failed', err);
    }
  },

  /**
   * Update avatar URL for a specific team member
   */
  async updateAvatar(id: string, avatarUrl: string): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({ avatar_url: avatarUrl })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating team member avatar', error);
      throw new Error('Failed to update avatar');
    }

    return data as TeamMember;
  },

  /**
   * Delete team member (admin)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting team member', error);
      throw new Error('Failed to delete team member');
    }
  },
};

