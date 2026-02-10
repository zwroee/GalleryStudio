import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { GalleryService } from '../services/gallery.service';
import { FavoriteService } from '../services/favorite.service';
import { EmailCollectionService } from '../services/email-collection.service';
import { verifyPasswordSchema, validateBody } from '../middleware/validation';

export default async function clientRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/client/galleries/:id/verify
     * Verify gallery password and get session token
     * Also collects client email for marketing purposes
     */
    fastify.post('/galleries/:id/verify', async (request: FastifyRequest<{
        Params: { id: string };
        Body: { password: string; email?: string };
    }>, reply: FastifyReply) => {
        const galleryId = request.params.id;

        try {
            const { password } = validateBody(verifyPasswordSchema, request.body);
            const { email } = request.body as { password: string; email?: string };

            const isValid = await AuthService.verifyGalleryPassword(galleryId, password);

            if (!isValid) {
                return reply.status(401).send({ error: 'Invalid password' });
            }

            // Generate session token (simple JWT without admin privileges)
            const sessionToken = fastify.jwt.sign({
                galleryId,
                type: 'client',
            });

            // Store email if provided
            if (email && email.trim()) {
                try {
                    await EmailCollectionService.recordGalleryAccess(galleryId, email.trim());
                } catch (err) {
                    // Log error but don't fail the request
                    request.log.error({ err }, 'Failed to store email');
                }
            }

            return { sessionToken };
        } catch (err) {
            request.log.error(err);
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });

    /**
     * GET /api/client/galleries/:id
     * Get gallery with photos (requires valid session or public gallery)
     */
    fastify.get('/galleries/:id', async (request: FastifyRequest<{
        Params: { id: string };
        Querystring: { sessionId?: string };
    }>, reply: FastifyReply) => {
        const galleryId = request.params.id;
        const sessionId = request.query.sessionId || 'anonymous';

        const gallery = await GalleryService.getGalleryById(galleryId);

        if (!gallery) {
            return reply.status(404).send({ error: 'Gallery not found' });
        }

        // Gallery is now publicly viewable - password protection moved to downloads only

        // Get favorite statuses for this session
        const photoIds = gallery.photos.map(p => p.id);
        const favoriteStatuses = await FavoriteService.getFavoriteStatuses(photoIds, sessionId);

        // Add favorite status to each photo
        const photosWithFavorites = gallery.photos.map(photo => ({
            ...photo,
            is_favorited: favoriteStatuses.get(photo.id) || false,
        }));

        // Remove password hash from response
        const { password_hash, ...galleryData } = gallery;

        return {
            gallery: {
                ...galleryData,
                photos: photosWithFavorites,
            },
        };
    });

    /**
     * POST /api/client/photos/:id/favorite
     * Toggle favorite for a photo
     */
    fastify.post('/photos/:id/favorite', async (request: FastifyRequest<{
        Params: { id: string };
        Body: { sessionId: string };
    }>, reply: FastifyReply) => {
        const photoId = request.params.id;
        const { sessionId } = request.body as { sessionId: string };

        if (!sessionId) {
            return reply.status(400).send({ error: 'Session ID required' });
        }

        const isFavorited = await FavoriteService.toggleFavorite(photoId, sessionId);

        return { favorited: isFavorited };
    });

    /**
     * GET /api/client/galleries/:id/favorites
     * Get favorited photos for a gallery
     */
    fastify.get('/galleries/:id/favorites', async (request: FastifyRequest<{
        Params: { id: string };
        Querystring: { sessionId: string };
    }>, reply: FastifyReply) => {
        const galleryId = request.params.id;
        const sessionId = request.query.sessionId;

        if (!sessionId) {
            return reply.status(400).send({ error: 'Session ID required' });
        }

        const favorites = await FavoriteService.getFavoritesByGallery(galleryId, sessionId);

        return { favorites };
    });
}
