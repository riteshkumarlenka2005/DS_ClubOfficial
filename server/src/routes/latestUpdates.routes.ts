import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/latest-updates
 * Public endpoint — returns the most recent published events, projects, and blogs
 * merged into a single chronological feed.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Fetch ONLY the 1 most recent published event
    const { data: events, error: eventsErr } = await supabase
      .from('events')
      .select('id, title, slug, short_description, description, event_date, venue, cover_image, status, publish_status, created_at')
      .eq('publish_status', 'published')
      .order('created_at', { ascending: false })
      .limit(1);

    if (eventsErr) logger.warn('Latest updates: events fetch failed', eventsErr);

    // Fetch ONLY the 1 most recent published project
    const { data: projects, error: projectsErr } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1);

    if (projectsErr) logger.warn('Latest updates: projects fetch failed', projectsErr);

    // Fetch latest published blogs (no longer shown, but keep as empty for now)
    const blogs: any[] = [];

    // Normalize into a unified shape
    type UpdateItem = {
      id: string;
      type: 'event' | 'project' | 'blog';
      title: string;
      slug: string;
      description: string;
      image_url: string | null;
      date: string;
      meta: Record<string, any>;
    };

    const items: UpdateItem[] = [];

    (events || []).forEach((e: any) => {
      items.push({
        id: e.id,
        type: 'event',
        title: e.title,
        slug: e.slug,
        description: e.short_description || e.description || '',
        image_url: e.cover_image,
        date: e.created_at,
        meta: {
          event_date: e.event_date,
          venue: e.venue,
          status: e.status,
        },
      });
    });

    (projects || []).forEach((p: any) => {
      items.push({
        id: p.id,
        type: 'project',
        title: p.title,
        slug: p.slug,
        description: p.short_description || p.content || p.description || '',
        image_url: p.image_url || p.cover_image || p.cover_image_url || null,
        date: p.created_at,
        meta: {
          tech_stack: p.tech_stack,
        },
      });
    });

    (blogs || []).forEach((b: any) => {
      items.push({
        id: b.id,
        type: 'blog',
        title: b.title,
        slug: b.slug,
        description: b.excerpt || '',
        image_url: b.cover_image,
        date: b.published_at || b.created_at,
        meta: {
          category: b.category,
        },
      });
    });

    // Sort all by date descending, take top 2 (1 event + 1 project max)
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = items.slice(0, 2);

    res.status(200).json({
      success: true,
      message: 'Latest updates fetched',
      data: latest,
    });
  } catch (error: any) {
    logger.error('Fetch latest updates failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest updates',
    });
  }
});

export default router;
