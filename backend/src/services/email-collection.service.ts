import pool from '../config/database';

export class EmailCollectionService {
    /**
     * Store client email when they access a gallery
     */
    static async recordGalleryAccess(
        galleryId: string,
        email: string,
        sessionId?: string
    ): Promise<void> {
        await pool.query(
            `INSERT INTO gallery_access_emails (gallery_id, email, session_id)
             VALUES ($1, $2, $3)`,
            [galleryId, email, sessionId || null]
        );
    }

    /**
     * Get all collected emails for a specific gallery
     */
    static async getGalleryEmails(galleryId: string): Promise<Array<{
        email: string;
        accessed_at: Date;
        session_id: string | null;
    }>> {
        const result = await pool.query(
            `SELECT email, accessed_at, session_id
             FROM gallery_access_emails
             WHERE gallery_id = $1
             ORDER BY accessed_at DESC`,
            [galleryId]
        );

        return result.rows;
    }

    /**
     * Get all unique emails across all galleries
     */
    static async getAllUniqueEmails(): Promise<Array<{
        email: string;
        gallery_count: number;
        last_accessed: Date;
    }>> {
        const result = await pool.query(
            `SELECT 
                email,
                COUNT(DISTINCT gallery_id) as gallery_count,
                MAX(accessed_at) as last_accessed
             FROM gallery_access_emails
             GROUP BY email
             ORDER BY last_accessed DESC`
        );

        return result.rows;
    }

    /**
     * Check if an email has already been recorded for a gallery
     */
    static async hasEmailBeenRecorded(
        galleryId: string,
        email: string
    ): Promise<boolean> {
        const result = await pool.query(
            `SELECT COUNT(*) as count
             FROM gallery_access_emails
             WHERE gallery_id = $1 AND email = $2`,
            [galleryId, email]
        );

        return parseInt(result.rows[0].count) > 0;
    }
}
