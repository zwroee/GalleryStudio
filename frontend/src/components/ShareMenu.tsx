import { useState } from 'react';
import { Share2, Facebook, Twitter, Link as LinkIcon, Check, X } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface ShareMenuProps {
    photoUrl: string;
    photoTitle: string;
    onClose: () => void;
}

export default function ShareMenu({ photoUrl, photoTitle, onClose }: ShareMenuProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}${photoUrl}`;
    const shareText = `Check out this photo: ${photoTitle}`;

    const handleCopyLink = async () => {
        try {
            await copyToClipboard(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleFacebookShare = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handlePinterestShare = () => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-sm shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-neutral-700" />
                        <h3 className="text-lg font-semibold text-neutral-900">Share Photo</h3>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleFacebookShare}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-sm hover:bg-[#166FE5] transition-colors font-sans"
                    >
                        <Facebook className="w-5 h-5" fill="currentColor" />
                        <span>Share on Facebook</span>
                    </button>

                    <button
                        onClick={handleTwitterShare}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-[#1DA1F2] text-white rounded-sm hover:bg-[#1A94DA] transition-colors font-sans"
                    >
                        <Twitter className="w-5 h-5" fill="currentColor" />
                        <span>Share on Twitter</span>
                    </button>

                    <button
                        onClick={handlePinterestShare}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-[#E60023] text-white rounded-sm hover:bg-[#D50020] transition-colors font-sans"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                        </svg>
                        <span>Share on Pinterest</span>
                    </button>

                    <div className="pt-3 border-t border-neutral-200">
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-neutral-100 text-neutral-900 rounded-sm hover:bg-neutral-200 transition-colors font-sans"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-600">Link Copied!</span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-5 h-5" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
