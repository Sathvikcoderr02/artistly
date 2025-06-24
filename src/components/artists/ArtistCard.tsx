import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ArtistCardProps = {
  id: string;
  name: string;
  category: string[];
  priceRange: { min: number; max: number; currency: string };
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  className?: string;
};

export function ArtistCard({
  id,
  name,
  category,
  priceRange,
  location,
  rating,
  reviewCount,
  image,
  className = '',
}: ArtistCardProps) {
  // Format price range
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: priceRange.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image || '/images/placeholder-artist.jpg'}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {category[0]}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="line-clamp-1 text-lg font-semibold">{name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {rating.toFixed(1)}
              <span className="text-muted-foreground text-xs"> ({reviewCount})</span>
            </span>
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {location}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="text-sm font-medium">
            {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/artists/${id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
