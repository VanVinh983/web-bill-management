'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Don't show sidebar on login/register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // Don't show sidebar/header on print pages
  const isPrintPage = pathname?.includes('/print');
  
  if (isAuthPage || isPrintPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-orange-100 px-4 py-3 text-orange-900">
          <h1 className="text-lg font-bold">Quản lý hóa đơn</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-orange-900 hover:bg-orange-200">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <VisuallyHidden>
                <SheetTitle>Menu điều hướng</SheetTitle>
              </VisuallyHidden>
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

