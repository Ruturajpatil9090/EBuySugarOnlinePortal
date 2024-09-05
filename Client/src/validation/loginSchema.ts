// src/validation/loginSchema.ts
import * as z from 'zod';

export const loginSchema = z.object({
    mobileNumber: z.string().length(10,'Mobile number must be at least 10 digits')
});

export type LoginSchema = z.infer<typeof loginSchema>;
