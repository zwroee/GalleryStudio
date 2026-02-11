import { useState, useEffect, useRef, useCallback } from 'react';
import { Instagram, Facebook, Mail, Phone, Globe, ArrowUp, X, ChevronLeft, ChevronRight, Github } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolioStore } from '../store/portfolioStore';

export default function PortfolioPage() {
    const { businessName, website, phone, email, images, categories, fetchImages } = usePortfolioStore();
    const [activeCategory, setActiveCategory] = useState("ALL");
    const navigate = useNavigate();
    const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    // Filter photos
    const filteredPhotos = images.filter(photo =>
        activeCategory === "ALL" || photo.category === activeCategory
    );

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0');
                        setVisibleImages(prev => new Set(prev).add(index));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        imageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [filteredPhotos]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Lightbox handlers
    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev === null || prev === filteredPhotos.length - 1 ? 0 : prev + 1));
    }, [lightboxIndex, filteredPhotos.length]);

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev === null || prev === 0 ? filteredPhotos.length - 1 : prev - 1));
    }, [lightboxIndex, filteredPhotos.length]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, nextImage, prevImage]);

    // Social media links - configure in admin panel
    const socialLinks = {
        instagram: '',
        facebook: '',
        tiktok: '',
        youtube: '',
        website: website || '',
        github: 'https://github.com/zwroee/GalleryStudio'
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">

            {/* GitHub Corner Link */}
            <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed top-0 right-0 z-50 p-4 text-neutral-400 hover:text-neutral-900 transition-colors duration-300"
                aria-label="View on GitHub"
            >
                <Github className="w-6 h-6" />
            </a>

            {/* Navigation */}
            <nav className="w-full py-6 px-4 md:px-8 bg-neutral-50/80 backdrop-blur-sm sticky top-0 z-40 border-b border-neutral-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="w-1/3 md:w-1/4">
                        {/* Placeholder for left nav items if needed */}
                    </div>

                    <div className="w-1/3 md:w-1/2 flex justify-center">
                        <Link to="/" className="text-xl md:text-2xl font-serif tracking-widest uppercase hover:opacity-70 transition-opacity">
                            {businessName}
                        </Link>
                    </div>

                    <div className="w-1/3 md:w-1/4 flex justify-end gap-6 text-xs tracking-widest font-medium">
                        {/* Right nav items */}
                        <Link to="/gallery-studio" className="hover:text-neutral-500 transition-colors">LOGIN</Link>
                    </div>
                </div>
            </nav>

            {/* Header Section */}
            <header className="flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center">
                {/* Logo */}
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-neutral-200 p-2 mb-8 transition-transform hover:scale-105 duration-700 ease-out">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center">
                        {usePortfolioStore.getState().profilePictureUrl ? (
                            <img
                                src={usePortfolioStore.getState().profilePictureUrl!}
                                alt={businessName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-neutral-100 text-neutral-400">
                                <span className="font-serif text-6xl italic text-neutral-300">
                                    {businessName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-widest font-light mb-8 text-neutral-800 uppercase">
                    {businessName}
                </h1>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base font-light text-neutral-500 tracking-wide">
                    {socialLinks.website && (
                        <a href={socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-neutral-900 transition-colors group">
                            <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Website</span>
                        </a>
                    )}
                    {phone && (
                        <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-neutral-900 transition-colors group">
                            <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>{phone}</span>
                        </a>
                    )}
                    {email && (
                        <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-neutral-900 transition-colors group">
                            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Contact</span>
                        </a>
                    )}
                </div>
            </header>

            {/* Navigation Categories */}
            <div className="max-w-7xl mx-auto px-4 mb-12 md:mb-16">
                <div className="flex flex-wrap justify-center gap-y-4 gap-x-8 md:gap-x-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                text-xs md:text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300 pb-1 border-b
                                ${activeCategory === cat
                                    ? 'text-neutral-900 border-neutral-900'
                                    : 'text-neutral-400 border-transparent hover:text-neutral-600 hover:border-neutral-200'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Masonry Grid */}
            <main className="max-w-[1800px] mx-auto px-4 pb-20">
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {filteredPhotos.map((photo, index) => (
                        <div
                            key={photo.id}
                            ref={(el) => (imageRefs.current[index] = el)}
                            data-index={index}
                            className={`
                                break-inside-avoid relative group cursor-pointer overflow-hidden
                                transition-all duration-700 ease-out fill-mode-forwards
                            `}
                            onClick={() => openLightbox(index)}
                            style={{
                                opacity: visibleImages.has(index) ? 1 : 0,
                                transform: visibleImages.has(index) ? 'translateY(0)' : 'translateY(40px)',
                            }}
                        >
                            <div className="bg-neutral-200 w-full overflow-hidden">
                                <img
                                    src={photo.url}
                                    alt="Portfolio"
                                    className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
                        </div>
                    ))}
                </div>

                {filteredPhotos.length === 0 && (
                    <div className="text-center py-20 text-neutral-400 font-light tracking-wide">
                        No photos found in this category.
                    </div>
                )}
            </main>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-neutral-500 hover:text-neutral-900 transition-colors p-2 z-50 transform hover:scale-110 duration-200"
                        aria-label="Close"
                    >
                        <X className="w-8 h-8 md:w-10 md:h-10" />
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-4 z-50 hidden md:block"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-12 h-12" />
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors p-4 z-50 hidden md:block"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-12 h-12" />
                    </button>

                    {/* Image Container */}
                    <div
                        className="relative w-full h-full p-4 md:p-12 flex items-center justify-center outline-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={filteredPhotos[lightboxIndex].url}
                            alt="Lightbox view"
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                        />

                        {/* Caption/Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-xs font-medium tracking-widest text-neutral-600">
                            {lightboxIndex + 1} / {filteredPhotos.length}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-100 pt-16 pb-8 px-4 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center">

                    {/* Instagram Feature */}
                    <div className="mb-12 flex flex-col items-center">
                        <Instagram className="w-6 h-6 mb-4 text-neutral-800" />
                        <h3 className="font-serif text-lg mb-2">Instagram</h3>
                        <a
                            href={socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-500 hover:text-neutral-900 transition-colors tracking-widest text-sm"
                        >
                            @GalleryStudio
                        </a>
                    </div>

                    {/* Footer Nav */}
                    <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12 text-xs font-medium tracking-[0.2em] text-neutral-400">
                        <Link to="/gallery-studio/portfolio" className="hover:text-neutral-900 transition-colors">PORTFOLIO</Link>
                        <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">GITHUB</a>
                        <Link to="/gallery-studio" className="hover:text-neutral-900 transition-colors">LOGIN</Link>
                    </div>

                    {/* Back to Top */}
                    <button
                        onClick={scrollToTop}
                        className="mb-12 p-3 rounded-full border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-all duration-300 hover:-translate-y-1"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>

                    <div className="w-full border-t border-neutral-100 my-8"></div>

                    {/* Bottom */}
                    <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <p className="text-xs text-neutral-400 tracking-wide mb-4 md:mb-0">
                            © {new Date().getFullYear()} {businessName}. All rights reserved.
                        </p>

                        <div className="flex gap-6 text-neutral-400">
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors"><Facebook className="w-4 h-4" /></a>
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors"><Instagram className="w-4 h-4" /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Ensure the Tailwind build picks this up by running the build command after this.
