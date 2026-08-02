import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { eventService } from '../../services/event.service';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';

export default function MyEvents() {
  const { data: events, isLoading, error, refetch } = useApi<any[]>(
    () => eventService.getAll()
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  if (isLoading) return <LoadingSpinner message="Loading events..." />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#1A0B2E]">My Events</h1>
          <p className="text-sm text-[#2D164B]/60">Create and manage event drafts</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowCreate(true);
          }}
          className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-xl hover:bg-[#4B2C82] transition w-full sm:w-auto"
        >
          + Create Event
        </button>
      </div>

      {/* Message */}
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

      {/* Events List */}
      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event: any) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-[#E0D4F5] p-5 hover:border-[#9667E0]/30 hover:shadow-lg hover:shadow-[#9667E0]/5 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#1A0B2E]">
                      {event.title}
                    </h3>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="text-sm text-[#2D164B]/70 mb-3 line-clamp-2">
                    {event.short_description || event.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#2D164B]/50">
                    <span>
                      📅{' '}
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {event.venue && <span>📍 {event.venue}</span>}
                    <span>
                      Created{' '}
                      {new Date(event.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setShowCreate(true);
                    }}
                    className="px-3 py-1.5 text-xs bg-[#EEEAFD] text-[#2D164B] rounded-lg hover:bg-[#D8CAF6]"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title="No events yet"
          description="Create your first event draft. An admin will review and publish it."
          action={{ label: 'Create Event', onClick: () => setShowCreate(true) }}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Edit Event' : 'Create Event Draft'}
        size="lg"
      >
        <EventForm
          event={editingEvent}
          onSuccess={(msg) => {
            setShowCreate(false);
            setEditingEvent(null);
            setMessage({ type: 'success', text: msg });
            refetch();
          }}
          onError={(msg) => setMessage({ type: 'error', text: msg })}
        />
      </Modal>
    </div>
  );
}

import { eventHighlightService } from '../../services/eventHighlight.service';

