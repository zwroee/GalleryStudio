import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Settings, Copy, Check, CheckSquare, Square } from 'lucide-react';
import { galleryApi } from '../services/api';
import type { GalleryWithPhotos } from '../types';
import GallerySettingsModal from '../components/GallerySettingsModal';
import { copyToClipboard } from '../utils/clipboard';

export default function GalleryManagement() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [gallery, setGallery] = useState<GalleryWithPhotos | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (id) loadGallery();
    }, [id]);

    const loadGallery = async () => {
        if (!id) return;
        try {
            const response = await galleryApi.getById(id);
            setGallery(response.gallery);
        } catch (err) {
            console.error('Failed to load gallery:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !id) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            await galleryApi.uploadPhotos(id, files, (progress) => {
                setUploadProgress(progress);
            });

            // Reload gallery to show new photos
            await loadGallery();
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload photos');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!id || !confirm('Are you sure you want to delete this photo?')) return;

        try {
            await galleryApi.deletePhoto(id, photoId);
            await loadGallery();
        } catch (err) {
            console.error('Failed to delete photo:', err);
            alert('Failed to delete photo');
        }
    };

    const handleDeleteGallery = async () => {
        if (!id || !confirm('Are you sure? This will delete the gallery and all photos permanently.')) return;

        try {
            await galleryApi.delete(id);
            navigate('/admin');
        } catch (err) {
            console.error('Failed to delete gallery:', err);
            alert('Failed to delete gallery');
        }
    };

    // Bulk Photo Actions
    const togglePhotoSelection = (photoId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPhotos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(photoId)) {
                newSet.delete(photoId);
            } else {
                newSet.add(photoId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (!gallery) return;
        if (selectedPhotos.size === gallery.photos.length) {
            setSelectedPhotos(new Set());
        } else {
            setSelectedPhotos(new Set(gallery.photos.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!id || selectedPhotos.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedPhotos.size} photo${selectedPhotos.size !== 1 ? 's' : ''}? This cannot be undone.`)) return;

        try {
            const photoIds = Array.from(selectedPhotos);
            // Delete photos sequentially or we could add a bulk delete endpoint
            // For now, doing it in parallel but client-side loop
            await Promise.all(photoIds.map(photoId => galleryApi.deletePhoto(id, photoId)));

            setSelectedPhotos(new Set());
            await loadGallery();
        } catch (err) {
            console.error('Failed to delete photos:', err);
            alert('Failed to delete some photos');
        }
    };

    const copyGalleryLink = async () => {
        const link = `${window.location.origin}/gallery/${id}`;
        try {
            await copyToClipboard(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('Failed to copy link');
        }
    };

    const handleUpdateGallery = async (updatedData: any) => {
        if (!id) return;
        try {
            // Handle Cover Image Upload if present
            if (updatedData.cover_image_file) {
                await galleryApi.uploadCover(id, updatedData.cover_image_file);
                // Remove file from data before sending JSON update
                delete updatedData.cover_image_file;
            }

            // Remove cover_image string if present (legacy/preview)
            if ('cover_image' in updatedData) {
                // If explicitly set to null (removed), update path to null
                if (updatedData.cover_image === null) {
                    updatedData.cover_image_path = null;
                }
                delete updatedData.cover_image;
            }

            await galleryApi.update(id, updatedData);
            await loadGallery();
            setShowSettings(false);
        } catch (err) {
            console.error('Failed to update gallery:', err);
            alert('Failed to update gallery settings');
        }
    };

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

    if (!gallery) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Gallery not found</p>
                    <Link to="/admin" className="btn-primary mt-4">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/gallery-studio/admin" className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{gallery.title}</h1>
                                {gallery.description && (
                                    <p className="text-sm text-gray-600">{gallery.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSettings(true)} className="btn-secondary flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                            <button onClick={copyGalleryLink} className="btn-secondary flex items-center gap-2">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button onClick={handleDeleteGallery} className="btn-danger flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete Gallery
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload Section */}
                <div className="card mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h2>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        {uploading ? `Uploading... ${uploadProgress}%` : 'Select Photos'}
                    </button>
                </div>

                {/* Photos Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Photos ({gallery.photos.length})
                        </h2>

                        {gallery.photos.length > 0 && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                >
                                    {selectedPhotos.size === gallery.photos.length ? (
                                        <CheckSquare className="w-4 h-4" />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                    {selectedPhotos.size === gallery.photos.length ? 'Deselect All' : 'Select All'}
                                </button>

                                {selectedPhotos.size > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="btn-danger text-sm py-1 px-3 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected ({selectedPhotos.size})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {gallery.photos.length === 0 ? (
                        <div className="card text-center py-12">
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No photos yet. Upload some to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {gallery.photos.map((photo) => (
                                <div key={photo.id} className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${selectedPhotos.has(photo.id) ? 'border-primary-500' : 'border-transparent'}`}>
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <button
                                            onClick={(e) => togglePhotoSelection(photo.id, e)}
                                            className="bg-white rounded shadow-sm p-1 hover:bg-gray-50 transition-colors"
                                        >
                                            {selectedPhotos.has(photo.id) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400 border-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    <img
                                        src={`/storage/galleries/${gallery.id}/thumbnail/${photo.filename}`}
                                        alt={photo.filename}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                        <button
                                            onClick={() => handleDeletePhoto(photo.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {photo.processing_status !== 'completed' && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                            {photo.processing_status}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Settings Modal */}
            {showSettings && gallery && (
                <GallerySettingsModal
                    gallery={gallery}
                    onClose={() => setShowSettings(false)}
                    onSave={handleUpdateGallery}
                />
            )}
        </div>
    );
}
