import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const result = await getAllEvents();
      if (result.success) {
        // Just show the first 3 for "Trending Now"
        setEvents(result.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-32 md:pb-32 px-6 lg:px-12 max-w-[1280px] mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="flex flex-col gap-6 z-10">
            <h1 className="font-[Montserrat] text-[40px] md:text-[64px] font-bold leading-tight tracking-tight text-[#fdfcfb]">
              Your Next <br />
              <span className="text-gradient">Experience Awaits</span>
            </h1>
            <p className="text-lg text-[#e8dcd8] max-w-md">
              Secure your passage to world-class events, exclusive VIP access, and unforgettable moments across the globe.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Link to="/events" className="btn-glow px-8 py-4 text-[16px]">
                Browse Events
              </Link>
              <Link to="/register" className="btn-ghost px-8 py-4 text-[16px]">
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Side: Generic Booking Graphic */}
          <div className="relative h-[400px] md:h-[500px] flex justify-center items-center">
            {/* Abstract background glow */}
            <div className="absolute inset-0 bg-[#d97706]/20 blur-[100px] rounded-full pointer-events-none animate-float"></div>
            
            <div className="glass-panel w-full max-w-md rounded-2xl relative p-8 glow-primary flex flex-col justify-between h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[#d97706]/30 z-10 animate-slide-up">
              <div className="text-center mb-6">
                <span className="material-symbols-outlined text-[64px] text-[#fcd34d] mb-4">event_available</span>
                <h3 className="font-[Montserrat] text-[28px] font-bold text-[#fdfcfb]">Unlock Experiences</h3>
                <p className="text-[#e8dcd8] mt-2">Your gateway to the best events in town.</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/10">
                  <span className="material-symbols-outlined text-[#fdba74]">confirmation_number</span>
                  <div>
                    <p className="text-sm text-[#fdfcfb] font-semibold">Instant Booking</p>
                    <p className="text-xs text-[#8c909f]">No waiting in line</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/10">
                  <span className="material-symbols-outlined text-[#ffb4ab]">security</span>
                  <div>
                    <p className="text-sm text-[#fdfcfb] font-semibold">Secure Checkout</p>
                    <p className="text-xs text-[#8c909f]">100% encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-6 lg:px-12 max-w-[1280px] mx-auto mb-24 relative z-20">
        <div className="glass-panel rounded-2xl p-8 flex flex-col md:flex-row justify-around items-center gap-8">
          <div className="text-center">
            <h4 className="font-[Montserrat] text-[32px] font-bold text-[#fcd34d]">10K+</h4>
            <p className="text-[14px] font-semibold text-[#e8dcd8] uppercase tracking-[0.05em] mt-1">Events</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10"></div>
          <div className="text-center">
            <h4 className="font-[Montserrat] text-[32px] font-bold text-[#fdba74]">50K+</h4>
            <p className="text-[14px] font-semibold text-[#e8dcd8] uppercase tracking-[0.05em] mt-1">Tickets</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10"></div>
          <div className="text-center">
            <h4 className="font-[Montserrat] text-[32px] font-bold text-[#fcd34d]">99%</h4>
            <p className="text-[14px] font-semibold text-[#e8dcd8] uppercase tracking-[0.05em] mt-1">Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="px-6 lg:px-12 max-w-[1280px] mx-auto mb-24">
        <h2 className="font-[Montserrat] text-[32px] font-bold text-[#fdfcfb] mb-8 flex items-center gap-2">
          Trending Now <span className="material-symbols-outlined text-[#ffb4ab]">local_fire_department</span>
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d97706]/20 border-t-[#d97706]"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-[#e8dcd8]">No trending events available right now.</p>
          </div>
        )}
        

        <div className="mt-8 text-center">
          <Link to="/events" className="btn-ghost px-6 py-3">View All Events</Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 lg:px-12 max-w-[1280px] mx-auto mb-24 md:mb-32">
        <h2 className="font-[Montserrat] text-[32px] font-bold text-center text-[#fdfcfb] mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-6 relative">
            <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 glow-primary border-[#d97706]/30 relative z-10">
              <span className="material-symbols-outlined text-[#fcd34d] text-4xl">search</span>
            </div>
            <h4 className="font-[Montserrat] text-[24px] font-semibold text-[#fdfcfb] mb-3">1. Find Your Event</h4>
            <p className="text-[16px] text-[#e8dcd8]">Browse our curated selection of premium experiences tailored to your tastes.</p>
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[62px] left-[60%] w-[80%] h-px bg-gradient-to-r from-[#fcd34d]/50 to-transparent"></div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-6 relative">
            <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 glow-accent border-[#d97706]/30 relative z-10">
              <span className="material-symbols-outlined text-[#fdba74] text-4xl">local_activity</span>
            </div>
            <h4 className="font-[Montserrat] text-[24px] font-semibold text-[#fdfcfb] mb-3">2. Book Your Ticket</h4>
            <p className="text-[16px] text-[#e8dcd8]">Securely purchase your passes with our encrypted, seamless checkout process.</p>
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[62px] left-[60%] w-[80%] h-px bg-gradient-to-r from-[#fdba74]/50 to-transparent"></div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 glow-primary border-[#d97706]/30 relative z-10">
              <span className="material-symbols-outlined text-[#fcd34d] text-4xl">celebration</span>
            </div>
            <h4 className="font-[Montserrat] text-[24px] font-semibold text-[#fdfcfb] mb-3">3. Enjoy the Show</h4>
            <p className="text-[16px] text-[#e8dcd8]">Present your digital ticket at the venue and immerse yourself in the experience.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 lg:px-12 max-w-[1280px] mx-auto mb-24">
        <div className="glass-panel rounded-3xl p-12 text-center relative overflow-hidden border-[#d97706]/20">
          <div className="absolute top-0 left-1/2 -transtone-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#d97706]/20 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
          <h2 className="font-[Montserrat] text-[40px] font-bold text-[#fdfcfb] mb-4 relative z-10">Ready for your next experience?</h2>
          <p className="text-lg text-[#e8dcd8] mb-8 max-w-2xl mx-auto relative z-10">Join thousands of others who trust BookIT for their premium entertainment needs.</p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            {user ? (
              <Link to="/events" className="btn-glow px-8 py-4 text-[16px]">
                Browse Events
              </Link>
            ) : (
              <Link to="/register" className="btn-glow px-8 py-4 text-[16px]">
                Create an Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
