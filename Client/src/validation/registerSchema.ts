import * as z from 'zod';

export const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    companyName: z.string().min(1, 'Company name is required'),
    city: z.string().min(1, 'City is required'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' })
});

export type RegisterSchema = z.infer<typeof registerSchema>;
