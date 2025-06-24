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
  status: ApprovalStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}
