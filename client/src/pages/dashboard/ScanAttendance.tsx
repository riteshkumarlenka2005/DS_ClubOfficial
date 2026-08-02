// FILE: frontend/src/pages/dashboard/ScanAttendance.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, CheckCircle2, XCircle, History, Calendar, MapPin } from 'lucide-react';
import QRScannerModal from '../../components/QRScannerModal';
import { attendanceService } from '../../services/attendance.service';
import { useApi } from '../../hooks/useApi';

interface AttendanceRecord {
  id: string;
  scanned_at: string;
  verified: boolean;
  events: {
    id: string;
    title: string;
    slug: string;
    event_date: string;
    venue: string | null;
    cover_image: string | null;
  };
}

interface AttendanceSummary {
  total_attended: number;
  total_certificates: number;
  total_contributions: number;
}

export default function ScanAttendance() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  const { data: attendance, refetch: refetchAttendance } = useApi<AttendanceRecord[]>(
    () => attendanceService.getMyAttendance(),
    []
  );

  const { data: summary } = useApi<AttendanceSummary>(
    () => attendanceService.getMySummary(),
    []
  );

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(true);
    setScanResult(null);
    try {
      const response = await attendanceService.scanQR(decodedText);
      setScanResult({ success: true, message: response.message });
      refetchAttendance();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to mark attendance';
      setScanResult({ success: false, message: msg });
    } finally {
      setScanning(false);
    }
  };

  const stats = [
    { label: 'Events Attended', value: summary?.total_attended || 0, color: 'bg-[#9667E0]' },
    { label: 'Certificates', value: summary?.total_certificates || 0, color: 'bg-[#4B2C82]' },
    { label: 'Contributions', value: summary?.total_contributions || 0, color: 'bg-[#1A0B2E]' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-[#D8CAF6] shadow-sm"
          >
            <p className="text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <p className="text-3xl font-black text-[#1A0B2E]">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Scan Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[2rem] p-8 border border-[#D8CAF6] shadow-sm text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#9667E0] to-[#4B2C82] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#9667E0]/30">
          <ScanLine size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-[#1A0B2E] mb-2">Scan Attendance QR</h2>
        <p className="text-sm text-[#2D164B]/60 font-medium mb-6 max-w-md mx-auto">
          Open your camera and scan the QR code displayed at the event to mark your attendance.
        </p>
        <button
          onClick={() => { setScanResult(null); setScannerOpen(true); }}
          className="px-10 py-3.5 bg-[#1A0B2E] text-white rounded-2xl text-sm font-black tracking-widest hover:bg-[#4B2C82] transition-colors shadow-lg uppercase cursor-pointer"
        >
          Open Scanner
        </button>

        {/* Scan Result */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${
              scanResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {scanResult.success ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : (
              <XCircle size={20} className="text-red-500" />
            )}
            <span className={`text-sm font-bold ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {scanResult.message}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Attendance History */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <History size={20} className="text-[#9667E0]" />
          <h3 className="text-lg font-extrabold text-[#1A0B2E]">Attendance History</h3>
        </div>

        {!attendance || attendance.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#D8CAF6] text-center">
            <Calendar size={40} className="text-[#D8CAF6] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#2D164B]/50">No attendance records yet</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {attendance.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-[#D8CAF6] shadow-sm flex items-center gap-4 hover:border-[#9667E0] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EEEAFD] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={22} className="text-[#9667E0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A0B2E] truncate">{record.events?.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-wider">
                      {new Date(record.scanned_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </span>
                    {record.events?.venue && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-wider">
                        <MapPin size={10} /> {record.events.venue}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200">
                  Present
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Scan Attendance QR"
      />
    </div>
  );
}