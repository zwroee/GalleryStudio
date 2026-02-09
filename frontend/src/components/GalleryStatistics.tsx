import { Eye, Heart, Download, TrendingUp, Image as ImageIcon } from 'lucide-react';

interface GalleryStatisticsProps {
    statistics: {
        viewCount: number;
        favoriteCount: number;
        downloadCount: number;
        photoCount: number;
        topPhotos?: Array<{
            id: string;
            filename: string;
            viewCount: number;
        }>;
    };
}

export default function GalleryStatistics({ statistics }: GalleryStatisticsProps) {
    const stats = [
        {
            label: 'Total Views',
            value: statistics.viewCount,
            icon: Eye,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Favorites',
            value: statistics.favoriteCount,
            icon: Heart,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            label: 'Downloads',
            value: statistics.downloadCount,
            icon: Download,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Photos',
            value: statistics.photoCount,
            icon: ImageIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="card p-6">
                            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mb-3`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900 mb-1">{stat.value.toLocaleString()}</p>
                            <p className="text-sm text-neutral-600 font-sans">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Top Photos */}
            {statistics.topPhotos && statistics.topPhotos.length > 0 && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-neutral-700" />
                        <h3 className="text-lg font-semibold text-neutral-900">Most Viewed Photos</h3>
                    </div>
                    <div className="space-y-3">
                        {statistics.topPhotos.map((photo, index) => (
                            <div key={photo.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-neutral-400 w-6">#{index + 1}</span>
                                    <div className="w-12 h-12 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-sm flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-neutral-400" />
                                    </div>
                                    <span className="text-sm text-neutral-900 font-sans">{photo.filename}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-600">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm font-sans">{photo.viewCount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Engagement Rate */}
            <div className="card bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
                <h3 className="text-lg font-semibold mb-2">Engagement Rate</h3>
                <p className="text-3xl font-bold mb-1">
                    {statistics.viewCount > 0
                        ? Math.round(((statistics.favoriteCount + statistics.downloadCount) / statistics.viewCount) * 100)
                        : 0}%
                </p>
                <p className="text-sm opacity-75 font-sans">
                    Clients who viewed also favorited or downloaded
                </p>
            </div>
        </div>
    );
}
