import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center py-20 px-6 min-h-[calc(100vh-80px)] animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -transtone-x-1/2 -transtone-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#d97706]/10 to-[#d97706]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 animate-slide-up shadow-[0_0_40px_rgba(0,0,0,0.5)] border-[#fcd34d]/10">
        <div className="text-center mb-8">
          <h2 className="font-[Montserrat] text-[32px] font-bold text-[#fdfcfb] mb-2">Welcome Back</h2>
          <p className="text-[14px] text-[#e8dcd8]">Sign in to access your tickets and events</p>
        </div>

        {error && (
          <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] shrink-0 mt-0.5">error</span>
            <p className="text-[14px] text-[#ffdad6]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#e8dcd8]">Password</label>
              <Link to="#" className="text-[12px] text-[#fcd34d] hover:text-white transition-colors">Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-glow w-full py-3.5 text-[16px] mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[#e8dcd8]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#fcd34d] hover:text-white transition-colors">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
