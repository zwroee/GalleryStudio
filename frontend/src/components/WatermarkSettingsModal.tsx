import { useState, FormEvent, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface WatermarkSettingsModalProps {
    onClose: () => void;
    onSave: (logoFile: File | null) => void;
    currentLogo: string | null;
}

export default function WatermarkSettingsModal({ onClose, onSave, currentLogo }: WatermarkSettingsModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(currentLogo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(selectedFile);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-xl max-w-lg w-full">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-semibold text-neutral-900">Watermark Settings</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3 font-sans">
                            Upload Your Logo
                        </label>
                        <p className="text-sm text-neutral-600 mb-4 font-sans">
                            This logo will be added to the bottom-center of all preview and web-size images.
                            Original files remain unwatermarked for client downloads.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {preview ? (
                            <div className="space-y-3">
                                <div className="border-2 border-neutral-200 rounded-sm p-4 bg-neutral-50">
                                    <img
                                        src={preview}
                                        alt="Watermark preview"
                                        className="max-h-32 mx-auto object-contain"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn-secondary flex-1 text-xs"
                                    >
                                        Change Logo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        className="btn-danger text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-neutral-300 rounded-sm p-8 hover:border-neutral-400 transition-colors"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-neutral-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-neutral-900 font-sans">Click to upload logo</p>
                                        <p className="text-xs text-neutral-500 mt-1 font-sans">PNG or JPG, recommended transparent background</p>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4">
                        <h3 className="text-sm font-medium text-neutral-900 mb-2 font-sans">Watermark Position</h3>
                        <p className="text-sm text-neutral-600 font-sans">
                            <strong>Bottom-center</strong> - Your logo will appear centered at the bottom of each image
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1 text-xs">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
