import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';

export default function SeatSelection() {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    
    const [event, setEvent] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [holding, setHolding] = useState(false);
    
    const stompClientRef = useRef(null);

    useEffect(() => {
        fetchEventDetails();
        fetchSeats();
        connectWebSocket();
        
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            const response = await api.get(`/events/${eventId}`);
            setEvent(response.data.data);
        } catch (err) {
            setError('Failed to load event details.');
        }
    };

    const fetchSeats = async () => {
        try {
            const response = await api.get(`/events/${eventId}/seats`);
            setSeats(response.data.data);
        } catch (err) {
            setError('Failed to load seats.');
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            debug: (str) => {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            client.subscribe(`/topic/events/${eventId}/seats`, (message) => {
                const update = JSON.parse(message.body);
                setSeats((prevSeats) =>
                    prevSeats.map((seat) =>
                        seat.id === update.seatId ? { ...seat, status: update.status } : seat
                    )
                );
                
                if (update.status !== 'AVAILABLE' && update.status !== 'HELD') {
                    setSelectedSeats((prev) => prev.filter(id => id !== update.seatId));
                }
            });
        };

        client.activate();
        stompClientRef.current = client;
    };

    const toggleSeatSelection = (seat) => {
        if (seat.status === 'BOOKED' || (seat.status === 'HELD' && !selectedSeats.includes(seat.id))) {
            return;
        }
        
        if (selectedSeats.includes(seat.id)) {
            setSelectedSeats(selectedSeats.filter((id) => id !== seat.id));
        } else {
            if (selectedSeats.length >= 10) {
                alert('You can only select up to 10 seats per booking.');
                return;
            }
            setSelectedSeats([...selectedSeats, seat.id]);
        }
    };

    const handleHoldSeats = async () => {
        if (selectedSeats.length === 0) return;
        
        setHolding(true);
        setError('');
        
        try {
            const response = await api.post('/seats/hold', {
                eventId: eventId,
                seatIds: selectedSeats
            });
            
            navigate(`/checkout/${eventId}`, { 
                state: { 
                    selectedSeats: seats.filter(s => selectedSeats.includes(s.id)).map(s => ({ ...s, price: getSeatPrice(s.category) })),
                    holdExpiresAt: response.data.data.holdExpiresAt
                } 
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to hold seats. Someone might have just taken them.');
            fetchSeats();
        } finally {
            setHolding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    const rows = {};
    seats.forEach(seat => {
        if (!rows[seat.rowNumber]) rows[seat.rowNumber] = [];
        rows[seat.rowNumber].push(seat);
    });
    
    const sortedRows = Object.keys(rows).sort();
    sortedRows.forEach(row => {
        rows[row].sort((a, b) => a.seatNumber - b.seatNumber);
    });

    const getSeatStyle = (seat) => {
        if (selectedSeats.includes(seat.id)) return 'bg-amber-600 text-white shadow-md shadow-amber-600/40 border-amber-700 scale-110 z-10';
        if (seat.status === 'BOOKED') return 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60';
        if (seat.status === 'HELD') return 'bg-amber-400 text-white border-amber-500 cursor-not-allowed shadow-inner opacity-80';
        return 'bg-white hover:bg-amber-50 text-stone-700 border-stone-300 hover:border-amber-400 hover:shadow-sm cursor-pointer hover:scale-105';
    };

    const getSeatPrice = (category) => {
        if (!event || !event.prices) return 0;
        const priceObj = event.prices.find(p => p.category === category);
        return priceObj ? priceObj.price : 0;
    };

    const totalPrice = seats
        .filter(s => selectedSeats.includes(s.id))
        .reduce((sum, s) => sum + getSeatPrice(s.category), 0);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-32">
            <Link to={`/events/${eventId}`} className="inline-flex items-center text-stone-500 hover:text-amber-600 font-medium mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12 relative overflow-hidden">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-3 tracking-tight">Select Your Seats</h1>
                    <p className="text-lg text-stone-500 font-medium">{event?.title} <span className="mx-2">•</span> {event?.venueName}</p>
                </div>
                
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center shadow-sm">
                        <AlertCircle className="text-red-500 mr-3 h-6 w-6 shrink-0" />
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}
                
                {/* Legend */}
                <div className="flex flex-wrap gap-6 mb-12 justify-center bg-stone-50 py-4 px-6 rounded-2xl border border-stone-100 max-w-fit mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-t-lg bg-white border-2 border-stone-300 shadow-sm"></div>
                        <span className="text-sm font-semibold text-stone-600 tracking-wide uppercase">Available</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-t-lg bg-amber-600 border-2 border-amber-700 shadow-sm shadow-amber-600/40"></div>
                        <span className="text-sm font-semibold text-stone-600 tracking-wide uppercase">Selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-t-lg bg-amber-400 border-2 border-amber-500 shadow-inner"></div>
                        <span className="text-sm font-semibold text-stone-600 tracking-wide uppercase">Held</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-t-lg bg-stone-200 border-2 border-stone-300 opacity-60"></div>
                        <span className="text-sm font-semibold text-stone-600 tracking-wide uppercase">Booked</span>
                    </div>
                </div>

                {/* Seat Map */}
                <div className="overflow-x-auto pb-10 custom-scrollbar">
                    <div className="min-w-[700px] flex flex-col items-center gap-5 pt-8">
                        {/* Stage */}
                        <div className="w-3/4 max-w-2xl h-16 bg-gradient-to-b from-amber-100 to-transparent rounded-t-full mb-16 flex items-center justify-center border-t border-amber-200">
                            <span className="text-amber-400 text-sm tracking-[0.3em] uppercase font-bold mt-2">Stage</span>
                        </div>
                        
                        {sortedRows.map((rowLabel) => (
                            <div key={rowLabel} className="flex items-center gap-6 w-full justify-center">
                                <div className="w-8 font-bold text-stone-400 text-right text-lg">{rowLabel}</div>
                                <div className="flex gap-2.5">
                                    {rows[rowLabel].map((seat) => (
                                        <div
                                            key={seat.id}
                                            onClick={() => toggleSeatSelection(seat)}
                                            className={`
                                                w-10 h-10 md:w-11 md:h-11 rounded-t-[10px] border-2 flex items-center justify-center
                                                transition-all duration-300 relative group
                                                ${getSeatStyle(seat)}
                                            `}
                                        >
                                            <span className="text-xs font-bold">{seat.seatNumber}</span>
                                            
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-3 hidden group-hover:block z-50 w-max bg-stone-800 text-white text-xs font-semibold rounded-lg px-3 py-2 shadow-xl pointer-events-none transform -transtone-x-1/2 left-1/2">
                                                {seat.seatLabel} <span className="opacity-50 mx-1">|</span> ${getSeatPrice(seat.category)}
                                                <div className="absolute top-full left-1/2 -transtone-x-1/2 border-4 border-transparent border-t-stone-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-8 font-bold text-stone-400 text-left text-lg">{rowLabel}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass border-t border-stone-200 p-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-50 animate-slide-up">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-6">
                            <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                                {selectedSeats.length}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Total Amount</p>
                                <p className="text-2xl font-extrabold text-stone-900">${totalPrice.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleHoldSeats}
                            disabled={holding}
                            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:-transtone-y-1"
                        >
                            {holding ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Holding Seats...
                                </>
                            ) : (
                                <>
                                    Continue to Checkout <Check className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
