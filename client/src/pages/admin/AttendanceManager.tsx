// FILE: frontend/src/pages/admin/AttendanceManager.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ClipboardCheck, QrCode, Download, Trash2, Users,
  Clock, Loader2, ChevronDown, RefreshCw,
} from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';
import { eventService } from '../../services/event.service';
import { certificateService } from '../../services/certificate.service';
import { useApi } from '../../hooks/useApi';

interface EventOption {
  id: string;
  title: string;
  event_date: string;
}

interface AttendanceEntry {
  id: string;
  scanned_at: string;
  verified: boolean;
  device_info: string | null;
  users: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export default function AttendanceManager() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [qrContent, setQrContent] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState<string | null>(null);
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [generating, setGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [attendanceTotal, setAttendanceTotal] = useState(0);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch events for dropdown
  const { data: events } = useApi<EventOption[]>(
    () => eventService.getPublished(),
    []
  );

  // Fetch attendance when event changes
  useEffect(() => {
    if (!selectedEvent) {
      setAttendance([]);
      setAttendanceTotal(0);
      return;
    }
    fetchAttendance();
  }, [selectedEvent]);

  const fetchAttendance = async () => {
    if (!selectedEvent) return;
    setLoadingAttendance(true);
    try {
      const res = await attendanceService.getEventAttendance(selectedEvent);
      setAttendance(res.data.attendance || []);
      setAttendanceTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedEvent) return;
    setGenerating(true);
    try {
      const res = await attendanceService.generateQR(selectedEvent, expiryMinutes);
      setQrContent(res.data.qr_content);
      setQrExpiry(res.data.expires_at);
    } catch (err) {
      console.error('QR generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedEvent) return;
    setExporting(true);
    try {
      const blob = await attendanceService.exportCSV(selectedEvent);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedEvent}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Delete this attendance record?')) return;
    try {
      await attendanceService.deleteRecord(id);
      fetchAttendance();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleGenerateCertificate = async (userId: string) => {
    if (!selectedEvent) return;
    setGeneratingId(userId);
    try {
      await certificateService.generateCertificate({ user_id: userId, event_id: selectedEvent });
      alert('Certificate generated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Event Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#D8CAF6] shadow-sm"
      >
        <h2 className="text-xl font-extrabold text-[#1A0B2E] mb-5 flex items-center gap-3">
          <ClipboardCheck size={22} className="text-[#9667E0]" />
          Attendance Manager
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
              Select Event
            </label>
            <div className="relative">
              <select
                value={selectedEvent}
                onChange={(e) => { setSelectedEvent(e.target.value); setQrContent(null); }}
                className="w-full px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0] appearance-none cursor-pointer"
              >
                <option value="">Choose an event...</option>
                {(events || []).map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9667E0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider mb-2">
              QR Expiry (minutes)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 60)}
                min={5}
                max={480}
                className="flex-1 px-4 py-3 rounded-xl border border-[#D8CAF6] bg-[#F5F1FE] text-[#1A0B2E] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#9667E0]"
              />
              <button
                onClick={handleGenerateQR}
                disabled={!selectedEvent || generating}
                className="px-6 py-3 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                Generate QR
              </button>
            </div>
          </div>
        </div>

        {/* Generated QR Display */}
        {qrContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex flex-col items-center"
          >
            <div className="bg-white p-6 rounded-2xl border-2 border-[#D8CAF6] shadow-lg">
              <QRCodeSVG
                value={qrContent}
                size={280}
                level="H"
                includeMargin
                bgColor="#FFFFFF"
                fgColor="#1A0B2E"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#4B2C82]/60 uppercase tracking-wider">
              <Clock size={14} className="text-[#9667E0]" />
              Expires: {qrExpiry ? new Date(qrExpiry).toLocaleString() : 'N/A'}
            </div>
            <p className="text-[10px] text-[#2D164B]/40 mt-2 font-medium">
              Project this QR at the event venue for attendees to scan.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Attendance Table */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#D8CAF6] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-[#9667E0]" />
              <h3 className="text-lg font-extrabold text-[#1A0B2E]">
                Attendance Sheet
              </h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEEAFD] text-[#4B2C82] border border-[#D8CAF6]">
                {attendanceTotal} present
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAttendance}
                className="p-2.5 rounded-xl bg-[#EEEAFD] text-[#4B2C82] hover:bg-[#D8CAF6] transition"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={handleExportCSV}
                disabled={exporting || attendanceTotal === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#EEEAFD] text-[#4B2C82] rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#D8CAF6] transition disabled:opacity-50"
              >
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Export CSV
              </button>
            </div>
          </div>

          {loadingAttendance ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="text-[#9667E0] animate-spin" />
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-12">
              <Users size={36} className="text-[#D8CAF6] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#2D164B]/50">No attendance records for this event</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0D4F5]">
                    {['#', 'Student', 'Email', 'Scan Time', 'Status', ''].map((h) => (
                      <th key={h} className="text-left text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em] pb-3 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((entry, i) => (
                    <tr key={entry.id} className="border-b border-[#F5F1FE] hover:bg-[#F5F1FE]/50 transition">
                      <td className="py-3 px-3 text-sm font-bold text-[#2D164B]/40">{i + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.users?.avatar_url || '/default-avatar.png'}
                            alt=""
                            className="w-8 h-8 rounded-full ring-2 ring-[#EEEAFD]"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-sm font-semibold text-[#1A0B2E]">
                            {entry.users?.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-[#2D164B]/60">{entry.users?.email}</td>
                      <td className="py-3 px-3 text-xs font-medium text-[#2D164B]/50">
                        {new Date(entry.scanned_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200">
                          Present
                        </span>
                      </td>
                      <td className="py-3 px-3 flex gap-2 items-center">
                        <button
                          onClick={() => handleGenerateCertificate(entry.users.id)}
                          disabled={generatingId === entry.users.id}
                          className="px-3 py-1 bg-[#EEEAFD] text-[#4B2C82] rounded-lg text-xs font-bold hover:bg-[#D8CAF6] transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {generatingId === entry.users.id ? 'Generating...' : 'Generate Cert'}
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(entry.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-[#D8CAF6] hover:text-red-400 transition"
                          title="Delete record"
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
      )}
    </div>
  );
}