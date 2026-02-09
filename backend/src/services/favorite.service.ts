import pool from '../config/database';
import { Favorite, Photo } from '../types';

export class FavoriteService {
    /**
     * Toggle favorite for a photo
     */
    static async toggleFavorite(photoId: string, sessionId: string): Promise<boolean> {
        // Check if favorite already exists
        const existing = await pool.query<Favorite>(
            'SELECT * FROM favorites WHERE photo_id = $1 AND session_id = $2',
            [photoId, sessionId]
        );

        if (existing.rows.length > 0) {
            // Remove favorite
            await pool.query(
                'DELETE FROM favorites WHERE photo_id = $1 AND session_id = $2',
                [photoId, sessionId]
            );
            return false; // Unfavorited
        } else {
            // Add favorite
            await pool.query(
                'INSERT INTO favorites (photo_id, session_id) VALUES ($1, $2)',
                [photoId, sessionId]
            );
            return true; // Favorited
        }
    }

    /**
     * Get all favorited photos for a session in a gallery
     */
    static async getFavoritesByGallery(
        galleryId: string,
        sessionId: string
    ): Promise<Photo[]> {
        const result = await pool.query<Photo>(
            `SELECT p.* FROM photos p
       INNER JOIN favorites f ON p.id = f.photo_id
       WHERE p.gallery_id = $1 AND f.session_id = $2 AND p.processing_status = 'completed'
       ORDER BY f.created_at DESC`,
            [galleryId, sessionId]
        );

        return result.rows;
    }

    /**
     * Get favorite status for multiple photos
     */
    static async getFavoriteStatuses(
        photoIds: string[],
        sessionId: string
    ): Promise<Map<string, boolean>> {
        if (photoIds.length === 0) {
            return new Map();
        }

        const result = await pool.query<{ photo_id: string }>(
            'SELECT photo_id FROM favorites WHERE photo_id = ANY($1) AND session_id = $2',
            [photoIds, sessionId]
        );

        const favoriteMap = new Map<string, boolean>();
        photoIds.forEach(id => favoriteMap.set(id, false));
        result.rows.forEach(row => favoriteMap.set(row.photo_id, true));

        return favoriteMap;
    }

    /**
     * Check if a photo is favorited
     */
    static async isFavorited(photoId: string, sessionId: string): Promise<boolean> {
        const result = await pool.query<{ count: string }>(
            'SELECT COUNT(*) as count FROM favorites WHERE photo_id = $1 AND session_id = $2',
            [photoId, sessionId]
        );

        return parseInt(result.rows[0].count) > 0;
    }
}
