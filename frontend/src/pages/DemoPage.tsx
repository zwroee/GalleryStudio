import { useState } from 'react';
import { Plus, LogOut, Image as ImageIcon, Lock, ArrowLeft, Upload, Trash2, Copy, Check, Heart, Download, X, ChevronLeft, ChevronRight, Share2, Play, BarChart3, Calendar, AlertCircle, Settings, Edit3 } from 'lucide-react';
import ShareMenu from '../components/ShareMenu';
import SlideshowViewer from '../components/SlideshowViewer';
import GalleryStatistics from '../components/GalleryStatistics';
import MainSettingsModal from '../components/MainSettingsModal';
import GallerySettingsModal from '../components/GallerySettingsModal';

// Initial Mock Data
const initialGalleries = [
    {
        id: '1',
        title: 'Summer Wedding 2024',
        description: 'Beautiful outdoor ceremony and reception',
        password_hash: 'protected',
        allow_downloads: true,
        allow_favorites: true,
        created_at: '2024-01-15',
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 5 days
        photo_count: 24,
        view_count: 145,
        download_count: 12,
        favorite_count: 18,
        cover_image: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Corporate Headshots',
        description: 'Professional headshots for ABC Company',
        password_hash: null,
        allow_downloads: true,
        allow_favorites: false,
        created_at: '2024-01-20',
        expires_at: undefined,
        photo_count: 12,
        view_count: 89,
        download_count: 45,
        favorite_count: 0,
        cover_image: null,
        updated_at: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'Family Portrait Session',
        description: null,
        password_hash: null,
        allow_downloads: true,
        allow_favorites: true,
        created_at: '2024-02-01',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
        photo_count: 8,
        view_count: 56,
        download_count: 8,
        favorite_count: 12,
        cover_image: null,
        updated_at: new Date().toISOString(),
    },
];

const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
    id: `photo-${i + 1}`,
    filename: `photo-${i + 1}.jpg`,
    is_favorited: i % 3 === 0,
    view_count: Math.floor(Math.random() * 50) + 10,
}));

const mockStatistics = {
    viewCount: 145,
    favoriteCount: 18,
    downloadCount: 12,
    photoCount: 24,
    topPhotos: [
        { id: 'photo-1', filename: 'ceremony-kiss.jpg', viewCount: 45 },
        { id: 'photo-2', filename: 'first-dance.jpg', viewCount: 38 },
        { id: 'photo-3', filename: 'bride-portrait.jpg', viewCount: 32 },
    ],
};

