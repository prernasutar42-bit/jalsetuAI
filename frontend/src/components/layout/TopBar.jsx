import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Bell, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { strings } from '../../lib/strings';

export function TopBar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-line min-h-[56px] px-4 sm:px-6 flex items-center justify-between">
      {/* Brand title */}
      <Link
        to="/"
        className="flex items-center gap-2.5 text-ink-900 focus-visible:ring-2 focus-visible:ring-accent rounded-btn"
      >
        <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center font-bold">
          <Waves size={18} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight leading-none block">
            {strings.appName}
          </span>
          <span className="text-[10px] text-ink-500 font-medium leading-none block hidden sm:inline">
            Maharashtra Flood Early Warning
          </span>
        </div>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAdmin && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-ink-900 text-white rounded-btn">
            <Shield size={12} aria-hidden="true" />
            <span>Admin</span>
          </span>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs font-medium text-ink-700">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="min-h-[44px] min-w-[44px] px-2 flex items-center justify-center rounded-btn text-ink-500 hover:text-ink-900 hover:bg-canvas transition-colors"
              title={strings.nav.logout}
              aria-label={strings.nav.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="min-h-[44px] px-3.5 flex items-center justify-center text-xs font-semibold text-accent hover:text-accent-hover bg-white border border-accent rounded-btn transition-colors"
          >
            {strings.nav.login}
          </Link>
        )}
      </div>
    </header>
  );
}
