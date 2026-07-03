import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SeatMap({ eventId, prices, onCancel }) {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    fetchSeats();
    // In a real app, you would also set up a WebSocket connection here 
    // to listen for 'seat_update' events and refresh the map.
  }, [eventId]);

  const fetchSeats = async () => {
    try {
      const res = await api.get(`/events/${eventId}/seats`);
      setSeats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 10) {
        alert("You can only select up to 10 seats.");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;
    setHolding(true);

    try {
      const seatIds = selectedSeats.map(s => s.id);
      // 1. Hold seats
      await api.post('/seats/hold', { eventId, seatIds });
      
      // 2. Book seats (In a real app, this would redirect to a payment gateway first)
      const bookingRes = await api.post('/bookings', { eventId, seatIds });
      
      alert(`Booking Successful! Ref: ${bookingRes.data.data.bookingNumber}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete booking. Seats might have been taken.');
      fetchSeats(); // refresh seat map
      setSelectedSeats([]);
    } finally {
      setHolding(false);
    }
  };

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.rowNumber]) acc[seat.rowNumber] = [];
    acc[seat.rowNumber].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(rows).sort();

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d97706]/20 border-t-[#d97706]"></div>
      </div>
    );
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    const priceRecord = prices.find(p => p.category === seat.category);
    return sum + (priceRecord ? priceRecord.price : 0);
  }, 0);

  return (
    <div className="glass-panel rounded-3xl p-8 border-[#d97706]/20 mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-[Montserrat] text-[24px] font-bold text-[#fdfcfb]">Select Seats</h2>
        <button onClick={onCancel} className="text-[#e8dcd8] hover:text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Screen Indicator */}
      <div className="w-full flex justify-center mb-12">
        <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-[#fcd34d]/50 to-transparent rounded-full relative">
          <div className="absolute -bottom-6 w-full text-center text-[12px] text-[#e8dcd8] uppercase tracking-[0.2em]">Stage / Screen</div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="overflow-x-auto pb-8">
        <div className="flex flex-col items-center gap-4 min-w-max">
          {sortedRows.map(rowLabel => (
            <div key={rowLabel} className="flex items-center gap-4">
              <div className="w-6 text-center text-[#8c909f] font-bold text-sm">{rowLabel}</div>
              <div className="flex gap-2">
                {rows[rowLabel].sort((a, b) => a.seatNumber - b.seatNumber).map(seat => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  let seatColor = "bg-[#3d261e] border-[#d97706]/30 text-[#8c909f]";
                  let cursor = "cursor-pointer hover:bg-[#d97706]/20";

                  if (seat.status === 'BOOKED') {
                    seatColor = "bg-[#ffb4ab]/10 border-[#ffb4ab]/20 text-[#ffb4ab]/30";
                    cursor = "cursor-not-allowed";
                  } else if (seat.status === 'HELD') {
                    seatColor = "bg-[#fdba74]/20 border-[#fdba74]/40 text-[#fdba74]/50";
                    cursor = "cursor-not-allowed";
                  } else if (isSelected) {
                    seatColor = "bg-[#d97706] border-[#fcd34d] text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]";
                  }

                  return (
                    <div 
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-10 h-10 rounded-t-lg rounded-b-sm border ${seatColor} ${cursor} flex items-center justify-center text-xs font-medium transition-all duration-200`}
                      title={`${seat.category} - ${seat.seatLabel}`}
                    >
                      {seat.seatNumber}
                    </div>
                  );
                })}
              </div>
              <div className="w-6 text-center text-[#8c909f] font-bold text-sm">{rowLabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border bg-[#3d261e] border-[#d97706]/30"></div>
          <span className="text-sm text-[#e8dcd8]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border bg-[#d97706] border-[#fcd34d]"></div>
          <span className="text-sm text-[#e8dcd8]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border bg-[#fdba74]/20 border-[#fdba74]/40"></div>
          <span className="text-sm text-[#e8dcd8]">Held</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border bg-[#ffb4ab]/10 border-[#ffb4ab]/20"></div>
          <span className="text-sm text-[#e8dcd8]">Booked</span>
        </div>
      </div>

      {/* Checkout Bar */}
      {selectedSeats.length > 0 && (
        <div className="mt-8 bg-[#1a100c]/80 border border-[#d97706]/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-[#fcd34d] font-medium">{selectedSeats.length} ticket(s) selected</p>
            <p className="text-sm text-[#8c909f] mt-1">{selectedSeats.map(s => s.seatLabel).join(', ')}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-[#8c909f] uppercase tracking-wider">Total</p>
              <p className="font-[Montserrat] font-bold text-[24px] text-[#fdba74]">${totalPrice.toFixed(2)}</p>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={holding}
              className="btn-glow px-8 py-3"
            >
              {holding ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
