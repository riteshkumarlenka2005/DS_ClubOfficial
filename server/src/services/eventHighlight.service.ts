import supabase from '../config/supabase';
import { EventHighlight } from '../types';
import { logger } from '../utils/logger';

export const eventHighlightService = {
  /**
   * Get highlights by event ID (public)
   */
  async getByEventId(eventId: string): Promise<EventHighlight | null> {
    const { data, error } = await supabase
      .from('event_highlights')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error fetching event highlights', error);
      throw new Error('Failed to fetch event highlights');
    }

    return data as EventHighlight;
  },

  /**
   * Get highlights by event slug (public)
   * Joins through events table
   */
  async getByEventSlug(slug: string): Promise<{
    event: any;
    highlights: EventHighlight | null;
    galleryImages: any[];
    blogVideos: any[];
  } | null> {
    // First get the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (eventError) {
      if (eventError.code === 'PGRST116') return null;
      throw new Error('Failed to fetch event');
    }

    if (!event) return null;

    // Fetch highlights record (optional — may not exist)
    const { data: highlights } = await supabase
      .from('event_highlights')
      .select('*')
      .eq('event_id', event.id)
      .single();

    // Fetch gallery images linked to this event
    const { data: galleryImages } = await supabase
      .from('gallery')
      .select('id, image_url, title, description, is_cover')
      .eq('event_id', event.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    // Fetch blog posts/videos linked to this event
    const { data: blogVideos } = await supabase
      .from('blogs')
      .select('id, title, slug, video_url, excerpt, cover_image, category')
      .eq('event_id', event.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    return {
      event,
      highlights: highlights as EventHighlight | null,
      galleryImages: galleryImages || [],
      blogVideos: blogVideos || [],
    };
  },

  /**
   * Get all highlights with event info (admin)
   */
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('event_highlights')
      .select(`
        *,
        event:event_id (id, title, slug, event_date, venue, cover_image, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all highlights', error);
      throw new Error('Failed to fetch highlights');
    }

    return data;
  },

  /**
   * Create highlights for an event (admin)
   */
  async create(data: {
    event_id: string;
    summary: string;
    stats: { label: string; value: string }[];
    photos?: string[];
    key_takeaways?: string[];
    testimonial_text?: string;
    testimonial_author?: string;
  }): Promise<EventHighlight> {
    const { data: created, error } = await supabase
      .from('event_highlights')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      logger.error('Error creating highlights', error);
      if (error.code === '23505') {
        throw new Error('Highlights already exist for this event');
      }
      throw new Error('Failed to create highlights');
    }

    return created as EventHighlight;
  },

  /**
   * Update highlights (admin)
   */
  async update(
    id: string,
    updates: Partial<{
      summary: string;
      stats: { label: string; value: string }[];
      photos: string[];
      key_takeaways: string[];
      testimonial_text: string | null;
      testimonial_author: string | null;
    }>
  ): Promise<EventHighlight> {
    const { data, error } = await supabase
      .from('event_highlights')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating highlights', error);
      throw new Error('Failed to update highlights');
    }

    return data as EventHighlight;
  },

  /**
   * Delete highlights (admin)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('event_highlights')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Failed to delete highlights');
    }
  },

  /**
   * Get by highlight ID
   */
  async getById(id: string): Promise<EventHighlight | null> {
    const { data, error } = await supabase
      .from('event_highlights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch highlight');
    }

    return data as EventHighlight;
  },
};

