import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STORAGE_PATH',
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Export typed configuration
export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    storagePath: process.env.STORAGE_PATH!,
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '524288000', 10),
    thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '400', 10),
    previewSize: parseInt(process.env.PREVIEW_SIZE || '1920', 10),
    webSize: parseInt(process.env.WEB_SIZE || '2048', 10),
    imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        fromName: process.env.SMTP_FROM_NAME || 'Gallery Studio',
        fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@gallerystudio.com',
    },
} as const;
