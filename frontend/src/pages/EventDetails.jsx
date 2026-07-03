import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../services/eventService';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const result = await getEvent(id);
      if (result.success) {
        setEvent(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async (category) => {
    try {
      await api.post('/waitlists', {
        eventId: id,
        seatCategory: category
      });
      alert(`Successfully joined the waitlist for ${category} seats! You will be emailed if a seat becomes available.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join waitlist.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d97706]/20 border-t-[#d97706]"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-12 text-center animate-fade-in">
        <div className="glass-panel rounded-3xl p-12 max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-[64px] text-[#ffb4ab] mb-4">error</span>
          <h2 className="font-[Montserrat] text-[24px] font-bold text-[#fdfcfb] mb-4">Event Not Found</h2>
          <p className="text-[#e8dcd8] mb-8">{error || "We couldn't find the event you're looking for."}</p>
          <Link to="/events" className="btn-glow px-8 py-3">Back to Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      {/* Event Header Banner */}
      <div className="w-full h-[300px] md:h-[400px] relative bg-gradient-to-tr from-[#78350f]/40 to-[#3d261e]">
        {/* Abstract pattern placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <span className="material-symbols-outlined text-[120px] text-white">
            {event.category === 'MUSIC' ? 'music_note' : 
             event.category === 'SPORTS' ? 'sports_basketball' : 
             event.category === 'THEATER' ? 'theater_comedy' : 'event'}
          </span>
        </div>
        
        {/* Gradient overlay to blend with background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a100c]/50 to-[#1a100c]"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-6 lg:px-12 max-w-[1280px] mx-auto transform transtone-y-12">
          <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
            <div className="glass-panel p-8 rounded-3xl flex-grow z-10 border-[#d97706]/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="bg-[#d97706]/20 text-[#fcd34d] border border-[#d97706]/30 px-3 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wider">
                  {event.category || 'Event'}
                </span>
                <span className={`px-3 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wider border ${
                  event.status === 'PUBLISHED' ? 'bg-[#4d8eff]/10 text-[#fcd34d] border-[#4d8eff]/30' : 
                  event.status === 'DRAFT' ? 'bg-white/5 text-[#e8dcd8] border-white/10' : 
                  'bg-[#93000a]/20 text-[#ffb4ab] border-[#93000a]/30'
                }`}>
                  {event.status}
                </span>
              </div>
              <h1 className="font-[Montserrat] text-[32px] md:text-[48px] font-bold text-[#fdfcfb] leading-tight mb-2">
                {event.title}
              </h1>
              <p className="text-[#8c909f] text-[14px]">Organized by {event.organiserName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-24">
        <Link to="/events" className="inline-flex items-center gap-2 text-[#e8dcd8] hover:text-white transition-colors mb-8">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-[14px] font-medium">Back to Events</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel rounded-3xl p-8">
              <h2 className="font-[Montserrat] text-[24px] font-semibold text-[#fdfcfb] mb-6 border-b border-white/10 pb-4">
                About This Experience
              </h2>
              <div className="text-[16px] text-[#e8dcd8] leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8">
              <h2 className="font-[Montserrat] text-[24px] font-semibold text-[#fdfcfb] mb-6 border-b border-white/10 pb-4">
                Ticket Categories
              </h2>
              {event.prices && event.prices.length > 0 ? (
                <div className="space-y-4">
                  {event.prices.map((priceItem, index) => (
                    <div key={index} className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-[#3d261e]/50 hover:bg-[#3d261e] transition-colors">
                      <div>
                        <p className="font-semibold text-[#fdfcfb]">{priceItem.category}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-[Montserrat] font-bold text-[20px] text-[#fdba74]">${priceItem.price}</p>
                        {user && user.role === 'CUSTOMER' && (
                          <button 
                            onClick={() => handleJoinWaitlist(priceItem.category)} 
                            className="text-[12px] font-semibold text-[#fcd34d] hover:text-white hover:bg-[#d97706]/20 border border-[#fcd34d]/30 px-3 py-1.5 rounded-full transition-all"
                          >
                            Join Waitlist
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#e8dcd8]">Ticket information is currently unavailable.</p>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-panel rounded-3xl p-8 border-t border-[#d97706]/30">
              <h2 className="font-[Montserrat] text-[20px] font-semibold text-[#fdfcfb] mb-6">Event Details</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center shrink-0 text-[#fcd34d]">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#8c909f] uppercase tracking-wider font-semibold mb-1">Date</p>
                    <p className="text-[#fdfcfb] font-medium">{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center shrink-0 text-[#fcd34d]">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#8c909f] uppercase tracking-wider font-semibold mb-1">Time</p>
                    <p className="text-[#fdfcfb] font-medium">{event.eventTime}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center shrink-0 text-[#fdba74]">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#8c909f] uppercase tracking-wider font-semibold mb-1">Venue</p>
                    <p className="text-[#fdfcfb] font-medium">{event.venueName || 'To be announced'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                {!user ? (
                  <Link to="/login" state={{ from: window.location }} className="btn-glow w-full py-4 text-center block text-[16px]">
                    Sign in to Book
                  </Link>
                ) : user.role === 'CUSTOMER' ? (
                  <button 
                    onClick={() => navigate(`/events/${id}/seats`)}
                    className="btn-glow w-full py-4 text-[16px]"
                  >
                    Select Tickets
                  </button>
                ) : (
                  <div className="text-center p-4 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-[#8c909f] text-[14px]">
                      <span className="material-symbols-outlined align-middle mr-2 text-[18px]">info</span>
                      Organisers cannot book tickets
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
