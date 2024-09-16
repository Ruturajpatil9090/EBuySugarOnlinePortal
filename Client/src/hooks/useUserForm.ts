import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  basicInfoSchema,
  contactInfoSchema,
  personalInfoSchema,
  paymentSchema,
  BasicInfoSchema,
  ContactInfoSchema,
  PersonalInfoSchema,
  PaymentSchema
} from '../validation/userSchemas';

// Define types for form data
type FormSchemas = 
  | BasicInfoSchema
  | ContactInfoSchema
  | PersonalInfoSchema
  | PaymentSchema;

// Function to get the appropriate schema based on the step
const getSchemaForStep = (step: number) => {
  switch (step) {
    case 0:
      return basicInfoSchema;
    case 1:
      return contactInfoSchema;
    case 2:
      return personalInfoSchema;
    case 3:
      return paymentSchema;
    default:
      throw new Error('Unknown step');
  }
};

const useUserForm = (step: number): UseFormReturn<FormSchemas> => {
  return useForm<FormSchemas>({
    resolver: zodResolver(getSchemaForStep(step)),
    mode: 'onBlur',
  });
};

export default useUserForm;
