import { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import ProtectedRoute from '@/components/ProtectedRoute';

// This is a Server Component
export const dynamic = 'force-dynamic'; // Ensure this page is dynamic

export const metadata: Metadata = {
  title: 'Dashboard | Artistly',
  description: 'Manage your artist submissions and view analytics',
  openGraph: {
    title: 'Dashboard | Artistly',
    description: 'Manage your artist profile and bookings',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | Artistly',
    description: 'Manage your artist profile and bookings',
  },
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your artist submissions and view analytics.
          </p>
        </div>
        <DashboardClient />
      </div>
    </ProtectedRoute>
  );
}
