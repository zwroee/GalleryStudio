import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClientState {
    sessionId: string;
    galleryTokens: Record<string, string>; // galleryId -> sessionToken
    setGalleryToken: (galleryId: string, token: string) => void;
    getGalleryToken: (galleryId: string) => string | undefined;
    clearGalleryToken: (galleryId: string) => void;
}

// Generate or retrieve session ID for favorites
const getOrCreateSessionId = (): string => {
    let sessionId = localStorage.getItem('client_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('client_session_id', sessionId);
    }
    return sessionId;
};

export const useClientStore = create<ClientState>()(
    persist(
        (set, get) => ({
            sessionId: getOrCreateSessionId(),
            galleryTokens: {},

            setGalleryToken: (galleryId, token) => {
                set((state) => ({
                    galleryTokens: { ...state.galleryTokens, [galleryId]: token },
                }));
            },

            getGalleryToken: (galleryId) => {
                return get().galleryTokens[galleryId];
            },

            clearGalleryToken: (galleryId) => {
                set((state) => {
                    const { [galleryId]: _, ...rest } = state.galleryTokens;
                    return { galleryTokens: rest };
                });
            },
        }),
        {
            name: 'client-storage',
        }
    )
);
