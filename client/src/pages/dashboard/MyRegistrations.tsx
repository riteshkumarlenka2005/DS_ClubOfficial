import { useApi } from '../../hooks/useApi';
import { eventService } from '../../services/event.service';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export default function MyRegistrations() {
  const { data: registrations, isLoading } = useApi<any[]>(
    () => eventService.getMyRegistrations()
  );

  if (isLoading) return <LoadingSpinner message="Loading registrations..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-[#1A0B2E] mb-6">
        My Event Registrations
      </h1>

      {registrations && registrations.length > 0 ? (
        <div className="space-y-4">
          {registrations.map((reg: any) => {
            const event = reg.event;
            if (!event) return null;

            const isUpcoming = new Date(event.event_date) > new Date();

            return (
              <Link
                key={reg.id}
                to={`/events/${event.slug}`}
                className="block bg-white rounded-2xl border border-[#E0D4F5] p-5 hover:border-[#9667E0]/30 hover:shadow-lg hover:shadow-[#9667E0]/5 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {event.cover_image && (
                    <img
                      src={event.cover_image}
                      alt={event.title}
                      className="w-full sm:w-16 h-32 sm:h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A0B2E]">{event.title}</h3>
                    <p className="text-sm text-[#2D164B]/60">
                      📅{' '}
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {event.venue && (
                      <p className="text-sm text-[#2D164B]/60">📍 {event.venue}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 self-start sm:self-center ${
                      isUpcoming
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#EEEAFD] text-[#2D164B]'
                    }`}
                  >
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="No registrations"
          description="You haven't registered for any events yet."
        />
      )}
    </div>
  );
}

