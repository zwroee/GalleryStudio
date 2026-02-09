import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Image as ImageIcon, Lock, Trash2, Upload, ExternalLink, Eye, Download, Heart, Settings } from 'lucide-react';
import { galleryApi, authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { usePortfolioStore } from '../store/portfolioStore';
import type { Gallery } from '../types';
import CreateGalleryModal from '../components/CreateGalleryModal';

export default function AdminDashboard() {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'galleries' | 'portfolio' | 'settings'>('galleries');

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    // Portfolio Store
    // Portfolio Store
    const {
        images: portfolioImages,
        uploadImage,
        removeImage,
        updateProfile,
        businessName,
        website
    } = usePortfolioStore();

    // Ref for file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadGalleries();
    }, []);

    const loadGalleries = async () => {
        try {
            const response = await galleryApi.getAll();
            setGalleries(response.galleries);
        } catch (err) {
            console.error('Failed to load galleries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGalleryCreated = () => {
        setShowCreateModal(false);
        loadGalleries();
    };

    const handleAddPortfolioImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadImage(file);
        } catch (err) {
            alert('Failed to upload image');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Watermark Upload
    const watermarkInputRef = useRef<HTMLInputElement>(null);
    const handleWatermarkUploadClick = () => {
        if (watermarkInputRef.current) {
            watermarkInputRef.current.click();
        }
    };

    const handleWatermarkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await authApi.uploadWatermark(file);
            alert('Watermark uploaded successfully!');
        } catch (err) {
            console.error('Failed to upload watermark:', err);
            alert('Failed to upload watermark');
        } finally {
            if (watermarkInputRef.current) {
                watermarkInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gallery Studio Admin</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user?.username}</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.open('/gallery-studio/portfolio', '_blank')}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Site
                            </button>
                            <button onClick={logout} className="btn-secondary flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('galleries')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'galleries' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Client Galleries
                        {activeTab === 'galleries' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'portfolio' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Portfolio & Showcase
                        {activeTab === 'portfolio' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'settings' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Settings
                        {activeTab === 'settings' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                        )}
                    </button>
                </div>

                {activeTab === 'galleries' && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Your Galleries</h2>
                            <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Create Gallery
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                                <p className="mt-2 text-gray-600">Loading galleries...</p>
                            </div>
                        ) : galleries.length === 0 ? (
                            <div className="text-center py-12 card">
                                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No galleries yet</h3>
                                <p className="text-gray-600 mb-4">Create your first gallery to get started</p>
                                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                                    Create Gallery
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {galleries.map((gallery) => (
                                    <Link
                                        key={gallery.id}
                                        to={`/gallery-studio/admin/gallery/${gallery.id}`}
                                        className="card hover:shadow-md transition-shadow group overflow-hidden"
                                    >
                                        {/* Cover Image or Placeholder */}
                                        {gallery.cover_image_path ? (
                                            <div className="w-full h-48 bg-gray-100 mb-4 -mx-6 -mt-6 overflow-hidden">
                                                <img
                                                    src={`/storage/${gallery.cover_image_path}`}
                                                    alt={gallery.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 mb-4 -mx-6 -mt-6 flex items-center justify-center">
                                                <ImageIcon className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {gallery.title}
                                            </h3>
                                            {gallery.password_hash && (
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>

                                        {gallery.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gallery.description}</p>
                                        )}

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1" title="Photos">
                                                    <ImageIcon className="w-4 h-4" />
                                                    {gallery.photo_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1" title="Views">
                                                    <Eye className="w-4 h-4" />
                                                    {gallery.view_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1" title="Downloads">
                                                    <Download className="w-4 h-4" />
                                                    {gallery.download_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1" title="Favorites">
                                                    <Heart className="w-4 h-4" />
                                                    {gallery.favorite_count || 0}
                                                </span>
                                            </div>
                                            <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'portfolio' && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Portfolio Images</h3>
                                <button
                                    onClick={handleAddPortfolioImage}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    Add Image
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {portfolioImages.map((img) => (
                                    <div key={img.id} className="relative group aspect-square bg-gray-100 rounded-sm overflow-hidden">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                            <span className="text-white text-xs font-bold uppercase tracking-wider mb-2">{img.category}</span>
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={businessName}
                                        onChange={(e) => updateProfile({ businessName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={website}
                                        onChange={(e) => updateProfile({ website: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Watermark Settings</h3>
                            <div className="flex items-start gap-6">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload a PNG logo to be used as a watermark on your images.
                                        The watermark will be applied to all high-resolution downloads.
                                        For best results, use a high-quality PNG with transparency.
                                    </p>
                                    <button
                                        onClick={handleWatermarkUploadClick}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Watermark
                                    </button>
                                    <input
                                        type="file"
                                        ref={watermarkInputRef}
                                        onChange={handleWatermarkChange}
                                        className="hidden"
                                        accept="image/png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Create Gallery Modal */}
            {
                showCreateModal && (
                    <CreateGalleryModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleGalleryCreated}
                    />
                )
            }
        </div >
    );
}
