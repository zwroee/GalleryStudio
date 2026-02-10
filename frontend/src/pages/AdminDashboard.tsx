import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Image as ImageIcon, Lock, Trash2, Upload, ExternalLink, Eye, Download, Heart, Settings, CheckSquare, Square, BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { galleryApi, authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { usePortfolioStore } from '../store/portfolioStore';
import type { Gallery } from '../types';
import CreateGalleryModal from '../components/CreateGalleryModal';
import PortfolioUploadModal from '../components/PortfolioUploadModal';

export default function AdminDashboard() {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'galleries' | 'portfolio' | 'statistics' | 'settings'>('galleries');
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    // Portfolio Store
    const {
        images: portfolioImages,
        uploadImage,
        removeImage,
        removeImages,
        updateProfile,
        businessName,
        website,
        fetchImages: fetchPortfolioImages
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

    const handlePortfolioUploadSuccess = () => {
        setShowUploadModal(false);
        fetchPortfolioImages();
    };

    const toggleImageSelection = (id: string) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedImages.size === portfolioImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(portfolioImages.map(img => img.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedImages.size === 0) return;

        const confirmed = confirm(`Are you sure you want to delete ${selectedImages.size} image${selectedImages.size !== 1 ? 's' : ''}?`);
        if (!confirmed) return;

        try {
            await removeImages(Array.from(selectedImages));
            setSelectedImages(new Set());
        } catch (err) {
            alert('Failed to delete images');
        }
    };

    // Gallery Bulk Actions
    const toggleGallerySelection = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        setSelectedGalleries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAllGalleries = () => {
        if (selectedGalleries.size === galleries.length) {
            setSelectedGalleries(new Set());
        } else {
            setSelectedGalleries(new Set(galleries.map(g => g.id)));
        }
    };

    const handleBulkDeleteGalleries = async () => {
        if (selectedGalleries.size === 0) return;

        const confirmed = confirm(`Are you sure you want to delete ${selectedGalleries.size} gallery${selectedGalleries.size !== 1 ? 'ies' : 'y'}? This cannot be undone.`);
        if (!confirmed) return;

        try {
            const ids = Array.from(selectedGalleries);
            await Promise.all(ids.map(id => galleryApi.delete(id)));
            setSelectedGalleries(new Set());
            loadGalleries();
        } catch (err) {
            console.error('Failed to delete galleries:', err);
            alert('Failed to delete some galleries');
        }
    };

    const handleBulkVisibility = async (isPublic: boolean) => {
        if (selectedGalleries.size === 0) return;

        try {
            const ids = Array.from(selectedGalleries);
            await Promise.all(ids.map(id => galleryApi.update(id, { is_public: isPublic })));
            setSelectedGalleries(new Set());
            loadGalleries();
            alert(`Updated ${ids.length} galleries`);
        } catch (err) {
            console.error('Failed to update galleries:', err);
            alert('Failed to update some galleries');
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
                <nav className="flex gap-1 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('galleries')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'galleries'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Galleries
                    </button>
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'portfolio'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >Portfolio & Showcase
                    </button>
                    <button
                        onClick={() => setActiveTab('statistics')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'statistics'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Statistics
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'settings'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >Settings
                    </button>
                </nav>

                {activeTab === 'galleries' && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-semibold text-gray-900">Your Galleries</h2>
                                {galleries.length > 0 && (
                                    <>
                                        <button
                                            onClick={toggleSelectAllGalleries}
                                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                        >
                                            {selectedGalleries.size === galleries.length ? (
                                                <CheckSquare className="w-4 h-4" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                            {selectedGalleries.size === galleries.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                        {selectedGalleries.size > 0 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleBulkVisibility(true)}
                                                    className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Make Public
                                                </button>
                                                <button
                                                    onClick={() => handleBulkVisibility(false)}
                                                    className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                                                >
                                                    <Lock className="w-3 h-3" />
                                                    Make Private
                                                </button>
                                                <button
                                                    onClick={handleBulkDeleteGalleries}
                                                    className="btn-danger text-sm py-1 px-3 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete ({selectedGalleries.size})
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
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
                                        className="card hover:shadow-md transition-shadow group overflow-hidden relative"
                                    >
                                        {/* Selection Checkbox */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <button
                                                onClick={(e) => toggleGallerySelection(gallery.id, e)}
                                                className="bg-white rounded shadow-sm p-1 hover:bg-gray-50 transition-colors"
                                            >
                                                {selectedGalleries.has(gallery.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Cover Image or Placeholder */}
                                        <div className="w-full h-48 bg-gray-100 mb-4 rounded-lg overflow-hidden">
                                            {gallery.cover_image_path ? (
                                                <img
                                                    src={`/storage/${gallery.cover_image_path}`}
                                                    alt={gallery.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="w-16 h-16 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

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
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Portfolio Images</h3>
                                    {portfolioImages.length > 0 && (
                                        <>
                                            <button
                                                onClick={toggleSelectAll}
                                                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                            >
                                                {selectedImages.size === portfolioImages.length ? (
                                                    <CheckSquare className="w-4 h-4" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                                {selectedImages.size === portfolioImages.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                            {selectedImages.size > 0 && (
                                                <button
                                                    onClick={handleBulkDelete}
                                                    className="btn-danger flex items-center gap-2 text-sm py-2 px-4"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete {selectedImages.size} Selected
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    Upload Images
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {portfolioImages.map((img) => (
                                    <div key={img.id} className="relative group aspect-square bg-gray-100 rounded-sm overflow-hidden">
                                        {/* Selection Checkbox */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <button
                                                onClick={() => toggleImageSelection(img.id)}
                                                className="bg-white rounded shadow-sm p-1 hover:bg-gray-50 transition-colors"
                                            >
                                                {selectedImages.has(img.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
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

                {activeTab === 'statistics' && (
                    <div className="space-y-6">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">Total Galleries</h3>
                                    <ImageIcon className="w-5 h-5 text-primary-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{galleries.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Active client galleries</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">Total Photos</h3>
                                    <ImageIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {galleries.reduce((sum, g) => sum + (g.photo_count || 0), 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Across all galleries</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">Portfolio Images</h3>
                                    <Heart className="w-5 h-5 text-pink-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{portfolioImages.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Public portfolio showcase</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-600">Protected Galleries</h3>
                                    <Lock className="w-5 h-5 text-amber-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {galleries.filter(g => g.password_hash).length}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PIN protected</p>
                            </div>
                        </div>

                        {/* Gallery Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gallery Stats */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary-600" />
                                    Gallery Statistics
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Average Photos per Gallery</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {galleries.length > 0
                                                    ? Math.round(galleries.reduce((sum, g) => sum + (g.photo_count || 0), 0) / galleries.length)
                                                    : 0}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full"
                                                style={{
                                                    width: `${galleries.length > 0 ? Math.min((galleries.reduce((sum, g) => sum + (g.photo_count || 0), 0) / galleries.length / 100) * 100, 100) : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Galleries with Downloads Enabled</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {galleries.filter(g => g.allow_downloads).length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{
                                                    width: `${galleries.length > 0 ? (galleries.filter(g => g.allow_downloads).length / galleries.length) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Galleries with Favorites Enabled</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {galleries.filter(g => g.allow_favorites).length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-pink-600 h-2 rounded-full"
                                                style={{
                                                    width: `${galleries.length > 0 ? (galleries.filter(g => g.allow_favorites).length / galleries.length) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio Breakdown */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Portfolio Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {['WEDDING', 'FAMILY', 'NEWBORN', 'MATERNITY', 'SENIOR', 'BRANDING'].map(category => {
                                        const count = portfolioImages.filter(img => img.category === category).length;
                                        const percentage = portfolioImages.length > 0 ? (count / portfolioImages.length) * 100 : 0;
                                        return (
                                            <div key={category}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">{category}</span>
                                                    <span className="text-sm font-bold text-gray-900">{count}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                Recent Galleries
                            </h3>
                            <div className="space-y-3">
                                {galleries.slice(0, 5).map(gallery => (
                                    <div key={gallery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {gallery.cover_image_path ? (
                                                <img
                                                    src={`/storage/${gallery.cover_image_path}`}
                                                    alt={gallery.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-medium text-gray-900">{gallery.title}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {gallery.photo_count || 0} photos • Created {new Date(gallery.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {gallery.password_hash && <Lock className="w-4 h-4 text-gray-400" />}
                                            {gallery.allow_downloads && <Download className="w-4 h-4 text-green-600" />}
                                            {gallery.allow_favorites && <Heart className="w-4 h-4 text-pink-600" />}
                                        </div>
                                    </div>
                                ))}
                                {galleries.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No galleries yet. Create your first gallery to see statistics!</p>
                                )}
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

                                    {/* Watermark Preview */}
                                    {user?.watermark_logo_path && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Watermark</p>
                                            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 inline-block">
                                                <img
                                                    src={`/storage/${user.watermark_logo_path}`}
                                                    alt="Current Watermark"
                                                    className="max-h-24 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

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

                        {/* Storage Usage */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Galleries</span>
                                        <span className="text-sm text-gray-600">{galleries.length} galleries</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Portfolio Images</span>
                                        <span className="text-sm text-gray-600">{portfolioImages.length} images</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Total Photos</span>
                                        <span className="text-sm text-gray-600">
                                            {galleries.reduce((sum, g) => sum + (g.photo_count || 0), 0)} photos
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Storage usage details are calculated based on your galleries and portfolio images.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Default Gallery Settings */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Gallery Settings</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                These settings will be applied to all new galleries you create.
                            </p>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        defaultChecked={true}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Download className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-900">Allow Downloads by Default</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            New galleries will allow clients to download watermarked images
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        defaultChecked={true}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-900">Allow Favorites by Default</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            New galleries will allow clients to mark favorite photos
                                        </p>
                                    </div>
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Default Expiration Period
                                    </label>
                                    <select className="input-field">
                                        <option value="never">Never expire</option>
                                        <option value="30">30 days</option>
                                        <option value="60">60 days</option>
                                        <option value="90">90 days</option>
                                        <option value="180">6 months</option>
                                        <option value="365">1 year</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Galleries will automatically hide from clients after this period
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Choose what email notifications you'd like to receive.
                            </p>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        defaultChecked={false}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">New Favorites</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Get notified when clients mark photos as favorites
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        defaultChecked={false}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">Download Activity</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Get notified when clients download photos
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        defaultChecked={true}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">Weekly Summary</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Receive a weekly summary of gallery activity
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Change Admin Password
                                    </label>
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            placeholder="Current password"
                                            className="input-field"
                                        />
                                        <input
                                            type="password"
                                            placeholder="New password"
                                            className="input-field"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="input-field"
                                        />
                                        <button className="btn-primary">
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Timeout
                                    </label>
                                    <select className="input-field">
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="240">4 hours</option>
                                        <option value="480">8 hours</option>
                                        <option value="1440">24 hours</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        You'll be automatically logged out after this period of inactivity
                                    </p>
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

            {/* Portfolio Upload Modal */}
            {
                showUploadModal && (
                    <PortfolioUploadModal
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={handlePortfolioUploadSuccess}
                    />
                )
            }
        </div >
    );
}
