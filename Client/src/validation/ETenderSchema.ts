// src/validation/tenderSchema.ts
import * as z from 'zod';

// Define the validation schema for the tender form
export const tenderSchema = z.object({
    Mill_Code: z.number().min(1, 'Mill Code is required'),
    Delivery_From: z.string().min(1, 'Delivery From is required'),
    Start_Date: z.string().min(1, 'Start Date is required'),
    Start_Time: z.string().min(1, 'Start Time is required'),
    End_Date: z.string().min(1, 'End Date is required'),
    End_Time: z.string().min(1, 'End Time is required'),
    Last_Dateof_Payment: z.string().min(1, 'Last Date of Payment is required'),
    Lifting_Date: z.string().min(1, 'Lifting Date is required'),
    Season: z.string().min(1, 'Season is required'),
    Packing: z.string().min(1, 'Packing is required'),
    Sugar_Type: z.string().min(1, 'Sugar Type is required'),
    Grade: z.string().min(1, 'Grade is required'),
    Quantity: z.string().min(1, 'Quantity is required'),
    Base_Rate: z.string().min(1, 'Base Rate is required'),
    Base_Rate_GST_Perc: z.string().min(1, 'GST is required'),
    Rate_Including_GST: z.string().min(1, 'Including GST Rate is required'),
    Quantity_In:z.string().min(1, 'Including GST Rate is required'),
    // acceptTerms: z.boolean(),
    // agreeToConditions: z.boolean(),
    // subscribeToNewsletter: z.boolean(),
});


// Export schema type
export type TenderSchema = z.infer<typeof tenderSchema>;
