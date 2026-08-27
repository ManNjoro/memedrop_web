import { z } from 'zod';

// "identifier" (not "emailAddress") because this Clerk instance accepts
// both email and username as sign-in identifiers.
export const signInSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscores, and periods'),
  email: z.email('Enter a valid email address').trim().min(1, 'Enter your email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password needs at least one letter')
    .regex(/[0-9]/, 'Password needs at least one number'),
});

export const verifyCodeSchema = z.object({
  code: z.string().trim().length(6, 'Enter the 6-digit code'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;