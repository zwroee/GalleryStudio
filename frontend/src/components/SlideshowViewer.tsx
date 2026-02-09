import { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideshowViewerProps {
    photos: any[];
    startIndex: number;
    onClose: () => void;
}

export default function SlideshowViewer({ photos, startIndex, onClose }: SlideshowViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [interval, setIntervalDuration] = useState(5000); // 5 seconds

    useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % photos.length);
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, interval, photos.length]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(!isPlaying);
            }
            if (e.key === 'ArrowLeft') navigatePrev();
            if (e.key === 'ArrowRight') navigateNext();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying]);

    const navigatePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const navigateNext = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const currentPhoto = photos[currentIndex];

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-6 z-10">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <p className="text-sm font-sans opacity-75">
                            {currentIndex + 1} / {photos.length}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="max-w-6xl max-h-full bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-sm flex items-center justify-center aspect-video shadow-2xl">
                    <div className="text-neutral-400 text-center">
                        <p className="text-lg font-sans">Photo {currentIndex + 1}</p>
                        <p className="text-sm opacity-75">{currentPhoto?.filename}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={navigatePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
                onClick={navigateNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
                <div className="flex items-center justify-center gap-4">
                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all backdrop-blur-sm"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                        ) : (
                            <Play className="w-6 h-6 text-white" />
                        )}
                    </button>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-2 backdrop-blur-sm">
                        <button
                            onClick={() => setIntervalDuration(3000)}
                            className={`px-3 py-1 rounded-full text-sm font-sans transition-colors ${interval === 3000 ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                                }`}
                        >
                            3s
                        </button>
                        <button
                            onClick={() => setIntervalDuration(5000)}
                            className={`px-3 py-1 rounded-full text-sm font-sans transition-colors ${interval === 5000 ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                                }`}
                        >
                            5s
                        </button>
                        <button
                            onClick={() => setIntervalDuration(10000)}
                            className={`px-3 py-1 rounded-full text-sm font-sans transition-colors ${interval === 10000 ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                                }`}
                        >
                            10s
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                {isPlaying && (
                    <div className="mt-4 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all"
                            style={{
                                width: '100%',
                                animation: `slideProgress ${interval}ms linear infinite`,
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
        </div>
    );
}
