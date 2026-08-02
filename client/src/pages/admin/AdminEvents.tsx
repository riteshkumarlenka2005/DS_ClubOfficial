import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { eventService } from '../../services/event.service';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminEvents() {
  const { data: events, isLoading, refetch } = useApi<any[]>(
    () => eventService.getAll()
  );
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [actionEvent, setActionEvent] = useState<{ id: string; title: string; action: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const performAction = async () => {
    if (!actionEvent) return;
    try {
      setProcessing(true);
      switch (actionEvent.action) {
        case 'publish':
          await eventService.publish(actionEvent.id);
          break;
        case 'unpublish':
          await eventService.unpublish(actionEvent.id);
          break;
        case 'cancel':
          await eventService.cancel(actionEvent.id);
          break;
        case 'delete':
          await eventService.deleteEvent(actionEvent.id);
          break;
      }
      setMessage({
        type: 'success',
        text: `Event "${actionEvent.title}" ${actionEvent.action}ed successfully`,
      });
      setActionEvent(null);
      refetch();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to ${actionEvent.action} event`,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading events..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#1A0B2E] mb-6">All Events</h1>

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

      <div className="space-y-4">
        {events?.map((event: any) => (
          <div key={event.id} className="bg-white rounded-2xl border border-[#E0D4F5] p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#1A0B2E]">{event.title}</h3>
                  <StatusBadge status={event.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#2D164B]/50">
                  <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                  {event.venue && <span>📍 {event.venue}</span>}
                  <span>By: {event.creator?.full_name}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {event.publish_status === 'draft' && (
                  <button
                    onClick={() =>
                      setActionEvent({ id: event.id, title: event.title, action: 'publish' })
                    }
                    className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    Publish
                  </button>
                )}
                {event.publish_status === 'published' && (
                  <>
                    <button
                      onClick={() =>
                        setActionEvent({ id: event.id, title: event.title, action: 'unpublish' })
                      }
                      className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
                    >
                      Unpublish
                    </button>
                    <button
                      onClick={() =>
                        setActionEvent({ id: event.id, title: event.title, action: 'cancel' })
                      }
                      className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    setActionEvent({ id: event.id, title: event.title, action: 'delete' })
                  }
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!actionEvent}
        onClose={() => setActionEvent(null)}
        onConfirm={performAction}
        title={`${actionEvent?.action?.charAt(0).toUpperCase()}${actionEvent?.action?.slice(1)} Event`}
        message={`Are you sure you want to ${actionEvent?.action} "${actionEvent?.title}"?`}
        confirmLabel={actionEvent?.action ? actionEvent.action.charAt(0).toUpperCase() + actionEvent.action.slice(1) : ''}
        confirmColor={actionEvent?.action === 'delete' || actionEvent?.action === 'cancel' ? 'red' : 'green'}
        isLoading={processing}
      />
    </div>
  );
}

