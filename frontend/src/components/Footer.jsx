import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', query: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleHelpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/support/query', formData);
      setMessage('Your query has been sent successfully!');
      setFormData({ email: '', query: '' });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('Failed to send query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <footer className="w-full py-12 bg-[#1a100c] border-t border-white/5 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 lg:px-12 max-w-[1280px] mx-auto gap-4">
          <div>
            <span className="font-[Montserrat] text-xl font-bold text-[#fcd34d]">BookIT</span>
          </div>
          
          <div className="flex gap-8">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="text-sm text-[#e8dcd8] hover:text-[#fcd34d] transition-colors opacity-80 hover:opacity-100"
            >
              Help Center
            </button>
            <a href="/#how-it-works" className="text-sm text-[#e8dcd8] hover:text-[#fcd34d] transition-colors opacity-80 hover:opacity-100">
              About Us
            </a>
          </div>
        </div>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border-[#d97706]/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#e8dcd8] hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-[Montserrat] text-[24px] font-bold text-[#fdfcfb] mb-2">Help Center</h3>
            <p className="text-[#8c909f] text-sm mb-6">Send us your query and we'll get back to you.</p>
            
            <form onSubmit={handleHelpSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email address</label>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label">Your Query</label>
                <textarea 
                  required 
                  className="form-input min-h-[120px] resize-none" 
                  placeholder="How can we help you?"
                  value={formData.query}
                  onChange={(e) => setFormData({...formData, query: e.target.value})}
                />
              </div>
              
              {message && (
                <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn-glow w-full py-3"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
