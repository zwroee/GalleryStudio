// Database types
export interface Gallery {
    id: string;
    title: string;
    description: string | null;
    password_hash: string | null;
    download_pin: string | null;
    allow_downloads: boolean;
    allow_favorites: boolean;
    is_public: boolean;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
    view_count: number;
    download_count: number;
    favorite_count?: number;
    photo_count?: number;
    cover_image_path?: string;
}

export interface Photo {
    id: string;
    gallery_id: string;
    filename: string;
    file_path: string;
    width: number;
    height: number;
    file_size: number;
    mime_type: string;
    processing_status: 'pending' | 'processing' | 'completed' | 'failed';
    upload_order: number | null;
    created_at: Date;
}

export interface Favorite {
    id: string;
    photo_id: string;
    session_id: string;
    created_at: Date;
}

export interface AdminUser {
    id: string;
    username: string;
    password_hash: string;
    email: string;
    watermark_logo_path?: string | null;
    business_name?: string;
    website?: string;
    phone?: string;
    profile_picture_path?: string | null;
    notification_new_favorites?: boolean;
    notification_download_activity?: boolean;
    notification_weekly_summary?: boolean;
    notification_email?: string | null;
    created_at: Date;
}

// API request/response types
export interface CreateGalleryRequest {
    title: string;
    description?: string;
    password?: string;
    allow_downloads?: boolean;
    allow_favorites?: boolean;
    is_public?: boolean;
}

export interface UpdateGalleryRequest {
    title?: string;
    description?: string | null;
    password?: string | null;
    allow_downloads?: boolean;
    allow_favorites?: boolean;
    is_public?: boolean;
    expires_at?: string | null;
    cover_image_path?: string | null;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export interface VerifyGalleryPasswordRequest {
    password: string;
}

export interface GalleryWithPhotos extends Gallery {
    photos: Photo[];
    photo_count: number;
}

// Image processing types
export interface ImageSizes {
    thumbnail: string;
    preview: string;
    web: string;
    original: string;
}

export interface ProcessedImage {
    sizes: ImageSizes;
    width: number;
    height: number;
    mimeType: string;
    fileSize: number;
}
