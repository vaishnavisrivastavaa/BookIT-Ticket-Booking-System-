import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const minPrice = event.prices?.length > 0 
    ? Math.min(...event.prices.map(p => p.price)) 
    : 0;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden group transition-all duration-300 hover:glow-primary hover:-transtone-y-2 flex flex-col h-full">
      <div className="h-48 relative overflow-hidden bg-gradient-to-tr from-[#78350f]/40 to-[#3d261e]">
        {/* Abstract pattern placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-[80px] text-white">
            {event.category === 'MUSIC' ? 'music_note' : 
             event.category === 'SPORTS' ? 'sports_basketball' : 
             event.category === 'THEATER' ? 'theater_comedy' : 'event'}
          </span>
        </div>
        
        {/* Status Badge */}
        {event.status && (
          <div className="absolute top-4 right-4 bg-[#2b1b15]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className={`text-[12px] font-medium ${
              event.status === 'PUBLISHED' ? 'text-[#fcd34d]' : 
              event.status === 'DRAFT' ? 'text-[#e8dcd8]' : 'text-[#ffb4ab]'
            }`}>
              {event.status}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-[Montserrat] text-[20px] font-semibold text-[#fdfcfb] mb-3 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-6 flex-grow">
          <div className="flex items-center gap-2 text-[#e8dcd8]">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span className="text-[14px]">
              {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
            </span>
          </div>
          
          {event.venueName && (
            <div className="flex items-center gap-2 text-[#e8dcd8]">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span className="text-[14px] line-clamp-1">{event.venueName}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
          {minPrice > 0 ? (
            <span className="text-[14px] font-semibold text-[#fdba74]">From ${minPrice}</span>
          ) : (
            <span className="text-[14px] font-semibold text-[#e8dcd8]">Price TBD</span>
          )}
          
          <Link to={`/events/${event.id}`} className="flex items-center gap-1 text-[#fcd34d] hover:text-white transition-colors group/btn">
            <span className="text-[14px] font-medium">View Details</span>
            <span className="material-symbols-outlined text-[18px] transform transition-transform group-hover/btn:transtone-x-1">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
