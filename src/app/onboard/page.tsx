'use client';

import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDropzone } from 'react-dropzone';
import { ArrowRight, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types and validation
import { onboardingSchema, defaultValues } from './validation';
import {
  CATEGORIES,
  LANGUAGES,
  FEE_RANGES,
  EXPERIENCE_LEVELS,
} from './types';

type FormValues = {
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
};

export default function OnboardPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  // Image loading state for transitions and animations
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Apply fade-in effect when image loads
  const imageClasses = `object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`;

  const router = useRouter();
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormValues>({
    
    resolver: yupResolver(onboardingSchema) as never,
    defaultValues,
    mode: 'onChange',
  });

  const watchedCategories = watch('categories') || [];
  const watchedLanguages = watch('languages') || [];

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setValue('profileImage', file, { shouldValidate: true });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const removeImage = () => {
    setValue('profileImage', null, { shouldValidate: true });
    
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      
      console.log('Form data:', data);
      console.log('Fee range from form:', data.feeRange);
      
      const formData = new FormData();
      const name = data.stageName || data.fullName;
      const category = data.categories[0] || 'Other';
      const city = data.location || 'Not specified';
      // Remove currency symbol and commas, then take the first value if it's a range
      const feeValue = (data.feeRange?.split('-')[0]?.trim() || '0')
        .replace(/[^0-9]/g, ''); // Remove all non-numeric characters
      
      console.log('Processed fee value:', feeValue);
      
      formData.append('name', name);
      formData.append('category', category);
      formData.append('city', city);
      formData.append('fee', feeValue);
      formData.append('bio', data.bio);
      formData.append('experience', data.experience);
      formData.append('languages', data.languages.join(','));
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      
      // Log all form data entries
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage);
      }

      const response = await fetch('/api/artists', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit form');
      }
      
      // Redirect to success page
      router.push('/onboard/success');
    } catch (error) {
      console.error('Error saving artist submission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(0.21_0.034_264.665)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become an Artist</h1>
          <p className="text-gray-600">Join our community of talented performers</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stageName">Stage Name</Label>
                  <Input
                    id="stageName"
                    placeholder="Your stage name (optional)"
                    {...register('stageName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level *</Label>
                  <Controller
                    name="experience"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500">{errors.experience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Your city, state"
                    {...register('location')}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">
                    Bio * <span className="text-xs text-gray-500">(Min. 50 characters)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your experience, and what makes you unique..."
                    rows={4}
                    {...register('bio')}
                  />
                  <div className="flex justify-between">
                    {errors.bio ? (
                      <p className="text-sm text-red-500">{errors.bio.message}</p>
                    ) : (
                      <div />
                    )}
                    <p className="text-xs text-gray-500">
                      {watch('bio')?.length || 0}/1000 characters
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories *</CardTitle>
              <p className="text-sm text-gray-500">Select the categories that best describe your talent</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={watchedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        const newCategories = checked
                          ? [...watchedCategories, category]
                          : watchedCategories.filter((c) => c !== category);
                        setValue('categories', newCategories, { shouldValidate: true });
                      }}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-2 text-sm text-red-500">{errors.categories.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Languages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Languages *</CardTitle>
              <p className="text-sm text-gray-500">Select the languages you are comfortable performing in</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {LANGUAGES.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={`language-${language}`}
                      checked={watchedLanguages.includes(language)}
                      onCheckedChange={(checked) => {
                        const newLanguages = checked
                          ? [...watchedLanguages, language]
                          : watchedLanguages.filter((l) => l !== language);
                        setValue('languages', newLanguages, { shouldValidate: true });
                      }}
                    />
                    <label
                      htmlFor={`language-${language}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {language}
                    </label>
                  </div>
                ))}
              </div>
              {errors.languages && (
                <p className="mt-2 text-sm text-red-500">{errors.languages.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Fee Range Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fee Range *</CardTitle>
              <p className="text-sm text-gray-500">Select your expected performance fee range</p>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-md">
                <Controller
                  name="feeRange"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee range" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEE_RANGES.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.feeRange && (
                  <p className="mt-2 text-sm text-red-500">{errors.feeRange.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Image</CardTitle>
              <p className="text-sm text-gray-500">Upload a professional profile picture (optional)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    {...getRootProps()}
                    className={`relative w-40 h-40 mx-auto rounded-full border-2 border-dashed ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    } transition-colors cursor-pointer flex items-center justify-center`}
                  >
                    <input {...getInputProps()} />
                    {previewImage ? (
                      <>
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <Image
                            src={previewImage}
                            alt="Profile preview"
                            fill
                            className={imageClasses}
                            onLoadingComplete={() => setIsImageLoaded(true)}
                            onError={() => setPreviewImage('')}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {isDragActive ? 'Drop the image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (max. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-8 py-6 text-base font-medium rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
