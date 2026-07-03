import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { Clock, CreditCard, ShieldCheck } from 'lucide-react';

export default function Checkout() {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [timeLeft, setTimeLeft] = useState(0);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');
    
    const selectedSeats = location.state?.selectedSeats || [];
    const holdExpiresAt = location.state?.holdExpiresAt;

    useEffect(() => {
        if (!selectedSeats.length || !holdExpiresAt) {
            navigate(`/events/${eventId}/seats`);
            return;
        }

        const expiryTime = new Date(holdExpiresAt).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = expiryTime - now;
            
            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                alert("Your seat hold has expired. Please select seats again.");
                navigate(`/events/${eventId}/seats`);
            } else {
                setTimeLeft(Math.floor(difference / 1000));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [holdExpiresAt, navigate, eventId, selectedSeats]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleCheckout = async () => {
        setBooking(true);
        setError('');
        
        try {
            const seatIds = selectedSeats.map(s => s.id);
            const response = await api.post('/bookings', {
                eventId: eventId,
                seatIds: seatIds
            });
            
            navigate(`/booking-success/${response.data.data.bookingReference}`, {
                state: { bookingData: response.data.data }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process booking.');
            setBooking(false);
        }
    };

    const handleCancel = async () => {
        try {
            const seatIds = selectedSeats.map(s => s.id);
            await api.post('/seats/release', {
                eventId: eventId,
                seatIds: seatIds
            });
        } catch (e) {
            console.error(e);
        } finally {
            navigate(`/events/${eventId}/seats`);
        }
    };

    if (!selectedSeats.length) return null;

    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <Clock className="text-yellow-600 h-6 w-6" />
                    <div>
                        <h3 className="font-semibold text-yellow-800">Seats Held</h3>
                        <p className="text-sm text-yellow-700">Please complete your purchase before the timer runs out.</p>
                    </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600 font-mono tracking-wider bg-white px-4 py-2 rounded-lg shadow-sm">
                    {formatTime(timeLeft)}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h2 className="text-xl font-bold text-stone-900 mb-6 border-b pb-4">Order Summary</h2>
                    
                    <div className="space-y-4">
                        {selectedSeats.map(seat => (
                            <div key={seat.id} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                                <div>
                                    <p className="font-medium text-stone-900">Seat {seat.seatLabel}</p>
                                    <p className="text-xs text-stone-500 capitalize">{seat.category.toLowerCase()}</p>
                                </div>
                                <span className="font-medium text-stone-900">${seat.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-stone-200 flex justify-between items-center">
                        <span className="text-lg font-bold text-stone-900">Total Amount</span>
                        <span className="text-2xl font-bold text-amber-600">${totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Details (Mock) */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 h-fit">
                    <h2 className="text-xl font-bold text-stone-900 mb-6 border-b pb-4">Payment Information</h2>
                    
                    <div className="space-y-4">
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex gap-4 items-start">
                            <ShieldCheck className="text-green-500 w-6 h-6 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-medium text-stone-900">Secure Checkout</h4>
                                <p className="text-sm text-stone-500 mt-1">This is a mock checkout for Phase 2. No real payment will be processed. Clicking "Confirm Booking" will finalize your seats and send an email with your QR ticket.</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                onClick={handleCheckout}
                                disabled={booking}
                                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {booking ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <CreditCard className="w-5 h-5" />
                                )}
                                {booking ? 'Processing...' : `Pay $${totalAmount.toFixed(2)} & Confirm`}
                            </button>
                            
                            <button
                                onClick={handleCancel}
                                disabled={booking}
                                className="w-full py-3 text-stone-500 hover:text-stone-700 font-medium transition-colors"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
