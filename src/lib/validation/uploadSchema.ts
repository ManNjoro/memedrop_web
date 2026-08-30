import { z } from 'zod';

export const uploadDetailsSchema = z.object({
  title: z.string().trim().min(3, 'Title needs at least 3 characters').max(80, 'Title is too long'),
  description: z.string().trim().max(280, 'Description is too long').optional(),
});

export type UploadDetailsFormValues = z.infer<typeof uploadDetailsSchema>;