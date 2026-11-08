import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Bell, LifeBuoy, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { strings } from '../../lib/strings';

export function BottomNav() {
  const { isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: strings.nav.home, icon: LayoutDashboard },
    { to: '/map', label: strings.nav.map, icon: Map },
    { to: '/alerts', label: strings.nav.alerts, icon: Bell },
    { to: '/safety', label: strings.nav.safety, icon: LifeBuoy },
    {
      to: isAdmin ? '/admin' : isAuthenticated ? '/safety' : '/login',
      label: isAdmin ? strings.nav.admin : strings.nav.account,
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `min-h-[44px] flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-accent font-semibold'
                    : 'text-ink-500 hover:text-ink-900'
                }`
              }
            >
              <Icon size={19} strokeWidth={2} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
