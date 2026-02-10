import { useState, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';

interface PortfolioUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function PortfolioUploadModal({ onClose, onSuccess }: PortfolioUploadModalProps) {
    const { categories, uploadImages } = usePortfolioStore();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('WEDDING');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select at least one image');
            return;
        }

        setUploading(true);
        try {
            await uploadImages(selectedFiles, selectedCategory, (progress) => {
                setUploadProgress(progress);
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    // Filter out "ALL" from categories for selection
    const uploadCategories = categories.filter(cat => cat !== 'ALL');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Upload Portfolio Images</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={uploading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="input-field"
                            disabled={uploading}
                        >
                            {uploadCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            All selected images will be added to this category
                        </p>
                    </div>

                    {/* File Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images
                        </label>
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${!uploading ? 'cursor-pointer hover:border-gray-400' : 'opacity-50'} transition-colors`}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-1">
                                Click to select images or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, JPEG up to 10MB each
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selected Images ({selectedFiles.length})
                            </label>
                            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-white hover:text-red-400 transition-colors"
                                                disabled={uploading}
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                                            {file.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        className="btn-primary"
                        disabled={uploading || selectedFiles.length === 0}
                    >
                        {uploading ? `Uploading... ${uploadProgress}%` : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