// ============================================
// EVENT FORM COMPONENT
// ============================================
function EventForm({
  event,
  onSuccess,
  onError,
}: {
  event?: any;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(event?.image_url || '');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'highlights'>('details');
  const [eventType, setEventType] = useState<'upcoming' | 'past'>(
    event?.status === 'completed' ? 'past' : 'upcoming'
  );
  
  // Highlight state
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [highlightsForm, setHighlightsForm] = useState({
    summary: '',
    key_takeaways: '',
    testimonial_text: '',
    testimonial_author: '',
  });

  // Fetch highlights if editing a past event
  useEffect(() => {
    if (event && event.status === 'completed') {
      eventHighlightService.getByEventId(event.id).then(res => {
        if (res.data) {
          setHighlightId(res.data.id);
          setHighlightsForm({
            summary: res.data.summary || '',
            key_takeaways: res.data.key_takeaways?.join('\n') || '',
            testimonial_text: res.data.testimonial_text || '',
            testimonial_author: res.data.testimonial_author || '',
          });
        }
      }).catch(() => { /* No highlights exist yet */ });
    }
  }, [event]);
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    short_description: event?.short_description || '',
    event_date: event?.event_date
      ? new Date(event.event_date).toISOString().slice(0, 16)
      : '',
    end_date: event?.end_date
      ? new Date(event.end_date).toISOString().slice(0, 16)
      : '',
    venue: event?.venue || '',
    cover_image: event?.cover_image || '',
    max_participants: event?.max_participants?.toString() || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.event_date) {
      onError('Title, description, and event date are required');
      return;
    }

    // Client-side date validation based on event type
    const eventDateObj = new Date(form.event_date);
    const now = new Date();
    if (eventType === 'past') {
      if (eventDateObj >= now) {
        onError('For a past event, the event date must be in the past');
        return;
      }
      if (form.end_date && new Date(form.end_date) >= now) {
        onError('For a past event, the end date must also be in the past');
        return;
      }
    } else {
      if (eventDateObj < now) {
        onError('For an upcoming event, the event date must be in the future');
        return;
      }
    }

    try {
      setSaving(true);

      // Upload cover image first if a new file was selected
      let imageUrl = form.cover_image;
      if (coverFile) {
        try {
          setUploading(true);
          const uploadRes = await eventService.uploadCoverImage(coverFile);
          imageUrl = uploadRes.data.url;
        } catch {
          onError('Failed to upload cover image');
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload: Record<string, any> = {
        title: form.title,
        description: form.description,
        event_date: new Date(form.event_date).toISOString(),
      };

      if (form.short_description) payload.short_description = form.short_description;
      if (form.end_date) payload.end_date = new Date(form.end_date).toISOString();
      if (form.venue) payload.venue = form.venue;
      if (imageUrl) payload.cover_image = imageUrl;
      if (form.max_participants)
        payload.max_participants = parseInt(form.max_participants);
      if (!event) {
        payload.event_type = eventType;
      }

      if (event) {
        await eventService.update(event.id, payload);
        
        // Save highlights if editing a past event
        if (eventType === 'past' && highlightsForm.summary.trim()) {
          const highlightPayload = {
            event_id: event.id,
            summary: highlightsForm.summary,
            stats: [], // We can leave stats empty for now or add fields later
            key_takeaways: highlightsForm.key_takeaways.split('\n').filter(k => k.trim() !== ''),
            testimonial_text: highlightsForm.testimonial_text,
            testimonial_author: highlightsForm.testimonial_author,
          };
          if (highlightId) {
            await eventHighlightService.update(highlightId, highlightPayload);
          } else {
            await eventHighlightService.create(highlightPayload);
          }
        }
        
        onSuccess('Event and highlights updated successfully');
      } else {
        await eventService.create(payload as any);
        onSuccess('Event draft created — pending admin review');
      }
    } catch (error: any) {
      onError(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tabs for past events */}
      {eventType === 'past' && (
        <div className="flex gap-2 mb-4 border-b border-[#E0D4F5] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'details' ? 'bg-[#9667E0] text-white' : 'text-[#2D164B] hover:bg-[#EEEAFD]'
            }`}
          >
            Event Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('highlights')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'highlights' ? 'bg-[#9667E0] text-white' : 'text-[#2D164B] hover:bg-[#EEEAFD]'
            }`}
          >
            Highlights
          </button>
        </div>
      )}

      {/* Event Details Tab */}
      <div className={activeTab === 'details' ? 'block space-y-4' : 'hidden'}>
        {/* Event Type Toggle (only for new events) */}
        {!event && (
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-2">
            Event Type *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEventType('upcoming')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                eventType === 'upcoming'
                  ? 'bg-[#9667E0] text-white shadow-lg'
                  : 'bg-[#EEEAFD] text-[#4B2C82] border border-[#D8CAF6] hover:bg-[#D8CAF6]'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setEventType('past')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                eventType === 'past'
                  ? 'bg-[#4B2C82] text-white shadow-lg'
                  : 'bg-[#EEEAFD] text-[#4B2C82] border border-[#D8CAF6] hover:bg-[#D8CAF6]'
              }`}
            >
              Past
            </button>
          </div>
          <p className="text-xs text-[#9667E0]/60 mt-1.5">
            {eventType === 'past'
              ? '📅 All dates must be in the past'
              : '📅 Event date must be in the future'}
          </p>
        </div>
      )}
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
          Short Description
        </label>
        <input
          type="text"
          name="short_description"
          value={form.short_description}
          onChange={handleChange}
          placeholder="Brief summary for event cards"
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Full Description *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-1">
            Event Date & Time *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={form.event_date.slice(0, 10)}
              onChange={(e) => {
                const time = form.event_date.slice(11, 16) || '00:00';
                setForm((prev) => ({ ...prev, event_date: `${e.target.value}T${time}` }));
              }}
              required
              className="w-full px-3 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none text-sm"
            />
            <input
              type="time"
              value={form.event_date.slice(11, 16)}
              onChange={(e) => {
                const date = form.event_date.slice(0, 10) || new Date().toISOString().slice(0, 10);
                setForm((prev) => ({ ...prev, event_date: `${date}T${e.target.value}` }));
              }}
              required
              className="w-full px-3 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-1">
            End Date & Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={form.end_date.slice(0, 10)}
              onChange={(e) => {
                const time = form.end_date.slice(11, 16) || '00:00';
                setForm((prev) => ({ ...prev, end_date: `${e.target.value}T${time}` }));
              }}
              className="w-full px-3 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none text-sm"
            />
            <input
              type="time"
              value={form.end_date.slice(11, 16)}
              onChange={(e) => {
                const date = form.end_date.slice(0, 10) || new Date().toISOString().slice(0, 10);
                setForm((prev) => ({ ...prev, end_date: `${date}T${e.target.value}` }));
              }}
              className="w-full px-3 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-1">
            Location
          </label>
          <input
            type="text"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="e.g. Seminar Hall 1"
            className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2D164B] mb-1">
            Max Participants
          </label>
          <input
            type="number"
            name="max_participants"
            value={form.max_participants}
            onChange={handleChange}
            placeholder="Leave empty for unlimited"
            min="1"
            className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2D164B] mb-1">
          Cover Image
        </label>

        {/* Preview */}
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
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* File picker */}
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
        <p className="text-xs text-[#9667E0]/50 mt-1">JPEG, PNG, WebP, or GIF — max 5 MB</p>
      </div>

      </div>

      {/* Highlights Tab */}
      {eventType === 'past' && (
        <div className={activeTab === 'highlights' ? 'block space-y-4' : 'hidden'}>
          <div>
            <label className="block text-sm font-medium text-[#2D164B] mb-1">
              Highlights Summary
            </label>
            <textarea
              value={highlightsForm.summary}
              onChange={(e) => setHighlightsForm(p => ({ ...p, summary: e.target.value }))}
              rows={4}
              placeholder="Write a summary of how the event went..."
              className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D164B] mb-1">
              Key Takeaways (One per line)
            </label>
            <textarea
              value={highlightsForm.key_takeaways}
              onChange={(e) => setHighlightsForm(p => ({ ...p, key_takeaways: e.target.value }))}
              rows={4}
              placeholder="- Learned about Neural Networks&#10;- Built a sentiment analysis model"
              className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none resize-none"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D164B] mb-1">
                Testimonial Text
              </label>
              <textarea
                value={highlightsForm.testimonial_text}
                onChange={(e) => setHighlightsForm(p => ({ ...p, testimonial_text: e.target.value }))}
                rows={2}
                placeholder='"The best workshop ever!"'
                className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D164B] mb-1">
                Testimonial Author
              </label>
              <input
                type="text"
                value={highlightsForm.testimonial_author}
                onChange={(e) => setHighlightsForm(p => ({ ...p, testimonial_author: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] focus:border-transparent outline-none mt-2"
              />
            </div>
          </div>
          <p className="text-xs text-[#9667E0]/60 italic">
            Note: To add photos or videos to highlights, link an album from the Gallery or a Video from Blogs to this event alias.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D4F5]">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2.5 bg-[#9667E0] text-white rounded-xl hover:bg-[#4B2C82] disabled:opacity-50 font-medium"
        >
          {uploading ? 'Uploading image...' : saving ? 'Saving...' : event ? 'Update Event' : 'Create Draft'}
        </button>
      </div>
    </form>
  );
}

