import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Heart, Download, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { clientApi } from '../services/api';
import { useClientStore } from '../store/clientStore';
import type { GalleryWithPhotos, Photo } from '../types';
import SlideshowViewer from '../components/SlideshowViewer';
import DownloadPinModal from '../components/DownloadPinModal';

export default function ClientGalleryView() {
    const { id } = useParams<{ id: string }>();
    const [gallery, setGallery] = useState<GalleryWithPhotos | null>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [passwordRequired, setPasswordRequired] = useState(false);
    const [error, setError] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [slideshowActive, setSlideshowActive] = useState(false);
    const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const sessionId = useClientStore((state) => state.sessionId);
    const getGalleryToken = useClientStore((state) => state.getGalleryToken);
    const setGalleryToken = useClientStore((state) => state.setGalleryToken);

    useEffect(() => {
        if (id) loadGallery();
    }, [id]);

    const loadGallery = async () => {
        if (!id) return;

        try {
            const token = getGalleryToken(id);
            const response = await clientApi.getGallery(id, token, sessionId);
            setGallery(response.gallery);
            setPasswordRequired(false);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setPasswordRequired(true);
            } else {
                setError('Failed to load gallery');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setError('');
        try {
            const response = await clientApi.verifyPassword(id, password, email);
            setGalleryToken(id, response.sessionToken);
            await loadGallery();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid password');
        }
    };

    const handleToggleFavorite = async (photoId: string) => {
        if (!gallery) return;

        try {
            const response = await clientApi.toggleFavorite(photoId, sessionId);

            // Update local state
            setGallery({
                ...gallery,
                photos: gallery.photos.map((p) =>
                    p.id === photoId ? { ...p, is_favorited: response.favorited } : p
                ),
            });

            if (selectedPhoto?.id === photoId) {
                setSelectedPhoto({ ...selectedPhoto, is_favorited: response.favorited });
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    const handleDownload = (photo: Photo) => {
        if (!id || !gallery?.allow_downloads) return;

        const link = document.createElement('a');
        link.href = `/storage/galleries/${id}/web/${photo.filename}`;
        link.download = photo.filename;
        link.click();
    };

    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (!gallery || !selectedPhoto) return;

        const currentIndex = gallery.photos.findIndex((p) => p.id === selectedPhoto.id);
        let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0) newIndex = gallery.photos.length - 1;
        if (newIndex >= gallery.photos.length) newIndex = 0;

        setSelectedPhoto(gallery.photos[newIndex]);
    };

    // Password prompt
    if (passwordRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="card max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Password Protected</h1>
                        <p className="text-gray-600 mt-2">This gallery requires a password to view</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="input-field"
                                autoFocus
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full">
                            Access Gallery
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading gallery...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !gallery) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">{error || 'Gallery not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">{gallery.title}</h1>
                    {gallery.description && (
                        <p className="text-gray-600 mt-2">{gallery.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-500">{gallery.photos.length} photos</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSlideshowStartIndex(0);
                                    setSlideshowActive(true);
                                }}
                                className="btn-primary text-xs flex items-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Start Slideshow
                            </button>
                            {gallery.allow_downloads && (
                                <button
                                    onClick={() => setShowDownloadModal(true)}
                                    className="btn-secondary text-xs flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download All
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Photos Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {gallery.photos.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No photos in this gallery yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gallery.photos.map((photo) => (
                            <div
                                key={photo.id}
                                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img
                                    src={`/storage/galleries/${id}/thumbnail/${photo.filename}`}
                                    alt={photo.filename}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                {gallery.allow_favorites && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleFavorite(photo.id);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${photo.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                                }`}
                                        />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Fullscreen Viewer */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => navigatePhoto('prev')}
                        className="absolute left-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => navigatePhoto('next')}
                        className="absolute right-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    <img
                        src={`/storage/galleries/${id}/preview/${selectedPhoto.filename}`}
                        alt={selectedPhoto.filename}
                        className="max-w-full max-h-full object-contain"
                    />

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {gallery.allow_favorites && (
                            <button
                                onClick={() => handleToggleFavorite(selectedPhoto.id)}
                                className="p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
                            >
                                <Heart
                                    className={`w-6 h-6 ${selectedPhoto.is_favorited ? 'fill-red-500 text-red-500' : 'text-white'
                                        }`}
                                />
                            </button>
                        )}
                        {gallery.allow_downloads && (
                            <button
                                onClick={() => handleDownload(selectedPhoto)}
                                className="p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
                            >
                                <Download className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* Slideshow Viewer */}
            {slideshowActive && gallery && (
                <SlideshowViewer
                    photos={gallery.photos}
                    startIndex={slideshowStartIndex}
                    onClose={() => setSlideshowActive(false)}
                />
            )}

            {/* Download Modal */}
            {showDownloadModal && gallery && (
                <DownloadPinModal
                    galleryId={gallery.id}
                    onClose={() => setShowDownloadModal(false)}
                />
            )}
        </div>
    );
}
