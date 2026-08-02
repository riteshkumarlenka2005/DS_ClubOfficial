import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { galleryService } from '../../services/gallery.service';
import { eventService } from '../../services/event.service';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';

export default function MyGallery() {
  const { data: items, isLoading, refetch } = useApi<any[]>(
    () => galleryService.getAll()
  );
  const [showUpload, setShowUpload] = useState(false);
  const [expandedCover, setExpandedCover] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  if (isLoading) return <LoadingSpinner message="Loading gallery..." />;

  // Separate cover/standalone items from sub-photos
  const coverItems = items?.filter((item: any) => !item.parent_id) || [];
  const subPhotos = items?.filter((item: any) => item.parent_id) || [];
  const getSubPhotosForCover = (coverId: string) =>
    subPhotos.filter((p: any) => p.parent_id === coverId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A0B2E]">My Gallery Uploads</h1>
          <p className="text-sm text-[#2D164B]/60">
            Upload cover images with additional photos — admin will approve them
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82] w-full sm:w-auto"
        >
          + Upload Image
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

      {coverItems.length > 0 ? (
        <div className="space-y-4">
          {coverItems.map((item: any) => {
            const itemSubPhotos = getSubPhotosForCover(item.id);
            const isExpanded = expandedCover === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E0D4F5] overflow-hidden"
              >
                {/* Cover Photo Row */}
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.title || 'Gallery upload'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {item.title && (
                          <p className="text-sm font-bold text-[#2D164B] truncate">
                            {item.title}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-[#2D164B]/60 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <StatusBadge status={item.status} />
                          <span className="text-[10px] text-[#9667E0]/50 font-medium">
                            Cover Photo
                          </span>
                          <span className="text-xs text-[#9667E0]/40">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          setExpandedCover(isExpanded ? null : item.id)
                        }
                        className="text-xs px-3 py-1.5 bg-[#EEEAFD] text-[#4B2C82] rounded-lg hover:bg-[#D8CAF6] font-medium"
                      >
                        {isExpanded ? 'Hide' : 'Show'} Photos ({itemSubPhotos.length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Sub-Photos */}
                {isExpanded && (
                  <div className="border-t border-[#E0D4F5] p-4 bg-[#FDFBFE]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#2D164B]/70 uppercase tracking-widest">
                        Additional Photos
                      </span>
                      <SubPhotoUploadButton
                        parentId={item.id}
                        onSuccess={(msg) => {
                          setMessage({ type: 'success', text: msg });
                          refetch();
                        }}
                        onError={(msg) =>
                          setMessage({ type: 'error', text: msg })
                        }
                      />
                    </div>

                    {itemSubPhotos.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {itemSubPhotos.map((photo: any) => (
                          <div
                            key={photo.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-[#E0D4F5]"
                          >
                            <img
                              src={photo.image_url}
                              alt="Sub-photo"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/40 to-transparent">
                              <StatusBadge status={photo.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#2D164B]/40 italic text-center py-6">
                        No additional photos yet. Click "+ Add Photos" to upload.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🖼️"
          title="No uploads yet"
          description="Upload your first image to the gallery."
          action={{
            label: 'Upload Image',
            onClick: () => setShowUpload(true),
          }}
        />
      )}

      {/* Upload Modal — Cover Photo */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload to Gallery"
        size="md"
      >
        <GalleryUploadForm
          onSuccess={(msg) => {
            setShowUpload(false);
            setMessage({ type: 'success', text: msg });
            refetch();
          }}
          onError={(msg) => setMessage({ type: 'error', text: msg })}
        />
      </Modal>
    </div>
  );
}

/* ── Sub-Photo Upload Button ── */
function SubPhotoUploadButton({
  parentId,
  onSuccess,
  onError,
}: {
  parentId: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        failCount++;
        continue;
      }
      try {
        const uploadRes = await galleryService.uploadImage(file);
        await galleryService.upload({
          image_url: uploadRes.data.url,
          parent_id: parentId,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setUploading(false);
    e.target.value = '';

    if (successCount > 0) {
      onSuccess(
        `${successCount} photo${successCount > 1 ? 's' : ''} uploaded — pending approval${failCount > 0 ? `. ${failCount} failed.` : ''}`
      );
    } else {
      onError('All uploads failed. Please try again.');
    }
  };

  return (
    <label className="cursor-pointer text-xs px-3 py-1.5 bg-[#9667E0] text-white rounded-lg hover:bg-[#4B2C82] font-medium inline-flex items-center gap-1">
      {uploading ? (
        'Uploading...'
      ) : (
        <>
          + Add Photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </>
      )}
    </label>
  );
}

/* ── Cover Photo Upload Form ── */
function GalleryUploadForm({
  onSuccess,
  onError,
}: {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({ title: '', description: '', event_id: '' });

  // Fetch events for the dropdown
  const { data: events } = useApi<any[]>(() => eventService.getAll(), []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onError('Image must be under 5 MB');
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      onError('Please select a cover image');
      return;
    }
    if (!form.title.trim()) {
      onError('Please enter a title for the cover photo');
      return;
    }
    if (!form.description.trim()) {
      onError('Please enter a description');
      return;
    }

    try {
      setSaving(true);

      // Upload file to storage
      const uploadRes = await galleryService.uploadImage(imageFile);
      const imageUrl = uploadRes.data.url;

      // Save gallery record as cover photo
      const payload: Record<string, any> = {
        title: form.title,
        image_url: imageUrl,
        description: form.description,
        is_cover: true,
      };
      if (form.event_id) payload.event_id = form.event_id;

      await galleryService.upload(payload as any);
      onSuccess('Cover photo uploaded — pending admin approval. You can now add more photos from the expanded view.');
    } catch (error: any) {
      onError(error.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cover Image picker */}
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Cover Image *
        </label>

        {imagePreview ? (
          <div className="relative mb-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-56 object-contain rounded-lg border border-[#E0D4F5] bg-[#F5F1FE]"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 shadow-md"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#D8CAF6] rounded-xl p-6 text-center hover:border-[#9667E0] transition-colors">
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-[#2D164B]/70 mb-2">Select a cover photo from your device</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="w-full text-sm text-[#2D164B]/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EEEAFD] file:text-[#4B2C82] hover:file:bg-[#D8CAF6] cursor-pointer"
            />
            <p className="text-xs text-[#9667E0]/50 mt-2">JPEG, PNG, WebP, or GIF — max 5 MB</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. MySQL Workshop 2025"
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Description *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={2}
          placeholder="Brief description of the event/collection"
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Link to Event (Optional)
        </label>
        <select
          value={form.event_id}
          onChange={(e) => setForm((p) => ({ ...p, event_id: e.target.value }))}
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none bg-white"
        >
          <option value="">None (Standalone Album)</option>
          {events?.map((ev: any) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({new Date(ev.event_date).getFullYear()})
            </option>
          ))}
        </select>
        <p className="text-xs text-[#9667E0]/60 mt-1">
          Linking to an event will automatically feature this album on the event highlights page.
        </p>
      </div>

      <p className="text-xs text-[#9667E0]/60 italic">
        💡 After uploading the cover photo, you can add additional photos from the expanded view on the gallery page.
      </p>

      <div className="flex justify-end pt-4 border-t border-[#E0D4F5]">
        <button
          type="submit"
          disabled={saving || !imageFile}
          className="px-6 py-2.5 bg-[#9667E0] text-white rounded-xl hover:bg-[#4B2C82] disabled:opacity-50 font-medium"
        >
          {saving ? 'Uploading...' : 'Upload Cover Photo'}
        </button>
      </div>
    </form>
  );
}
