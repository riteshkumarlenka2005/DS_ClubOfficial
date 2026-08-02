// ============================================
// CORE APPLICATION TYPES
// ============================================

export type UserRole = 'student' | 'member' | 'admin';

export interface User {
  id: string;
  google_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  bio: string | null;
  department: string | null;
  batch_year: number | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  content: string | null;
  event_date: string;
  end_date: string | null;
  venue: string | null;
  cover_image: string | null;
  max_participants: number | null;
  event_type: string | null;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'cancelled' | 'completed';
  publish_status: 'draft' | 'published' | 'archived';
  created_by: string;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  registered_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  published_by: string | null;
  published_at: string | null;
  tags: string[];
  video_url: string | null;
  category: string | null;
  duration: string | null;
  views_count: number;
  is_user_upload: boolean;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  description: string | null;
  thumbnail_url: string | null;
  album: string | null;
  event_id: string | null;
  category: string | null;
  uploaded_by: string;
  status: 'draft' | 'published' | 'archived';
  approved_by: string | null;
  parent_id: string | null;
  is_cover: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  content?: string;
  description?: string;
  short_description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Alumni {
  id: string;
  full_name: string;
  email: string | null;
  batch_year: number;
  department: string | null;
  company: string | null;
  designation: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  avatar_url: string | null;
  testimonial: string | null;
  skills: string[];
  bg_color: string | null;
  img_seed: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// ============================================
// JWT PAYLOAD
// ============================================
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ============================================
// API RESPONSE
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Add at the end of the existing file

export interface TeamMember {
  id: string;
  name: string;
  student_id: string;
  role: string;
  department: 'leadership' | 'technical' | 'management' | 'creative';
  tier: 'lead' | 'head' | 'core' | 'co-member';
  sub_category: 'social' | 'design' | 'video' | null;
  bio: string | null;
  avatar_url: string | null;
  img_seed: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  portfolio_url: string | null;
  email: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}


export interface EventHighlight {
  id: string;
  event_id: string;
  summary: string;
  stats: { label: string; value: string }[];
  photos: string[];
  key_takeaways: string[];
  testimonial_text: string | null;
  testimonial_author: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipApplication {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  academic_year: number;
  interests: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventReview {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  // Optional relations
  user?: User;
}