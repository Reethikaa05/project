import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileModal from './ProfileModal';
import { 
  BarChart3, 
  LogOut, 
  User as UserIcon,
  Sun,
  Moon,
  Settings,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleLogout = () => {
    logout();
    setToastMsg('Successfully logged out!');
    setTimeout(() => setToastMsg(''), 3000);
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-black/80 backdrop-blur-xl shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Data<span className="text-brand-400">Board</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  PRO
                </span>
              </div>
            </Link>

            {/* Nav Links (Consolidated Plot & Analytics into 1 single link) */}
            {user && (
              <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
                <Link
                  to="/"
                  className={`text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/') 
                      ? 'text-white border-b-2 border-brand-400 pb-0.5' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Overview
                </Link>

                <Link
                  to="/data"
                  className={`text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/data') 
                      ? 'text-white border-b-2 border-brand-400 pb-0.5' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Data Management
                </Link>

                <Link
                  to="/analytics"
                  className={`text-xs sm:text-sm font-semibold transition-all ${
                    isActive('/analytics') 
                      ? 'text-white border-b-2 border-brand-400 pb-0.5' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Plot & Analytics
                </Link>
              </nav>
            )}

            {/* Actions & Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors border border-white/15"
                title="Switch Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-300" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* User Profile Button */}
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl liquid-glass border border-white/20 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                    title="User Profile & Settings"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-mono max-w-[110px] truncate">
                      {user.email.split('@')[0]}
                    </span>
                    <Settings className="w-3.5 h-3.5 text-white/70" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="btn-danger !px-3 !py-1.5 text-xs"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>

                  {/* Mobile Hamburger Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-xl liquid-glass text-white border border-white/20"
                    aria-label="Toggle Navigation Menu"
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="btn-primary text-xs !py-2">
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu (below lg) */}
        {user && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/15 bg-black/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fade-in">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
            >
              Overview
            </Link>
            <Link
              to="/data"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
            >
              Data Management
            </Link>
            <Link
              to="/analytics"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
            >
              Plot & Analytics
            </Link>
          </div>
        )}
      </header>

      {/* Logout Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in font-semibold text-xs">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogoutSuccess={() => {
          setToastMsg('Successfully logged out!');
          setTimeout(() => setToastMsg(''), 3000);
          navigate('/auth');
        }}
      />
    </>
  );
};

export default Navbar;
