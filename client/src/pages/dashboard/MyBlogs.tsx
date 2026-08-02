import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { blogService } from '../../services/blog.service';
import { eventService } from '../../services/event.service';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function MyBlogs() {
  const { data: blogs, isLoading, error, refetch } = useApi<any[]>(
    () => blogService.getAll()
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [deletingBlog, setDeletingBlog] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handleDelete = async () => {
    if (!deletingBlog) return;
    try {
      setDeleting(true);
      await blogService.deleteBlog(deletingBlog.id);
      setMessage({ type: 'success', text: 'Blog deleted' });
      setDeletingBlog(null);
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading blogs..." />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A0B2E]">My Blogs</h1>
          <p className="text-sm text-[#2D164B]/60">Write and manage blog drafts</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null);
            setShowCreate(true);
          }}
          className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82] w-full sm:w-auto"
        >
          + Write Blog
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {blogs && blogs.length > 0 ? (
        <div className="space-y-4">
          {blogs.map((blog: any) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl border border-[#E0D4F5] p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#1A0B2E]">
                      {blog.title}
                    </h3>
                    <StatusBadge status={blog.status} />
                  </div>
                  <p className="text-sm text-[#2D164B]/70 mb-2 line-clamp-2">
                    {blog.excerpt || blog.content?.substring(0, 150)}
                  </p>
                  {blog.tags?.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {blog.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-[#EEEAFD] text-[#4B2C82] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#9667E0]/40">
                    Created {new Date(blog.created_at).toLocaleDateString()}
                    {blog.published_at &&
                      ` • Published ${new Date(blog.published_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.status === 'draft' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingBlog(blog);
                          setShowCreate(true);
                        }}
                        className="px-3 py-1.5 text-xs bg-[#EEEAFD] text-[#2D164B] rounded-lg hover:bg-[#D8CAF6]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingBlog(blog)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="✍️"
          title="No blogs yet"
          description="Write your first blog post. An admin will review and publish it."
          action={{ label: 'Write Blog', onClick: () => setShowCreate(true) }}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditingBlog(null);
        }}
        title={editingBlog ? 'Edit Blog' : 'Write Blog'}
        size="xl"
      >
        <BlogForm
          blog={editingBlog}
          onSuccess={(msg) => {
            setShowCreate(false);
            setEditingBlog(null);
            setMessage({ type: 'success', text: msg });
            refetch();
          }}
          onError={(msg) => setMessage({ type: 'error', text: msg })}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingBlog}
        onClose={() => setDeletingBlog(null)}
        onConfirm={handleDelete}
        title="Delete Blog"
        message={`Are you sure you want to delete "${deletingBlog?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        isLoading={deleting}
      />
    </div>
  );
}

// ============================================
// BLOG FORM
// ============================================
function BlogForm({
  blog,
  onSuccess,
  onError,
}: {
  blog?: any;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: blog?.title || '',
    category: blog?.category || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    cover_image: blog?.cover_image || '',
    tags: blog?.tags?.join(', ') || '',
    event_date: blog?.published_at ? new Date(blog.published_at).toISOString().split('T')[0] : '',
    event_id: blog?.event_id || '',
  });

  // Fetch events for the dropdown
  const { data: events } = useApi<any[]>(() => eventService.getAll(), []);

  // Cover image upload state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(blog?.cover_image || '');

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>(blog?.video_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      onError('Video must be under 50 MB');
      e.target.value = '';
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.content) {
      onError('Title and content are required');
      return;
    }

    try {
      setSaving(true);

      // Upload cover image first if a new file was selected
      let coverUrl = form.cover_image;
      if (coverFile) {
        try {
          setUploading(true);
          setUploadProgress('Uploading cover image...');
          const uploadRes = await blogService.uploadCoverImage(coverFile);
          coverUrl = uploadRes.data.url;
          setUploadProgress('');
        } catch {
          onError('Failed to upload cover image. Please try again.');
          return;
        } finally {
          setUploading(false);
        }
      }
      // If user removed cover, clear the URL
      if (!coverPreview && !coverFile) coverUrl = '';

      // Upload video if a new file was selected
      let videoUrl = videoPreview && !videoFile ? videoPreview : '';
      if (videoFile) {
        try {
          setUploading(true);
          setUploadProgress('Uploading video...');
          const uploadRes = await blogService.uploadVideo(videoFile);
          videoUrl = uploadRes.data.url;
          setUploadProgress('');
        } catch {
          onError('Failed to upload video. Please try again.');
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload: Record<string, any> = {
        title: form.title,
        content: form.content,
      };

      if (form.category) payload.category = form.category;
      if (form.excerpt) payload.excerpt = form.excerpt;
      if (coverUrl) payload.cover_image = coverUrl;
      if (!coverPreview && !coverFile && blog?.cover_image) payload.cover_image = '';
      if (form.tags) {
        payload.tags = form.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      }
      if (videoUrl) payload.video_url = videoUrl;
      // Clear video_url if user removed the video
      if (!videoPreview && !videoFile && blog?.video_url) {
        payload.video_url = '';
      }
      if (form.event_date) {
        payload.published_at = new Date(form.event_date).toISOString();
      }
      if (form.event_id) {
        payload.event_id = form.event_id;
      }

      if (blog) {
        await blogService.update(blog.id, payload);
        onSuccess('Blog updated successfully');
      } else {
        await blogService.create(payload as any);
        onSuccess('Blog draft created — pending admin review');
      }
    } catch (error: any) {
      onError(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Category *
        </label>
        <select
          name="category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          required
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none bg-white"
        >
          <option value="">Select Category</option>
          <option value="Workshops">Workshops</option>
          <option value="Tutorials">Tutorials</option>
          <option value="Events">Events</option>
          <option value="Research">Research</option>
          <option value="Community">Community</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Link to Event (Optional)
        </label>
        <select
          name="event_id"
          value={form.event_id}
          onChange={(e) => setForm((prev) => ({ ...prev, event_id: e.target.value }))}
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none bg-white"
        >
          <option value="">None (Standalone Blog)</option>
          {events?.map((ev: any) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({new Date(ev.event_date).getFullYear()})
            </option>
          ))}
        </select>
        <p className="text-xs text-[#9667E0]/60 mt-1">
          Linking to an event will automatically feature this video/blog on the event highlights page.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Excerpt
        </label>
        <input
          type="text"
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          placeholder="Brief summary for blog cards"
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Content *
        </label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          required
          rows={12}
          placeholder="Write your blog content here..."
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none resize-none font-mono text-sm"
        />
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Cover Image
        </label>

        {coverPreview && (
          <div className="mb-2 relative">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-40 object-cover rounded-lg border border-[#E0D4F5]"
            />
            <button
              type="button"
              onClick={() => {
                setCoverFile(null);
                setCoverPreview('');
                setForm((prev) => ({ ...prev, cover_image: '' }));
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow-md"
            >
              ✕
            </button>
          </div>
        )}

        {!coverPreview && (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  onError('Image must be under 5 MB');
                  return;
                }
                setCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
              }
            }}
            className="w-full text-sm text-[#2D164B]/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EEEAFD] file:text-[#4B2C82] hover:file:bg-[#D8CAF6] cursor-pointer"
          />
        )}
        <p className="text-xs text-[#9667E0]/50 mt-1">JPEG, PNG, WebP, or GIF — max 5 MB</p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="python, machine-learning, tutorial"
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
        />
      </div>

      {/* Event / Blog Date */}
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Event / Blog Date
        </label>
        <input
          type="date"
          name="event_date"
          value={form.event_date}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
        />
        <p className="text-xs text-[#9667E0]/50 mt-1">This date will be shown on the blog card</p>
      </div>

      {/* Video Upload Section */}
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Video (optional)
        </label>

        {/* Video preview */}
        {videoPreview && (
          <div className="mb-2 relative">
            <video
              src={videoPreview}
              controls
              className="w-full max-h-56 rounded-lg border border-[#E0D4F5] bg-black"
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow-md"
            >
              ✕
            </button>
          </div>
        )}

        {/* File picker */}
        {!videoPreview && (
          <div className="border-2 border-dashed border-[#D8CAF6] rounded-xl p-6 text-center hover:border-[#9667E0] transition-colors">
            <div className="text-3xl mb-2">🎨</div>
            <p className="text-sm text-[#2D164B]/70 mb-2">
              Select a video file from your device
            </p>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
              onChange={handleVideoSelect}
              className="w-full text-sm text-[#2D164B]/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EEEAFD] file:text-[#4B2C82] hover:file:bg-[#D8CAF6] cursor-pointer"
            />
            <p className="text-xs text-[#9667E0]/50 mt-2">
              MP4, WebM, OGG, MOV, or AVI — max 50 MB
            </p>
          </div>
        )}

        {/* Upload progress */}
        {uploadProgress && (
          <div className="mt-2 flex items-center gap-2 text-sm text-[#9667E0]">
            <div className="w-4 h-4 border-2 border-[#9667E0] border-t-transparent rounded-full animate-spin" />
            {uploadProgress}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D4F5]">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2.5 bg-[#9667E0] text-white rounded-xl hover:bg-[#4B2C82] disabled:opacity-50 font-medium"
        >
          {uploading ? 'Uploading video...' : saving ? 'Saving...' : blog ? 'Update Blog' : 'Create Draft'}
        </button>
      </div>
    </form>
  );
}

