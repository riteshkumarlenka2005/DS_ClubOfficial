// FILE: frontend/src/pages/admin/CertificateManager.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Upload, Trash2, Loader2, Users, Search,
  ChevronDown, CheckCircle2,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { certificateService } from '../../services/certificate.service';
import { eventService } from '../../services/event.service';

interface EventOption { id: string; title: string; }

interface CertificateEntry {
  id: string;
  certificate_title: string;
  file_path: string;
  issued_at: string;
  users: { id: string; full_name: string; email: string; avatar_url: string | null };
  events: { id: string; title: string } | null;
  uploader: { id: string; full_name: string } | null;
}

export default function CertificateManager() {
  const [userId, setUserId] = useState('');
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [filterEvent, setFilterEvent] = useState('');

  const { data: events } = useApi<EventOption[]>(() => eventService.getPublished(), []);
  const { data: certificates, refetch, isLoading } = useApi<CertificateEntry[]>(
    () => certificateService.getAllCertificates(filterEvent || undefined),
    [filterEvent]
  );

  const handleUpload = async () => {
    if (!userId || !title || !file) {
      setUploadMsg({ success: false, text: 'Please fill all required fields' });
      return;
    }

    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('user_id', userId);
      fd.append('certificate_title', title);
      if (eventId) fd.append('event_id', eventId);

      const res = await certificateService.uploadCertificate(fd);
      setUploadMsg({ success: true, text: res.message });
      setUserId('');
      setEventId('');
      setTitle('');
      setFile(null);
      refetch();
    } catch (err: any) {
      setUploadMsg({ success: false, text: err?.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate?')) return;
    try {
      await certificateService.deleteCertificate(id);
      refetch();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#D8CAF6] shadow-sm"
      >
        <h2 className="text-xl font-extrabold text-[#1A0B2E] mb-6 flex items-center gap-3">
          <Upload size={22} className="text-[#9667E0]" />
          Upload Certificate
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
              User ID *
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Paste user UUID"
              className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] placeholder:text-[#2D164B]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
              Certificate Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Participation Certificate"
              className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] placeholder:text-[#2D164B]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
              Event (optional)
            </label>
            <div className="relative">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] appearance-none cursor-pointer"
              >
                <option value="">No event linked</option>
                {(events || []).map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9667E0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
              PDF File *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#9667E0] file:text-white file:cursor-pointer"
            />
          </div>
        </div>

        {uploadMsg && (
          <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border ${uploadMsg.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <CheckCircle2 size={16} className={uploadMsg.success ? 'text-green-500' : 'text-red-500'} />
            <span className={`text-xs font-bold ${uploadMsg.success ? 'text-green-700' : 'text-red-700'}`}>
              {uploadMsg.text}
            </span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-5 px-8 py-3 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload Certificate'}
        </button>
      </motion.div>

      {/* Certificates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#D8CAF6] shadow-sm"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-lg font-extrabold text-[#1A0B2E] flex items-center gap-3">
            <Award size={20} className="text-[#9667E0]" />
            All Certificates
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEEAFD] text-[#4B2C82] border border-[#D8CAF6]">
              {certificates?.length || 0}
            </span>
          </h3>

          <div className="relative">
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-sm font-medium text-[#1A0B2E] appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9667E0]"
            >
              <option value="">All Events</option>
              {(events || []).map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9667E0] pointer-events-none" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="text-[#9667E0] animate-spin" />
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award size={36} className="text-[#D8CAF6] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#2D164B]/50">No certificates uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0D4F5]">
                  {['Student', 'Certificate', 'Event', 'Issued', ''].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em] pb-3 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id} className="border-b border-[#F5F1FE] hover:bg-[#F5F1FE]/50 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={cert.users?.avatar_url || '/default-avatar.png'}
                          alt=""
                          className="w-7 h-7 rounded-full ring-2 ring-[#EEEAFD]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#1A0B2E]">{cert.users?.full_name}</p>
                          <p className="text-[10px] text-[#2D164B]/40">{cert.users?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm font-medium text-[#1A0B2E]">{cert.certificate_title}</td>
                    <td className="py-3 px-3 text-xs text-[#2D164B]/50">{cert.events?.title || '—'}</td>
                    <td className="py-3 px-3 text-xs text-[#2D164B]/50">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-[#D8CAF6] hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}