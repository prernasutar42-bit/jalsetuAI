import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { DisclaimerBanner } from './DisclaimerBanner';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-900 font-sans">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-6">
          <div className="p-3 sm:p-4 max-w-7xl w-full mx-auto">
            <DisclaimerBanner className="mb-4" />
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
