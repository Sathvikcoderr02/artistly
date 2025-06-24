'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.21_0.034_264.665)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for joining Artistly! We&apos;ve received your application and our team will review it shortly.
            You&apos;ll receive a confirmation email with next steps within 24-48 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button asChild className="px-6 py-3 text-base">
              <Link href="/artists">
                Browse Artists
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="px-6 py-3 text-base">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            Need help? <a href="mailto:support@artisly.com" className="text-blue-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
