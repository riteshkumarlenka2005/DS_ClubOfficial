import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, PenLine, Image, ClipboardList,
  Settings, Users, FolderKanban, GraduationCap, ScrollText,
  UserCog, Newspaper, Images, LogOut, User, Home, Menu, X,
  ScanLine, Award, Wallet, ClipboardCheck, MessageSquare
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: ('student' | 'member' | 'admin')[];
}

const navItems: NavItem[] = [
  // ── Dashboard (all roles) ──
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['student', 'member', 'admin'] },

  // ── Student + Member + Admin ──
  { label: 'Scan QR', path: '/dashboard/scan-qr', icon: ScanLine, roles: ['student', 'member', 'admin'] },
  { label: 'My Attendance', path: '/dashboard/attendance', icon: ClipboardCheck, roles: ['student', 'member', 'admin'] },
  { label: 'My Certificates', path: '/dashboard/certificates', icon: Award, roles: ['student', 'member', 'admin'] },
  { label: 'My Contributions', path: '/dashboard/contributions', icon: Wallet, roles: ['student', 'member', 'admin'] },

  // ── Member + Admin only ──
  { label: 'My Events', path: '/dashboard/events', icon: CalendarDays, roles: ['member', 'admin'] },
  { label: 'My Blogs', path: '/dashboard/blogs', icon: PenLine, roles: ['member', 'admin'] },
  { label: 'My Gallery', path: '/dashboard/gallery', icon: Image, roles: ['member', 'admin'] },
  { label: 'Registrations', path: '/dashboard/registrations', icon: ClipboardList, roles: ['member', 'admin'] },

  // ── Admin only ──
  { label: 'Admin Panel', path: '/admin', icon: Settings, roles: ['admin'] },
  { label: 'Manage Users', path: '/admin/users', icon: UserCog, roles: ['admin'] },
  { label: 'All Events', path: '/admin/events', icon: CalendarDays, roles: ['admin'] },
  { label: 'All Blogs', path: '/admin/blogs', icon: Newspaper, roles: ['admin'] },
  { label: 'Gallery Queue', path: '/admin/gallery', icon: Images, roles: ['admin'] },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban, roles: ['admin'] },
  { label: 'Alumni', path: '/admin/alumni', icon: GraduationCap, roles: ['admin'] },
  { label: 'Activity Log', path: '/admin/activity', icon: ScrollText, roles: ['admin'] },
  { label: 'Team', path: '/admin/team', icon: Users, roles: ['admin'] },
  { label: 'Memberships', path: '/admin/members', icon: ClipboardList, roles: ['admin'] },
  { label: 'Attendance Mgr', path: '/admin/attendance', icon: ClipboardCheck, roles: ['admin'] },
  { label: 'Certificates Mgr', path: '/admin/certificates', icon: Award, roles: ['admin'] },
  { label: 'Contributions Mgr', path: '/admin/contributions', icon: Wallet, roles: ['admin'] },
  { label: 'Review Queue', path: '/admin/reviews', icon: MessageSquare, roles: ['admin'] },
];

export default function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const dashboardItems = filteredNav.filter((i) => i.path.startsWith('/dashboard'));
  const adminItems = filteredNav.filter((i) => i.path.startsWith('/admin'));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F5F1FE]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1A0B2E]/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR — Light Purple */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#E0D4F5]
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-5 pt-6 pb-5 border-b border-[#E0D4F5]">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9667E0] to-[#4B2C82] flex items-center justify-center shadow-lg shadow-[#9667E0]/25">
                <span className="text-white font-black text-sm tracking-tight">DS</span>
              </div>
              <div>
                <span className="text-[#1A0B2E] font-extrabold text-lg tracking-tight">DSC</span>
                <span className="text-[#4B2C82]/70 text-xs font-semibold ml-1.5">GIETU</span>
              </div>
            </Link>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEEAFD] text-[#4B2C82] border border-[#D8CAF6]">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6" data-lenis-prevent="true">
            {dashboardItems.length > 0 && (
              <div>
                <p className="px-3 mb-2 text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em]">
                  Dashboard
                </p>
                <div className="space-y-0.5">
                  {dashboardItems.map((item) => (
                    <SidebarLink
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </div>
              </div>
            )}

            {adminItems.length > 0 && (
              <div>
                <p className="px-3 mb-2 text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em]">
                  Administration
                </p>
                <div className="space-y-0.5">
                  {adminItems.map((item) => (
                    <SidebarLink
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className="border-t border-[#E0D4F5] p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user?.avatar_url || '/default-avatar.png'}
                alt={user?.full_name}
                className="w-9 h-9 rounded-full ring-2 ring-[#9667E0]/30"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A0B2E] truncate">
                  {user?.full_name}
                </p>
                <p className="text-[11px] text-[#2D164B]/50 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/profile"
                className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-[#EEEAFD] text-[#4B2C82] rounded-lg hover:bg-[#D8CAF6] transition font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                <User size={13} />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E0D4F5] px-4 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-[#EEEAFD] text-[#4B2C82] transition"
                onClick={() => setSidebarOpen(true)}
                title="Open sidebar menu"
              >
                <Menu size={22} />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-lg font-extrabold text-[#1A0B2E] tracking-tight">
                  {getPageTitle(location.pathname)}
                </h2>
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#9667E0] hover:text-[#4B2C82] transition"
            >
              <Home size={15} />
              Back to Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8" data-lenis-prevent="true">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar Link ── */
function SidebarLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${
          isActive
            ? 'bg-[#9667E0] text-white shadow-md shadow-[#9667E0]/25'
            : 'text-[#2D164B]/70 hover:bg-[#EEEAFD] hover:text-[#1A0B2E]'
        }`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
        ${isActive ? 'bg-white/25' : 'bg-[#EEEAFD] group-hover:bg-[#D8CAF6]'}`}
      >
        <Icon size={16} className={isActive ? 'text-white' : 'text-[#9667E0]'} />
      </div>
      <span>{item.label}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
      )}
    </Link>
  );
}

/* ── Page Title Resolver ── */
function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard Overview',
    '/dashboard/events': 'My Events',
    '/dashboard/blogs': 'My Blogs',
    '/dashboard/gallery': 'My Gallery Uploads',
    '/dashboard/registrations': 'Event Registrations',
    '/admin': 'Admin Panel',
    '/admin/users': 'Manage Users',
    '/admin/events': 'All Events',
    '/admin/blogs': 'All Blogs',
    '/admin/gallery': 'Gallery Queue',
    '/admin/projects': 'Manage Projects',
    '/admin/alumni': 'Manage Alumni',
    '/admin/activity': 'Activity Log',
    '/profile': 'My Profile',
    '/admin/team': 'Manage Team',
    '/admin/members': 'Membership Applications',
    '/dashboard/scan-qr': 'Scan Attendance QR',
    '/dashboard/attendance': 'My Attendance',
    '/dashboard/certificates': 'My Certificates',
    '/dashboard/contributions': 'Contributions',
    '/admin/attendance': 'Attendance Manager',
    '/admin/certificates': 'Certificate Manager',
    '/admin/contributions': 'Contribution Manager',
    '/admin/reviews': 'Review Queue',
  };

  if (titles[path]) return titles[path];
  for (const [key, value] of Object.entries(titles)) {
    if (path.startsWith(key) && key !== '/') return value;
  }
  return 'Dashboard';
}

