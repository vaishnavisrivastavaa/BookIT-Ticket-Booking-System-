import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ORGANISER' || user?.role === 'ADMIN') {
      fetchStats();
    } else if (user?.role === 'CUSTOMER') {
      fetchBookings();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d97706]/20 border-t-[#d97706]"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-6 lg:px-12 max-w-[1280px] mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-[Montserrat] text-[32px] font-bold text-[#fdfcfb]">Dashboard</h1>
        <div className="flex gap-4">
          {(user?.role === 'ORGANISER' || user?.role === 'ADMIN') && (
            <button onClick={() => window.location.href = '/manage-events'} className="btn-glow px-6 py-2 text-sm">
              + Create Event
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button onClick={() => window.location.href = '/create-venue'} className="btn-ghost px-6 py-2 text-sm">
              + Create Venue
            </button>
          )}
        </div>
      </div>
      
      {/* Organiser/Admin View */}
      {(user?.role === 'ORGANISER' || user?.role === 'ADMIN') && stats && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-[#e8dcd8] text-[12px] uppercase tracking-wider mb-2 font-semibold">Total Revenue</p>
              <h3 className="text-[28px] font-bold text-[#fdba74]">${stats.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-[#e8dcd8] text-[12px] uppercase tracking-wider mb-2 font-semibold">Bookings</p>
              <h3 className="text-[28px] font-bold text-[#fcd34d]">{stats.totalBookings}</h3>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-[#e8dcd8] text-[12px] uppercase tracking-wider mb-2 font-semibold">Waitlist</p>
              <h3 className="text-[28px] font-bold text-[#ffb4ab]">{stats.totalWaitlisted || 0}</h3>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-[#e8dcd8] text-[12px] uppercase tracking-wider mb-2 font-semibold">Events</p>
              <h3 className="text-[28px] font-bold text-[#fcd34d]">{stats.totalEvents}</h3>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="text-[#e8dcd8] text-[12px] uppercase tracking-wider mb-2 font-semibold">Users</p>
              <h3 className="text-[28px] font-bold text-[#fcd34d]">{stats.totalUsers}</h3>
            </div>
          </div>
          
          <h2 className="font-[Montserrat] text-[24px] font-bold text-[#fdfcfb] mb-4">Recent Bookings</h2>
          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#ffffff05]">
                  <th className="p-4 text-[#e8dcd8] font-medium">User</th>
                  <th className="p-4 text-[#e8dcd8] font-medium">Event</th>
                  <th className="p-4 text-[#e8dcd8] font-medium">Amount</th>
                  <th className="p-4 text-[#e8dcd8] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-[#ffffff05] transition-colors">
                    <td className="p-4 text-[#fdfcfb]">{b.user}</td>
                    <td className="p-4 text-[#fdfcfb]">{b.event}</td>
                    <td className="p-4 text-[#fdba74] font-semibold">${b.amount}</td>
                    <td className="p-4 text-[#e8dcd8]">{new Date(b.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {stats.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-[#e8dcd8]">No recent bookings</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer View */}
      {user?.role === 'CUSTOMER' && (
        <div>
          <h2 className="font-[Montserrat] text-[24px] font-bold text-[#fdfcfb] mb-4">My Bookings</h2>
          {bookings.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center text-[#e8dcd8]">
              You haven't booked any events yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((b) => (
                <div key={b.id} className="glass-panel rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-[Montserrat] text-[20px] font-bold text-[#fdfcfb]">{b.eventTitle}</h3>
                    <p className="text-[#fcd34d]">{b.venueName}</p>
                    <p className="text-sm text-[#e8dcd8] mt-2">
                      {new Date(b.eventDate).toLocaleDateString()} at {new Date(b.eventTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {b.seats.map((s, idx) => (
                        <span key={idx} className="bg-[#2b1b15]/80 border border-white/10 px-3 py-1 rounded-full text-xs text-[#fdba74]">
                          {s.category} - {s.seatLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                    <p className="text-sm text-[#e8dcd8] mb-1">Total Paid</p>
                    <p className="text-[24px] font-bold text-[#fdba74]">${b.totalAmount}</p>
                    <p className={`text-sm mt-1 font-semibold ${b.status === 'CONFIRMED' ? 'text-green-400' : 'text-red-400'}`}>
                      {b.status}
                    </p>
                    {b.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancel(b.id)}
                        className="mt-4 btn-ghost px-4 py-2 text-sm border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
