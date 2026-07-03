import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#2b1b15]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(173,198,255,0.05)] transition-all duration-300">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-[Montserrat] font-bold tracking-tighter text-[#fcd34d] hover:scale-105 transition-transform duration-200" onClick={closeMenu}>
            BookIT
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/events" onClick={closeMenu}>Live Events</NavLink>

            {user && user.role === 'ADMIN' && (
              <>
                <NavLink to="/venues" onClick={closeMenu}>Venues</NavLink>
                <NavLink to="/create-venue" onClick={closeMenu}>Create Venue</NavLink>
              </>
            )}
            {user && user.role === 'ORGANISER' && (
              <NavLink to="/manage-events" onClick={closeMenu}>Manage Events</NavLink>
            )}
            {user && (
              <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
            )}

            {!user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-8 ml-4">
                <Link to="/login" className="text-sm font-semibold text-[#fcd34d] hover:text-white transition-colors" onClick={closeMenu}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-glow px-6 py-2.5 text-sm"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="ml-4 flex items-center gap-4 border-l border-white/10 pl-8">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{user.firstName}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#fcd34d] font-bold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#e8dcd8] hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 md:hidden bg-[#1a100c]/95 backdrop-blur-xl">
          <div className="space-y-1 px-4 py-3">
            <MobileLink to="/" onClick={closeMenu}>Home</MobileLink>
            <MobileLink to="/events" onClick={closeMenu}>Live Events</MobileLink>

            {user && user.role === 'ADMIN' && (
              <>
                <MobileLink to="/venues" onClick={closeMenu}>Venues</MobileLink>
                <MobileLink to="/create-venue" onClick={closeMenu}>Create Venue</MobileLink>
              </>
            )}
            {user && user.role === 'ORGANISER' && (
              <MobileLink to="/manage-events" onClick={closeMenu}>Manage Events</MobileLink>
            )}
            {user && (
              <MobileLink to="/dashboard" onClick={closeMenu}>Dashboard</MobileLink>
            )}

            {!user ? (
              <div className="flex flex-col gap-3 pt-4 pb-2 border-t border-white/10 mt-2">
                <Link to="/login" className="btn-ghost w-full py-3" onClick={closeMenu}>Sign In</Link>
                <Link to="/register" className="btn-glow w-full py-3" onClick={closeMenu}>Register</Link>
              </div>
            ) : (
              <>
                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="px-3 text-sm text-[#8c909f]">
                    Signed in as <span className="font-medium text-white">{user.firstName}</span>
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-[#ffb4ab] hover:bg-white/5"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-sm font-medium text-[#e8dcd8] transition-colors hover:text-white hover:scale-105 duration-200"
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-3 text-base font-medium text-[#e8dcd8] hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
