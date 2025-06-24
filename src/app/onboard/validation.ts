import * as yup from 'yup';
import { FormValues } from './types';

export const onboardingSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  stageName: yup.string(),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  bio: yup
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio cannot exceed 1000 characters')
    .required('Bio is required'),
  experience: yup.string().required('Experience level is required'),
  categories: yup
    .array()
    .min(1, 'Select at least one category')
    .required('Category is required'),
  languages: yup
    .array()
    .min(1, 'Select at least one language')
    .required('Language is required'),
  feeRange: yup.string().required('Fee range is required'),
  location: yup.string().required('Location is required'),
  profileImage: yup.mixed().nullable(),
});

export const defaultValues: FormValues = {
  fullName: '',
  stageName: '',
  email: '',
  phone: '',
  bio: '',
  experience: '',
  categories: [],
  languages: [],
  feeRange: '',
  location: '',
  profileImage: null,
};
