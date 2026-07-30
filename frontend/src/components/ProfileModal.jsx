import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Calendar, 
  Sun, 
  Moon, 
  LogOut, 
  X, 
  CheckCircle2
} from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, onLogoutSuccess }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen || !user) return null;

  const createdDate = new Date(user.created_at || Date.now()).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleLogout = () => {
    logout();
    onClose();
    if (onLogoutSuccess) onLogoutSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 max-w-lg w-full relative shadow-2xl border border-brand-500/30 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-brand-500/30">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-brand-400">
                <User className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">User Profile & Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage security, session tokens & theme</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Info */}
        <div className="py-6 space-y-4">
          
          {/* Email Card */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-xl border border-brand-500/20">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Email</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user.email}</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>

          {/* Registration Date & Security */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] uppercase font-semibold">Joined Date</span>
              </div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{createdDate}</span>
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] uppercase font-semibold">Auth Strategy</span>
              </div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">JWT + bcrypt</span>
            </div>
          </div>

          {/* Theme Preference Switch */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">Interface Theme</span>
                <span className="text-[11px] text-slate-400">Current: {theme.toUpperCase()} Mode</span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="btn-secondary !py-1.5 !px-3 text-xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Switch to Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Switch to Dark
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-700/60 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">User ID #{user.id}</span>
          <button
            onClick={handleLogout}
            className="btn-danger text-xs !py-2 !px-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;
