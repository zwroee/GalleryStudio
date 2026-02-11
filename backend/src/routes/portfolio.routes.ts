import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../middleware/auth';
import { PortfolioService } from '../services/portfolio.service';
import { ImageProcessingService } from '../services/image-processing.service';
import { MultipartFile } from '@fastify/multipart';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { pipeline } from 'stream';
import { config } from '../config/env';
import { AuthService } from '../services/auth.service';

const pump = util.promisify(pipeline);

export default async function portfolioRoutes(fastify: FastifyInstance) {
    /**
     * GET /api/portfolio
     * Get all portfolio images (public)
     */
    fastify.get('/', async (request, reply) => {
        const images = await PortfolioService.getAllImages();
        const profile = await AuthService.getFirstAdminUser();

        return {
            images,
            profile: profile ? {
                business_name: profile.business_name,
                website: profile.website,
                phone: profile.phone,
                email: profile.email,
                profile_picture_path: profile.profile_picture_path
            } : null
        };
    });

    /**
     * POST /api/portfolio
     * Upload new portfolio image (admin only)
     */
    fastify.post('/', { onRequest: [authenticate] }, async (request, reply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }

        try {
            // Save to temp file
            const tempPath = path.join(process.cwd(), 'temp', `upload-${Date.now()}-${data.filename}`);
            await fs.promises.mkdir(path.dirname(tempPath), { recursive: true });
            await pump(data.file, fs.createWriteStream(tempPath));

            // Get watermark path from admin user
            const user = request.user as { id: string };
            const adminUser = await AuthService.getUserById(user.id);
            const watermarkPath = adminUser?.watermark_logo_path
                ? path.join('/storage', adminUser.watermark_logo_path)
                : undefined;

            // Process image
            const processed = await ImageProcessingService.processPortfolioImage(
                tempPath,
                data.filename,
                watermarkPath
            );

            // Get category from fields
            const fields = data.fields as any;
            const category = fields?.category?.value || 'WEDDING';

            // Save to DB
            const image = await PortfolioService.addImage(
                processed.url,
                category,
                processed.width,
                processed.height
            );

            return { image };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Upload failed' });
        }
    });

    /**
     * POST /api/portfolio/bulk
     * Upload multiple portfolio images (admin only)
     */
    fastify.post('/bulk', { onRequest: [authenticate] }, async (request, reply) => {
        try {
            const parts = request.parts();
            const tempFiles: { path: string; filename: string }[] = [];
            let category = 'WEDDING';

            // Collect all files and category
            for await (const part of parts) {
                if (part.type === 'file') {
                    // We must consume the file stream immediately
                    const tempPath = path.join(process.cwd(), 'temp', `upload-${Date.now()}-${part.filename}`);
                    await fs.promises.mkdir(path.dirname(tempPath), { recursive: true });
                    await pump(part.file, fs.createWriteStream(tempPath));

                    tempFiles.push({
                        path: tempPath,
                        filename: part.filename
                    });
                } else if (part.type === 'field' && part.fieldname === 'category') {
                    category = part.value as string;
                }
            }

            if (tempFiles.length === 0) {
                return reply.status(400).send({ error: 'No files uploaded' });
            }

            // Get watermark path from admin user
            const user = request.user as { id: string };
            const adminUser = await AuthService.getUserById(user.id);
            const watermarkPath = adminUser?.watermark_logo_path
                ? path.join('/storage', adminUser.watermark_logo_path)
                : undefined;

            const images = [];

            // Process each saved temp file
            for (const file of tempFiles) {
                try {
                    // Process image
                    const processed = await ImageProcessingService.processPortfolioImage(
                        file.path,
                        file.filename,
                        watermarkPath
                    );

                    // Save to DB
                    const image = await PortfolioService.addImage(
                        processed.url,
                        category,
                        processed.width,
                        processed.height
                    );

                    images.push(image);
                } catch (err) {
                    request.log.error({ err, file: file.filename }, 'Failed to process individual file in bulk upload');
                    // Continue with other files even if one fails
                }
            }

            return { images };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Bulk upload failed' });
        }
    });

    /**
     * DELETE /api/portfolio/:id
     * Delete portfolio image (admin only)
     */
    interface DeleteRequest {
        Params: { id: string };
    }
    fastify.delete<DeleteRequest>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const url = await PortfolioService.deleteImage(id);

        if (!url) {
            return reply.status(404).send({ error: 'Image not found' });
        }

        // Delete file
        await ImageProcessingService.deletePortfolioImage(url);

        return { success: true };
    });

    /**
     * POST /api/portfolio/bulk-delete
     * Delete multiple portfolio images (admin only)
     */
    interface BulkDeleteRequest {
        Body: { ids: string[] };
    }
    fastify.post<BulkDeleteRequest>('/bulk-delete', { onRequest: [authenticate] }, async (request, reply) => {
        const { ids } = request.body;

        if (!ids || ids.length === 0) {
            return reply.status(400).send({ error: 'No image IDs provided' });
        }

        try {
            const deletedUrls = [];

            for (const id of ids) {
                const url = await PortfolioService.deleteImage(id);
                if (url) {
                    deletedUrls.push(url);
                }
            }

            // Delete files
            for (const url of deletedUrls) {
                await ImageProcessingService.deletePortfolioImage(url);
            }

            return { success: true, deleted: deletedUrls.length };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Bulk delete failed' });
        }
    });
}
