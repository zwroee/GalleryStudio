// Database Models
export interface Gallery {
    id: string;
    title: string;
    description: string | null;
    password_hash: string | null;
    allow_downloads: boolean;
    allow_favorites: boolean;
    is_public?: boolean;
    created_at: string;
    updated_at: string;
    view_count: number;
    download_count: number;
    favorite_count?: number;
    photo_count?: number;
    cover_image_path?: string;
    cover_image?: string | null; // For UI compatibility
    expires_at?: string;
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
    created_at: string;
    is_favorited?: boolean;
}

export type User = AdminUser;

export interface Favorite {
    id: string;
    photo_id: string;
    session_id: string;
    created_at: string;
}

export interface AdminUser {
    id: string;
    username: string;
    password_hash?: string;
    email: string;
    watermark_logo_path: string | null;
    created_at?: string;
    notification_new_favorites?: boolean;
    notification_download_activity?: boolean;
    notification_weekly_summary?: boolean;
    notification_email?: string | null;
}

// API Request/Response Types
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
        watermark_logo_path: string | null;
    };
}

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
    description?: string;
    password?: string | null;
    allow_downloads?: boolean;
    allow_favorites?: boolean;
    is_public?: boolean;
    expires_at?: string | null;
    cover_image?: string | null;
    cover_image_path?: string | null;
}

export interface VerifyPasswordRequest {
    password: string;
}

export interface VerifyPasswordResponse {
    sessionToken: string;
}

export interface ToggleFavoriteRequest {
    sessionId: string;
}

export interface ToggleFavoriteResponse {
    favorited: boolean;
}

export interface GalleryWithPhotos extends Gallery {
    photos: Photo[];
}

export interface PhotoWithFavorite extends Photo {
    is_favorited?: boolean;
}
