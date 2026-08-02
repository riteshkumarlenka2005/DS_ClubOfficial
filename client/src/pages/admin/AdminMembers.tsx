import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { membershipService } from '../../services/membership.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Application {
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
}

export default function AdminMembers() {
  const { data: applications, isLoading, refetch } = useApi<Application[]>(
    () => membershipService.getAll()
  );
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handleAction = async (id: string, status: 'approved' | 'rejected', name: string) => {
    try {
      setProcessing(id);
      await membershipService.updateStatus(id, status);
      setMessage({
        type: 'success',
        text: `${name}'s application has been ${status}.${status === 'approved' ? ' They are now a DS Club member!' : ''}`,
      });
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to ${status} application`,
      });
    } finally {
      setProcessing(null);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading applications..." />;

  const filtered = applications?.filter((app) =>
    filter === 'all' ? true : app.status === filter
  ) || [];

  const pendingCount = applications?.filter((a) => a.status === 'pending').length || 0;
  const approvedCount = applications?.filter((a) => a.status === 'approved').length || 0;
  const rejectedCount = applications?.filter((a) => a.status === 'rejected').length || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A0B2E]">Membership Applications</h1>
          <p className="text-sm text-[#2D164B]/60 mt-1">Review and manage club join requests</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl border p-4 text-left transition ${
            filter === 'all' ? 'border-[#9667E0] bg-[#EEEAFD] ring-2 ring-[#9667E0]/30' : 'border-[#E0D4F5] bg-white hover:border-[#9667E0]/30'
          }`}
        >
          <p className="text-2xl font-bold text-[#1A0B2E]">{applications?.length || 0}</p>
          <p className="text-xs text-[#2D164B]/50 mt-1">Total</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-xl border p-4 text-left transition ${
            filter === 'pending' ? 'border-yellow-300 bg-yellow-50 ring-2 ring-yellow-200' : 'border-[#E0D4F5] bg-white hover:border-[#9667E0]/30'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-[#2D164B]/50 mt-1">Pending</p>
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`rounded-xl border p-4 text-left transition ${
            filter === 'approved' ? 'border-green-300 bg-green-50 ring-2 ring-green-200' : 'border-[#E0D4F5] bg-white hover:border-[#9667E0]/30'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-xs text-[#2D164B]/50 mt-1">Approved</p>
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`rounded-xl border p-4 text-left transition ${
            filter === 'rejected' ? 'border-red-300 bg-red-50 ring-2 ring-red-200' : 'border-[#E0D4F5] bg-white hover:border-[#9667E0]/30'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          <p className="text-xs text-[#2D164B]/50 mt-1">Rejected</p>
        </button>
      </div>

      {/* Applications Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0D4F5] p-12 text-center">
          <p className="text-[#9667E0]/40 text-lg">No {filter === 'all' ? '' : filter} applications found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0D4F5] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0D4F5] bg-[#EEEAFD]/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Applicant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Interests</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D4F5]/30">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-[#EEEAFD]/30">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#2D164B]">{app.full_name}</span>
                    {app.user_id && (
                      <span className="ml-2 text-[10px] bg-[#EEEAFD] text-[#4B2C82] px-1.5 py-0.5 rounded-full">Registered</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#2D164B]/70">{app.email}</td>
                  <td className="px-4 py-3 text-[#2D164B]/70">Year {app.academic_year}</td>
                  <td className="px-4 py-3 text-[#2D164B]/70 max-w-[200px]">
                    <p className="truncate" title={app.interests}>{app.interests}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : app.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          app.status === 'pending'
                            ? 'bg-yellow-500'
                            : app.status === 'approved'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#2D164B]/50 whitespace-nowrap">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {app.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(app.id, 'approved', app.full_name)}
                          disabled={processing === app.id}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          {processing === app.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(app.id, 'rejected', app.full_name)}
                          disabled={processing === app.id}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          {processing === app.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#9667E0]/40">
                        {app.reviewed_at
                          ? `Reviewed ${new Date(app.reviewed_at).toLocaleDateString()}`
                          : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
