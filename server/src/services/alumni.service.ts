import supabase from '../config/supabase';
import { Alumni } from '../types';
import { logger } from '../utils/logger';

export const alumniService = {
  /**
   * Get visible alumni (public) — ordered by display_order
   */
  async getVisible(): Promise<Alumni[]> {
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('Error fetching alumni', error);
      throw new Error('Failed to fetch alumni');
    }
    return data as Alumni[];
  },

  /**
   * Get all alumni (admin)
   */
  async getAll(): Promise<Alumni[]> {
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw new Error('Failed to fetch alumni');
    return data as Alumni[];
  },

  /**
   * Get single alumni by ID
   */
  async getById(id: string): Promise<Alumni | null> {
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch alumni');
    }
    return data as Alumni;
  },

  /**
   * Create alumni (admin)
   */
  async create(alumniData: {
    full_name: string;
    email?: string;
    batch_year: number;
    department?: string;
    company?: string;
    designation?: string;
    linkedin_url?: string;
    github_url?: string;
    avatar_url?: string;
    testimonial?: string;
    skills?: string[];
    bg_color?: string;
    img_seed?: string;
    display_order?: number;
  }): Promise<Alumni> {
    const { data, error } = await supabase
      .from('alumni')
      .insert({ ...alumniData, is_visible: true })
      .select('*')
      .single();

    if (error) {
      logger.error('Error creating alumni', error);
      throw new Error('Failed to create alumni');
    }
    return data as Alumni;
  },

  /**
   * Update alumni (admin)
   */
  async update(id: string, updates: Partial<Alumni>): Promise<Alumni> {
    const { data, error } = await supabase
      .from('alumni')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error('Failed to update alumni');
    return data as Alumni;
  },

  /**
   * Toggle visibility (admin)
   */
  async toggleVisibility(id: string, isVisible: boolean): Promise<Alumni> {
    const { data, error } = await supabase
      .from('alumni')
      .update({ is_visible: isVisible })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error('Failed to update visibility');
    return data as Alumni;
  },

  /**
   * Delete alumni (admin)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('alumni').delete().eq('id', id);
    if (error) throw new Error('Failed to delete alumni');
  },
};

