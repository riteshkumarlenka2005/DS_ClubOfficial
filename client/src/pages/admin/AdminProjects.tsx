import { useState, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminService } from '../../services/admin.service';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminProjects() {
  const { data: projects, isLoading, refetch } = useApi<any[]>(
    () => adminService.getAllProjects()
  );
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteProject, setDeleteProject] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handlePublish = async (id: string) => {
    try {
      await adminService.publishProject(id);
      setMessage({ type: 'success', text: 'Project published' });
      refetch();
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await adminService.unpublishProject(id);
      setMessage({ type: 'success', text: 'Project unpublished' });
      refetch();
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    try {
      setProcessing(true);
      await adminService.deleteProject(deleteProject.id);
      setMessage({ type: 'success', text: 'Project deleted' });
      setDeleteProject(null);
      refetch();
    } catch { setMessage({ type: 'error', text: 'Failed' }); }
    finally { setProcessing(false); }
  };

  if (isLoading) return <LoadingSpinner message="Loading projects..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-[#1A0B2E]">Manage Projects</h1>
        <button
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82]"
        >
          + Add Project
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {projects?.map((project: any) => (
          <div key={project.id} className="bg-white rounded-2xl border border-[#E0D4F5] p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#1A0B2E]">{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-[#2D164B]/70 mb-2 line-clamp-1">
                  {project.short_description || project.description || project.content}
                </p>
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 text-xs bg-[#EEEAFD] rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.status === 'draft' && (
                  <button onClick={() => handlePublish(project.id)} className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Publish</button>
                )}
                {project.status === 'published' && (
                  <button onClick={() => handleUnpublish(project.id)} className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">Unpublish</button>
                )}
                <button onClick={() => { setEditingProject(project); setShowForm(true); }} className="px-3 py-1.5 text-xs bg-[#EEEAFD] text-[#2D164B] rounded-lg hover:bg-[#D8CAF6]">Edit</button>
                <button onClick={() => setDeleteProject(project)} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProject(null); }}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        size="lg"
      >
        <ProjectForm
          project={editingProject}
          onSuccess={(msg) => { setShowForm(false); setEditingProject(null); setMessage({ type: 'success', text: msg }); refetch(); }}
          onError={(msg) => setMessage({ type: 'error', text: msg })}
        />
      </Modal>

      <ConfirmDialog isOpen={!!deleteProject} onClose={() => setDeleteProject(null)} onConfirm={handleDelete} title="Delete Project" message={`Delete "${deleteProject?.title}"?`} confirmLabel="Delete" confirmColor="red" isLoading={processing} />
    </div>
  );
}

function ProjectForm({ project, onSuccess, onError }: { project?: any; onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || project?.content || '',
    short_description: project?.short_description || '',
    tech_stack: project?.tech_stack?.join(', ') || '',
    github_url: project?.github_url || '',
    live_url: project?.live_url || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image_url || project?.cover_image || project?.cover_image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      onError('Only JPEG, PNG, WebP, and GIF images are allowed');
      return;
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title || !form.description) { setFormError('Title and description are required'); return; }
    try {
      setSaving(true);
      const payload: Record<string, any> = {
        title: form.title,
        description: form.description,
      };
      if (form.short_description) payload.short_description = form.short_description;
      if (form.tech_stack) payload.tech_stack = form.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean);
      if (form.github_url) payload.github_url = form.github_url;
      if (form.live_url) payload.live_url = form.live_url;

      // Upload image file if selected
      if (imageFile) {
        try {
          const uploadRes = await adminService.uploadProjectImage(imageFile);
          if (uploadRes.success && uploadRes.data?.url) {
            payload.image_url = uploadRes.data.url;
          } else {
            setFormError('Image upload failed. Try creating without an image.');
            setSaving(false);
            return;
          }
        } catch (uploadErr: any) {
          setFormError(uploadErr.response?.data?.message || 'Image upload failed. The storage bucket may not exist.');
          setSaving(false);
          return;
        }
      } else if (imagePreview && (project?.image_url || project?.cover_image || project?.cover_image_url)) {
        // Keep existing image if no new file selected
        payload.image_url = project.image_url || project.cover_image || project.cover_image_url;
      }

      if (project) {
        await adminService.updateProject(project.id, payload);
        onSuccess('Project updated');
      } else {
        await adminService.createProject(payload);
        onSuccess('Project created');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save project';
      setFormError(msg);
      onError(msg);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {formError}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">Title *</label>
        <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">Short Description</label>
        <input type="text" value={form.short_description} onChange={(e) => setForm(p => ({ ...p, short_description: e.target.value }))} className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">Description *</label>
        <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} required rows={5} className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">Tech Stack (comma-separated)</label>
        <input type="text" value={form.tech_stack} onChange={(e) => setForm(p => ({ ...p, tech_stack: e.target.value }))} placeholder="React, Node.js, Python" className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-1">GitHub URL</label>
          <input type="url" value={form.github_url} onChange={(e) => setForm(p => ({ ...p, github_url: e.target.value }))} className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-1">Live URL</label>
          <input type="url" value={form.live_url} onChange={(e) => setForm(p => ({ ...p, live_url: e.target.value }))} className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">Project Image</label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="w-full max-w-xs h-40 object-cover rounded-lg border border-[#E0D4F5]" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow"
            >
              x
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#D8CAF6] rounded-xl p-6 text-center cursor-pointer hover:border-[#9667E0] hover:bg-[#EEEAFD] transition-colors"
          >
            <svg className="mx-auto h-10 w-10 text-[#9667E0]/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
            </svg>
            <p className="text-sm text-[#2D164B]/60">Click to upload an image</p>
            <p className="text-xs text-[#9667E0]/50 mt-1">JPEG, PNG, WebP, GIF (max 5MB)</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      <div className="flex justify-end pt-4 border-t border-[#E0D4F5]">
        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#9667E0] text-white rounded-xl hover:bg-[#4B2C82] disabled:opacity-50 font-medium">
          {saving ? 'Saving...' : project ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

