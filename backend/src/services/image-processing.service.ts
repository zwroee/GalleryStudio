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
        console.log(`[ProcessImage] Starting for ${filename}`);
        console.log(`[ProcessImage] Watermark path: ${watermarkPath || 'NONE'}`);
        console.log(`[ProcessImage] Watermark exists: ${!!watermarkPath}`);
        console.log(`[ProcessImage] Watermark type: ${typeof watermarkPath}`);
        console.log(`[ProcessImage] Watermark value: ${JSON.stringify(watermarkPath)}`);

        // Ensure gallery directories exist
        await this.ensureGalleryDirectories(galleryId);

        // Get image metadata
        const metadata = await sharp(originalPath).metadata();
        const { width = 0, height = 0, format } = metadata;

        // Determine output format (convert HEIC/RAW to JPEG)
        const shouldConvert = this.shouldConvertFormat(format);
        const outputFormat = shouldConvert ? 'jpeg' : format || 'jpeg';

        // Only change extension if we are converting format
        // This preserves .jpg vs .jpeg to match frontend expectations
        const outputFilename = shouldConvert ? this.changeExtension(filename, outputFormat) : filename;

        // Generate all image sizes
        const sizes: ImageSizes = {
            thumbnail: await this.generateThumbnail(galleryId, originalPath, outputFilename, watermarkPath),
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
        filename: string,
        watermarkPath?: string | null
    ): Promise<string> {
        const outputPath = path.join(
            config.storagePath,
            galleryId,
            'thumbnail',
            filename
        );

        // First, resize the image to a buffer
        const resizedBuffer = await sharp(sourcePath)
            .resize(config.thumbnailSize, config.thumbnailSize, {
                fit: 'cover', // Fill the entire thumbnail, cropping if necessary
                position: 'center', // Center the crop
            })
            .toBuffer();

        // Now create a new sharp instance from the resized buffer
        let image = sharp(resizedBuffer);

        // Apply watermark if provided
        console.log(`[GenerateThumbnail] Watermark check: ${watermarkPath ? 'YES' : 'NO'}`);
        if (watermarkPath) {
            console.log(`[GenerateThumbnail] APPLYING watermark`);
            image = await this.applyWatermark(image, watermarkPath, config.thumbnailSize);
            console.log(`[GenerateThumbnail] Watermark applied successfully`);
        } else {
            console.log(`[GenerateThumbnail] SKIPPING watermark - path is falsy`);
        }

        await image.jpeg({ quality: config.imageQuality }).toFile(outputPath);

        try {
            await fs.chmod(outputPath, 0o644);
        } catch (err) {
            console.warn(`Failed to chmod ${outputPath}:`, err);
        }

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

        // First, resize the image to a buffer
        const resizedBuffer = await sharp(sourcePath)
            .resize(config.previewSize, config.previewSize, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .toBuffer();

        // Now create a new sharp instance from the resized buffer
        let image = sharp(resizedBuffer);

        // Apply watermark if provided (now working with actual resized dimensions)
        console.log(`[GeneratePreview] Watermark check: ${watermarkPath ? 'YES' : 'NO'}`);
        console.log(`[GeneratePreview] Watermark path value: ${watermarkPath}`);
        if (watermarkPath) {
            console.log(`[GeneratePreview] APPLYING watermark for ${filename}`);
            image = await this.applyWatermark(image, watermarkPath, config.previewSize);
            console.log(`[GeneratePreview] Watermark applied successfully`);
        } else {
            console.log(`[GeneratePreview] SKIPPING watermark - path is falsy`);
        }

        await image.jpeg({ quality: config.imageQuality }).toFile(outputPath);

        try {
            await fs.chmod(outputPath, 0o644);
        } catch (err) {
            console.warn(`Failed to chmod ${outputPath}:`, err);
        }

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

        // First, resize the image to a buffer
        const resizedBuffer = await sharp(sourcePath)
            .resize(config.webSize, config.webSize, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .toBuffer();

        // Now create a new sharp instance from the resized buffer
        let image = sharp(resizedBuffer);

        // Apply watermark if provided (now working with actual resized dimensions)
        console.log(`[GenerateWebSize] Watermark check: ${watermarkPath ? 'YES' : 'NO'}`);
        if (watermarkPath) {
            console.log(`[GenerateWebSize] APPLYING watermark`);
            image = await this.applyWatermark(image, watermarkPath, config.webSize);
            console.log(`[GenerateWebSize] Watermark applied successfully`);
        } else {
            console.log(`[GenerateWebSize] SKIPPING watermark - path is falsy`);
        }

        await image.jpeg({ quality: config.imageQuality }).toFile(outputPath);

        try {
            await fs.chmod(outputPath, 0o644);
        } catch (err) {
            console.warn(`Failed to chmod ${outputPath}:`, err);
        }

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

        try {
            await fs.chmod(outputPath, 0o644);
        } catch (err) {
            console.warn(`Failed to chmod ${outputPath}:`, err);
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
            try {
                await fs.chmod(dir, 0o755);
            } catch (err) {
                console.warn(`Failed to chmod directory ${dir}:`, err);
            }
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
    public static async applyWatermark(
        image: sharp.Sharp,
        watermarkPath: string,
        maxSize: number
    ): Promise<sharp.Sharp> {
        try {
            console.log(`Applying watermark from: ${watermarkPath}`);
            // Get original image metadata
            const metadata = await image.metadata();
            const originalWidth = metadata.width || maxSize;
            const originalHeight = metadata.height || maxSize;

            // Calculate target dimensions after resizing (sharps 'fit: inside' logic)
            // We must limit scale to 1 because of 'withoutEnlargement: true'
            const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight, 1);

            const targetWidth = Math.round(originalWidth * scale);
            const targetHeight = Math.round(originalHeight * scale);

            console.log(`Target dims: ${targetWidth}x${targetHeight} (Original: ${originalWidth}x${originalHeight})`);

            // Resize watermark to be 15% of TARGET width
            const watermarkWidth = Math.max(Math.floor(targetWidth * 0.15), 50); // Ensure at least 50px if possible

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

            // Calculate bottom-center position relative to TARGET dimensions
            const left = Math.floor((targetWidth - wmWidth) / 2);
            const top = targetHeight - wmHeight - Math.floor(targetHeight * 0.03); // 3% margin from bottom

            console.log(`Watermark position: top=${top}, left=${left}, width=${wmWidth}`);

            // Composite watermark onto image and RETURN the new instance
            return image.composite([{
                input: watermarkBuffer,
                top,
                left,
            }]);
        } catch (err) {
            console.error('Failed to apply watermark:', err);
            // Return original image if watermark fails
            return image;
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

    /**
     * Process portfolio image
     */
    static async processPortfolioImage(
        tempPath: string,
        filename: string,
        watermarkPath?: string
    ): Promise<{ url: string; width: number; height: number }> {
        const portfolioDir = path.join('/storage', 'portfolio');
        await fs.mkdir(portfolioDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(filename);
        const baseName = path.basename(filename, ext);
        const uniqueName = `${baseName}-${Date.now()}.jpeg`;
        const outputPath = path.join(portfolioDir, uniqueName);

        // Process image (resize to reasonable max width, convert to jpeg)
        let image = sharp(tempPath);
        const metadata = await image.metadata();

        // Resize if too large
        if ((metadata.width || 0) > 2000) {
            image.resize(2000, null, { withoutEnlargement: true });
        }

        // Apply watermark if provided
        if (watermarkPath) {
            image = await this.applyWatermark(image, watermarkPath, 2000);
        }

        await image
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        // Get final dimensions
        const finalMetadata = await sharp(outputPath).metadata();

        // Clean up temp file
        try {
            await fs.unlink(tempPath);
        } catch { }

        return {
            url: `/storage/portfolio/${uniqueName}`,
            width: finalMetadata.width || 0,
            height: finalMetadata.height || 0
        };
    }

    /**
     * Delete portfolio image
     */
    static async deletePortfolioImage(url: string): Promise<void> {
        // Extract filename from URL (e.g. /storage/portfolio/abc.jpg -> abc.jpg)
        const filename = path.basename(url);
        const filePath = path.join(config.storagePath, 'portfolio', filename);

        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.warn(`Failed to delete portfolio image ${filePath}:`, err);
        }
    }
}
