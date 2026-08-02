import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminAlumni() {
  const { data: alumni, isLoading, refetch } = useApi<any[]>(() => adminService.getAllAlumni());
  const [showForm, setShowForm] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<any>(null);
  const [deleteAlumni, setDeleteAlumni] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteAlumni) return;
    try {
      setProcessing(true);
      await adminService.deleteAlumni(deleteAlumni.id);
      setMessage({ type: 'success', text: 'Alumni deleted' });
      setDeleteAlumni(null);
      refetch();
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
    finally { setProcessing(false); }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await adminService.toggleAlumniVisibility(id, !current);
      setMessage({ type: 'success', text: `Alumni ${!current ? 'visible' : 'hidden'}` });
      refetch();
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
  };

  if (isLoading) return <LoadingSpinner message="Loading alumni..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-[#1A0B2E]">Manage Alumni</h1>
        <button onClick={() => { setEditingAlumni(null); setShowForm(true); }} className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82]">
          + Add Alumni
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E0D4F5] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0D4F5] bg-[#EEEAFD]/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Role @ Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Skills</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Color</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Visible</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D4F5]/30">
            {alumni?.map((a: any) => (
              <tr key={a.id} className={`hover:bg-[#EEEAFD]/30 ${!a.is_visible ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-[#2D164B]">{a.full_name}</td>
                <td className="px-4 py-3 text-[#2D164B]/70">{a.batch_year}</td>
                <td className="px-4 py-3 text-[#2D164B]/70">
                  {a.designation && a.company ? `${a.designation} @ ${a.company}` : a.company || a.designation || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.skills?.slice(0, 3).map((s: string) => (
                      <span key={s} className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-700 rounded">{s}</span>
                    ))}
                    {a.skills?.length > 3 && <span className="text-[10px] text-[#9667E0]/40">+{a.skills.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: a.bg_color || '#F9F7FF' }} />
                    <span className="text-[10px] text-[#9667E0]/40 font-mono">{a.bg_color || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#2D164B]/50 text-center">{a.display_order}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleVisibility(a.id, a.is_visible)}
                    className={`text-xs px-2 py-1 rounded-full ${a.is_visible ? 'bg-green-100 text-green-700' : 'bg-[#EEEAFD] text-[#2D164B]'}`}
                  >
                    {a.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingAlumni(a); setShowForm(true); }} className="px-3 py-1 text-xs bg-[#EEEAFD] text-[#2D164B] rounded-lg hover:bg-[#D8CAF6]">Edit</button>
                    <button onClick={() => setDeleteAlumni(a)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingAlumni(null); }} title={editingAlumni ? 'Edit Alumni' : 'Add Alumni'} size="xl">
        <AlumniForm
          alumni={editingAlumni}
          onSuccess={(msg) => { setShowForm(false); setEditingAlumni(null); setMessage({ type: 'success', text: msg }); refetch(); }}
          onError={(msg) => setMessage({ type: 'error', text: msg })}
        />
      </Modal>

      <ConfirmDialog isOpen={!!deleteAlumni} onClose={() => setDeleteAlumni(null)} onConfirm={handleDelete} title="Delete Alumni" message={`Delete "${deleteAlumni?.full_name}"?`} confirmLabel="Delete" confirmColor="red" isLoading={processing} />
    </div>
  );
}

// ============================================
// ALUMNI FORM — Extended with new fields
// ============================================

const BG_COLOR_PRESETS = [
  { label: 'Green', value: '#E8F5E9' },
  { label: 'Orange', value: '#FFF3E0' },
  { label: 'Blue', value: '#E3F2FD' },
  { label: 'Pink', value: '#FCE4EC' },
  { label: 'Yellow', value: '#FFFDE7' },
  { label: 'Purple', value: '#F3E5F5' },
  { label: 'Lavender', value: '#F9F7FF' },
  { label: 'Cyan', value: '#E0F7FA' },
  { label: 'Amber', value: '#FFF8E1' },
];

function AlumniForm({ alumni, onSuccess, onError }: { alumni?: any; onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: alumni?.full_name || '',
    email: alumni?.email || '',
    batch_year: alumni?.batch_year?.toString() || '',
    department: alumni?.department || '',
    company: alumni?.company || '',
    designation: alumni?.designation || '',
    linkedin_url: alumni?.linkedin_url || '',
    github_url: alumni?.github_url || '',
    avatar_url: alumni?.avatar_url || '',
    testimonial: alumni?.testimonial || '',
    skills: alumni?.skills?.join(', ') || '',
    bg_color: alumni?.bg_color || '#E8F5E9',
    img_seed: alumni?.img_seed || '',
    display_order: alumni?.display_order?.toString() || '0',
  });

  const h = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.batch_year) { onError('Name and batch year required'); return; }
    try {
      setSaving(true);
      const payload: Record<string, any> = {
        full_name: form.full_name,
        batch_year: parseInt(form.batch_year),
        bg_color: form.bg_color,
        display_order: parseInt(form.display_order) || 0,
      };

      if (form.email) payload.email = form.email;
      if (form.department) payload.department = form.department;
      if (form.company) payload.company = form.company;
      if (form.designation) payload.designation = form.designation;
      if (form.linkedin_url) payload.linkedin_url = form.linkedin_url;
      if (form.github_url) payload.github_url = form.github_url;
      if (form.avatar_url) payload.avatar_url = form.avatar_url;
      if (form.testimonial) payload.testimonial = form.testimonial;
      if (form.img_seed) payload.img_seed = form.img_seed;

      if (form.skills) {
        payload.skills = form.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        payload.skills = [];
      }

      if (alumni) {
        await adminService.updateAlumni(alumni.id, payload);
        onSuccess('Alumni updated');
      } else {
        await adminService.createAlumni(payload);
        onSuccess('Alumni added');
      }
    } catch (error: any) { onError(error.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const inputClass = "w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none text-sm";
  const labelClass = "block text-sm font-medium text-[#2D164B] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Name + Batch */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input type="text" value={form.full_name} onChange={h('full_name')} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Batch Year *</label>
          <input type="number" value={form.batch_year} onChange={h('batch_year')} required className={inputClass} />
        </div>
      </div>

      {/* Row 2: Role + Company */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Role / Designation</label>
          <input type="text" value={form.designation} onChange={h('designation')} placeholder="e.g. AI Research Engineer" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Company</label>
          <input type="text" value={form.company} onChange={h('company')} placeholder="e.g. Google" className={inputClass} />
        </div>
      </div>

      {/* Row 3: Email + Department */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={form.email} onChange={h('email')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Department</label>
          <input type="text" value={form.department} onChange={h('department')} className={inputClass} />
        </div>
      </div>

      {/* Testimonial / Quote */}
      <div>
        <label className={labelClass}>Testimonial / Quote</label>
        <textarea value={form.testimonial} onChange={h('testimonial')} rows={4} placeholder="Their story about DSC GIETU..." className={`${inputClass} resize-none`} />
      </div>

      {/* Skills */}
      <div>
        <label className={labelClass}>Skills (comma-separated)</label>
        <input type="text" value={form.skills} onChange={h('skills')} placeholder="PyTorch, TensorFlow, Computer Vision" className={inputClass} />
        {form.skills && (
          <div className="flex flex-wrap gap-1 mt-2">
            {form.skills.split(',').map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
              <span key={s} className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded-full border border-purple-200">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Background Color */}
      <div>
        <label className={labelClass}>Section Background Color</label>
        <div className="flex items-center gap-3 flex-wrap">
          {BG_COLOR_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setForm(p => ({ ...p, bg_color: preset.value }))}
              className={`w-10 h-10 rounded-xl border-2 transition-all ${
                form.bg_color === preset.value ? 'border-[#9667E0] scale-110 shadow-md' : 'border-[#E0D4F5] hover:border-[#9667E0]/50'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.label}
            />
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="text"
              value={form.bg_color}
              onChange={h('bg_color')}
              placeholder="#E8F5E9"
              className="w-28 px-3 py-2 border border-[#D8CAF6] rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-[#9667E0]"
            />
            <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: form.bg_color }} />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Image Seed (for placeholder)</label>
          <input type="text" value={form.img_seed} onChange={h('img_seed')} placeholder="e.g. arjun" className={inputClass} />
          <p className="text-[10px] text-[#9667E0]/40 mt-1">Used as picsum.photos/seed/VALUE for placeholder images</p>
        </div>
        <div>
          <label className={labelClass}>Avatar URL (overrides seed)</label>
          <input type="url" value={form.avatar_url} onChange={h('avatar_url')} placeholder="https://..." className={inputClass} />
        </div>
      </div>

      {/* Social Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>LinkedIn URL</label>
          <input type="url" value={form.linkedin_url} onChange={h('linkedin_url')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>GitHub URL</label>
          <input type="url" value={form.github_url} onChange={h('github_url')} className={inputClass} />
        </div>
      </div>

      {/* Display Order */}
      <div className="w-32">
        <label className={labelClass}>Display Order</label>
        <input type="number" value={form.display_order} onChange={h('display_order')} min="0" className={inputClass} />
      </div>

      {/* Preview */}
      {(form.full_name || form.designation) && (
        <div className="border border-dashed border-[#D8CAF6] rounded-xl p-4">
          <p className="text-[10px] text-[#9667E0]/40 uppercase tracking-widest mb-3">Preview</p>
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: form.bg_color }}>
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-white p-1 shrink-0">
              <img
                src={form.avatar_url || `https://picsum.photos/seed/${form.img_seed || form.full_name || 'default'}/200/250`}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${form.full_name || 'default'}/200/250`; }}
              />
            </div>
            <div>
              <p className="font-black text-[#1A0B2E] text-lg">{form.full_name || 'Name'}</p>
              <p className="text-sm text-[#2D164B]/70 font-bold">
                {form.designation || 'Role'} <span className="text-[#9667E0]">@{form.company || 'Company'}</span>
              </p>
              <p className="text-xs text-gray-500">Class of {form.batch_year || '20XX'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-[#E0D4F5]">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#9667E0] text-white rounded-xl hover:bg-[#4B2C82] disabled:opacity-50 font-medium">
          {saving ? 'Saving...' : alumni ? 'Update' : 'Add Alumni'}
        </button>
      </div>
    </form>
  );
}

