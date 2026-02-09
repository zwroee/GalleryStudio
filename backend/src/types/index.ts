// Database types
export interface Gallery {
    id: string;
    title: string;
    description: string | null;
    password_hash: string | null;
    allow_downloads: boolean;
    allow_favorites: boolean;
    created_at: Date;
    updated_at: Date;
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
    created_at: Date;
}

// API request/response types
export interface CreateGalleryRequest {
    title: string;
    description?: string;
    password?: string;
    allow_downloads?: boolean;
    allow_favorites?: boolean;
}

export interface UpdateGalleryRequest {
    title?: string;
    description?: string;
    password?: string;
    allow_downloads?: boolean;
    allow_favorites?: boolean;
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
