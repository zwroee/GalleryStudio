import { useState, useRef } from 'react';
import { X, Lock, Download, Heart, Calendar, Save, Eye, EyeOff, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

import { Gallery } from '../types';

interface GallerySettingsModalProps {
    onClose: () => void;
    onSave?: (updatedGallery: any) => void;
    gallery: Gallery;
}

export default function GallerySettingsModal({ onClose, onSave, gallery }: GallerySettingsModalProps) {
    const [formData, setFormData] = useState({
        title: gallery.title,
        description: gallery.description || '',
        password: '',
        allow_downloads: gallery.allow_downloads,
        allow_favorites: gallery.allow_favorites,
        is_public: gallery.is_public ?? false,
        expires_at: gallery.expires_at ? new Date(gallery.expires_at).toISOString().split('T')[0] : '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [removePassword, setRemovePassword] = useState(false);

    // Cover Image State
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(gallery.cover_image_path ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveCover = () => {
        setCoverImageFile(null);
        setCoverPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = () => {
        // In a real app, we would upload the file here
        // For demo, we pass the preview URL/data back
        if (onSave) {
            const updateData: any = {
                title: formData.title,
                description: formData.description || null,
                allow_downloads: formData.allow_downloads,
                allow_favorites: formData.allow_favorites,
                is_public: formData.is_public,
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
                cover_image_file: coverImageFile, // Pass file for upload
            };

            // Handle password update
            if (removePassword) {
                updateData.password = null;
            } else if (formData.password) {
                updateData.password = formData.password;
            }

            onSave(updateData);
        }
        // alert('Gallery settings & cover image saved! (Demo mode)'); // Removed demo alert
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-semibold text-neutral-900">Gallery Settings</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                    Gallery Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                    Cover Image
                                </label>
                                <div className="flex items-start gap-4">
                                    {coverPreview ? (
                                        <div className="relative group w-32 h-32 rounded-sm overflow-hidden border border-neutral-200">
                                            <img
                                                src={coverPreview?.startsWith('data:') ? coverPreview : `/storage/${coverPreview}`}
                                                alt="Cover preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={handleRemoveCover}
                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-neutral-100 rounded-sm border border-neutral-200 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-neutral-400" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="btn-secondary text-sm mb-2"
                                        >
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            Upload Cover Image
                                        </button>
                                        <p className="text-xs text-neutral-500 font-sans">
                                            Recommended size: 1200x800px. JPG or PNG.
                                            Used as the thumbnail in your dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field resize-none font-sans"
                                    rows={3}
                                    placeholder="Optional description for clients"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Privacy & Access */}
                    <div className="pt-6 border-t border-neutral-200">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Privacy & Access</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-neutral-700 font-sans">
                                        <Lock className="w-4 h-4 inline mr-1" />
                                        Password Protection
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-xs text-neutral-600 hover:text-neutral-900 font-sans"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {gallery.password_hash && !removePassword && (
                                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-700 font-sans">Password is currently set</span>
                                    </div>
                                )}
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field font-sans"
                                    placeholder={gallery.password_hash ? 'Enter new password to change' : 'Leave empty for public gallery'}
                                    disabled={removePassword}
                                />
                                <p className="text-xs text-neutral-500 mt-1 font-sans">
                                    {gallery.password_hash
                                        ? 'Enter a new password to update, or check the box below to remove protection'
                                        : 'Set a password to require PIN entry for downloads'}
                                </p>
                                {gallery.password_hash && (
                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={removePassword}
                                            onChange={(e) => setRemovePassword(e.target.checked)}
                                            className="w-4 h-4 text-neutral-900 border-neutral-300 rounded"
                                        />
                                        <span className="text-sm text-neutral-600 font-sans">Remove password protection</span>
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Expiration Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    className="input-field font-sans"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-xs text-neutral-500 mt-1 font-sans">
                                    Gallery will be hidden from clients after this date
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Client Permissions */}
                    <div className="pt-6 border-t border-neutral-200">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Client Permissions</h3>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-neutral-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.allow_downloads}
                                    onChange={(e) => setFormData({ ...formData, allow_downloads: e.target.checked })}
                                    className="w-4 h-4 text-neutral-900 border-neutral-300 rounded"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4 text-neutral-600" />
                                        <span className="font-medium text-neutral-900 font-sans">Allow Downloads</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1 font-sans">
                                        Clients can download photos from this gallery
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-neutral-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.allow_favorites}
                                    onChange={(e) => setFormData({ ...formData, allow_favorites: e.target.checked })}
                                    className="w-4 h-4 text-neutral-900 border-neutral-300 rounded"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-neutral-600" />
                                        <span className="font-medium text-neutral-900 font-sans">Allow Favorites</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1 font-sans">
                                        Clients can mark photos as favorites
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-sm hover:bg-neutral-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_public}
                                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                    className="w-4 h-4 text-neutral-900 border-neutral-300 rounded"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-neutral-600" />
                                        <span className="font-medium text-neutral-900 font-sans">Make Public</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1 font-sans">
                                        Show this gallery on the public client galleries page
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6">
                        <button onClick={onClose} className="btn-secondary flex-1 text-xs">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn-primary flex-1 text-xs flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
