export interface FormValues {
  fullName: string;
  stageName: string;
  email: string;
  phone: string;
  bio: string;
  experience: string;
  categories: string[];
  languages: string[];
  feeRange: string;
  location: string;
  profileImage: File | null;
}

export const CATEGORIES = [
  'Singer',
  'Dancer',
  'Musician',
  'Comedian',
  'Magician',
  'Actor',
  'DJ',
  'Speaker',
  'Other'
];

export const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Other'
];

export const FEE_RANGES = [
  'Under ₹5,000',
  '₹5,000 - ₹10,000',
  '₹10,000 - ₹25,000',
  '₹25,000 - ₹50,000',
  '₹50,000 - ₹1,00,000',
  'Above ₹1,00,000'
];

export const EXPERIENCE_LEVELS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
];
