const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

// Helper to get image URL based on environment
export const getImageUrl = (galleryId: string, filename: string, type: 'thumbnail' | 'preview' | 'original' | 'web' = 'preview') => {
    if (isDemo) {
        // In demo mode, return a placeholder from public/demo or a random unsplash image
        // unique-ish based on filename hash to make it consistent
        const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const w = type === 'thumbnail' ? 400 : 1920;
        const h = type === 'thumbnail' ? 400 : 1080;
        return `https://picsum.photos/${w}/${h}?random=${hash}`;
    }

    return `/storage/${galleryId}/${type}/${filename}`;
};

export const getPortfolioImageUrl = (filename: string) => {
    if (isDemo) {
        const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `https://picsum.photos/800/800?random=${hash}`;
    }
    return `/storage/portfolio/${filename}`;
};
