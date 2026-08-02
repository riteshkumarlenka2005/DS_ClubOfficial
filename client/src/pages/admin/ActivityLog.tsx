import { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Search, Calendar, Clock, Filter, X } from 'lucide-react';

export default function ActivityLog() {
  const { data: logs, isLoading } = useApi<any[]>(
    () => adminService.getActivityLogs(500, 0)
  );

  /* ── filter state ── */
  const [userSearch, setUserSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');   // yyyy-mm-dd
  const [timeFrom, setTimeFrom] = useState('');        // HH:mm
  const [timeTo, setTimeTo] = useState('');             // HH:mm
  const [actionFilter, setActionFilter] = useState('');

  const hasAnyFilter = userSearch || dateFilter || timeFrom || timeTo || actionFilter;

  /* ── unique action types for dropdown ── */
  const actionTypes = useMemo(() => {
    if (!logs) return [];
    const set = new Set(logs.map((l: any) => l.action as string));
    return Array.from(set).sort();
  }, [logs]);

  /* ── filtered logs ── */
  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log: any) => {
      const dt = new Date(log.created_at);

      // User name filter (case-insensitive partial match)
      if (userSearch) {
        const name = (log.users?.full_name || '').toLowerCase();
        const email = (log.users?.email || '').toLowerCase();
        const q = userSearch.toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }

      // Date filter — compare yyyy-mm-dd
      if (dateFilter) {
        const logDate = dt.toISOString().slice(0, 10); // UTC date
        if (logDate !== dateFilter) return false;
      }

      // Time-from filter
      if (timeFrom) {
        const logTime = dt.toTimeString().slice(0, 5); // HH:mm local
        if (logTime < timeFrom) return false;
      }

      // Time-to filter
      if (timeTo) {
        const logTime = dt.toTimeString().slice(0, 5);
        if (logTime > timeTo) return false;
      }

      // Action type filter
      if (actionFilter && log.action !== actionFilter) return false;

      return true;
    });
  }, [logs, userSearch, dateFilter, timeFrom, timeTo, actionFilter]);

  const clearFilters = () => {
    setUserSearch('');
    setDateFilter('');
    setTimeFrom('');
    setTimeTo('');
    setActionFilter('');
  };

  if (isLoading) return <LoadingSpinner message="Loading activity..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#1A0B2E] mb-6">Activity Log</h1>

      {/* ════════ FILTER SECTION ════════ */}
      <div className="bg-white rounded-2xl border border-[#E0D4F5] p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#4B2C82]">
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters</span>
          </div>
          {hasAnyFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-[#9667E0] hover:text-[#4B2C82] transition-colors cursor-pointer"
            >
              <X size={14} /> Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* User search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9667E0]/50" />
            <input
              type="text"
              placeholder="Search user..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E0D4F5] bg-[#F5F1FE]/50 text-[#2D164B] placeholder-[#9667E0]/40 focus:outline-none focus:ring-2 focus:ring-[#9667E0]/30 transition"
            />
          </div>

          {/* Date picker */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9667E0]/50 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              aria-label="Filter by date"
              placeholder="Select date"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E0D4F5] bg-[#F5F1FE]/50 text-[#2D164B] focus:outline-none focus:ring-2 focus:ring-[#9667E0]/30 transition"
            />
          </div>

          {/* Time from */}
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9667E0]/50 pointer-events-none" />
            <input
              type="time"
              value={timeFrom}
              onChange={e => setTimeFrom(e.target.value)}
              title="From time"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E0D4F5] bg-[#F5F1FE]/50 text-[#2D164B] focus:outline-none focus:ring-2 focus:ring-[#9667E0]/30 transition"
            />
          </div>

          {/* Time to */}
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9667E0]/50 pointer-events-none" />
            <input
              type="time"
              value={timeTo}
              onChange={e => setTimeTo(e.target.value)}
              title="To time"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E0D4F5] bg-[#F5F1FE]/50 text-[#2D164B] focus:outline-none focus:ring-2 focus:ring-[#9667E0]/30 transition"
            />
          </div>

          {/* Action type dropdown */}
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            title="Filter by action type"
            className="w-full px-3 py-2 text-sm rounded-xl border border-[#E0D4F5] bg-[#F5F1FE]/50 text-[#2D164B] focus:outline-none focus:ring-2 focus:ring-[#9667E0]/30 transition"
          >
            <option value="">All actions</option>
            {actionTypes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Result count */}
        {hasAnyFilter && (
          <p className="mt-3 text-xs text-[#9667E0]/60">
            Showing <span className="font-semibold text-[#4B2C82]">{filtered.length}</span> of {logs?.length ?? 0} logs
          </p>
        )}
      </div>

      {/* ════════ TABLE ════════ */}
      <div className="bg-white rounded-2xl border border-[#E0D4F5] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0D4F5] bg-[#EEEAFD]/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D4F5]/30">
            {filtered.map((log: any) => (
              <tr key={log.id} className="hover:bg-[#EEEAFD]/30">
                <td className="px-4 py-3 text-[#2D164B]/50 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={log.users?.avatar_url || '/default-avatar.png'}
                      alt=""
                      className="w-6 h-6 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[#2D164B] text-sm">
                      {log.users?.full_name || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-[#EEEAFD] text-[#2D164B] rounded-full">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#2D164B]/70 text-sm">
                  {log.entity_type}
                  {log.entity_id && (
                    <span className="text-[#9667E0]/40 text-xs ml-1">
                      ({log.entity_id.substring(0, 8)}...)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#9667E0]/40">
            {hasAnyFilter ? 'No logs match the current filters' : 'No activity logged yet'}
          </div>
        )}
      </div>
    </div>
  );
}

