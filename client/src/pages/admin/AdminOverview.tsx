import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminOverview() {
  const { data: stats, isLoading } = useApi<Record<string, number>>(() => adminService.getStats());

  if (isLoading) return <LoadingSpinner message="Loading stats..." />;

  const cards = [
    { label: 'Total Users', value: stats?.total_users, icon: '👥', path: '/admin/users', color: 'border-blue-200 bg-blue-50' },
    { label: 'Total Events', value: stats?.total_events, icon: '📅', path: '/admin/events', color: 'border-green-200 bg-green-50' },
    { label: 'Published Events', value: stats?.published_events, icon: '✅', path: '/admin/events', color: 'border-emerald-200 bg-emerald-50' },
    { label: 'Total Blogs', value: stats?.total_blogs, icon: '📝', path: '/admin/blogs', color: 'border-purple-200 bg-purple-50' },
    { label: 'Published Blogs', value: stats?.published_blogs, icon: '📰', path: '/admin/blogs', color: 'border-indigo-200 bg-indigo-50' },
    { label: 'Gallery Items', value: stats?.total_gallery, icon: '🖼️', path: '/admin/gallery', color: 'border-pink-200 bg-pink-50' },
    { label: 'Pending Gallery', value: stats?.pending_gallery, icon: '⏳', path: '/admin/gallery', color: 'border-orange-200 bg-orange-50' },
    { label: 'Projects', value: stats?.total_projects, icon: '🚀', path: '/admin/projects', color: 'border-cyan-200 bg-cyan-50' },
    { label: 'Alumni', value: stats?.total_alumni, icon: '🎓', path: '/admin/alumni', color: 'border-teal-200 bg-teal-50' },
    { label: 'Pending Applications', value: stats?.pending_memberships, icon: '📋', path: '/admin/members', color: 'border-yellow-200 bg-yellow-50' },
    { label: 'Approved Members', value: stats?.approved_memberships, icon: '✅', path: '/admin/members', color: 'border-lime-200 bg-lime-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#1A0B2E] mb-2">Admin Panel</h1>
      <p className="text-[#2D164B]/60 mb-8">System overview and quick actions</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className={`rounded-2xl border p-5 hover:shadow-lg hover:shadow-[#9667E0]/5 transition ${card.color}`}
          >
            <span className="text-2xl">{card.icon}</span>
            <p className="text-3xl font-bold text-[#1A0B2E] mt-2">
              {card.value ?? 0}
            </p>
            <p className="text-sm text-[#2D164B]/70 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E0D4F5] p-6">
        <h3 className="text-lg font-extrabold text-[#1A0B2E] mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/users" className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82]">
            Manage Users
          </Link>
          <Link to="/admin/gallery" className="px-4 py-2 bg-orange-600 text-white text-sm rounded-xl hover:bg-orange-700">
            Review Gallery ({stats?.pending_gallery || 0} pending)
          </Link>
          <Link to="/admin/members" className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-xl hover:bg-yellow-700">
            Review Applications ({stats?.pending_memberships || 0} pending)
          </Link>
          <Link to="/admin/activity" className="px-4 py-2 bg-[#4B2C82] text-white text-sm rounded-xl hover:bg-[#1A0B2E]">
            View Activity Log
          </Link>
        </div>
      </div>
    </div>
  );
}

