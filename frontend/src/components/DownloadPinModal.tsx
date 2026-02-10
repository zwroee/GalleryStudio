import { useState } from 'react';
import { X, Download } from 'lucide-react';

interface DownloadPinModalProps {
    galleryId: string;
    onClose: () => void;
}

export default function DownloadPinModal({ galleryId, onClose }: DownloadPinModalProps) {
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setIsDownloading(true);
        setDownloadProgress(20); // Fake progress to show activity

        // Use direct download link with PIN
        const downloadUrl = `/api/galleries/${galleryId}/download-all?email=${encodeURIComponent(email)}&pin=${encodeURIComponent(pin)}`;

        // Use window.location to trigger native browser download
        window.location.href = downloadUrl;

        // Close modal after a short delay
        setTimeout(() => {
            setDownloadProgress(100);
            setTimeout(() => {
                onClose();
            }, 1000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Download Gallery</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Please enter your email address to download all photos as a ZIP file.
                </p>

                {!isDownloading ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="your@email.com"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PIN (if required)
                            </label>
                            <input
                                type="text"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="input-field"
                                placeholder="Enter PIN"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download All Photos
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-700 font-medium mb-2">Preparing download...</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary-600 h-full transition-all duration-300"
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{downloadProgress}%</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
