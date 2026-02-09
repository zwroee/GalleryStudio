import { z } from 'zod';

// Gallery validation schemas
export const createGallerySchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    password: z.string().min(4).optional(),
    allow_downloads: z.boolean().default(true),
    allow_favorites: z.boolean().default(true),
});

export const updateGallerySchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    password: z.string().min(4).optional(),
    allow_downloads: z.boolean().optional(),
    allow_favorites: z.boolean().optional(),
    cover_image_path: z.string().nullable().optional(),
});

// Auth validation schemas
export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export const verifyPasswordSchema = z.object({
    password: z.string().min(1),
});

// Helper function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}
