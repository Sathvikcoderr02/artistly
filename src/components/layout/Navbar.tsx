'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ModeToggle } from './ModeToggle';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleDashboardClick = (e: React.MouseEvent, href: string) => {
    if (href === '/dashboard' && !isAuthenticated) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const routes = [
    {
      href: '/',
      label: 'Home',
      active: pathname === '/',
    },
    {
      href: '/artists',
      label: 'Browse Artists',
      active: pathname === '/artists',
    },
    {
      href: '/onboard',
      label: 'Become an Artist',
      active: pathname === '/onboard',
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-20 max-w-screen-2xl px-6 sm:px-8 lg:px-10">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Artistly
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium ml-12">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={(e) => handleDashboardClick(e, route.href)}
                className={cn(
                  'transition-colors hover:text-foreground/80 px-3 py-2 rounded-md',
                  route.active ? 'text-foreground' : 'text-foreground/60',
                  route.href === '/dashboard' && !isAuthenticated ? 'cursor-pointer' : ''
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  logout();
                  router.push('/');
                }}
              >
                Logout
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/onboard">List Your Talent</Link>
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
