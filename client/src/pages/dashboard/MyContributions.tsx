// FILE: frontend/src/pages/dashboard/MyContributions.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, QrCode, X, CheckCircle2, Clock, XCircle, Loader2, Send } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { contributionService } from '../../services/contribution.service';

interface ContributionRequest {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  qr_image_path: string;
  status: string;
  created_at: string;
  my_status: string | null; // pending, verified, rejected, or null (not submitted)
}

interface MyContribution {
  id: string;
  amount: number;
  payment_reference: string;
  status: string;
  paid_at: string;
  verified_at: string | null;
  contribution_requests: {
    id: string;
    title: string;
    amount: number;
  };
}

const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock, label: 'Pending' },
  verified: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle2, label: 'Verified' },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
};

export default function MyContributions() {
  const { data: requests, refetch: refetchRequests } = useApi<ContributionRequest[]>(
    () => contributionService.getActiveRequests(),
    []
  );
  const { data: myHistory, refetch: refetchHistory } = useApi<MyContribution[]>(
    () => contributionService.getMyContributions(),
    []
  );

  const [payModal, setPayModal] = useState<ContributionRequest | null>(null);
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmitPayment = async () => {
    if (!payModal || !utr.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await contributionService.submitPayment(payModal.id, utr.trim(), payModal.amount);
      setSubmitResult({ success: true, message: res.message });
      refetchRequests();
      refetchHistory();
      setTimeout(() => { setPayModal(null); setUtr(''); setSubmitResult(null); }, 2000);
    } catch (err: any) {
      setSubmitResult({ success: false, message: err?.response?.data?.message || 'Failed to submit' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Contribution Requests */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Wallet size={20} className="text-[#9667E0]" />
          <h2 className="text-xl font-extrabold text-[#1A0B2E]">Active Contributions</h2>
        </div>

        {!requests || requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#D8CAF6] text-center">
            <Wallet size={40} className="text-[#D8CAF6] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#2D164B]/50">No active contribution requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-[#D8CAF6] shadow-sm"
              >
                <h4 className="font-bold text-[#1A0B2E] text-lg mb-1">{req.title}</h4>
                {req.description && (
                  <p className="text-sm text-[#2D164B]/60 mb-3">{req.description}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-black text-[#9667E0]">₹{req.amount}</span>
                </div>

                {/* QR Image */}
                <div className="bg-[#F5F1FE] rounded-xl p-4 mb-4 flex justify-center">
                  <img
                    src={req.qr_image_path}
                    alt="Payment QR"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                </div>

                {/* Action or Status */}
                {req.my_status ? (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${statusConfig[req.my_status]?.bg || ''}`}>
                    {(() => {
                      const cfg = statusConfig[req.my_status];
                      const Icon = cfg?.icon || Clock;
                      return (
                        <>
                          <Icon size={16} className={cfg?.text} />
                          <span className={`text-xs font-bold uppercase tracking-widest ${cfg?.text}`}>
                            {cfg?.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <button
                    onClick={() => setPayModal(req)}
                    className="w-full px-6 py-3 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase cursor-pointer"
                  >
                    I Have Paid
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Clock size={20} className="text-[#9667E0]" />
          <h3 className="text-lg font-extrabold text-[#1A0B2E]">Payment History</h3>
        </div>

        {!myHistory || myHistory.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#D8CAF6] text-center">
            <p className="text-sm font-medium text-[#2D164B]/50">No payment records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myHistory.map((c, i) => {
              const cfg = statusConfig[c.status];
              const Icon = cfg?.icon || Clock;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-[#D8CAF6] shadow-sm flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg?.bg}`}>
                    <Icon size={18} className={cfg?.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1A0B2E] text-sm truncate">
                      {c.contribution_requests?.title}
                    </p>
                    <p className="text-[10px] font-bold text-[#4B2C82]/40 uppercase tracking-wider mt-0.5">
                      UTR: {c.payment_reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#1A0B2E]">₹{c.amount}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg?.text}`}>
                      {cfg?.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Submission Modal */}
      <AnimatePresence>
        {payModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A0B2E]/60 backdrop-blur-sm px-4"
            onClick={() => { setPayModal(null); setUtr(''); setSubmitResult(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0D4F5]">
                <h3 className="text-lg font-extrabold text-[#1A0B2E]">Submit Payment</h3>
                <button onClick={() => { setPayModal(null); setUtr(''); setSubmitResult(null); }} className="p-2 rounded-xl hover:bg-[#EEEAFD] text-[#4B2C82]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-sm font-bold text-[#1A0B2E]">{payModal.title}</p>
                  <p className="text-2xl font-black text-[#9667E0] mt-1">₹{payModal.amount}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
                    Transaction ID / UTR Number
                  </label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="Enter your UTR or Transaction ID"
                    className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] focus:border-transparent placeholder:text-[#2D164B]/30"
                  />
                </div>

                {submitResult && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${submitResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {submitResult.success ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                    <span className={`text-xs font-bold ${submitResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {submitResult.message}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSubmitPayment}
                  disabled={!utr.trim() || submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A0B2E] text-white rounded-2xl text-sm font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}