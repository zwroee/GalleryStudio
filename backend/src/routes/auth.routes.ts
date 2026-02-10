import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import path from 'path';
import fs from 'fs/promises';
import pool from '../config/database';
import { AuthService } from '../services/auth.service';
import { loginSchema, validateBody } from '../middleware/validation';
import { LoginRequest } from '../types';

export default async function authRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/auth/login
     * Admin login endpoint
     */
    fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const credentials = validateBody(loginSchema, request.body);

            const user = await AuthService.login(credentials);

            if (!user) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username,
            });

            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            };
        } catch (err) {
            request.log.error(err);
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });

    /**
     * GET /api/auth/verify
     * Verify JWT token
     */
    fastify.get('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            const payload = request.user as { id: string; username: string };
            const user = await AuthService.getUserById(payload.id);

            if (!user) {
                return reply.status(401).send({ error: 'User not found' });
            }

            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    watermark_logo_path: user.watermark_logo_path,
                },
            };
        } catch (err) {
            return reply.status(401).send({ error: 'Invalid token' });
        }
    });

    /**
     * POST /api/auth/watermark
     * Upload watermark logo
     */
    fastify.post('/watermark', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
            const payload = request.user as { id: string };

            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'No file uploaded' });
            }

            const buffer = await data.toBuffer();
            const filename = `watermark-${Date.now()}${path.extname(data.filename)}`;
            const uploadDir = path.join('/storage', 'uploads');
            const filePath = path.join(uploadDir, filename);

            // Ensure directory exists
            await fs.mkdir(uploadDir, { recursive: true });

            // Delete old watermark if exists
            const user = await AuthService.getUserById(payload.id);
            if (user && user.watermark_logo_path) {
                const oldPath = path.join('/storage', user.watermark_logo_path);
                try {
                    await fs.unlink(oldPath);
                } catch (err) {
                    request.log.warn(`Failed to delete old watermark: ${oldPath}`);
                }
            }

            // Save file
            await fs.writeFile(filePath, buffer);

            const relativePath = `uploads/${filename}`;

            // Update user record
            await AuthService.updateWatermark(payload.id, relativePath);

            return { success: true, path: relativePath };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Upload failed' });
        }
    });

    /**
     * GET /api/auth/debug-watermark
     * Debug watermark path and existence (Public for diagnosis)
     */
    fastify.get('/debug-watermark', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Lazy load sharp
            const sharp = (await import('sharp')).default;

            // Public debug - Get ANY admin user to check their watermark
            const result = await pool.query('SELECT * FROM admin_users LIMIT 1');
            const user = result.rows[0];

            if (!user) {
                return { error: 'No admin user found' };
            }

            const dbPath = user.watermark_logo_path;
            if (!dbPath) {
                return { status: 'no_watermark_in_db' };
            }

            const fullPath = path.join('/storage', dbPath);
            let fileExists = false;
            let fileStats = null;
            let sharpMetadata = null;

            try {
                const stats = await fs.stat(fullPath);
                fileExists = true;
                fileStats = {
                    size: stats.size,
                    uid: stats.uid,
                    gid: stats.gid,
                    mode: stats.mode
                };
            } catch (e: any) {
                fileExists = false;
            }

            if (fileExists) {
                try {
                    const meta = await sharp(fullPath).metadata();
                    sharpMetadata = {
                        format: meta.format,
                        width: meta.width,
                        height: meta.height
                    };
                } catch (e: any) {
                    sharpMetadata = { error: e.message };
                }
            }

            return {
                status: 'checked',
                db_path: dbPath,
                full_path: fullPath,
                file_exists: fileExists,
                file_stats: fileStats,
                sharp_readability: sharpMetadata
            };

        } catch (err) {
            request.log.error(err);
            return { error: 'Debug failed', details: err };
        }
    });

    /**
     * GET /api/auth/test-watermark
     * Generate a test image with the user's watermark applied
     */
    fastify.get('/test-watermark', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Lazy load dependencies
            const sharp = (await import('sharp')).default;
            const { ImageProcessingService } = await import('../services/image-processing.service');

            // Get ANY admin user to check their watermark
            const result = await pool.query('SELECT * FROM admin_users LIMIT 1');
            const user = result.rows[0];

            if (!user || !user.watermark_logo_path) {
                return reply.status(404).send({ error: 'No watermark found for admin' });
            }

            const watermarkPath = path.join('/storage', user.watermark_logo_path);

            // Create a grey background image
            const width = 1000;
            const height = 800;
            let image = sharp({
                create: {
                    width,
                    height,
                    channels: 3,
                    background: { r: 200, g: 200, b: 200 }
                }
            });

            // Apply watermark
            image = await ImageProcessingService.applyWatermark(image, watermarkPath, width);

            // Return as JPEG
            const buffer = await image.jpeg().toBuffer();
            reply.type('image/jpeg').send(buffer);

        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Test failed', details: err });
        }
    });
}