export default function DemoPage() {
    const [view, setView] = useState<'dashboard' | 'gallery' | 'client'>('dashboard');
    const [galleries, setGalleries] = useState(initialGalleries);
    const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);

    // UI State
    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [shareMenuPhoto, setShareMenuPhoto] = useState<any>(null);
    const [slideshowActive, setSlideshowActive] = useState(false);
    const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);
    const [showStatistics, setShowStatistics] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [bulkMode, setBulkMode] = useState(false);
    const [showMainSettings, setShowMainSettings] = useState(false);
    const [showGallerySettings, setShowGallerySettings] = useState(false);

    // Download PIN State
    const [showDownloadPinModal, setShowDownloadPinModal] = useState(false);
    const [downloadPin, setDownloadPin] = useState('');
    const [downloadEmail, setDownloadEmail] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const mockUser = {
        username: 'demo_user',
        email: 'demo@example.com',
        watermark_logo_path: null,
    };

    // Computed property for valid active gallery or fallback to first
    const activeGallery = galleries.find(g => g.id === activeGalleryId) || galleries[0];

    const handleGalleryClick = (id: string) => {
        setActiveGalleryId(id);
        setView('gallery');
    };

    const handleUpdateGallery = (updatedGallery: any) => {
        setGalleries(galleries.map(g => g.id === updatedGallery.id ? updatedGallery : g));
    };

    const copyLink = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const navigatePhoto = (direction: 'prev' | 'next') => {
        if (!selectedPhoto) return;
        const currentIndex = mockPhotos.findIndex((p) => p.id === selectedPhoto.id);
        let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0) newIndex = mockPhotos.length - 1;
        if (newIndex >= mockPhotos.length) newIndex = 0;
        setSelectedPhoto(mockPhotos[newIndex]);
    };

    const togglePhotoSelection = (photoId: string) => {
        const newSelection = new Set(selectedPhotos);
        if (newSelection.has(photoId)) {
            newSelection.delete(photoId);
        } else {
            newSelection.add(photoId);
        }
        setSelectedPhotos(newSelection);
    };

    const selectAll = () => {
        setSelectedPhotos(new Set(mockPhotos.map(p => p.id)));
    };

    const deselectAll = () => {
        setSelectedPhotos(new Set());
    };

    const deleteSelected = () => {
        if (confirm(`Delete ${selectedPhotos.size} selected photos?`)) {
            alert(`Deleted ${selectedPhotos.size} photos (demo mode)`);
            setSelectedPhotos(new Set());
            setBulkMode(false);
        }
    };

    const getDaysUntilExpiration = (expiresAt: string | null) => {
        if (!expiresAt) return null;
        const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const handleDownloadClick = () => {
        setShowDownloadPinModal(true);
        setDownloadPin('');
        setDownloadEmail('');
        setDownloadProgress(0);
    };

    const handleDownloadSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        if (!downloadEmail || !downloadEmail.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        setIsDownloading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setDownloadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsDownloading(false);
                setShowDownloadPinModal(false);
                alert('Gallery ZIP downloaded! (Demo mode)');
            }
        }, 300);
    };

    // Dashboard View
    if (view === 'dashboard') {
        return (
            <div className="min-h-screen bg-neutral-50">
                <header className="bg-white border-b border-neutral-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Gallery Studio</h1>
                                <p className="text-sm text-neutral-600 mt-1 font-sans">Demo Mode - All features enabled</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open('/admin', '_blank')}
                                    className="btn-secondary text-xs flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
                                >
                                    <Settings className="w-4 h-4" />
                                    Manage Portfolio
                                </button>
                                <button onClick={() => setShowMainSettings(true)} className="btn-secondary text-xs flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <button onClick={() => { setActiveGalleryId('1'); setView('client'); }} className="btn-secondary text-xs">
                                    View as Client
                                </button>
                                <button className="btn-secondary text-xs flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-1">Your Galleries</h2>
                            <p className="text-neutral-600 font-sans text-sm">Manage and share your photo collections</p>
                        </div>
                        <button className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Create Gallery
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {galleries.map((gallery) => {
                            const daysUntilExpiration = getDaysUntilExpiration(gallery.expires_at || null);
                            const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7;

                            return (
                                <div
                                    key={gallery.id}
                                    onClick={() => handleGalleryClick(gallery.id)}
                                    className="bg-white rounded-sm shadow-sm border border-neutral-200 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden group"
                                >
                                    {/* Thumbnail Area */}
                                    <div className="aspect-[3/2] bg-neutral-100 relative">
                                        {gallery.cover_image ? (
                                            <img
                                                src={gallery.cover_image}
                                                alt={gallery.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                        {/* Status Badges */}
                                        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                            {gallery.password_hash && (
                                                <div className="bg-white/90 p-1.5 rounded-sm backdrop-blur-sm shadow-sm" title="Password Protected">
                                                    <Lock className="w-4 h-4 text-neutral-600" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-1">
                                                {gallery.title}
                                            </h3>
                                        </div>

                                        {gallery.description ? (
                                            <p className="text-neutral-500 text-sm mb-4 font-sans line-clamp-2 h-10">{gallery.description}</p>
                                        ) : (
                                            <div className="h-10 mb-4" />
                                        )}

                                        {daysUntilExpiration !== null && (
                                            <div className={`mb-4 inline-flex items-center px-2 py-1 rounded-sm text-xs font-sans ${isExpiringSoon ? 'bg-orange-50 text-orange-700' : 'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                <Calendar className="w-3 h-3 mr-1.5" />
                                                Expires in {daysUntilExpiration} days
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-xs text-neutral-500 font-sans">
                                            <span className="flex items-center gap-1.5">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                {gallery.photo_count}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Download className="w-3.5 h-3.5" />
                                                {gallery.download_count}
                                            </span>
                                            <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* Main Settings Modal */}
                {showMainSettings && (
                    <MainSettingsModal
                        currentUser={mockUser}
                        onClose={() => setShowMainSettings(false)}
                    />
                )}
            </div>
        );
    }

    // Gallery Management View
    if (view === 'gallery') {
        return (
            <div className="min-h-screen bg-neutral-50">
                <header className="bg-white border-b border-neutral-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setView('dashboard')} className="text-neutral-600 hover:text-neutral-900 transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{activeGallery.title}</h1>
                                    <p className="text-sm text-neutral-600 mt-1 font-sans">{activeGallery.description || 'No description'}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowGallerySettings(true)}
                                    className="btn-secondary text-xs flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <button
                                    onClick={() => setShowStatistics(!showStatistics)}
                                    className={`btn-secondary text-xs flex items-center gap-2 ${showStatistics ? 'bg-neutral-900 text-white' : ''}`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Statistics
                                </button>
                                <button onClick={copyLink} className="btn-secondary text-xs flex items-center gap-2">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </button>
                                <button className="btn-danger text-xs flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {showStatistics ? (
                        <GalleryStatistics statistics={mockStatistics} />
                    ) : (
                        <>
                            <div className="card mb-12">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-neutral-900 mb-1">Upload Photos</h2>
                                        <p className="text-neutral-500 text-sm font-sans">Add new images to this gallery</p>
                                    </div>
                                    <button className="btn-primary flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        Select Photos
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-neutral-900">Photos ({mockPhotos.length})</h2>
                                    <div className="flex gap-2">
                                        {bulkMode ? (
                                            <>
                                                <button onClick={selectAll} className="btn-secondary text-xs">
                                                    Select All
                                                </button>
                                                <button onClick={deselectAll} className="btn-secondary text-xs">
                                                    Deselect All
                                                </button>
                                                {selectedPhotos.size > 0 && (
                                                    <button onClick={deleteSelected} className="btn-danger text-xs">
                                                        Delete Selected ({selectedPhotos.size})
                                                    </button>
                                                )}
                                                <button onClick={() => { setBulkMode(false); deselectAll(); }} className="btn-secondary text-xs">
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => setBulkMode(true)} className="btn-secondary text-xs">
                                                Bulk Actions
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {mockPhotos.map((photo) => (
                                        <div key={photo.id} className="photo-item aspect-square relative">
                                            {bulkMode && (
                                                <div className="absolute top-2 left-2 z-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPhotos.has(photo.id)}
                                                        onChange={() => togglePhotoSelection(photo.id)}
                                                        className="w-5 h-5 rounded border-2 border-white shadow-lg"
                                                    />
                                                </div>
                                            )}
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 image-fade-in">
                                                <ImageIcon className="w-12 h-12 text-neutral-400" />
                                            </div>
                                            {!bulkMode && (
                                                <div className="photo-overlay">
                                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-3 rounded-sm hover:bg-red-700 shadow-lg">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </main>

                {/* Gallery Settings Modal */}
                {showGallerySettings && (
                    <GallerySettingsModal
                        gallery={activeGallery}
                        onClose={() => setShowGallerySettings(false)}
                        onSave={handleUpdateGallery}
                    />
                )}
            </div>
        );
    }

    // Client Gallery View
    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">{activeGallery.title}</h1>
                            <p className="text-neutral-600 font-sans">{activeGallery.description}</p>
                            <p className="text-sm text-neutral-500 mt-2 font-sans">{mockPhotos.length} photos</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadClick}
                                className="btn-secondary text-xs flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download All
                            </button>
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
                            <button onClick={() => setView('dashboard')} className="btn-secondary text-xs">
                                Back to Admin
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mockPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            className="photo-item aspect-square"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 image-fade-in">
                                <ImageIcon className="w-12 h-12 text-neutral-400" />
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShareMenuPhoto(photo);
                                    }}
                                    className="p-2.5 bg-white rounded-full shadow-lg hover:bg-neutral-50 transition-all"
                                >
                                    <Share2 className="w-5 h-5 text-neutral-600" />
                                </button>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2.5 bg-white rounded-full shadow-lg hover:bg-neutral-50 transition-all"
                                >
                                    <Heart className={`w-5 h-5 ${photo.is_favorited ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Download PIN Modal */}
            {showDownloadPinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900">Download Gallery</h3>
                            {!isDownloading && (
                                <button
                                    onClick={() => setShowDownloadPinModal(false)}
                                    className="text-neutral-400 hover:text-neutral-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {isDownloading ? (
                            <div className="text-center py-6">
                                <div className="mb-4">
                                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-neutral-900 transition-all duration-300 ease-out"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-neutral-900 font-medium mb-1">Preparing Download...</p>
                                <p className="text-sm text-neutral-500 font-sans">Your download will start automatically.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleDownloadSubmit}>
                                <div className="mb-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={downloadEmail}
                                            onChange={(e) => setDownloadEmail(e.target.value)}
                                            className="input-field"
                                            placeholder="you@example.com"
                                            required
                                            autoFocus
                                        />
                                        <p className="text-xs text-neutral-500 mt-1 font-sans">
                                            Please enter your email to proceed with the download.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                            Download PIN
                                        </label>
                                        <input
                                            type="password"
                                            value={downloadPin}
                                            onChange={(e) => setDownloadPin(e.target.value)}
                                            className="input-field text-center tracking-widest text-lg"
                                            placeholder="••••"
                                            maxLength={4}
                                            required
                                        />
                                        <p className="text-xs text-neutral-500 mt-1 font-sans text-center">
                                            Please enter the 4-digit PIN provided by the photographer.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Unlock & Download
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Fullscreen Viewer */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-6 right-6 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => navigatePhoto('prev')}
                        className="absolute left-6 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={() => navigatePhoto('next')}
                        className="absolute right-6 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    <div className="w-full h-full flex items-center justify-center p-12">
                        <div className="max-w-5xl max-h-full bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-sm flex items-center justify-center aspect-video shadow-2xl">
                            <ImageIcon className="w-32 h-32 text-neutral-500" />
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
                        <button
                            onClick={() => setShareMenuPhoto(selectedPhoto)}
                            className="p-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
                        >
                            <Share2 className="w-6 h-6 text-white" />
                        </button>
                        <button className="p-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm">
                            <Heart className={`w-6 h-6 ${selectedPhoto.is_favorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </button>
                        <button className="p-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm">
                            <Download className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Thumbnail filmstrip */}
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-2xl px-4">
                        {mockPhotos.slice(0, 8).map((photo) => (
                            <button
                                key={photo.id}
                                onClick={() => setSelectedPhoto(photo)}
                                className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden transition-all ${selectedPhoto.id === photo.id ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-75'
                                    }`}
                            >
                                <div className="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Share Menu */}
            {shareMenuPhoto && (
                <ShareMenu
                    photoUrl={`/gallery/1/photo/${shareMenuPhoto.id}`}
                    photoTitle={shareMenuPhoto.filename}
                    onClose={() => setShareMenuPhoto(null)}
                />
            )}

            {/* Slideshow Viewer */}
            {slideshowActive && (
                <SlideshowViewer
                    photos={mockPhotos}
                    startIndex={slideshowStartIndex}
                    onClose={() => setSlideshowActive(false)}
                />
            )}
        </div>
    );
}
