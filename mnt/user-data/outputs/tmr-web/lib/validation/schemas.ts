import { z } from 'zod';

/** Every server action validates its input with one of these before touching the DB. */

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Passwords are capped at 72 characters');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(1, 'Enter your name').max(120),
});

export const resetRequestSchema = z.object({ email: emailSchema });
export const updatePasswordSchema = z.object({ password: passwordSchema });

/** Registration wizard — mirrors the five steps of the existing sign-up flow. */
export const registrationSchema = z.object({
  // step 1
  fullName: z.string().trim().min(1, 'Enter your name').max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  birthday: z.string().date().optional().or(z.literal('')),
  gender: z.string().trim().max(60).optional().or(z.literal('')),
  // step 2
  experience: z.string().trim().max(120).optional().or(z.literal('')),
  twoMileTime: z.string().trim().max(20).optional().or(z.literal('')),
  typicalPace: z.string().trim().max(20).optional().or(z.literal('')),
  goal: z.string().trim().max(280).optional().or(z.literal('')),
  // step 3
  streetAddress: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  region: z.string().trim().max(100).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  // step 4
  emergencyName: z.string().trim().max(120).optional().or(z.literal('')),
  emergencyPhone: z.string().trim().max(40).optional().or(z.literal('')),
  medicalNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  heardAbout: z.string().trim().max(120).optional().or(z.literal('')),
  excitedAbout: z.string().trim().max(280).optional().or(z.literal('')),
  prefersWeekdays: z.coerce.boolean().default(true),
  prefersWeekends: z.coerce.boolean().default(true),
  // step 5 — waiver
  fitnessAck: z.literal(true, { errorMap: () => ({ message: 'Confirm you are fit to participate' }) }),
  riskAck: z.literal(true, { errorMap: () => ({ message: 'Acknowledge the assumption of risk' }) }),
  conductAck: z.literal(true, { errorMap: () => ({ message: 'Agree to the code of conduct' }) }),
  termsAck: z.literal(true, { errorMap: () => ({ message: 'Accept the privacy policy and terms' }) }),
  marketingOptin: z.coerce.boolean().default(false),
  signature: z.string().trim().min(1, 'Type your full name as a signature').max(120),
});

/** mm:ss or h:mm:ss */
const durationRegex = /^(\d{1,2}:)?\d{1,3}:\d{2}$/;

export const logRunSchema = z.object({
  ranOn: z.string().date('Pick a valid date'),
  distanceMi: z.coerce.number().positive('Distance must be greater than 0').max(200),
  duration: z.string().trim().regex(durationRegex, 'Use a time like 18:30'),
  routeId: z.string().uuid().optional().or(z.literal('')),
  routeLabel: z.string().trim().max(120).optional().or(z.literal('')),
});

export const routeCommentSchema = z.object({
  routeId: z.string().uuid(),
  body: z.string().trim().min(1, 'Write a review first').max(1000),
});

export const routeSuggestionSchema = z.object({
  name: z.string().trim().min(1, 'Add a route name').max(120),
  distance: z.string().trim().min(1, 'Add a distance').max(40),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  reason: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const postSchema = z.object({
  caption: z.string().trim().min(1, 'Write a caption first').max(2000),
  photos: z.array(z.string().trim().max(500)).max(3, 'Up to 3 photos per post').default([]),
});

export const postCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1).max(1000),
});

export const reactionSchema = z.object({
  postId: z.string().uuid(),
  emoji: z.string().min(1).max(8),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  goal: z.string().trim().max(280).optional().or(z.literal('')),
  experience: z.string().trim().max(120).optional().or(z.literal('')),
  typicalPace: z.string().trim().max(20).optional().or(z.literal('')),
  visibility: z.enum(['public', 'members', 'private']),
});

export const consentSchema = z.object({
  necessary: z.literal(true),
  functional: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.enum(['tee-black', 'tee-white', 'stickers']),
        size: z.enum(['S', 'M', 'L', 'XL']).optional(),
        qty: z.number().int().min(1).max(10),
      })
    )
    .min(1, 'Your cart is empty')
    .max(20),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LogRunInput = z.infer<typeof logRunSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
