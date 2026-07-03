import { useState, useEffect } from 'react';
import { getAllEvents } from '../services/eventService';
import EventCard from '../components/EventCard';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const result = await getAllEvents();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 animate-fade-in">
      <div className="mb-12">
        <h1 className="font-[Montserrat] text-[40px] md:text-[48px] font-bold text-[#fdfcfb] mb-4">
          Discover Events
        </h1>
        <p className="text-[18px] text-[#e8dcd8] max-w-2xl">
          Explore our curated collection of premium experiences. From exclusive galas to electrifying festivals, your next unforgettable moment is waiting.
        </p>
      </div>

      {error && (
        <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">error</span>
          <p className="text-[14px] text-[#ffdad6]">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d97706]/20 border-t-[#d97706]"></div>
        </div>
      ) : events.length === 0 && !error ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <span className="material-symbols-outlined text-[64px] text-[#8c909f] mb-4">event_busy</span>
          <h2 className="font-[Montserrat] text-[24px] font-semibold text-[#fdfcfb] mb-2">No Events Found</h2>
          <p className="text-[#e8dcd8]">Check back later for new and upcoming premium experiences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
