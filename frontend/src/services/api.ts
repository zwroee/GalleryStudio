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

// Demo Mode Check
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
import { MOCK_USER, MOCK_GALLERIES, MOCK_GALLERY_WITH_PHOTOS } from './mockData';

// Auth API
export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        if (isDemo) {
            // Mock login for demo
            if (credentials.username === 'admin' && credentials.password === 'demo') {
                return {
                    token: 'demo-token',
                    user: MOCK_USER
                };
            }
            // Allow any login in demo for ease of use
            return {
                token: 'demo-token',
                user: MOCK_USER
            };
        }
        const { data } = await api.post<LoginResponse>('/auth/login', credentials);
        return data;
    },

    verify: async (): Promise<{ user: LoginResponse['user'] }> => {
        if (isDemo) return { user: MOCK_USER };
        const { data } = await api.get('/auth/verify');
        return data;
    },

    uploadWatermark: async (file: File): Promise<{ success: true; path: string }> => {
        if (isDemo) return { success: true, path: 'demo/watermark.png' };

        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/auth/watermark', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    updateProfile: async (updates: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> => {
        if (isDemo) {
            return { ...MOCK_USER, ...updates };
        }
        const { data } = await api.patch<LoginResponse['user']>('/auth/profile', updates);
        return data;
    },

    sendTestEmail: async (email?: string): Promise<{ success: boolean; message: string }> => {
        if (isDemo) return { success: true, message: 'Demo email sent (simulated)' };
        const { data } = await api.post('/auth/test-email', { email });
        return data;
    },
};

// Admin Gallery API
export const galleryApi = {
    getAll: async (): Promise<{ galleries: Gallery[] }> => {
        if (isDemo) return { galleries: MOCK_GALLERIES };
        const { data } = await api.get('/galleries');
        return data;
    },

    getPublic: async (): Promise<{ galleries: Gallery[] }> => {
        if (isDemo) return { galleries: MOCK_GALLERIES.filter(g => g.is_public) };
        const { data } = await api.get('/galleries/public');
        return data;
    },

    getById: async (id: string): Promise<{ gallery: GalleryWithPhotos }> => {
        if (isDemo) {
            // Return mock gallery with ID matching request or default
            const gallery = MOCK_GALLERIES.find(g => g.id === id) || MOCK_GALLERIES[0];
            return {
                gallery: {
                    ...MOCK_GALLERY_WITH_PHOTOS,
                    ...gallery
                } as GalleryWithPhotos
            };
        }
        const { data } = await api.get(`/galleries/${id}`);
        return data;
    },

    create: async (gallery: CreateGalleryRequest): Promise<{ gallery: Gallery }> => {
        if (isDemo) {
            const newGallery: Gallery = {
                ...MOCK_GALLERIES[0],
                id: `new-${Date.now()}`,
                title: gallery.title,
                created_at: new Date().toISOString()
            } as Gallery;
            return { gallery: newGallery };
        }
        const { data } = await api.post('/galleries', gallery);
        return data;
    },

    update: async (id: string, updates: UpdateGalleryRequest): Promise<{ gallery: Gallery }> => {
        if (isDemo) {
            const gallery = MOCK_GALLERIES.find(g => g.id === id) || MOCK_GALLERIES[0];
            return { gallery: { ...gallery, ...updates } as Gallery };
        }
        const { data } = await api.patch(`/galleries/${id}`, updates);
        return data;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
        if (isDemo) return { success: true };
        const { data } = await api.delete(`/galleries/${id}`);
        return data;
    },

    uploadPhotos: async (
        galleryId: string,
        files: File[],
        onProgress?: (progress: number) => void
    ): Promise<{ photos: Array<{ id: string; filename: string; status: string }> }> => {
        if (isDemo) {
            // Simulate progress
            if (onProgress) {
                onProgress(50);
                setTimeout(() => onProgress(100), 500);
            }
            return {
                photos: files.map((f, i) => ({
                    id: `new-photo-${i}`,
                    filename: f.name,
                    status: 'completed'
                }))
            };
        }

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
        if (isDemo) return { success: true };
        const { data } = await api.delete(`/galleries/${galleryId}/photos/${photoId}`);
        return data;
    },

    uploadCover: async (galleryId: string, file: File): Promise<{ success: boolean; path: string }> => {
        if (isDemo) return { success: true, path: 'demo/cover.jpg' };
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
    getPublicGalleries: async (): Promise<{ galleries: Gallery[] }> => {
        const { data } = await api.get('/client/galleries');
        return data;
    },

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
