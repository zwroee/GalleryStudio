import axios from 'axios';
import type {
    Gallery,
    GalleryWithPhotos,
    LoginRequest,
    LoginResponse,
    CreateGalleryRequest,
    UpdateGalleryRequest,
    Photo,
} from '../types';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', credentials);
        return data;
    },

    verify: async (): Promise<{ user: LoginResponse['user'] }> => {
        const { data } = await api.get('/auth/verify');
        return data;
    },

    uploadWatermark: async (file: File): Promise<{ success: true; path: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/auth/watermark', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
};

// Admin Gallery API
export const galleryApi = {
    getAll: async (): Promise<{ galleries: Gallery[] }> => {
        const { data } = await api.get('/galleries');
        return data;
    },

    getPublic: async (): Promise<{ galleries: Gallery[] }> => {
        const { data } = await api.get('/galleries/public');
        return data;
    },

    getById: async (id: string): Promise<{ gallery: GalleryWithPhotos }> => {
        const { data } = await api.get(`/galleries/${id}`);
        return data;
    },

    create: async (gallery: CreateGalleryRequest): Promise<{ gallery: Gallery }> => {
        const { data } = await api.post('/galleries', gallery);
        return data;
    },

    update: async (id: string, updates: UpdateGalleryRequest): Promise<{ gallery: Gallery }> => {
        const { data } = await api.patch(`/galleries/${id}`, updates);
        return data;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
        const { data } = await api.delete(`/galleries/${id}`);
        return data;
    },

    uploadPhotos: async (
        galleryId: string,
        files: File[],
        onProgress?: (progress: number) => void
    ): Promise<{ photos: Array<{ id: string; filename: string; status: string }> }> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const { data } = await api.post(`/galleries/${galleryId}/photos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });

        return data;
    },

    deletePhoto: async (galleryId: string, photoId: string): Promise<{ success: boolean }> => {
        const { data } = await api.delete(`/galleries/${galleryId}/photos/${photoId}`);
        return data;
    },

    uploadCover: async (galleryId: string, file: File): Promise<{ success: boolean; path: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post(`/galleries/${galleryId}/cover`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
};

// Client API (for gallery viewing)
export const clientApi = {
    verifyPassword: async (
        galleryId: string,
        password: string,
        email?: string
    ): Promise<{ sessionToken: string }> => {
        const { data } = await axios.post(`/api/client/galleries/${galleryId}/verify`, {
            password,
            email,
        });
        return data;
    },

    getGallery: async (
        galleryId: string,
        sessionToken?: string,
        sessionId?: string
    ): Promise<{ gallery: GalleryWithPhotos }> => {
        const headers: Record<string, string> = {};
        if (sessionToken) {
            headers.Authorization = `Bearer ${sessionToken}`;
        }

        const params: Record<string, string> = {};
        if (sessionId) {
            params.sessionId = sessionId;
        }

        const { data } = await api.get(`/client/galleries/${galleryId}`, { headers, params });
        return data;
    },

    toggleFavorite: async (photoId: string, sessionId: string): Promise<{ favorited: boolean }> => {
        const { data } = await api.post(`/client/photos/${photoId}/favorite`, { sessionId });
        return data;
    },

    getFavorites: async (galleryId: string, sessionId: string): Promise<{ favorites: Photo[] }> => {
        const { data } = await api.get(`/client/galleries/${galleryId}/favorites`, {
            params: { sessionId },
        });
        return data;
    },
};

export default api;
