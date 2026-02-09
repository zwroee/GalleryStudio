import { useState, FormEvent } from 'react';
import { X, Upload } from 'lucide-react';
import { galleryApi } from '../services/api';
import type { CreateGalleryRequest } from '../types';

interface CreateGalleryModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateGalleryModal({ onClose, onSuccess }: CreateGalleryModalProps) {
    const [formData, setFormData] = useState<CreateGalleryRequest>({
        title: '',
        description: '',
        password: '',
        allow_downloads: true,
        allow_favorites: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            if (!payload.description) delete payload.description;

            await galleryApi.create(payload);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create gallery');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-semibold text-neutral-900">Create New Gallery</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                            Gallery Title *
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-field"
                            required
                            autoFocus
                            placeholder="e.g., Summer Wedding 2024"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field resize-none font-sans"
                            rows={3}
                            placeholder="Optional description for your clients"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 font-sans">
                                Password Protection (PIN)
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-neutral-600 hover:text-neutral-900 font-sans"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input-field font-sans"
                            placeholder="Leave empty for public gallery"
                        />
                        <p className="text-xs text-neutral-500 mt-1 font-sans">
                            Clients will need this PIN to view the gallery
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.allow_downloads}
                                onChange={(e) => setFormData({ ...formData, allow_downloads: e.target.checked })}
                                className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-500"
                            />
                            <span className="text-sm text-neutral-700 font-sans group-hover:text-neutral-900">
                                Allow clients to download photos
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.allow_favorites}
                                onChange={(e) => setFormData({ ...formData, allow_favorites: e.target.checked })}
                                className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-500"
                            />
                            <span className="text-sm text-neutral-700 font-sans group-hover:text-neutral-900">
                                Allow clients to favorite photos
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1 text-xs" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Gallery'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
