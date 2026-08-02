import supabase from '../config/supabase';
import { Event, EventRegistration } from '../types';
import { logger } from '../utils/logger';

export const eventService = {
  /**
   * Get all published events (public)
   */
  async getPublished(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url),
        publisher:published_by (id, full_name)
      `)
      .in('status', ['upcoming', 'ongoing', 'completed'])
      .eq('publish_status', 'published')
      .order('event_date', { ascending: true });

    if (error) {
      logger.error('Error fetching published events', error);
      throw new Error('Failed to fetch events');
    }

    return data as Event[];
  },

  /**
   * Get all events including drafts (member/admin)
   */
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url),
        publisher:published_by (id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all events', error);
      throw new Error('Failed to fetch events');
    }

    return data as Event[];
  },

  /**
   * Get events created by specific user
   */
  async getByCreator(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user events', error);
      throw new Error('Failed to fetch events');
    }

    return data as Event[];
  },

  /**
   * Get single event by slug (public — only published)
   */
  async getBySlug(slug: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url, email),
        publisher:published_by (id, full_name)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      logger.error('Error fetching event by slug', error);
      throw new Error('Failed to fetch event');
    }

    return data as Event;
  },

  /**
   * Get single event by ID
   */
  async getById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url),
        publisher:published_by (id, full_name)
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch event');
    }

    return data as Event;
  },

  /**
   * Create event draft (member/admin)
   */
  async create(eventData: {
    title: string;
    slug: string;
    description: string;
    short_description?: string;
    event_date: string;
    end_date?: string;
    venue?: string;
    cover_image?: string;
    max_participants?: number;
    created_by: string;
    event_type?: 'past' | 'upcoming';
  }): Promise<Event> {
    const { event_type, ...insertData } = eventData;
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...insertData,
        status: event_type === 'past' ? 'completed' : 'upcoming',
        publish_status: 'draft',
      })
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      logger.error('Error creating event', error);
      if (error.code === '23505') {
        throw new Error('An event with this title already exists');
      }
      throw new Error('Failed to create event');
    }

    return data as Event;
  },

  /**
   * Update event (creator or admin)
   */
  async update(
    eventId: string,
    updates: Partial<{
      title: string;
      slug: string;
      description: string;
      short_description: string;
      event_date: string;
      end_date: string;
      venue: string;
      cover_image: string;
      max_participants: number;
    }>
  ): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      logger.error('Error updating event', error);
      throw new Error('Failed to update event');
    }

    return data as Event;
  },

  /**
   * Publish event (admin only)
   */
  async publish(eventId: string, publishedBy: string): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update({
        publish_status: 'published',
        published_by: publishedBy,
        published_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) {
      logger.error('Error publishing event', error);
      throw new Error('Failed to publish event');
    }

    return data as Event;
  },

  /**
   * Unpublish event (admin only)
   */
  async unpublish(eventId: string): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update({
        publish_status: 'draft',
        published_by: null,
        published_at: null,
      })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to unpublish event');
    }

    return data as Event;
  },

  /**
   * Cancel event (admin only)
   */
  async cancel(eventId: string): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to cancel event');
    }

    return data as Event;
  },

  /**
   * Delete event (admin only)
   */
  async delete(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      logger.error('Error deleting event', error);
      throw new Error('Failed to delete event');
    }
  },

  // ============================================
  // EVENT REGISTRATIONS
  // ============================================

  /**
   * Register user for event
   */
  async register(eventId: string, userId: string): Promise<EventRegistration> {
    // Check if event exists and is published
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    if (event.status !== 'upcoming' && event.status !== 'ongoing') {
      throw new Error('Event is not open for registration');
    }

    // Check max participants
    if (event.max_participants) {
      const { count, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'registered');

      if (countError) {
        throw new Error('Failed to check registration count');
      }

      if (count !== null && count >= event.max_participants) {
        throw new Error('Event is full — no more seats available');
      }
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (existing.status === 'cancelled') {
        // Re-register
        const { data, error } = await supabase
          .from('event_registrations')
          .update({ status: 'registered', registered_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select('*')
          .single();

        if (error) throw new Error('Failed to re-register');
        return data as EventRegistration;
      }
      throw new Error('Already registered for this event');
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered',
      })
      .select('*')
      .single();

    if (error) {
      logger.error('Error registering for event', error);
      throw new Error('Failed to register for event');
    }

    return data as EventRegistration;
  },

  /**
   * Cancel registration
   */
  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to cancel registration');
    }
  },

  /**
   * Get registrations for an event (member/admin)
   */
  async getRegistrations(eventId: string) {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        user:user_id (id, full_name, email, avatar_url, department, batch_year)
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch registrations');
    }

    return data;
  },

  /**
   * Check if user is registered for event
   */
  async checkRegistration(
    eventId: string,
    userId: string
  ): Promise<EventRegistration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to check registration');
    }

    return data as EventRegistration;
  },

  /**
   * Get registration count for event
   */
  async getRegistrationCount(eventId: string): Promise<number> {
    const { count, error } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered');

    if (error) {
      throw new Error('Failed to get count');
    }

    return count || 0;
  },

  /**
   * Get user's registered events
   */
  async getUserRegistrations(userId: string) {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:event_id (id, title, slug, event_date, venue, cover_image, status)
      `)
      .eq('user_id', userId)
      .eq('status', 'registered')
      .order('registered_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch user registrations');
    }

    return data;
  },
};

