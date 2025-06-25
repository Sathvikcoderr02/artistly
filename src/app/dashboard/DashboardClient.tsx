'use client';

import { useState, useEffect, useCallback } from 'react';
import { Artist, ApprovalStatus } from '@/types/artist';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

export default function DashboardClient() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDummyArtists = useCallback((): Artist[] => {
    // Add default image URL for dummy data
    const defaultImageUrl = '/images/placeholder-user.jpg';
    const categories = ['Singer', 'Dancer', 'Musician', 'Comedian', 'Actor', 'Magician'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];
    const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
    const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const status = statuses[i % statuses.length];
      const category = categories[i % categories.length];
      const city = cities[i % cities.length];
      const langCount = Math.max(1, Math.floor(Math.random() * 3));
      const artistLanguages = Array.from({ length: langCount }, 
        () => languages[Math.floor(Math.random() * languages.length)]
      );
      
      return {
        id: `dummy-${i + 1}`,
        name: `Artist ${i + 1}`,
        email: `artist${i + 1}@example.com`,
        phone: `+91${Math.floor(7000000000 + Math.random() * 3000000000)}`,
        category,
        experience: `${Math.floor(Math.random() * 10) + 1} years`,
        fee: Math.floor(Math.random() * 50000) + 5000,
        city,
        state: city === 'Mumbai' ? 'Maharashtra' : 
               city === 'Delhi' ? 'Delhi' :
               city === 'Bangalore' ? 'Karnataka' :
               city === 'Hyderabad' ? 'Telangana' :
               city === 'Chennai' ? 'Tamil Nadu' : 'West Bengal',
        languages: [...new Set(artistLanguages)],
        bio: `Professional ${category.toLowerCase()} with experience in live performances.`,
        status,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        reviewedAt: status !== 'pending' ? new Date().toISOString() : null,
        reviewedBy: status !== 'pending' ? 'admin@example.com' : null,
        rejectionReason: status === 'rejected' ? 'Insufficient portfolio' : null,
        imageUrl: defaultImageUrl,
        isDummy: true, // Flag to identify dummy data
        socialMedia: {
          instagram: null,
          youtube: null,
          facebook: null,
          twitter: null,
          website: null
        }
      };
    });
  }, []);

  const fetchArtists = useCallback(async () => {
    try {
      const response = await fetch('/api/artists');
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      const data = await response.json();
      return data;
    } catch (fetchError) {
      console.warn('Using dummy data due to API error:', fetchError);
      toast('Using sample data (API unavailable)', { icon: 'ℹ️' });
      return getDummyArtists();
    } finally {
      setIsLoading(false);
    }
  }, [getDummyArtists]);
  
  useEffect(() => {
    const loadArtists = async () => {
      try {
        const data = await fetchArtists();
        setArtists(data);
        setError(null);
      } catch (loadError) {
        console.error('Error loading artists:', loadError);
        setError('Failed to load artists. Please try again later.');
      }
    };

    loadArtists();
  }, [fetchArtists]);


  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const handleStatusUpdate = async (id: string, status: ApprovalStatus, rejectionReason?: string) => {
    try {
      const response = await fetch('/api/artists', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status, rejectionReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      // Refresh the artist list
      const updatedArtists = await fetchArtists();
      setArtists(updatedArtists);
      toast.success(`Artist ${status} successfully`);
    } catch (updateError) {
      console.error('Error updating status:', updateError);
      const errorMessage = updateError instanceof Error ? updateError.message : 'Failed to update status';
      toast.error(errorMessage);
    }
  };

  const columns: Column<Artist>[] = [
    {
      header: 'Name',
      accessor: (artist) => (
        <div className="font-medium">
          {artist.name}
          <div className="text-sm text-muted-foreground">{artist.email}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (artist) => artist.category,
    },
    {
      header: 'Location',
      accessor: (artist) => artist.city,
    },
    {
      header: 'Fee',
      accessor: (artist) => `₹${artist.fee.toLocaleString('en-IN')}`,
    },
    {
      header: 'Status',
      accessor: (artist) => getStatusBadge(artist.status),
    },
    {
      header: 'Details',
      accessor: (artist) => (
        <div className="text-sm text-muted-foreground">
          <div>Experience: {artist.experience || 'Not specified'}</div>
          {artist.languages?.length > 0 && (
            <div>Languages: {artist.languages.join(', ')}</div>
          )}
          {artist.status === 'rejected' && artist.rejectionReason && (
            <div className="mt-1 text-red-500">
              <span className="font-medium">Reason:</span> {artist.rejectionReason}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (artist) => (
        <div className="flex space-x-2">
          {artist.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate(artist.id, 'approved');
                }}
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  const reason = prompt('Reason for rejection:');
                  if (reason) {
                    handleStatusUpdate(artist.id, 'rejected', reason);
                  }
                }}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </>
          )}
          {artist.status !== 'pending' && (
            <span className="text-sm text-muted-foreground self-center">
              {artist.reviewedAt ? `Reviewed on ${new Date(artist.reviewedAt).toLocaleDateString()}` : 'Action taken'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Artist Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No artist submissions found.</p>
              <p className="text-sm text-muted-foreground mt-2">New artist applications will appear here for review.</p>
            </div>
          ) : (
            <DataTable
              data={artists}
              columns={columns}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
