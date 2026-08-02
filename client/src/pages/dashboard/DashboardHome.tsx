// FILE: frontend/src/pages/dashboard/DashboardHome.tsx

import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import DashboardOverview from './DashboardOverview';

// Import your existing member/admin overview if it exists:
// import MemberDashboard from './MemberDashboard';

export default function DashboardHome() {
  const { user, hasRole } = useAuth();

  // Students get the student dashboard
  if (hasRole('student') && !hasRole('member') && !hasRole('admin')) {
    return <StudentDashboard />;
  }

  // Members and Admins get the existing overview
  return <DashboardOverview />;

  // Once you have the member overview:
  // return <MemberDashboard />;
}