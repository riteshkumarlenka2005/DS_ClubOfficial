// FILE: frontend/src/pages/admin/ContributionManager.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Plus, CheckCircle2, XCircle, Clock, Loader2,
  ChevronDown, DollarSign, Users, X, Lock,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { contributionService } from '../../services/contribution.service';
import { eventService } from '../../services/event.service';

interface Stats { total_pending: number; total_verified: number; total_collected: number; }

interface ContributionEntry {
  id: string;
  amount: number;
  payment_reference: string;
  status: string;
  paid_at: string;
  verified_at: string | null;
  users: { id: string; full_name: string; email: string; avatar_url: string | null };
  contribution_requests: { id: string; title: string };
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  verified: { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
};

export default function ContributionManager() {
  // Create Request Form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formEventId, setFormEventId] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  const { data: events } = useApi(() => eventService.getPublished(), []);
  const { data: stats, refetch: refetchStats } = useApi<Stats>(
    () => contributionService.getStats(),
    []
  );
  const { data: contributions, refetch, isLoading } = useApi<ContributionEntry[]>(
    () => contributionService.getAllContributions(statusFilter || undefined),
    [statusFilter]
  );

  const handleCreate = async () => {
    if (!formTitle || !formAmount || !formFile) {
      setCreateMsg({ success: false, text: 'Title, amount, and QR image are required' });
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const fd = new FormData();
      fd.append('title', formTitle);
      fd.append('description', formDesc);
      fd.append('amount', formAmount);
      fd.append('qr_image', formFile);
      if (formEventId) fd.append('event_id', formEventId);

      const res = await contributionService.createRequest(fd);
      setCreateMsg({ success: true, text: res.message });
      setFormTitle(''); setFormDesc(''); setFormAmount(''); setFormFile(null); setFormEventId('');
      setShowForm(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      setCreateMsg({ success: false, text: err?.response?.data?.message || 'Failed to create' });
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (id: string, action: 'verify' | 'reject') => {
    setVerifying(id);
    try {
      await contributionService.verifyContribution(id, action);
      refetch();
      refetchStats();
    } catch (err) {
      console.error('Verify failed:', err);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: stats?.total_pending || 0, icon: Clock, color: 'text-amber-500' },
          { label: 'Verified', value: stats?.total_verified || 0, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Total Collected', value: `₹${stats?.total_collected?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-[#9667E0]' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-[#D8CAF6] shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <s.icon size={20} className={s.color} />
              <p className="text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em]">{s.label}</p>
            </div>
            <p className="text-2xl font-black text-[#1A0B2E]">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Create Request Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {/* Create Request Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#D8CAF6] shadow-sm"
        >
          <h3 className="text-lg font-extrabold text-[#1A0B2E] mb-5">Create Contribution Request</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Annual Membership Fee"
                className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] placeholder:text-[#2D164B]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">Amount (₹) *</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="500"
                className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] placeholder:text-[#2D164B]/30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                placeholder="Optional description..."
                className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] resize-none placeholder:text-[#2D164B]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">UPI QR Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#9667E0] file:text-white file:cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">Link Event (optional)</label>
              <div className="relative">
                <select
                  value={formEventId}
                  onChange={(e) => setFormEventId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-sm font-medium text-[#1A0B2E] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9667E0]"
                >
                  <option value="">No event</option>
                  {(events || []).map((ev: any) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9667E0] pointer-events-none" />
              </div>
            </div>
          </div>

          {createMsg && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border ${createMsg.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <span className={`text-xs font-bold ${createMsg.success ? 'text-green-700' : 'text-red-700'}`}>
                {createMsg.text}
              </span>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="mt-5 px-8 py-3 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {creating ? 'Creating...' : 'Create Request'}
          </button>
        </motion.div>
      )}

      {/* All Contributions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#D8CAF6] shadow-sm"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-lg font-extrabold text-[#1A0B2E] flex items-center gap-3">
            <Users size={20} className="text-[#9667E0]" />
            Payment Submissions
          </h3>

          <div className="flex gap-2">
            {['', 'pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition ${
                  statusFilter === s
                    ? 'bg-[#1A0B2E] text-white'
                    : 'bg-[#EEEAFD] text-[#4B2C82] hover:bg-[#D8CAF6]'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="text-[#9667E0] animate-spin" />
          </div>
        ) : !contributions || contributions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet size={36} className="text-[#D8CAF6] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#2D164B]/50">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0D4F5]">
                  {['Student', 'Request', 'Amount', 'UTR', 'Paid At', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em] pb-3 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => {
                  const badge = statusBadge[c.status] || statusBadge.pending;
                  return (
                    <tr key={c.id} className="border-b border-[#F5F1FE] hover:bg-[#F5F1FE]/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.users?.avatar_url || '/default-avatar.png'}
                            alt=""
                            className="w-7 h-7 rounded-full ring-2 ring-[#EEEAFD]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#1A0B2E]">{c.users?.full_name}</p>
                            <p className="text-[10px] text-[#2D164B]/40">{c.users?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs font-medium text-[#1A0B2E]">{c.contribution_requests?.title}</td>
                      <td className="py-3 px-3 text-sm font-bold text-[#1A0B2E]">₹{c.amount}</td>
                      <td className="py-3 px-3 text-xs font-mono text-[#2D164B]/60">{c.payment_reference}</td>
                      <td className="py-3 px-3 text-xs text-[#2D164B]/50">
                        {new Date(c.paid_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {c.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleVerify(c.id, 'verify')}
                              disabled={verifying === c.id}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition disabled:opacity-50"
                              title="Approve"
                            >
                              {verifying === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            </button>
                            <button
                              onClick={() => handleVerify(c.id, 'reject')}
                              disabled={verifying === c.id}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                        {c.status !== 'pending' && (
                          <Lock size={14} className="text-[#D8CAF6]" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}