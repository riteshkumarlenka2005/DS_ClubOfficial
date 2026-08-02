import supabase from '../config/supabase';
import { Project } from '../types';
import { logger } from '../utils/logger';

export const projectService = {
  async getPublished(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching projects', error);
      throw new Error('Failed to fetch projects');
    }
    return data as Project[];
  },

  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch projects');
    return data as Project[];
  },

  async getBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:created_by (id, full_name, avatar_url)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch project');
    }
    return data as Project;
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch project');
    }
    return data as Project;
  },

  /**
   * Discover actual columns in the projects table.
   * Production DB may differ from migration files.
   */
  async _discoverColumns(): Promise<Set<string>> {
    if (this._cols) return this._cols;

    // Try fetching one row to see which columns exist
    const { data } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (data && data.length > 0) {
      this._cols = new Set(Object.keys(data[0]));
      logger.info(`projects columns discovered from row: ${[...this._cols].join(', ')}`);
      return this._cols;
    }

    // No rows — probe individual columns
    const allPossible = [
      'id', 'title', 'slug', 'description', 'content', 'short_description',
      'tech_stack', 'github_url', 'live_url', 'image_url', 'cover_image',
      'cover_image_url', 'created_by', 'status', 'created_at', 'updated_at',
    ];
    const found = new Set<string>();
    for (const col of allPossible) {
      const { error } = await supabase.from('projects').select(col).limit(0);
      if (!error) found.add(col);
    }
    this._cols = found;
    logger.info(`projects columns discovered by probing: ${[...found].join(', ')}`);
    return found;
  },
  _cols: undefined as Set<string> | undefined,

  async create(projectData: {
    title: string;
    slug: string;
    description: string;
    short_description?: string;
    tech_stack?: string[];
    github_url?: string;
    live_url?: string;
    image_url?: string;
    created_by: string;
  }): Promise<Project> {
    const cols = await this._discoverColumns();

    // Build insert payload — only include columns that actually exist in the table
    const insertData: Record<string, any> = {
      title: projectData.title,
      slug: projectData.slug,
      created_by: projectData.created_by,
      status: 'draft',
    };

    // Description body — try description, then content, then short_description
    if (cols.has('description')) {
      insertData.description = projectData.description;
    } else if (cols.has('content')) {
      insertData.content = projectData.description;
    }

    // Short description
    if (cols.has('short_description')) {
      insertData.short_description = projectData.short_description || projectData.description;
    }

    // Tech stack
    if (cols.has('tech_stack') && projectData.tech_stack?.length) {
      insertData.tech_stack = projectData.tech_stack;
    }

    // URLs
    if (cols.has('github_url') && projectData.github_url) insertData.github_url = projectData.github_url;
    if (cols.has('live_url') && projectData.live_url) insertData.live_url = projectData.live_url;

    // Image — try image_url, cover_image, cover_image_url
    if (projectData.image_url) {
      if (cols.has('image_url')) insertData.image_url = projectData.image_url;
      else if (cols.has('cover_image')) insertData.cover_image = projectData.image_url;
      else if (cols.has('cover_image_url')) insertData.cover_image_url = projectData.image_url;
    }

    logger.info(`projects insert payload keys: ${Object.keys(insertData).join(', ')}`);

    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      logger.error('Error creating project', error);
      if (error.code === '23505') throw new Error('Project with this title already exists');
      throw new Error(`Failed to create project: ${error.message}`);
    }
    return data as Project;
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const cols = await this._discoverColumns();

    // Filter updates to only include columns that exist
    const filtered: Record<string, any> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (cols.has(key)) {
        filtered[key] = val;
      } else if (key === 'description' && cols.has('content')) {
        filtered.content = val;
      } else if (key === 'image_url') {
        if (cols.has('cover_image')) filtered.cover_image = val;
        else if (cols.has('cover_image_url')) filtered.cover_image_url = val;
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .update(filtered)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating project', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
    return data as Project;
  },

  async publish(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'published' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error('Failed to publish project');
    return data as Project;
  },

  async unpublish(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'draft' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error('Failed to unpublish project');
    return data as Project;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw new Error('Failed to delete project');
  },
};
