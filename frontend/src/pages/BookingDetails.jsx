import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Ticket, CreditCard, ArrowLeft, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            const response = await api.get(`/bookings/${id}`);
            setBooking(response.data.data);
        } catch (err) {
            setError('Failed to load booking details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
            return;
        }
        
        setCancelling(true);
        try {
            await api.delete(`/bookings/${id}`);
            alert("Booking cancelled successfully.");
            fetchBookingDetails(); // Refresh details to show cancelled status
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel booking.");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="text-center mt-10">
                <p className="text-[#ffb4ab]">{error || "Booking not found"}</p>
                <Link to="/bookings" className="text-[#fcd34d] hover:text-white transition-colors mt-4 inline-block">Back to My Bookings</Link>
            </div>
        );
    }

    const eventDate = new Date(booking.eventDate);
    const isPastEvent = eventDate < new Date();
    const canCancel = booking.status === 'CONFIRMED' && !isPastEvent;

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-8 animate-fade-in pb-12">
            <Link to="/bookings" className="inline-flex items-center text-[#e8dcd8] hover:text-[#fcd34d] font-medium transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Bookings
            </Link>

            <div className="glass-panel rounded-3xl overflow-hidden">
                {/* Header */}
                <div className={`p-6 sm:p-8 ${booking.status === 'CONFIRMED' ? 'bg-[#d97706]/20 border-b border-[#d97706]/30' : 'bg-white/5 border-b border-white/10'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider mb-4 border ${
                                booking.status === 'CONFIRMED' ? 'bg-[#4d8eff]/10 text-[#fcd34d] border-[#4d8eff]/30' : 'bg-[#93000a]/20 text-[#ffb4ab] border-[#93000a]/30'
                            }`}>
                                {booking.status}
                            </span>
                            <h1 className="font-[Montserrat] text-[32px] font-bold text-[#fdfcfb]">{booking.eventTitle}</h1>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-[#8c909f] text-[12px] uppercase tracking-wider mb-1">Booking Ref</p>
                            <p className="text-[20px] font-mono font-bold text-[#fdba74]">{booking.bookingReference}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-8">
                    {/* Event & Venue Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center shrink-0">
                                <Calendar className="w-6 h-6 text-[#fcd34d]" />
                            </div>
                            <div>
                                <h3 className="font-[Montserrat] font-semibold text-[#fdfcfb] mb-1">Date & Time</h3>
                                <p className="text-[#e8dcd8]">{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-[#e8dcd8]">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6 text-[#fdba74]" />
                            </div>
                            <div>
                                <h3 className="font-[Montserrat] font-semibold text-[#fdfcfb] mb-1">Venue</h3>
                                <p className="text-[#e8dcd8]">{booking.venueName}</p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/10" />

                    {/* Customer & Payment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-[Montserrat] text-lg font-bold text-[#fdfcfb] mb-4">Customer Details</h3>
                            <p className="text-[#e8dcd8]"><span className="font-medium text-[#fdfcfb]">Name:</span> {booking.customerName}</p>
                            <p className="text-[#e8dcd8]"><span className="font-medium text-[#fdfcfb]">Email:</span> {booking.customerEmail}</p>
                            <p className="text-[#e8dcd8]"><span className="font-medium text-[#fdfcfb]">Booked On:</span> {new Date(booking.bookingTime).toLocaleString()}</p>
                        </div>
                        <div className="bg-[#3d261e]/50 p-6 rounded-xl border border-white/5">
                            <h3 className="font-[Montserrat] text-lg font-bold text-[#fdfcfb] mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#8ce196]" /> Payment Summary
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[#e8dcd8]">Total Seats ({booking.seats.length})</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/10 mt-4 pt-4">
                                <span className="font-bold text-[#fdfcfb]">Total Paid</span>
                                <span className="text-2xl font-bold text-[#fdba74]">${booking.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/10" />

                    {/* Seat Details */}
                    <div>
                        <h3 className="font-[Montserrat] text-lg font-bold text-[#fdfcfb] mb-4 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-[#fcd34d]" /> Seat Details
                        </h3>
                        <div className="bg-[#3d261e]/50 border border-white/5 rounded-xl overflow-hidden">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-[#1a100c]/80">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#8c909f] uppercase tracking-wider">Seat Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#8c909f] uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[#8c909f] uppercase tracking-wider">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {booking.seats.map((seat, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#fdfcfb]">{seat.seatLabel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#e8dcd8] capitalize">{seat.category.toLowerCase()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#fdba74] font-medium text-right">${seat.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Cancellation Action */}
                    {canCancel && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h4 className="text-[#ffb4ab] font-bold flex items-center gap-2 mb-1">
                                        <AlertTriangle className="w-5 h-5" /> Cancel Booking
                                    </h4>
                                    <p className="text-[#ffdad6] text-sm">Need to change your plans? You can cancel your booking and release these seats.</p>
                                </div>
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={cancelling}
                                    className="shrink-0 px-6 py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-[#ffb4ab]/20"
                                >
                                    {cancelling ? 'Cancelling...' : <><Trash2 className="w-4 h-4" /> Cancel Tickets</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
