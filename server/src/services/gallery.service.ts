import supabase from '../config/supabase';
import { GalleryItem } from '../types';
import { logger } from '../utils/logger';

export const galleryService = {
  /**
   * Get approved cover/standalone gallery items (public).
   * Only returns items where parent_id IS NULL (covers or legacy standalone items).
   */
  async getApproved(): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        uploader:uploaded_by (id, full_name, avatar_url),
        event:event_id (id, title, slug)
      `)
      .eq('status', 'published')
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching gallery', error);
      throw new Error('Failed to fetch gallery');
    }

    return data as GalleryItem[];
  },

  /**
   * Get approved sub-photos for a cover photo (public)
   */
  async getSubPhotos(parentId: string): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        uploader:uploaded_by (id, full_name, avatar_url)
      `)
      .eq('parent_id', parentId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error fetching sub-photos', error);
      throw new Error('Failed to fetch sub-photos');
    }

    return data as GalleryItem[];
  },

  /**
   * Get all gallery items (admin)
   */
  async getAll(): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        uploader:uploaded_by (id, full_name, avatar_url),
        event:event_id (id, title, slug),
        approver:approved_by (id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch gallery');
    }

    return data as GalleryItem[];
  },

  /**
   * Get pending gallery items (admin)
   */
  async getPending(): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        uploader:uploaded_by (id, full_name, avatar_url),
        event:event_id (id, title)
      `)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch pending gallery items');
    }

    return data as GalleryItem[];
  },

  /**
   * Get gallery items by uploader
   */
  async getByUploader(userId: string): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        event:event_id (id, title)
      `)
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch gallery items');
    }

    return data as GalleryItem[];
  },

  /**
   * Upload gallery item (member/admin)
   */
  async create(itemData: {
    title?: string;
    image_url: string;
    description?: string;
    event_id?: string;
    uploaded_by: string;
    parent_id?: string;
    is_cover?: boolean;
  }): Promise<GalleryItem> {
    // Build clean insert object — only include defined fields
    const insertObj: Record<string, any> = {
      image_url: itemData.image_url,
      uploaded_by: itemData.uploaded_by,
      status: 'draft',
    };
    if (itemData.title) insertObj.title = itemData.title;
    if (itemData.description) insertObj.description = itemData.description;
    if (itemData.event_id) insertObj.event_id = itemData.event_id;
    if (itemData.parent_id) insertObj.parent_id = itemData.parent_id;
    if (itemData.is_cover !== undefined) insertObj.is_cover = itemData.is_cover;

    const { data, error } = await supabase
      .from('gallery')
      .insert(insertObj)
      .select(`
        *,
        uploader:uploaded_by (id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      logger.error('Error creating gallery item', error);
      throw new Error(`Gallery insert failed: ${error.message}`);
    }

    return data as GalleryItem;
  },

  /**
   * Approve gallery item (admin)
   */
  async approve(
    itemId: string,
    approvedBy: string
  ): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery')
      .update({
        status: 'published',
        approved_by: approvedBy,
      })
      .eq('id', itemId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to approve gallery item');
    }

    return data as GalleryItem;
  },

  /**
   * Bulk approve gallery items (admin)
   */
  async bulkApprove(
    itemIds: string[],
    approvedBy: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from('gallery')
      .update({
        status: 'published',
        approved_by: approvedBy,
      })
      .in('id', itemIds)
      .eq('status', 'draft')
      .select('id');

    if (error) {
      throw new Error(`Bulk approve failed: ${error.message}`);
    }

    return data?.length || 0;
  },

  /**
   * Reject gallery item (admin)
   */
  async reject(itemId: string): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery')
      .update({ status: 'archived' })
      .eq('id', itemId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to reject gallery item');
    }

    return data as GalleryItem;
  },

  /**
   * Delete gallery item
   */
  async delete(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error('Failed to delete gallery item');
    }
  },

  /**
   * Get single item by ID
   */
  async getById(itemId: string): Promise<GalleryItem | null> {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch gallery item');
    }

    return data as GalleryItem;
  },

  /**
   * Get all sub-photos (any status) for a parent — used by admin/member
   */
  async getAllSubPhotos(parentId: string): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select(`
        *,
        uploader:uploaded_by (id, full_name, avatar_url)
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch sub-photos');
    }

    return data as GalleryItem[];
  },
};
