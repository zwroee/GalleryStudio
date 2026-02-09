import pool from '../config/database';
import { Photo } from '../types';

/**
 * Update photo metadata after processing
 */
export async function updatePhotoMetadata(
    photoId: string,
    filePath: string,
    width: number,
    height: number,
    fileSize: number,
    mimeType: string
): Promise<void> {
    await pool.query(
        `UPDATE photos 
     SET file_path = $1, width = $2, height = $3, file_size = $4, mime_type = $5
     WHERE id = $6`,
        [filePath, width, height, fileSize, mimeType, photoId]
    );
}
