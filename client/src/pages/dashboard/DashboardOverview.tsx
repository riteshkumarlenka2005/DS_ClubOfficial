import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { eventService } from '../../services/event.service';
import { blogService } from '../../services/blog.service';
import { galleryService } from '../../services/gallery.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DashboardOverview() {
  const { user } = useAuth();

  const { data: events, isLoading: eventsLoading } = useApi<any[]>(
    () => eventService.getAll()
  );
  const { data: blogs, isLoading: blogsLoading } = useApi<any[]>(
    () => blogService.getAll()
  );
  const { data: gallery, isLoading: galleryLoading } = useApi<any[]>(
    () => galleryService.getAll()
  );
  const { data: registrations, isLoading: regLoading } = useApi<any[]>(
    () => eventService.getMyRegistrations()
  );

  const isLoading = eventsLoading || blogsLoading || galleryLoading || regLoading;

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;

  const stats = [
    {
      label: 'My Events',
      value: events?.length || 0,
      icon: '📅',
      color: 'bg-[#EEEAFD] text-[#4B2C82]',
    },
    {
      label: 'My Blogs',
      value: blogs?.length || 0,
      icon: '✍️',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'My Uploads',
      value: gallery?.length || 0,
      icon: '🖼️',
      color: 'bg-[#9667E0]/10 text-[#9667E0]',
    },
    {
      label: 'Registered Events',
      value: registrations?.length || 0,
      icon: '📋',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#1A0B2E]">
          Welcome back, {user?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#2D164B]/60 mt-1">
          Here's what's happening with your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-[#E0D4F5] p-5 hover:shadow-lg hover:shadow-[#9667E0]/5 transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <span className="text-lg">{stat.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1A0B2E]">{stat.value}</p>
            <p className="text-sm text-[#2D164B]/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E0D4F5] p-6">
          <h3 className="text-lg font-extrabold text-[#1A0B2E] mb-4">
            Recent Events
          </h3>
          {events && events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 5).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b border-[#E0D4F5]/30 last:border-0 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2D164B] truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-[#2D164B]/50">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                      (event.status === 'upcoming' || event.status === 'ongoing')
                        ? 'bg-green-100 text-green-700'
                        : event.status === 'completed'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9667E0]/50">No events created yet</p>
          )}
        </div>

        {/* Recent Blogs */}
        <div className="bg-white rounded-2xl border border-[#E0D4F5] p-6">
          <h3 className="text-lg font-extrabold text-[#1A0B2E] mb-4">
            Recent Blogs
          </h3>
          {blogs && blogs.length > 0 ? (
            <div className="space-y-3">
              {blogs.slice(0, 5).map((blog: any) => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between py-2 border-b border-[#E0D4F5]/30 last:border-0 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2D164B] truncate">
                      {blog.title}
                    </p>
                    <p className="text-xs text-[#2D164B]/50">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                      blog.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9667E0]/50">No blogs created yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

