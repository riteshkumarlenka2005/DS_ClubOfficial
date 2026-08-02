import { Express } from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import blogRoutes from './routes/blog.routes';
import galleryRoutes from './routes/gallery.routes';
import projectRoutes from './routes/project.routes';
import alumniRoutes from './routes/alumni.routes';
import adminRoutes from './routes/admin.routes';
import teamRoutes from './routes/team.routes';
import eventHighlightRoutes from './routes/eventHighlight.routes';
import membershipRoutes from './routes/membership.routes';
import latestUpdatesRoutes from './routes/latestUpdates.routes';
import attendanceRoutes from './routes/attendance.routes';
import certificateRoutes from './routes/certificate.routes';
import contributionRoutes from './routes/contribution.routes';
import eventReviewRoutes from './routes/eventReview.routes';

export function registerRoutes(app: Express): void {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/alumni', alumniRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/event-highlights', eventHighlightRoutes);
  app.use('/api/event-reviews', eventReviewRoutes);
  app.use('/api/membership', membershipRoutes);
  app.use('/api/latest-updates', latestUpdatesRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/contributions', contributionRoutes);
}

