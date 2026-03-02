'use client';

import { AgentSidebar } from '@/components/sidebar/AgentSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leftOpen, setLeftOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop left sidebar — Agents */}
      <div className="hidden md:block">
        <AgentSidebar />
      </div>

      {/* Mobile left sidebar */}
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-3 top-3 z-10 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <AgentSidebar />
        </SheetContent>
      </Sheet>

      {/* Main content — full width (no right sidebar) */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
