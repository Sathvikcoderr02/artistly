export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Artist {
  id: string;
  name: string;
  category: string;
  city: string;
  fee: number;
  bio: string;
  experience: string;
  email: string;
  phone: string;
  languages: string[];
  imageUrl: string;
  image?: string; // Keeping for backward compatibility
  profileImage?: string; // New field for profile image URL
  status: ApprovalStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  updatedAt?: string;
  createdAt: string;
}

export interface ArtistFormData extends Omit<Artist, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'reviewedAt' | 'reviewedBy' | 'rejectionReason'> {
  profileImage?: string;
  // Add any additional form-specific fields here
}
