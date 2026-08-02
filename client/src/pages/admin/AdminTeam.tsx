import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { teamService } from '../../services/team.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AdminTeam() {
  const { data: members, isLoading, refetch } = useApi<any[]>(
    () => teamService.getAll()
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [filterDept, setFilterDept] = useState<string>('all');

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setProcessing(true);
      await teamService.deleteMember(deleting.id);
      setMessage({ type: 'success', text: `${deleting.name} removed` });
      setDeleting(null);
      refetch();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' });
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean, name: string) => {
    try {
      await teamService.toggleVisibility(id, !current);
      setMessage({ type: 'success', text: `${name} ${!current ? 'visible' : 'hidden'}` });
      refetch();
    } catch {
      setMessage({ type: 'error', text: 'Failed' });
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading team..." />;

  const filtered = members?.filter((m: any) =>
    filterDept === 'all' ? true : m.department === filterDept
  );

  const deptLabels: Record<string, string> = {
    leadership: '👑 Leadership',
    technical: '🧠 Technical',
    management: '🎯 Management',
    creative: '🎨 Creative',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A0B2E]">Manage Team</h1>
          <p className="text-sm text-[#2D164B]/60">{members?.length || 0} members</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82]"
        >
          + Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'leadership', 'technical', 'management', 'creative'].map(d => (
          <button
            key={d}
            onClick={() => setFilterDept(d)}
            className={`px-3 py-1.5 text-xs rounded-lg capitalize ${
              filterDept === d ? 'bg-[#9667E0] text-white' : 'bg-[#EEEAFD] text-[#2D164B] hover:bg-[#D8CAF6]'
            }`}
          >
            {d === 'all' ? 'All' : deptLabels[d] || d}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E0D4F5] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0D4F5] bg-[#EEEAFD]/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Dept</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Visible</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D4F5]/30">
            {filtered?.map((m: any) => (
              <tr key={m.id} className={`hover:bg-[#EEEAFD]/30 ${!m.is_visible ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-[#2D164B]">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar_url || `https://picsum.photos/seed/${m.img_seed || m.name}/100`}
                      alt={m.name}
                      className="w-8 h-8 rounded-full object-cover"
                      loading="lazy"
                    />
                    {m.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#2D164B]/50 font-mono text-xs">{m.student_id}</td>
                <td className="px-4 py-3 text-xs">
                  {m.email ? (
                    <span className="text-green-600" title={m.email}>✓ Linked</span>
                  ) : (
                    <span className="text-amber-500">⚠ Not linked</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#2D164B]/70">{m.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.department} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs capitalize text-[#2D164B]/70">{m.tier}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleVisibility(m.id, m.is_visible, m.name)}
                    className={`text-xs px-2 py-1 rounded-full ${m.is_visible ? 'bg-green-100 text-green-700' : 'bg-[#EEEAFD] text-[#2D164B]'}`}
                  >
                    {m.is_visible ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(m); setShowForm(true); }}
                      className="px-3 py-1 text-xs bg-[#EEEAFD] text-[#2D164B] rounded-lg hover:bg-[#D8CAF6]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleting(m)}
                      className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Edit Team Member' : 'Add Team Member'}
        size="lg"
      >
        <TeamMemberForm
          member={editing}
          onSuccess={(msg) => {
            setShowForm(false);
            setEditing(null);
            setMessage({ type: 'success', text: msg });
            refetch();
          }}
          onError={(msg) => setMessage({ type: 'error', text: msg })}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove Team Member"
        message={`Remove "${deleting?.name}" from the team?`}
        confirmLabel="Remove"
        confirmColor="red"
        isLoading={processing}
      />
    </div>
  );
}

// ============================================
// FORM
// ============================================
function TeamMemberForm({
  member,
  onSuccess,
  onError,
}: {
  member?: any;
  onSuccess: (m: string) => void;
  onError: (m: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: member?.name || '',
    student_id: member?.student_id || '',
    role: member?.role || '',
    department: member?.department || 'technical',
    tier: member?.tier || 'co-member',
    sub_category: member?.sub_category || '',
    bio: member?.bio || '',
    img_seed: member?.img_seed || '',
    avatar_url: member?.avatar_url || '',
    linkedin_url: member?.linkedin_url || '',
    github_url: member?.github_url || '',
    instagram_url: member?.instagram_url || '',
    email: member?.email || '',
    display_order: member?.display_order?.toString() || '0',
  });

  const h = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.student_id || !form.role) {
      onError('Name, student ID, and role are required');
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, any> = {
        name: form.name,
        student_id: form.student_id,
        role: form.role,
        department: form.department,
        tier: form.tier,
        display_order: parseInt(form.display_order) || 0,
      };

      if (form.department === 'creative' && form.sub_category) {
        payload.sub_category = form.sub_category;
      } else {
        payload.sub_category = null;
      }

      if (form.bio) payload.bio = form.bio;
      if (form.img_seed) payload.img_seed = form.img_seed;
      if (form.avatar_url) payload.avatar_url = form.avatar_url;
      if (form.linkedin_url) payload.linkedin_url = form.linkedin_url;
      if (form.github_url) payload.github_url = form.github_url;
      if (form.instagram_url) payload.instagram_url = form.instagram_url;
      if (form.email) payload.email = form.email;

      if (member) {
        await teamService.update(member.id, payload);
        onSuccess('Team member updated');
      } else {
        await teamService.create(payload);
        onSuccess('Team member added');
      }
    } catch (error: any) {
      onError(error.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none text-sm";
  const labelClass = "block text-sm font-medium text-[#2D164B] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input type="text" value={form.name} onChange={h('name')} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Student ID *</label>
          <input type="text" value={form.student_id} onChange={h('student_id')} required className={inputClass} placeholder="e.g. 23CSE513" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Role *</label>
        <input type="text" value={form.role} onChange={h('role')} required className={inputClass} placeholder="e.g. Technical Head" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Department *</label>
          <select value={form.department} onChange={h('department')} className={inputClass}>
            <option value="leadership">Leadership</option>
            <option value="technical">Technical</option>
            <option value="management">Management</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tier *</label>
          <select value={form.tier} onChange={h('tier')} className={inputClass}>
            <option value="lead">Lead</option>
            <option value="head">Head</option>
            <option value="core">Core</option>
            <option value="co-member">Co-Member</option>
          </select>
        </div>
        {form.department === 'creative' && (
          <div>
            <label className={labelClass}>Sub-Category</label>
            <select value={form.sub_category} onChange={h('sub_category')} className={inputClass}>
              <option value="">None</option>
              <option value="social">Social Media</option>
              <option value="design">Design</option>
              <option value="video">Video</option>
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Display Order</label>
          <input type="number" value={form.display_order} onChange={h('display_order')} className={inputClass} min="0" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Bio</label>
        <textarea value={form.bio} onChange={h('bio')} rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Image Seed (for picsum)</label>
          <input type="text" value={form.img_seed} onChange={h('img_seed')} className={inputClass} placeholder="e.g. tech1" />
        </div>
        <div>
          <label className={labelClass}>Avatar URL (overrides seed)</label>
          <input type="url" value={form.avatar_url} onChange={h('avatar_url')} className={inputClass} />
        </div>
      </div>

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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Instagram URL</label>
          <input type="url" value={form.instagram_url} onChange={h('instagram_url')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={form.email} onChange={h('email')} className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E0D4F5]">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#9667E0] text-white rounded-xl hover:bg-[#4B2C82] disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : member ? 'Update' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}

