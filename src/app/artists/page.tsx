"use client";

import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Music, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { QuoteModal } from '@/components/artists/QuoteModal';
import { ViewToggle } from '@/components/artists/ViewToggle';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { artists, type Artist } from '../../data/mockArtists';

// Extract unique categories and locations
const allCategories = Array.from(new Set(artists.flatMap(artist => artist.category)));
const allLocations = Array.from(new Set(artists.map(artist => artist.location.split(',')[0])));

export default function ArtistsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);

  // Apply filters
  useEffect(() => {
    let result = [...artists];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        artist =>
          artist.name.toLowerCase().includes(term) ||
          artist.category.some(cat => cat.toLowerCase().includes(term)) ||
          artist.genres.some(genre => genre.toLowerCase().includes(term))
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(artist =>
        selectedCategories.some(cat => artist.category.includes(cat))
      );
    }

    // Filter by locations
    if (selectedLocations.length > 0) {
      result = result.filter(artist =>
        selectedLocations.some(loc => artist.location.startsWith(loc))
      );
    }

    // Filter by price range - show artists whose minimum price is within the selected range
    result = result.filter(
      artist =>
        artist.priceRange.min >= priceRange[0] &&
        artist.priceRange.min <= priceRange[1]
    );
    
    // Apply sorting
    const sortedResult = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceRange.min - b.priceRange.min;
        case 'price-high':
          return b.priceRange.max - a.priceRange.max;
        case 'rating':
          return b.rating - a.rating;
        default: // 'recommended'
          // Default sort by featured first, then by rating
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
      }
    });

    setFilteredArtists(sortedResult);
  }, [searchTerm, selectedCategories, selectedLocations, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLocations([]);
    setPriceRange([0, 50000]);
  };

  const openQuoteModal = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedArtist(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {selectedArtist && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={closeQuoteModal}
          artistName={selectedArtist.name}
        />
      )}
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find the Perfect Performer</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Discover and book talented artists for your next event, party, or special occasion.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search artists, categories, or genres..."
              className="w-full pl-12 py-6 rounded-full border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 dark:text-blue-400"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {allCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label
                        htmlFor={`cat-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Location</h3>
                <div className="space-y-2">
                  {allLocations.map(location => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`loc-${location}`}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                      />
                      <label
                        htmlFor={`loc-${location}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">Price Range (INR)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">₹{priceRange[0].toLocaleString()}</span>
                    <span className="text-sm text-gray-500">₹{priceRange[1].toLocaleString()}+</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {filteredArtists.length} {filteredArtists.length === 1 ? 'Artist' : 'Artists'} Found
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedCategories.length > 0 && `In ${selectedCategories.join(', ')} • `}
                {selectedLocations.length > 0 && `Located in ${selectedLocations.join(', ')}`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                <select 
                  className="text-sm border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 w-full sm:w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              
              <ViewToggle 
                view={viewMode} 
                onViewChange={setViewMode} 
                className="hidden sm:flex"
              />
            </div>
            </div>

            {filteredArtists.length > 0 ? (
              <div className="space-y-6">
                {/* Grid View */}
                <div className={`${viewMode === 'grid' ? 'block' : 'hidden'} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
                  {filteredArtists.map(artist => (
                    <div
                      key={artist.id}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="relative h-48 flex-shrink-0">
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          width={400}
                          height={250}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={true}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-artist.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuoteModal(artist);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Ask for Quote
                          </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                          {artist.rating}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start flex-1">
                          <div>
                            <h3 
                              className="font-bold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/artists/${artist.id}`)}
                            >
                              {artist.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{artist.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600 dark:text-blue-400">
                              ₹{artist.priceRange.min.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">starting price</div>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {artist.category.slice(0, 3).map(cat => (
                            <span
                              key={cat}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                            >
                              {cat}
                            </span>
                          ))}
                          {artist.category.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              +{artist.category.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* List View */}
                <div className={`${viewMode === 'list' ? 'block' : 'hidden'} space-y-4`}>
                  {filteredArtists.map(artist => (
                    <div 
                      key={artist.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row"
                    >
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                          unoptimized={true}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-artist.svg';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                          {artist.rating}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col sm:flex-row">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 
                              className="text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/artists/${artist.id}`)}
                            >
                              {artist.name}
                            </h3>
                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                ₹{artist.priceRange.min.toLocaleString()}
                                {artist.priceRange.max > artist.priceRange.min && `-${artist.priceRange.max.toLocaleString()}`}
                              </div>
                              <div className="text-sm text-gray-500">starting price</div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>{artist.location}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {artist.bio || 'Professional artist with years of experience in live performances and events.'}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {artist.category.map(cat => (
                              <span
                                key={cat}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex sm:flex-col justify-end gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-36"
                            onClick={() => router.push(`/artists/${artist.id}`)}
                          >
                            View Profile
                          </Button>
                          <Button 
                            className="w-full sm:w-36"
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuoteModal(artist);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <Music className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No artists found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
                <Button className="mt-4" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
