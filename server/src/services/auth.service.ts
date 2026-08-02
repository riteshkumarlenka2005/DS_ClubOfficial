import supabase from '../config/supabase';
import { User } from '../types';
import { logger } from '../utils/logger';
import { teamService } from './team.service';

/**
 * Official DS Club member emails.
 * Any user logging in with one of these emails is automatically
 * assigned (or kept at) the 'member' role.
 */
const OFFICIAL_MEMBER_EMAILS: Set<string> = new Set([
  '23cse513.priyanshugupta@giet.edu',
  '23cseds048.snehashreepanda@giet.edu',
  '23cseds037.chitranshusanket@giet.edu',
  '23cse280.vaishnavipatnaik@giet.edu',
  '24cseaiml022.sushobhanpal@giet.edu',
  '23cse589.khusinayak@giet.edu',
  '23cseds042.abhinavkumar@giet.edu',
  '24cse015.mananpatel@giet.edu',
  '24cseaiml169.puppalaharish@giet.edu',
  '24cse097.milindpanda@giet.edu',
  '24cseds017.saripillimaruthi@giet.edu',
  '24cseaiml079.amankumarsingh@giet.edu',
  '24cseds038.subhasissamantaray@giet.edu',
  '23cseds029.ayushchoudhury@giet.edu',
  '23cse231.deviduttaparida@giet.edu',
  '24cseaiml065.soumyaranjanpadhi@giet.edu',
  '23cse586.jayaprakashsahoo@giet.edu',
  '23cse496.rajkumarsahu@giet.edu',
  '24cseaiml071.ashishpalo@giet.edu',
  '24cseaiml333.srustipanigrahi@giet.edu',
  '24cseaiml281.rudrakshyakumar@giet.edu',
  '24cseds020.gopalkrushnapanda@giet.edu',
  '24cseaiml088.abhinashkumarsingh@giet.edu',
  '24cseds011.radasuvarthika@giet.edu',
  '24cseaiml225.ravullaadhiraj@giet.edu',
  '24cseaiml101.subratjena@giet.edu',
  '23cseaiml027.swatirekhajena@giet.edu',
  '23cse250.pothamsettipradeepkumar@giet.edu',
  '24cse275.meegadadeepika@giet.edu',
  '24cseaiml161.srimayakumarpradhan@giet.edu',
  '23cseds049.lipsasamantray@giet.edu',
  '24cse215.tanmayabhuyan@giet.edu',
]);

interface UpsertUserData {
  google_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export const authService = {
  /**
   * Find or create user after Google authentication
   * New users get 'student' role by default
   */
  async upsertUser(userData: UpsertUserData): Promise<User> {
    // First check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', userData.google_id)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected for new users)
      logger.error('Error finding user', findError);
      throw new Error('Database error while finding user');
    }

    if (existingUser) {
      // Determine if user is an official member who should be promoted
      const isOfficialMember = OFFICIAL_MEMBER_EMAILS.has(userData.email.toLowerCase());
      const shouldPromote = isOfficialMember && existingUser.role === 'student';

      // Only update role if promotion is needed.
      // Do NOT overwrite full_name / avatar_url — the user may have customised them.
      const updatePayload: Record<string, any> = {};
      if (shouldPromote) updatePayload.role = 'member';

      // Only set name/avatar if user hasn't set them yet (first Google login populates them).
      if (!existingUser.full_name) updatePayload.full_name = userData.full_name;
      if (!existingUser.avatar_url) updatePayload.avatar_url = userData.avatar_url;

      let updated = existingUser;
      if (Object.keys(updatePayload).length > 0) {
        const { data, error: updateError } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', existingUser.id)
          .select('*')
          .single();

        if (updateError) {
          logger.error('Error updating user', updateError);
          throw new Error('Database error while updating user');
        }
        updated = data;

        if (shouldPromote) {
          logger.info(`Auto-promoted official member: ${updated.email}`);
        }
      }

      logger.info(`Returning user logged in: ${updated.email}`);

      // Auto-link to team_members if not yet linked
      await autoLinkTeamMember(updated as User);

      return updated as User;
    }

    // Create new user — official members get 'member' role, others get 'student'
    const isOfficialMember = OFFICIAL_MEMBER_EMAILS.has(userData.email.toLowerCase());
    const defaultRole = isOfficialMember ? 'member' : 'student';

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        google_id: userData.google_id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        role: defaultRole,
        is_active: true,
      })
      .select('*')
      .single();

    if (createError) {
      logger.error('Error creating user', createError);
      throw new Error('Database error while creating user');
    }

    logger.success(`New user registered: ${newUser.email} (role: ${defaultRole})`);

    // Auto-link to team_members if not yet linked
    await autoLinkTeamMember(newUser as User);

    return newUser as User;
  },

  /**
   * Find user by ID (for token refresh / session check)
   */
  async findById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Database error while finding user');
    }

    return data as User;
  },
};

// ─── Auto-link: wire a user's email into team_members (runs once per member) ───
async function autoLinkTeamMember(user: User): Promise<void> {
  try {
    if (user.role !== 'member' && user.role !== 'admin') return;

    // Already linked?
    const existing = await teamService.findByEmail(user.email);
    if (existing) {
      // Sync current profile data to team_members on every login
      const syncUpdates: Record<string, any> = {};
      if (user.full_name && user.full_name !== existing.name) syncUpdates.name = user.full_name;
      if (user.bio !== undefined && user.bio !== existing.bio) syncUpdates.bio = user.bio;
      if (user.avatar_url && user.avatar_url !== existing.avatar_url) syncUpdates.avatar_url = user.avatar_url;
      if (user.github_url !== undefined && user.github_url !== existing.github_url) syncUpdates.github_url = user.github_url;
      if (user.linkedin_url !== undefined && user.linkedin_url !== existing.linkedin_url) syncUpdates.linkedin_url = user.linkedin_url;
      if (Object.keys(syncUpdates).length > 0) {
        await teamService.update(existing.id, syncUpdates);
        logger.info(`Synced profile to team_members for ${user.email} on login`);
      }
      return;
    }

    // Try to find an unlinked team member via multi-strategy match
    const match = await teamService.findUnlinkedMatch(user.email, user.full_name);
    if (!match) {
      logger.warn(`No unlinked team_member found for "${user.full_name}" (${user.email})`);
      return;
    }

    // Link: set email + sync all current profile fields
    const linkUpdates: Record<string, any> = { email: user.email };
    if (user.full_name) linkUpdates.name = user.full_name;
    if (user.bio) linkUpdates.bio = user.bio;
    if (user.avatar_url) linkUpdates.avatar_url = user.avatar_url;
    if (user.github_url) linkUpdates.github_url = user.github_url;
    if (user.linkedin_url) linkUpdates.linkedin_url = user.linkedin_url;

    await teamService.update(match.id, linkUpdates);
    logger.success(`Auto-linked team member "${match.name}" → ${user.email}`);
  } catch (err) {
    // Non-critical — don't break login
    logger.warn('Auto-link team member failed', err);
  }
}

