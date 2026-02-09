import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/env';
import { ProcessedImage, ImageSizes } from '../types';

export class ImageProcessingService {
    /**
     * Process uploaded image: generate thumbnail, preview, and web sizes
     */
    static async processImage(
        galleryId: string,
        originalPath: string,
        filename: string,
        watermarkPath?: string | null
    ): Promise<ProcessedImage> {
        // Ensure gallery directories exist
        await this.ensureGalleryDirectories(galleryId);

        // Get image metadata
        const metadata = await sharp(originalPath).metadata();
        const { width = 0, height = 0, format } = metadata;

        // Determine output format (convert HEIC/RAW to JPEG)
        const outputFormat = this.shouldConvertFormat(format) ? 'jpeg' : format || 'jpeg';
        const outputFilename = this.changeExtension(filename, outputFormat);

        // Generate all image sizes
        const sizes: ImageSizes = {
            thumbnail: await this.generateThumbnail(galleryId, originalPath, outputFilename),
            preview: await this.generatePreview(galleryId, originalPath, outputFilename, watermarkPath),
            web: await this.generateWebSize(galleryId, originalPath, outputFilename, watermarkPath),
            original: await this.saveOriginal(galleryId, originalPath, outputFilename),
        };

        // Get file size of original
        const stats = await fs.stat(sizes.original);

        return {
            sizes,
            width,
            height,
            mimeType: `image/${outputFormat}`,
            fileSize: stats.size,
        };
    }

    /**
     * Generate thumbnail (400px longest edge)
     */
    private static async generateThumbnail(
        galleryId: string,
        sourcePath: string,
        filename: string
    ): Promise<string> {
        const outputPath = path.join(
            config.storagePath,
            galleryId,
            'thumbnail',
            filename
        );

        await sharp(sourcePath)
            .resize(config.thumbnailSize, config.thumbnailSize, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: config.imageQuality })
            .toFile(outputPath);

        return outputPath;
    }

    /**
     * Generate preview (1920px longest edge)
     */
    private static async generatePreview(
        galleryId: string,
        sourcePath: string,
        filename: string,
        watermarkPath?: string | null
    ): Promise<string> {
        const outputPath = path.join(
            config.storagePath,
            galleryId,
            'preview',
            filename
        );

        const image = sharp(sourcePath)
            .resize(config.previewSize, config.previewSize, {
                fit: 'inside',
                withoutEnlargement: true,
            });

        // Apply watermark if provided
        if (watermarkPath) {
            await this.applyWatermark(image, watermarkPath, config.previewSize);
        }

        await image.jpeg({ quality: config.imageQuality }).toFile(outputPath);

        return outputPath;
    }

    /**
     * Generate web download size (2048px longest edge)
     */
    private static async generateWebSize(
        galleryId: string,
        sourcePath: string,
        filename: string,
        watermarkPath?: string | null
    ): Promise<string> {
        const outputPath = path.join(
            config.storagePath,
            galleryId,
            'web',
            filename
        );

        const image = sharp(sourcePath)
            .resize(config.webSize, config.webSize, {
                fit: 'inside',
                withoutEnlargement: true,
            });

        // Apply watermark if provided
        if (watermarkPath) {
            await this.applyWatermark(image, watermarkPath, config.webSize);
        }

        await image.jpeg({ quality: config.imageQuality }).toFile(outputPath);

        return outputPath;
    }

    /**
     * Save original image (convert if necessary)
     */
    private static async saveOriginal(
        galleryId: string,
        sourcePath: string,
        filename: string
    ): Promise<string> {
        const outputPath = path.join(
            config.storagePath,
            galleryId,
            'original',
            filename
        );

        const metadata = await sharp(sourcePath).metadata();

        // If format needs conversion, convert to JPEG
        if (this.shouldConvertFormat(metadata.format)) {
            await sharp(sourcePath)
                .jpeg({ quality: 95 }) // Higher quality for originals
                .toFile(outputPath);
        } else {
            // Just copy the file
            await fs.copyFile(sourcePath, outputPath);
        }

        return outputPath;
    }

    /**
     * Create gallery directory structure
     */
    private static async ensureGalleryDirectories(galleryId: string): Promise<void> {
        const sizes = ['original', 'preview', 'thumbnail', 'web'];

        for (const size of sizes) {
            const dir = path.join(config.storagePath, galleryId, size);
            await fs.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Check if format should be converted to JPEG
     */
    private static shouldConvertFormat(format?: string): boolean {
        if (!format) return true;

        const convertFormats = ['heic', 'heif', 'raw', 'cr2', 'nef', 'arw', 'dng'];
        return convertFormats.includes(format.toLowerCase());
    }

    /**
     * Change file extension based on output format
     */
    private static changeExtension(filename: string, format: string): string {
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        return `${base}.${format}`;
    }

    /**
     * Apply watermark to image (bottom-center position)
     */
    private static async applyWatermark(
        image: sharp.Sharp,
        watermarkPath: string,
        maxSize: number
    ): Promise<void> {
        try {
            // Get image metadata to calculate positioning
            const metadata = await image.metadata();
            const imageWidth = metadata.width || maxSize;
            const imageHeight = metadata.height || maxSize;

            // Resize watermark to be 15% of image width
            const watermarkWidth = Math.floor(imageWidth * 0.15);

            const watermarkBuffer = await sharp(watermarkPath)
                .resize(watermarkWidth, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toBuffer();

            // Get watermark dimensions after resize
            const watermarkMeta = await sharp(watermarkBuffer).metadata();
            const wmWidth = watermarkMeta.width || watermarkWidth;
            const wmHeight = watermarkMeta.height || 50;

            // Calculate bottom-center position
            const left = Math.floor((imageWidth - wmWidth) / 2);
            const top = imageHeight - wmHeight - Math.floor(imageHeight * 0.03); // 3% margin from bottom

            // Composite watermark onto image
            await image.composite([{
                input: watermarkBuffer,
                top,
                left,
            }]);
        } catch (err) {
            console.error('Failed to apply watermark:', err);
            // Continue without watermark if it fails
        }
    }

    /**
     * Delete all image files for a photo
     */
    static async deletePhotoFiles(galleryId: string, filename: string): Promise<void> {
        const sizes = ['original', 'preview', 'thumbnail', 'web'];

        for (const size of sizes) {
            const filePath = path.join(config.storagePath, galleryId, size, filename);
            try {
                await fs.unlink(filePath);
            } catch (err) {
                // Ignore errors if file doesn't exist
                console.warn(`Failed to delete ${filePath}:`, err);
            }
        }
    }

    /**
     * Delete entire gallery directory
     */
    static async deleteGalleryDirectory(galleryId: string): Promise<void> {
        const galleryPath = path.join(config.storagePath, galleryId);
        try {
            await fs.rm(galleryPath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Failed to delete gallery directory ${galleryPath}:`, err);
        }
    }
}
