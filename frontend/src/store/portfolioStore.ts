import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PortfolioImage {
    id: string;
    url: string;
    category: string;
    height: number;
}

interface PortfolioState {
    businessName: string;
    website: string;
    phone: string;
    email: string;
    images: PortfolioImage[];
    categories: string[];

    // Actions
    updateProfile: (data: Partial<PortfolioState>) => void;
    addImage: (image: PortfolioImage) => void;
    removeImage: (id: string) => void;
    resetToDefaults: () => void;
}

const defaultImages = Array.from({ length: 12 }, (_, i) => ({
    id: `p-${i}`,
    url: `https://picsum.photos/seed/${i + 100}/600/${[300, 400, 250, 450][i % 4]}`,
    category: ["WEDDING", "FAMILY", "NEWBORN"][i % 3],
    height: [300, 400, 250, 450][i % 4],
}));

export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set) => ({
            businessName: "FIVE FEATHERS PHOTOGRAPHY",
            website: "www.5feathersphotography.com",
            phone: "209-900-2315",
            email: "5feathersphotos@gmail.com",
            images: defaultImages,
            categories: [
                "ALL", "WEDDING", "FAMILY", "NEWBORN", "MATERNITY", "SENIOR", "BRANDING"
            ],

            updateProfile: (data) => set((state) => ({ ...state, ...data })),

            addImage: (image) => set((state) => ({
                images: [image, ...state.images]
            })),

            removeImage: (id) => set((state) => ({
                images: state.images.filter((img) => img.id !== id)
            })),

            resetToDefaults: () => set({
                businessName: "FIVE FEATHERS PHOTOGRAPHY",
                website: "www.5feathersphotography.com",
                phone: "209-900-2315",
                email: "5feathersphotos@gmail.com",
                images: defaultImages,
            })
        }),
        {
            name: 'portfolio-storage', // unique name for localStorage
        }
    )
);
