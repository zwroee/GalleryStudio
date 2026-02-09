import pool from '../config/database';
import { Gallery, Photo, GalleryWithPhotos, CreateGalleryRequest, UpdateGalleryRequest } from '../types';
import { AuthService } from './auth.service';

export class GalleryService {
    /**
     * Get all galleries (admin only)
     */
    static async getAllGalleries(): Promise<Gallery[]> {
        const result = await pool.query<Gallery>(
            `SELECT g.*, 
                COUNT(DISTINCT p.id)::int as photo_count,
                COUNT(DISTINCT f.id)::int as favorite_count
       FROM galleries g
       LEFT JOIN photos p ON g.id = p.gallery_id AND p.processing_status = 'completed'
       LEFT JOIN favorites f ON p.id = f.photo_id
       GROUP BY g.id
       ORDER BY g.created_at DESC`
        );

        return result.rows;
    }

    /**
     * Get gallery by ID with photos
     */
    static async getGalleryById(id: string, includePhotos = true): Promise<GalleryWithPhotos | null> {
        const galleryResult = await pool.query<Gallery>(
            'SELECT * FROM galleries WHERE id = $1',
            [id]
        );

        if (galleryResult.rows.length === 0) {
            return null;
        }

        const gallery = galleryResult.rows[0];

        if (!includePhotos) {
            return {
                ...gallery,
                photos: [],
                photo_count: 0,
            };
        }

        const photosResult = await pool.query<Photo>(
            `SELECT * FROM photos 
       WHERE gallery_id = $1 AND processing_status = 'completed'
       ORDER BY upload_order ASC, created_at ASC`,
            [id]
        );

        return {
            ...gallery,
            photos: photosResult.rows,
            photo_count: photosResult.rows.length,
        };
    }

    /**
     * Create a new gallery
     */
    static async createGallery(data: CreateGalleryRequest): Promise<Gallery> {
        const passwordHash = data.password
            ? await AuthService.hashPassword(data.password)
            : null;

        const result = await pool.query<Gallery>(
            `INSERT INTO galleries (title, description, password_hash, allow_downloads, allow_favorites)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [
                data.title,
                data.description || null,
                passwordHash,
                data.allow_downloads ?? true,
                data.allow_favorites ?? true,
            ]
        );

        return result.rows[0];
    }

    /**
     * Update gallery
     */
    static async updateGallery(id: string, data: UpdateGalleryRequest): Promise<Gallery | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(data.title);
        }

        if (data.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(data.description);
        }

        if (data.password !== undefined) {
            const passwordHash = data.password
                ? await AuthService.hashPassword(data.password)
                : null;
            updates.push(`password_hash = $${paramCount++}`);
            values.push(passwordHash);
        }

        if (data.allow_downloads !== undefined) {
            updates.push(`allow_downloads = $${paramCount++}`);
            values.push(data.allow_downloads);
        }

        if (data.allow_favorites !== undefined) {
            updates.push(`allow_favorites = $${paramCount++}`);
            values.push(data.allow_favorites);
        }

        if (data.cover_image_path !== undefined) {
            updates.push(`cover_image_path = $${paramCount++}`);
            values.push(data.cover_image_path);
        }

        if (updates.length === 0) {
            return this.getGalleryById(id, false) as Promise<Gallery | null>;
        }

        values.push(id);

        const result = await pool.query<Gallery>(
            `UPDATE galleries SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    /**
     * Delete gallery (cascades to photos and favorites)
     */
    static async deleteGallery(id: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM galleries WHERE id = $1',
            [id]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Add photo metadata to gallery
     */
    static async addPhoto(
        galleryId: string,
        filename: string,
        filePath: string,
        width: number,
        height: number,
        fileSize: number,
        mimeType: string,
        uploadOrder?: number
    ): Promise<Photo> {
        const result = await pool.query<Photo>(
            `INSERT INTO photos (gallery_id, filename, file_path, width, height, file_size, mime_type, upload_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [galleryId, filename, filePath, width, height, fileSize, mimeType, uploadOrder || null]
        );

        return result.rows[0];
    }

    /**
     * Update photo processing status
     */
    static async updatePhotoStatus(
        photoId: string,
        status: 'pending' | 'processing' | 'completed' | 'failed'
    ): Promise<void> {
        await pool.query(
            'UPDATE photos SET processing_status = $1 WHERE id = $2',
            [status, photoId]
        );
    }

    /**
     * Delete photo
     */
    static async deletePhoto(photoId: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM photos WHERE id = $1',
            [photoId]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Get photo by ID
     */
    static async getPhotoById(photoId: string): Promise<Photo | null> {
        const result = await pool.query<Photo>(
            'SELECT * FROM photos WHERE id = $1',
            [photoId]
        );

        return result.rows[0] || null;
    }
}
