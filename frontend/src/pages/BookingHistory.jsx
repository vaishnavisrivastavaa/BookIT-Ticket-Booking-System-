import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Ticket, ChevronRight, XCircle } from 'lucide-react';

export default function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data.data);
        } catch (err) {
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10 bg-red-50 p-6 rounded-xl border border-red-100 max-w-2xl mx-auto">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-stone-100">
                <Ticket className="mx-auto h-16 w-16 text-stone-300 mb-4" />
                <h2 className="text-2xl font-bold text-stone-900 mb-2">No Bookings Found</h2>
                <p className="text-stone-500 mb-8">You haven't booked any events yet. Discover amazing events and book your tickets today!</p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors">
                    Browse Events
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6 animate-fade-in">
            <h1 className="font-[Montserrat] text-[32px] md:text-[40px] font-bold text-[#fdfcfb] mb-8">My Bookings</h1>
            
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <Link 
                        key={booking.id} 
                        to={`/bookings/${booking.id}`}
                        className="block glass-panel rounded-2xl hover:glow-primary transition-all p-6 group"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4 flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-[Montserrat] text-xl font-bold text-[#fdfcfb] group-hover:text-[#fcd34d] transition-colors">
                                            {booking.eventTitle}
                                        </h3>
                                        <p className="text-sm text-[#8c909f] font-mono mt-1">Ref: {booking.bookingReference}</p>
                                    </div>
                                    
                                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${
                                        booking.status === 'CONFIRMED' 
                                        ? 'bg-[#4d8eff]/10 text-[#fcd34d] border-[#4d8eff]/30' 
                                        : 'bg-[#93000a]/20 text-[#ffb4ab] border-[#93000a]/30'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-[#e8dcd8]">
                                        <Calendar className="w-4 h-4 text-[#8c909f]" />
                                        <span className="text-sm">{new Date(booking.eventDate).toLocaleDateString()} at {new Date(booking.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#e8dcd8]">
                                        <MapPin className="w-4 h-4 text-[#8c909f]" />
                                        <span className="text-sm">{booking.venueName}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:flex-col md:justify-center md:items-end gap-4 md:border-l md:border-white/10 md:pl-6 min-w-[120px]">
                                <div className="text-[20px] font-bold text-[#fdba74]">${booking.totalAmount.toFixed(2)}</div>
                                <button className="btn-glow px-4 py-2 text-sm w-full md:w-auto text-center">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
