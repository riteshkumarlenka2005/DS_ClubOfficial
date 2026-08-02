import supabase from '../config/supabase';
import { Blog } from '../types';
import { logger } from '../utils/logger';

export const blogService = {
  /**
   * Get published blogs (public)
   */
  async getPublished(category?: string): Promise<Blog[]> {
    let query = supabase
      .from('blogs')
      .select(`
        *,
        author:author_id (id, full_name, avatar_url, email)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching published blogs', error);
      throw new Error('Failed to fetch blogs');
    }

    return data as Blog[];
  },

  /**
   * Get all blogs (admin)
   */
  async getAll(): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:author_id (id, full_name, avatar_url, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch blogs');
    }

    return data as Blog[];
  },

  /**
   * Get blogs by author
   */
  async getByAuthor(authorId: string): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:author_id (id, full_name, avatar_url)
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch blogs');
    }

    return data as Blog[];
  },

  /**
   * Get single blog by slug
   */
  async getBySlug(slug: string): Promise<Blog | null> {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:author_id (id, full_name, avatar_url, email, bio)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch blog');
    }

    return data as Blog;
  },

  /**
   * Get single blog by ID
   */
  async getById(blogId: string): Promise<Blog | null> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch blog');
    }

    return data as Blog;
  },

  /**
   * Create blog draft
   */
  async create(blogData: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    author_id: string;
    tags?: string[];
    video_url?: string;
    category?: string;
    duration?: string;
    is_user_upload?: boolean;
    event_id?: string;
  }): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .insert({
        ...blogData,
        status: 'draft',
        views_count: 0,
      })
      .select(`
        *,
        author:author_id (id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      logger.error('Error creating blog', error);
      if (error.code === '23505') {
        throw new Error('A blog with this title already exists');
      }
      throw new Error('Failed to create blog');
    }

    return data as Blog;
  },

  /**
   * Update blog
   */
  async update(
    blogId: string,
    updates: Partial<{
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      cover_image: string;
      tags: string[];
      video_url: string;
      category: string;
      duration: string;
      event_id: string | null;
    }>
  ): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', blogId)
      .select(`
        *,
        author:author_id (id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw new Error('Failed to update blog');
    }

    return data as Blog;
  },

  /**
   * Publish blog (admin)
   */
  async publish(blogId: string, publishedBy: string): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .update({
        status: 'published',
        published_by: publishedBy,
        published_at: new Date().toISOString(),
      })
      .eq('id', blogId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to publish blog');
    }

    return data as Blog;
  },

  /**
   * Unpublish blog (admin)
   */
  async unpublish(blogId: string): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .update({
        status: 'draft',
        published_by: null,
        published_at: null,
      })
      .eq('id', blogId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to unpublish blog');
    }

    return data as Blog;
  },

  /**
   * Archive blog (admin)
   */
  async archive(blogId: string): Promise<Blog> {
    const { data, error } = await supabase
      .from('blogs')
      .update({ status: 'archived' })
      .eq('id', blogId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to archive blog');
    }

    return data as Blog;
  },

  /**
   * Delete blog
   */
  async delete(blogId: string): Promise<void> {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId);

    if (error) {
      throw new Error('Failed to delete blog');
    }
  },

  /**
   * Increment view count
   */
  async incrementViews(blogId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_blog_views', {
      blog_id: blogId,
    });

    // Fallback if RPC doesn't exist
    if (error) {
      const blog = await blogService.getById(blogId);
      if (blog) {
        await supabase
          .from('blogs')
          .update({ views_count: (blog.views_count || 0) + 1 })
          .eq('id', blogId);
      }
    }
  },

  /**
   * Get distinct categories
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null);

    if (error) {
      throw new Error('Failed to fetch categories');
    }

    const unique = [...new Set(data.map((d: any) => d.category).filter(Boolean))];
    return unique as string[];
  },
};

