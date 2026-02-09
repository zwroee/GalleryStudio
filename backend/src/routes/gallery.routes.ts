import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import path from 'path';
import fs from 'fs/promises';
import { authenticate } from '../middleware/auth';
import { createGallerySchema, updateGallerySchema, validateBody } from '../middleware/validation';
import { GalleryService } from '../services/gallery.service';
import { ImageProcessingService } from '../services/image-processing.service';
import { EmailCollectionService } from '../services/email-collection.service';
import { AuthService } from '../services/auth.service';
import { updatePhotoMetadata } from '../utils/photo.utils';
import { CreateGalleryRequest, UpdateGalleryRequest } from '../types';

export default async function galleryRoutes(fastify: FastifyInstance) {
    /**
     * GET /api/galleries
     * Get all galleries (admin only)
     */
    fastify.get('/', { onRequest: [authenticate] }, async (request: FastifyRequest) => {
        const galleries = await GalleryService.getAllGalleries();
        return { galleries };
    });

    /**
     * POST /api/galleries
     * Create new gallery (admin only)
     */
    fastify.post('/', { onRequest: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = validateBody(createGallerySchema, request.body);
            const gallery = await GalleryService.createGallery(data);

            return reply.status(201).send({ gallery });
        } catch (err) {
            request.log.error(err);
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });

    /**
     * GET /api/galleries/:id
     * Get gallery by ID (admin only)
     */
    interface GetGalleryRequest {
        Params: { id: string };
    }
    fastify.get<GetGalleryRequest>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
        const gallery = await GalleryService.getGalleryById(request.params.id);

        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        return { gallery };
    });

    /**
     * GET /api/galleries/:id/emails
     * Get collected client emails for a gallery (admin only)
     */
    interface GetEmailsRequest {
        Params: { id: string };
    }
    fastify.get<GetEmailsRequest>('/:id/emails', { onRequest: [authenticate] }, async (request, reply) => {
        const galleryId = request.params.id;

        // Verify gallery exists
        const gallery = await GalleryService.getGalleryById(galleryId, false);
        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        const emails = await EmailCollectionService.getGalleryEmails(galleryId);
        return { emails };
    });

    /**
     * PATCH /api/galleries/:id
     * Update gallery (admin only)
     */
    interface UpdateGalleryRouteRequest {
        Params: { id: string };
        Body: UpdateGalleryRequest;
    }
    fastify.patch<UpdateGalleryRouteRequest>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
        try {
            const data = validateBody(updateGallerySchema, request.body);
            const gallery = await GalleryService.updateGallery(request.params.id, data);

            if (!gallery) {
                return reply.status(404).send({ error: 'Gallery not found' });
            }

            return { gallery };
        } catch (err) {
            request.log.error(err);
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });

    /**
     * DELETE /api/galleries/:id
     * Delete gallery (admin only)
     */
    interface DeleteGalleryRequest {
        Params: { id: string };
    }
    fastify.delete<DeleteGalleryRequest>('/:id', { onRequest: [authenticate] }, async (request, reply) => {
        const gallery = await GalleryService.getGalleryById(request.params.id, false);

        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        // Delete from database (cascades to photos)
        await GalleryService.deleteGallery(request.params.id);

        // Delete files from disk
        await ImageProcessingService.deleteGalleryDirectory(request.params.id);

        return { success: true };
    });

    /**
     * POST /api/galleries/:id/photos
     * Upload photos to gallery (admin only)
     */
    interface UploadPhotosRequest {
        Params: { id: string };
    }
    fastify.post<UploadPhotosRequest>('/:id/photos', { onRequest: [authenticate] }, async (request, reply) => {
        const galleryId = request.params.id;

        // Verify gallery exists
        const gallery = await GalleryService.getGalleryById(galleryId, false);
        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        try {
            const safeTempDir = path.join('/storage', 'temp');
            await fs.mkdir(safeTempDir, { recursive: true });

            const files = await request.saveRequestFiles();
            const uploadedPhotos = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filename = file.filename;
                const tempPath = file.filepath;

                // Copy to safe temp location (Fastify deletes tempPath after response)
                const safePath = path.join(safeTempDir, `${Date.now()}-${filename}`);
                await fs.copyFile(tempPath, safePath);

                // Add photo record with pending status
                const photo = await GalleryService.addPhoto(
                    galleryId,
                    filename,
                    '', // Will be updated after processing
                    0, 0, 0, // Placeholder values
                    file.mimetype,
                    i
                );

                const user = request.user as { id: string };
                const adminUser = await AuthService.getUserById(user.id);
                const watermarkPath = adminUser?.watermark_logo_path || undefined;

                // Process image asynchronously using SAFE path
                processImageAsync(galleryId, photo.id, safePath, filename, watermarkPath);

                uploadedPhotos.push({
                    id: photo.id,
                    filename,
                    status: 'processing',
                });
            }

            return { photos: uploadedPhotos };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Upload failed' });
        }
    });

    /**
     * DELETE /api/galleries/:galleryId/photos/:photoId
     * Delete photo from gallery (admin only)
     */
    interface DeletePhotoRequest {
        Params: { galleryId: string; photoId: string };
    }
    fastify.delete<DeletePhotoRequest>('/:galleryId/photos/:photoId', { onRequest: [authenticate] }, async (request, reply) => {
        const { galleryId, photoId } = request.params;

        const photo = await GalleryService.getPhotoById(photoId);

        if (!photo || photo.gallery_id !== galleryId) {
            return reply.status(404).send({ error: 'Photo not found' });
        }

        // Delete from database
        await GalleryService.deletePhoto(photoId);

        // Delete files from disk
        await ImageProcessingService.deletePhotoFiles(galleryId, photo.filename);

        return { success: true };
    });

    /**
     * POST /api/galleries/:id/download-all
     * Download all photos in a gallery as ZIP (requires email)
     */
    interface DownloadAllRequest {
        Params: { id: string };
        Body: { email: string };
    }
    fastify.post<DownloadAllRequest>('/:id/download-all', async (request, reply) => {
        const { id } = request.params;
        const { email } = request.body;

        if (!email || !email.includes('@')) {
            return reply.status(400).send({ error: 'Valid email required' });
        }

        // Get gallery with photos
        const gallery = await GalleryService.getGalleryById(id, true);
        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        // Collect email
        await EmailCollectionService.recordGalleryAccess(id, email);

        // Import archiver
        const archiver = require('archiver');

        // Set response headers for ZIP download
        reply.header('Content-Type', 'application/zip');
        reply.header('Content-Disposition', `attachment; filename="${gallery.title.replace(/[^a-z0-9]/gi, '_')}.zip"`);

        // Create ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Pipe archive to response
        archive.pipe(reply.raw);

        // Add each photo to the archive
        for (const photo of gallery.photos) {
            const photoPath = path.join(process.cwd(), 'storage', photo.file_path);
            try {
                await fs.access(photoPath);
                archive.file(photoPath, { name: photo.filename });
            } catch (err) {
                request.log.warn(`Photo not found: ${photoPath}`);
            }
        }

        // Finalize the archive
        await archive.finalize();

        return reply;
    });

    /**
     * POST /api/galleries/:id/cover
     * Upload cover image
     */
    interface UploadCoverRequest {
        Params: { id: string };
    }
    fastify.post<UploadCoverRequest>('/:id/cover', { onRequest: [authenticate] }, async (request, reply) => {
        const { id } = request.params;

        const gallery = await GalleryService.getGalleryById(id, false);
        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'No file uploaded' });
            }

            const buffer = await data.toBuffer();
            const filename = `cover-${id}-${Date.now()}${path.extname(data.filename)}`;
            // Use absolute path matching Docker volume
            const uploadDir = path.join('/storage', 'uploads');
            const filePath = path.join(uploadDir, filename);

            // Ensure directory exists
            await fs.mkdir(uploadDir, { recursive: true });

            // Save file
            await fs.writeFile(filePath, buffer);

            const relativePath = `uploads/${filename}`;

            // Update gallery record
            await GalleryService.updateGallery(id, { cover_image_path: relativePath });

            return { success: true, path: relativePath };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Upload failed' });
        }
    });
}

/**
 * Process image asynchronously (non-blocking)
 */
async function processImageAsync(
    galleryId: string,
    photoId: string,
    tempPath: string,
    filename: string,
    watermarkPath?: string
) {
    try {
        // Update status to processing
        await GalleryService.updatePhotoStatus(photoId, 'processing');

        // Process image
        const processed = await ImageProcessingService.processImage(
            galleryId,
            tempPath,
            filename,
            watermarkPath
        );

        // Update photo record with actual metadata
        const photo = await GalleryService.getPhotoById(photoId);
        if (photo) {
            // Update with actual metadata from processing
            await updatePhotoMetadata(
                photoId,
                path.relative(process.cwd(), processed.sizes.original),
                processed.width,
                processed.height,
                processed.fileSize,
                processed.mimeType
            );

            await GalleryService.updatePhotoStatus(photoId, 'completed');
        }

        // Clean up temp file
        await fs.unlink(tempPath);

        console.log(`✓ Processed image: ${filename}`);
    } catch (err) {
        console.error(`✗ Failed to process image: ${filename}`, err);
        await GalleryService.updatePhotoStatus(photoId, 'failed');

        // Clean up temp file
        try {
            await fs.unlink(tempPath);
        } catch { }
    }

}
