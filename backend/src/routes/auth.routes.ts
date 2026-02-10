import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
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
            const filename = `watermark-${Date.now()}${require('path').extname(data.filename)}`;
            const uploadDir = require('path').join('/storage', 'uploads');
            const filePath = require('path').join(uploadDir, filename);

            // Ensure directory exists
            await require('fs').promises.mkdir(uploadDir, { recursive: true });

            // Save file
            await require('fs').promises.writeFile(filePath, buffer);

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
     * Debug watermark path and existence
     */
    fastify.get('/debug-watermark', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Public debug for now - verify logic
            // Get ANY admin user to check their watermark
            const result = await require('../config/database').default.query('SELECT * FROM admin_users LIMIT 1');
            const user = result.rows[0];

            if (!user) {
                return { error: 'No admin user found' };
            }

            const dbPath = user.watermark_logo_path;
            if (!dbPath) {
                return { status: 'no_watermark_in_db' };
            }

            const fullPath = require('path').join('/storage', dbPath);
            let fileExists = false;
            let fileStats = null;
            let sharpMetadata = null;

            try {
                const stats = await require('fs').promises.stat(fullPath);
                fileExists = true;
                fileStats = {
                    size: stats.size,
                    uid: stats.uid,
                    gid: stats.gid,
                    mode: stats.mode
                };
            } catch (e) {
                fileExists = false;
            }

            if (fileExists) {
                try {
                    const sharp = require('sharp');
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
            return { error: 'Debug failed', details: err };
        }
    });
}
