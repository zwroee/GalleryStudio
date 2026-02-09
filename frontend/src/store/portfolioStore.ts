import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Configure Axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
    images: PortfolioImage[];
    categories: string[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchImages: () => Promise<void>;
    updateProfile: (data: Partial<PortfolioState>) => void;
    uploadImage: (file: File) => Promise<void>;
    removeImage: (id: string) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set, get) => ({
            businessName: "FIVE FEATHERS PHOTOGRAPHY",
            website: "www.5feathersphotography.com",
            phone: "209-900-2315",
            email: "5feathersphotos@gmail.com",
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
                    set({ images: response.data.images, isLoading: false });
                } catch (err) {
                    console.error('Failed to fetch portfolio images:', err);
                    set({ error: 'Failed to load images', isLoading: false });
                }
            },

            updateProfile: (data) => set((state) => ({ ...state, ...data })),

            uploadImage: async (file: File) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    formData.append('file', file);

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
        }),
        {
            name: 'portfolio-storage',
            partialize: (state) => ({
                businessName: state.businessName,
                website: state.website,
                phone: state.phone,
                email: state.email
            }), // Only persist profile info, not images (fetch them fresh)
        }
    )
);
