import { z } from 'zod';

// Step 1 Schema
export const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  emailAddress: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  LandLineNumber: z.string().min(1, 'Phone number is required'),
  TINNo: z.string().min(1, 'Phone number is required'),
  GSTNo: z.string().min(1, 'Phone number is required'),
  PanNo: z.string().min(1, 'Phone number is required'),
  FSSAINo: z.string().min(1, 'Phone number is required'),
});

// Step 2 Schema
export const contactInfoSchema = z.object({
  Address: z.string().min(1, 'Address is required'),
  Country: z.string().min(1, 'Country is required'),
  State: z.string().min(1, 'Address is required'),
  City: z.string().min(1, 'City is required'),
  ZipCode: z.string().min(1, 'ZipCode is required'),
});

// Step 3 Schema
export const personalInfoSchema = z.object({
  address1: z.string().min(1, 'Address 1 is required'),
  address2: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

// Step 4 Schema
export const paymentSchema = z.object({
  cardNumber: z.string().min(1, 'Card number is required'),
  cardMonth: z.string().min(1, 'Card month is required'),
  cardYear: z.string().min(1, 'Card year is required'),
});

// Export types for TypeScript
export type BasicInfoSchema = z.infer<typeof basicInfoSchema>;
export type ContactInfoSchema = z.infer<typeof contactInfoSchema>;
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type PaymentSchema = z.infer<typeof paymentSchema>;
