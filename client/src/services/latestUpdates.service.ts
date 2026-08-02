import api from './api';

export interface LatestUpdate {
  id: string;
  type: 'event' | 'project' | 'blog';
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  date: string;
  meta: Record<string, any>;
}

export const latestUpdatesService = {
  async get(): Promise<{ success: boolean; data: LatestUpdate[]; message: string }> {
    const res = await api.get('/latest-updates');
    return res.data;
  },
};
