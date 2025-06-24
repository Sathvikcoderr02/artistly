export interface Artist {
  id: string;
  name: string;
  category: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  genres: string[];
  experience: string;
  bio: string;
  socialMedia?: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
  };
  featured?: boolean;
  available?: boolean;
}

export const artists: Artist[] = [
  {
    id: '1',
    name: 'John Smith',
    category: ['Singer'],
    priceRange: { min: 5000, max: 10000, currency: 'INR' },
    location: 'Mumbai, India',
    rating: 4.8,
    reviewCount: 24,
    image: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Pop', 'Rock'],
    experience: '5 years',
    bio: 'Professional singer with 5+ years of experience in live performances and studio recordings. Specializing in pop and rock genres.',
    featured: true,
    available: true,
    socialMedia: {
      instagram: 'johnsmithmusic',
      youtube: 'johnsmithofficial',
      spotify: 'artist/johnsmith',
      website: 'johnsmithmusic.com'
    }
  },
  {
    id: '2',
    name: 'Arjit Singh',
    category: ['Singer', 'Musician'],
    priceRange: { min: 50000, max: 100000, currency: 'INR' },
    location: 'Mumbai, India',
    rating: 4.9,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    genres: ['Bollywood', 'Playback', 'Sufi'],
    experience: '15+ years',
    bio: 'Award-winning playback singer known for his soulful voice and romantic ballads in Bollywood.',
    featured: true,
    available: true,
    socialMedia: {
      instagram: 'arjitsingh',
      youtube: 'arjitsingh',
      spotify: 'artist/artist/arjitsingh',
      website: 'arjitsingh.com'
    }
  },
  {
    id: '3',
    name: 'Mike Chen',
    category: ['Guitarist', 'Vocalist'],
    priceRange: { min: 6000, max: 12000, currency: 'INR' },
    location: 'Bangalore, India',
    rating: 4.7,
    reviewCount: 18,
    image: 'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Rock', 'Blues'],
    experience: '6 years',
    bio: 'Lead guitarist and vocalist with a passion for rock and blues. Available for gigs, studio work, and music lessons.',
    featured: true,
    available: true
  },
  {
    id: '4',
    name: 'Priya Patel',
    category: ['Violinist', 'Music Teacher'],
    priceRange: { min: 4000, max: 10000, currency: 'INR' },
    location: 'Chennai, India',
    rating: 4.5,
    reviewCount: 36,
    image: 'https://images.pexels.com/photos/1771338/pexels-photo-1771338.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Classical', 'Fusion'],
    experience: '10 years',
    bio: 'Professional violinist and music educator with a decade of experience in performances and teaching students of all levels.',
    featured: true,
    available: true
  },
  {
    id: '5',
    name: 'Alex Turner',
    category: ['DJ', 'Music Producer'],
    priceRange: { min: 10000, max: 25000, currency: 'INR' },
    location: 'Goa, India',
    rating: 4.9,
    reviewCount: 87,
    image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Electronic', 'House', 'Techno'],
    experience: '7 years',
    bio: 'Professional DJ and music producer specializing in electronic dance music. Available for clubs, festivals, and private events.',
    featured: true,
    available: true
  },
  {
    id: '6',
    name: 'Emma Wilson',
    category: ['Dancer', 'Choreographer'],
    priceRange: { min: 7000, max: 15000, currency: 'INR' },
    location: 'Mumbai, India',
    rating: 4.8,
    reviewCount: 52,
    image: 'https://images.pexels.com/photos/1918159/pexels-photo-1918159.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Contemporary', 'Hip Hop'],
    experience: '9 years',
    bio: 'Professional dancer and choreographer with extensive experience in stage performances, music videos, and dance instruction.',
    available: true
  },
  {
    id: '7',
    name: 'Rajesh Kumar',
    category: ['Tabla Player', 'Percussionist'],
    priceRange: { min: 5000, max: 12000, currency: 'INR' },
    location: 'Delhi, India',
    rating: 4.7,
    reviewCount: 31,
    image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Classical', 'Fusion', 'World Music'],
    experience: '12 years',
    bio: 'Professional tabla player with expertise in both classical and fusion music. Available for concerts, recordings, and collaborations.',
    available: true
  },
  {
    id: '8',
    name: 'Sophie Martin',
    category: ['Jazz Vocalist', 'Pianist'],
    priceRange: { min: 8000, max: 20000, currency: 'INR' },
    location: 'Bangalore, India',
    rating: 4.9,
    reviewCount: 45,
    image: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2',
    genres: ['Jazz', 'Blues', 'Soul'],
    experience: '8 years',
    bio: 'Jazz vocalist and pianist with a smooth, soulful voice. Specializing in jazz standards and blues classics.',
    available: true
  }
];

export const featuredArtists = artists.filter(artist => artist.featured);

export const getArtistById = (id: string) => {
  return artists.find(artist => artist.id === id);
};
