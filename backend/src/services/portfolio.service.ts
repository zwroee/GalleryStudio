import pool from '../config/database';

export interface PortfolioImage {
    id: string;
    url: string;
    category: string;
    width: number;
    height: number;
    created_at: Date;
}

export class PortfolioService {
    /**
     * Get all portfolio images
     */
    static async getAllImages(): Promise<PortfolioImage[]> {
        const result = await pool.query<PortfolioImage>(
            'SELECT * FROM portfolio_images ORDER BY created_at DESC'
        );
        return result.rows;
    }

    /**
     * Add new portfolio image
     */
    static async addImage(
        url: string,
        category: string,
        width: number,
        height: number
    ): Promise<PortfolioImage> {
        const result = await pool.query<PortfolioImage>(
            `INSERT INTO portfolio_images (url, category, width, height)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [url, category, width, height]
        );
        return result.rows[0];
    }

    /**
     * Delete portfolio image
     */
    static async deleteImage(id: string): Promise<string | null> {
        // Get URL first to return it (so caller can delete file)
        const getResult = await pool.query<{ url: string }>(
            'SELECT url FROM portfolio_images WHERE id = $1',
            [id]
        );

        if (getResult.rows.length === 0) return null;

        await pool.query('DELETE FROM portfolio_images WHERE id = $1', [id]);
        return getResult.rows[0].url;
    }
}
