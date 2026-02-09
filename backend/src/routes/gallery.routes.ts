import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import path from 'path';
import fs from 'fs/promises';
import { authenticate } from '../middleware/auth';
import { createGallerySchema, updateGallerySchema, validateBody } from '../middleware/validation';
import { GalleryService } from '../services/gallery.service';
import { ImageProcessingService } from '../services/image-processing.service';
import { EmailCollectionService } from '../services/email-collection.service';
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
    fastify.get('/:id', { onRequest: [authenticate] }, async (request: FastifyRequest<{
        Params: { id: string };
    }>, reply: FastifyReply) => {
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
    fastify.get('/:id/emails', { onRequest: [authenticate] }, async (request: FastifyRequest<{
        Params: { id: string };
    }>, reply: FastifyReply) => {
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
    fastify.patch('/:id', { onRequest: [authenticate] }, async (request: FastifyRequest<{
        Params: { id: string };
    }>, reply: FastifyReply) => {
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
    fastify.delete('/:id', { onRequest: [authenticate] }, async (request: FastifyRequest<{
        Params: { id: string };
    }>, reply: FastifyReply) => {
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
    fastify.post('/:id/photos', { onRequest: [authenticate] }, async (request: FastifyRequest<{
        Params: { id: string };
    }>, reply: FastifyReply) => {
        const galleryId = request.params.id;

        // Verify gallery exists
        const gallery = await GalleryService.getGalleryById(galleryId, false);
        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        try {
            const files = await request.saveRequestFiles();
            const uploadedPhotos = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filename = file.filename;
                const tempPath = file.filepath;

                // Add photo record with pending status
                const photo = await GalleryService.addPhoto(
                    galleryId,
                    filename,
                    '', // Will be updated after processing
                    0, 0, 0, // Placeholder values
                    file.mimetype,
                    i
                );

                // Process image asynchronously
                processImageAsync(galleryId, photo.id, tempPath, filename);

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
    fastify.delete('/:galleryId/photos/:photoId', { onRequest: [authenticate] }, async (request: FastifyRequest<{
        Params: { galleryId: string; photoId: string };
    }>, reply: FastifyReply) => {
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
}

/**
 * Process image asynchronously (non-blocking)
 */
async function processImageAsync(
    galleryId: string,
    photoId: string,
    tempPath: string,
    filename: string
) {
    try {
        // Update status to processing
        await GalleryService.updatePhotoStatus(photoId, 'processing');

        // Process image
        const processed = await ImageProcessingService.processImage(
            galleryId,
            tempPath,
            filename
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

