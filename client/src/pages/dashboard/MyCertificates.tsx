// FILE: frontend/src/pages/dashboard/MyCertificates.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Calendar, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { certificateService } from '../../services/certificate.service';

interface Certificate {
  id: string;
  certificate_title: string;
  issued_at: string;
  events: {
    id: string;
    title: string;
    event_date: string;
  } | null;
}

export default function MyCertificates() {
  const { data: certificates, isLoading } = useApi<Certificate[]>(
    () => certificateService.getMyCertificates(),
    []
  );

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (certId: string, title: string) => {
    setDownloading(certId);
    try {
      const response = await certificateService.downloadCertificate(certId);
      const url = response.data.download_url;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-[#9667E0] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award size={22} className="text-[#9667E0]" />
        <h2 className="text-xl font-extrabold text-[#1A0B2E]">My Certificates</h2>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-[#EEEAFD] text-[#4B2C82] border border-[#D8CAF6]">
          {certificates?.length || 0} Total
        </span>
      </div>

      {!certificates || certificates.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 border border-[#D8CAF6] text-center">
          <Award size={48} className="text-[#D8CAF6] mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-[#1A0B2E] mb-2">No Certificates Yet</h3>
          <p className="text-sm text-[#2D164B]/50 font-medium">
            Attend events and you'll receive certificates here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-[#D8CAF6] shadow-sm hover:shadow-lg hover:border-[#9667E0] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9667E0] to-[#4B2C82] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#9667E0]/20">
                  <Award size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1A0B2E] text-base group-hover:text-[#9667E0] transition-colors">
                    {cert.certificate_title}
                  </h4>
                  {cert.events && (
                    <p className="text-xs font-medium text-[#2D164B]/50 mt-1 truncate">
                      {cert.events.title}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Calendar size={12} className="text-[#9667E0]" />
                    <span className="text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-wider">
                      {new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(cert.id, cert.certificate_title)}
                disabled={downloading === cert.id}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EEEAFD] text-[#4B2C82] rounded-xl text-xs font-black tracking-widest uppercase hover:bg-[#D8CAF6] transition-colors disabled:opacity-50"
              >
                {downloading === cert.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {downloading === cert.id ? 'Downloading...' : 'Download PDF'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}