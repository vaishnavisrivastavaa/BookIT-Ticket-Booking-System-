import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleName: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/events');
      } else {
        setError(result.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center py-20 px-6 min-h-[calc(100vh-80px)] animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -transtone-x-1/2 -transtone-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#d97706]/10 to-[#d97706]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 md:p-10 relative z-10 animate-slide-up shadow-[0_0_40px_rgba(0,0,0,0.5)] border-[#fcd34d]/10">
        <div className="text-center mb-8">
          <h2 className="font-[Montserrat] text-[32px] font-bold text-[#fdfcfb] mb-2">Create Account</h2>
          <p className="text-[14px] text-[#e8dcd8]">Join BookIT to secure your experiences</p>
        </div>

        {error && (
          <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">error</span>
            <p className="text-[14px] text-[#ffdad6]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="form-label">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="form-input"
                placeholder="First"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">Last name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="form-input"
                placeholder="Last"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="mt-1.5 text-[12px] text-[#8c909f]">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="roleName" className="form-label">I want to</label>
            <div className="relative">
              <select
                id="roleName"
                name="roleName"
                className="form-input appearance-none cursor-pointer"
                value={formData.roleName}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="CUSTOMER" className="bg-[#3d261e] text-white">Buy tickets for events</option>
                <option value="ORGANISER" className="bg-[#3d261e] text-white">Organize and sell tickets</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8c909f]">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-glow w-full py-3.5 text-[16px] mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[#e8dcd8]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#fcd34d] hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
