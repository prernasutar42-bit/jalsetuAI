import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Bell, LifeBuoy, ShieldAlert, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { strings } from '../../lib/strings';

export function Sidebar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const navItems = [
    { to: '/', label: strings.nav.home, icon: LayoutDashboard },
    { to: '/map', label: strings.nav.map, icon: Map },
    { to: '/alerts', label: strings.nav.alerts, icon: Bell },
    { to: '/safety', label: strings.nav.safety, icon: LifeBuoy },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: strings.nav.admin, icon: ShieldAlert });
  }

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="hidden md:flex flex-col w-64 bg-white border-r border-line shrink-0 min-h-[calc(100vh-56px)] select-none"
    >
      <div className="p-4 flex-1 space-y-1">
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `min-h-[44px] px-3.5 py-2.5 rounded-btn flex items-center gap-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EBF5F6] text-accent font-semibold border-l-4 border-accent'
                    : 'text-ink-700 hover:bg-canvas hover:text-ink-900'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Network / Sensor status summary */}
      <div className="p-4 mx-3 mb-4 rounded-card bg-canvas border border-line space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
          <CheckCircle2 size={15} className="text-risk-low" />
          <span>Telemetry Active</span>
        </div>
        <p className="text-[11px] text-ink-500 leading-normal">
          36 Maharashtra districts continuously synchronized with IMD/CWC hydrology feeds.
        </p>
      </div>

      {/* User profile / Auth in sidebar footer */}
      <div className="p-4 border-t border-line">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-ink-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-ink-500 truncate">{user?.email}</p>
              <p className="text-[10px] font-mono text-accent uppercase font-semibold mt-0.5">
                {user?.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full min-h-[44px] px-3 py-2 text-xs font-medium text-ink-700 hover:bg-canvas rounded-btn border border-line flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={15} />
              <span>{strings.nav.logout}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <NavLink
              to="/login"
              className="w-full min-h-[44px] px-3 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-btn flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn size={15} />
              <span>{strings.nav.login}</span>
            </NavLink>
            <NavLink
              to="/register"
              className="w-full min-h-[44px] px-3 py-2 text-xs font-medium text-ink-700 bg-white hover:bg-canvas rounded-btn border border-line flex items-center justify-center gap-2 transition-colors"
            >
              <span>{strings.nav.register}</span>
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
