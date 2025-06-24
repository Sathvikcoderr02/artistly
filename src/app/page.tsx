'use client';

import Link from 'next/link';
import { ArrowRight, Music2, Headphones, Mic2, Music, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ArtistCard } from '@/components/artists/ArtistCard';
import { Card, CardContent } from '@/components/ui/card';

// Mock data for artists (temporary - will be replaced with actual data import)
const artists = [
  {
    id: '1',
    name: 'John Smith',
    category: ['Singer'],
    priceRange: { min: 5000, max: 10000, currency: 'INR' },
    location: 'New York, NY',
    rating: 4.8,
    reviewCount: 24,
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
  },
  {
    id: '2',
    name: 'Arjit Singh',
    category: ['Guitarist', 'Singer'],
    priceRange: { min: 7000, max: 12000, currency: 'INR' },
    location: 'Mumbai, MH',
    rating: 4.8,
    reviewCount: 36,
    image: '/images/download (7).jpeg',
  },
  {
    id: '3',
    name: 'Mike Chen',
    category: ['Guitarist', 'Vocalist'],
    priceRange: { min: 6000, max: 12000, currency: 'INR' },
    location: 'Bangalore, KA',
    rating: 4.7,
    reviewCount: 18,
    image: 'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
  },
  {
    id: '4',
    name: 'Priya Patel',
    category: ['Violinist', 'Music Teacher'],
    priceRange: { min: 4000, max: 10000, currency: 'INR' },
    location: 'Delhi, DL',
    rating: 4.5,
    reviewCount: 36,
    image: 'https://images.pexels.com/photos/1771338/pexels-photo-1771338.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
  },
];

// Categories data
const categories = [
  { 
    name: 'Singers', 
    icon: Mic2, 
    count: 42,
    description: 'Professional vocalists for all occasions',
    href: '/artists?category=singers'
  },
  { 
    name: 'Musicians', 
    icon: Music2, 
    count: 89,
    description: 'Instrumentalists and session players',
    href: '/artists?category=musicians'
  },
  { 
    name: 'Bands', 
    icon: Music, 
    count: 76,
    description: 'Live bands for weddings and events',
    href: '/artists?category=bands'
  },
  { 
    name: 'DJs', 
    icon: Headphones, 
    count: 112,
    description: 'Professional DJs for every genre',
    href: '/artists?category=djs'
  },
];

// Get featured artists (first 4 for demo)
const featuredArtists = artists.slice(0, 4);

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Find the Perfect Performer for Your Event</h1>
            <p className="text-xl mb-8 text-blue-100">
              Book talented musicians, singers, and performers for weddings, corporate events, and private parties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/artists">Browse Artists</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg bg-white/10 hover:bg-white/20 border-white/20">
                <Link href="/onboard">List Your Talent</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
              <Sparkles className="w-4 h-4 mr-1" /> Popular Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Artists by Category</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Browse through our diverse range of talented performers and find the perfect match for your event.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(({ name, icon: Icon, count, description, href }) => (
              <Link href={href} key={name} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {description}
                    </p>
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {count}+ Artists
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
              <Sparkles className="w-4 h-4 mr-1" /> Premium Talent
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Artists</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Discover some of our most popular and highly-rated performers
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArtists.map((artist) => (
              <ArtistCard key={artist.id} {...artist} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline" className="border-2">
              <Link href="/artists" className="flex items-center">
                Browse All Artists
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to book your perfect performer?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who found their perfect match on Artistly.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/artists">Browse All Artists</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
