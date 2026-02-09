import { useState } from 'react';
import { X, Upload, Image as ImageIcon, User, Mail, Key, Save } from 'lucide-react';

interface MainSettingsModalProps {
    onClose: () => void;
    currentUser: {
        username: string;
        email: string;
        watermark_logo_path: string | null;
    };
}

export default function MainSettingsModal({ onClose, currentUser }: MainSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'watermark'>('profile');
    const [profileData, setProfileData] = useState({
        username: currentUser.username,
        email: currentUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
    const [watermarkPreview, setWatermarkPreview] = useState<string | null>(currentUser.watermark_logo_path);

    const handleWatermarkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setWatermarkFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setWatermarkPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        alert('Profile updated! (Demo mode)');
    };

    const handleSaveWatermark = () => {
        alert('Watermark saved! (Demo mode)');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-semibold text-neutral-900">Settings</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-200 px-6">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-2 font-sans text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                    ? 'border-neutral-900 text-neutral-900'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('watermark')}
                            className={`py-4 px-2 font-sans text-sm font-medium border-b-2 transition-colors ${activeTab === 'watermark'
                                    ? 'border-neutral-900 text-neutral-900'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            Watermark
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'profile' ? (
                        <div className="space-y-6 max-w-xl">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="pt-4 border-t border-neutral-200">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={profileData.currentPassword}
                                            onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                            className="input-field"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={profileData.newPassword}
                                            onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                            className="input-field"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2 font-sans">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={profileData.confirmPassword}
                                            onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                            className="input-field"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSaveProfile} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Save className="w-5 h-5" />
                                Save Profile
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Logo Watermark</h3>
                                <p className="text-sm text-neutral-600 mb-4 font-sans">
                                    Upload your logo to automatically watermark all preview and web-size images.
                                    Original files remain unwatermarked for client downloads.
                                </p>
                            </div>

                            {watermarkPreview ? (
                                <div className="space-y-4">
                                    <div className="border-2 border-neutral-200 rounded-sm p-6 bg-neutral-50">
                                        <img
                                            src={watermarkPreview}
                                            alt="Watermark preview"
                                            className="max-h-40 mx-auto object-contain"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <label className="btn-secondary flex-1 text-xs cursor-pointer text-center">
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            Change Logo
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={handleWatermarkSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        <button
                                            onClick={() => {
                                                setWatermarkFile(null);
                                                setWatermarkPreview(null);
                                            }}
                                            className="btn-danger text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="block border-2 border-dashed border-neutral-300 rounded-sm p-12 hover:border-neutral-400 transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-neutral-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-neutral-900 font-sans">Click to upload logo</p>
                                            <p className="text-xs text-neutral-500 mt-1 font-sans">
                                                PNG or JPG, transparent background recommended
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleWatermarkSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}

                            <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4">
                                <h4 className="text-sm font-medium text-neutral-900 mb-2 font-sans">Watermark Settings</h4>
                                <ul className="text-sm text-neutral-600 space-y-1 font-sans">
                                    <li>• <strong>Position:</strong> Bottom-center</li>
                                    <li>• <strong>Size:</strong> 15% of image width</li>
                                    <li>• <strong>Applied to:</strong> Preview and web downloads</li>
                                    <li>• <strong>Not applied to:</strong> Original files</li>
                                </ul>
                            </div>

                            <button onClick={handleSaveWatermark} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Save className="w-5 h-5" />
                                Save Watermark
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
