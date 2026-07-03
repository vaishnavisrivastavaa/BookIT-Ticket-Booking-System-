import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="glass-panel rounded-3xl p-12 max-w-lg mx-auto relative overflow-hidden">
        {/* Abstract background blur */}
        <div className="absolute top-1/2 left-1/2 -transtone-x-1/2 -transtone-y-1/2 w-64 h-64 bg-[#d97706]/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <h1 className="font-[Montserrat] text-[80px] font-bold text-[#fdfcfb] mb-2 leading-none">404</h1>
        <p className="text-[20px] font-medium text-[#fcd34d] mb-4">Experience Not Found</p>
        <p className="text-[#e8dcd8] mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="btn-glow inline-flex items-center gap-2 px-8 py-3 text-[16px]"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Return Home
        </Link>
      </div>
    </div>
  );
}
