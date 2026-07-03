import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ManageEvents() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venueId: '',
    eventDate: '',
    eventTime: '',
    premiumPrice: '',
    standardPrice: ''
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await api.get('/venues');
      setVenues(res.data.data);
    } catch (err) {
      console.error('Failed to fetch venues', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        venueId: formData.venueId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        prices: [
          { category: 'PREMIUM', price: Number(formData.premiumPrice) },
          { category: 'STANDARD', price: Number(formData.standardPrice) }
        ]
      };

      await api.post('/events', payload);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to create event. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center animate-slide-up">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Event Created!</h2>
            <p className="text-stone-400 mb-8">Your event has been successfully published and is now live.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    <div className="animate-fade-in px-6 lg:px-12 max-w-[800px] mx-auto py-12">
      <h1 className="font-[Montserrat] text-[32px] font-bold text-[#fdfcfb] mb-8">Create New Event</h1>
      
      <div className="glass-panel rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Event Title</label>
            <input 
              type="text" 
              name="title" 
              required
              value={formData.title} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="e.g. Neon Nights Festival"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              required
              rows="4"
              value={formData.description} 
              onChange={handleChange} 
              className="form-input resize-none" 
              placeholder="Tell us about the event..."
            ></textarea>
          </div>

          <div>
            <label className="form-label">Venue</label>
            <select 
              name="venueId" 
              required
              value={formData.venueId} 
              onChange={handleChange} 
              className="form-input bg-[#1a100c]"
            >
              <option value="">Select a venue...</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.capacity} seats)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                name="eventDate" 
                required
                value={formData.eventDate} 
                onChange={handleChange} 
                className="form-input" 
              />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input 
                type="time" 
                name="eventTime" 
                required
                value={formData.eventTime} 
                onChange={handleChange} 
                className="form-input" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div>
              <label className="form-label">Premium Ticket Price ($)</label>
              <input 
                type="number" 
                name="premiumPrice" 
                required
                min="0"
                step="0.01"
                value={formData.premiumPrice} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="100.00"
              />
            </div>
            <div>
              <label className="form-label">Standard Ticket Price ($)</label>
              <input 
                type="number" 
                name="standardPrice" 
                required
                min="0"
                step="0.01"
                value={formData.standardPrice} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="50.00"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-[16px] mt-8"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
