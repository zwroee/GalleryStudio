import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ImageIcon, Lock, Eye } from 'lucide-react';
import { clientApi } from '../services/api';
import type { Gallery } from '../types';

export default function PublicGalleriesPage() {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGalleries();
    }, []);

    const loadGalleries = async () => {
        try {
            const response = await clientApi.getPublicGalleries();
            setGalleries(response.galleries);
        } catch (err) {
            console.error('Failed to load public galleries:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading galleries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-4xl font-bold text-gray-900">Client Galleries</h1>
                    <p className="text-gray-600 mt-2">Browse our public photo galleries</p>
                </div>
            </header>

            {/* Galleries Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {galleries.length === 0 ? (
                    <div className="card text-center py-12">
                        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No public galleries available yet</p>
                        <p className="text-gray-500 text-sm mt-2">Check back soon for new galleries!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleries.map((gallery) => (
                            <Link
                                key={gallery.id}
                                to={`/gallery/${gallery.id}`}
                                className="card group hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                            >
                                {/* Cover Image */}
                                <div className="w-full h-48 bg-gray-100 overflow-hidden">
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

                                {/* Gallery Info */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {gallery.title}
                                        </h3>
                                        {gallery.password_hash && (
                                            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                        )}
                                    </div>

                                    {gallery.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {gallery.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{gallery.photo_count || 0} photos</span>
                                        <span>{gallery.view_count || 0} views</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
