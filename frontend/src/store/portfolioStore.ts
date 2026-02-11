import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export interface PortfolioImage {
    id: string;
    url: string;
    category: string;
    width: number;
    height: number;
    created_at?: string;
}

interface PortfolioState {
    businessName: string;
    website: string;
    phone: string;
    email: string;
    profilePictureUrl: string | null;
    images: PortfolioImage[];
    categories: string[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchImages: () => Promise<void>;
    updateProfile: (data: Partial<PortfolioState>) => void;
    saveProfile: () => Promise<void>;
    uploadProfilePicture: (file: File) => Promise<void>;
    uploadImage: (file: File, category?: string) => Promise<void>;
    uploadImages: (files: File[], category: string, onProgress?: (progress: number) => void) => Promise<void>;
    removeImage: (id: string) => Promise<void>;
    removeImages: (ids: string[]) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set, get) => ({
            businessName: "Gallery Studio",
            website: "",
            phone: "",
            email: "",
            profilePictureUrl: null,
            images: [],
            categories: [
                "ALL", "WEDDING", "FAMILY", "NEWBORN", "MATERNITY", "SENIOR", "BRANDING"
            ],
            isLoading: false,
            error: null,

            fetchImages: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.get('/portfolio');
                    const { images, profile } = response.data;

                    const updates: Partial<PortfolioState> = {
                        images,
                        isLoading: false
                    };

                    if (profile) {
                        updates.businessName = profile.business_name;
                        updates.website = profile.website;
                        updates.phone = profile.phone;
                        updates.email = profile.email;
                        updates.profilePictureUrl = profile.profile_picture_path ? `/storage/${profile.profile_picture_path}` : null;
                    }

                    set(updates);
                } catch (err) {
                    console.error('Failed to fetch portfolio images:', err);
                    set({ error: 'Failed to load images', isLoading: false });
                }
            },

            updateProfile: (data) => set((state) => ({ ...state, ...data })),

            saveProfile: async () => {
                const state = get();
                try {
                    await api.put('/auth/profile', {
                        business_name: state.businessName,
                        website: state.website,
                        phone: state.phone,
                    });
                } catch (err) {
                    console.error('Failed to save profile:', err);
                    throw err;
                }
            },

            uploadProfilePicture: async (file: File) => {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await api.post('/auth/profile-picture', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    set({ profilePictureUrl: `/storage/${response.data.path}` });
                } catch (err) {
                    console.error('Failed to upload profile picture:', err);
                    throw err;
                }
            },

            uploadImage: async (file: File, category?: string) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    if (category) {
                        formData.append('category', category);
                    }

                    const response = await api.post('/portfolio', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    set((state) => ({
                        images: [response.data.image, ...state.images],
                        isLoading: false
                    }));
                } catch (err) {
                    console.error('Failed to upload image:', err);
                    set({ error: 'Failed to upload image', isLoading: false });
                    throw err;
                }
            },

            uploadImages: async (files: File[], category: string, onProgress?: (progress: number) => void) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    files.forEach((file) => {
                        formData.append('files', file);
                    });
                    formData.append('category', category);

                    const response = await api.post('/portfolio/bulk', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                onProgress?.(progress);
                            }
                        },
                    });

                    set((state) => ({
                        images: [...response.data.images, ...state.images],
                        isLoading: false
                    }));
                } catch (err) {
                    console.error('Failed to upload images:', err);
                    set({ error: 'Failed to upload images', isLoading: false });
                    throw err;
                }
            },

            removeImage: async (id: string) => {
                // Optimistic update
                const previousImages = get().images;
                set((state) => ({
                    images: state.images.filter((img) => img.id !== id)
                }));

                try {
                    await api.delete(`/portfolio/${id}`);
                } catch (err) {
                    console.error('Failed to delete image:', err);
                    // Revert on failure
                    set({ images: previousImages, error: 'Failed to delete image' });
                    throw err;
                }
            },

            removeImages: async (ids: string[]) => {
                // Optimistic update
                const previousImages = get().images;
                set((state) => ({
                    images: state.images.filter((img) => !ids.includes(img.id))
                }));

                try {
                    await api.post('/portfolio/bulk-delete', { ids });
                } catch (err) {
                    console.error('Failed to delete images:', err);
                    // Revert on failure
                    set({ images: previousImages, error: 'Failed to delete images' });
                    throw err;
                }
            },
        }),
        {
            name: 'portfolio-storage',
            partialize: (state) => ({
                businessName: state.businessName,
                website: state.website,
                phone: state.phone,
                email: state.email,
                profilePictureUrl: state.profilePictureUrl,
            }), // Only persist profile info
        }
    )
);
