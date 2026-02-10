import { useState, useEffect, useRef } from 'react';
import { Instagram, Facebook, Mail, Phone, Globe, ArrowUp } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolioStore } from '../store/portfolioStore';

export default function PortfolioPage() {
    const { businessName, website, phone, email, images, categories, fetchImages } = usePortfolioStore();
    const [activeCategory, setActiveCategory] = useState("ALL");
    const navigate = useNavigate();
    const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
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

    // Real social media links
    const socialLinks = {
        instagram: 'https://www.instagram.com/fivefeathersphotographybyerika',
        facebook: 'https://www.facebook.com/FiveFeathersPhotographybyErika/',
        tiktok: 'https://www.tiktok.com/@fivefeathersphoto',
        youtube: 'https://www.youtube.com/@FiveFeathersPhotography-ft5li',
        website: 'http://5fp.photo/'
    };

    return (
        <div className="ffp-page" style={{ background: 'var(--ffp-white)' }}>
            {/* Navigation */}
            <nav className="ffp-nav">
                <div className="ffp-nav-container">
                    <div className="ffp-nav-left">
                        <a href="#portfolio" style={{ color: 'var(--ffp-white)' }}>PORTFOLIO</a>
                        <a href="#about" style={{ color: 'var(--ffp-white)' }}>ABOUT</a>
                    </div>

                    <div className="ffp-nav-center">
                        <div className="ffp-brand">
                            {businessName}
                        </div>
                    </div>

                    <div className="ffp-nav-right">
                        <a href="#contact" style={{ color: 'var(--ffp-white)' }}>CONTACT</a>
                        <a href={socialLinks.website} target="_blank" rel="noreferrer" style={{ color: 'var(--ffp-white)' }}>WEBSITE</a>
                    </div>
                </div>
            </nav>

            {/* Header Section */}
            <header style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '140px',
                paddingBottom: '3rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                textAlign: 'center'
            }}>
                {/* Logo Placeholder */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'var(--ffp-secondary)',
                    border: '2px solid var(--ffp-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                }}>
                    <span style={{
                        fontFamily: 'var(--ffp-font-serif)',
                        fontSize: '2.5rem',
                        fontStyle: 'italic',
                        color: 'var(--ffp-accent)'
                    }}>
                        {businessName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                </div>

                <h1 style={{
                    fontFamily: 'var(--ffp-font-serif)',
                    fontSize: '3rem',
                    letterSpacing: '0.3em',
                    fontWeight: 600,
                    marginBottom: '2rem',
                    textTransform: 'uppercase',
                    color: 'var(--ffp-text)'
                }}>
                    {businessName}
                </h1>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: 300,
                    color: 'var(--ffp-text-light)'
                }}>
                    <a href={socialLinks.website} target="_blank" rel="noreferrer" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--ffp-text-light)',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ffp-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ffp-text-light)'}
                    >
                        <Globe className="w-4 h-4" />
                        5fp.photo
                    </a>
                    <a href={`tel:${phone}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--ffp-text-light)',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ffp-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ffp-text-light)'}
                    >
                        <Phone className="w-4 h-4" />
                        {phone}
                    </a>
                    <a href={`mailto:${email}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--ffp-text-light)',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ffp-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ffp-text-light)'}
                    >
                        <Mail className="w-4 h-4" />
                        {email}
                    </a>
                </div>
            </header>

            {/* Navigation Categories */}
            <nav style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 1rem',
                marginBottom: '4rem'
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1.5rem 2rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.15em',
                    color: 'var(--ffp-text-light)',
                    textTransform: 'uppercase'
                }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: activeCategory === cat ? 'var(--ffp-text)' : 'var(--ffp-text-light)',
                                textDecoration: activeCategory === cat ? 'underline' : 'none',
                                textDecorationColor: 'var(--ffp-text)',
                                textUnderlineOffset: '4px',
                                textDecorationThickness: '1px',
                                transition: 'color 0.3s ease',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase'
                            }}
                            onMouseEnter={(e) => {
                                if (activeCategory !== cat) {
                                    e.currentTarget.style.color = 'var(--ffp-text)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeCategory !== cat) {
                                    e.currentTarget.style.color = 'var(--ffp-text-light)';
                                }
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Masonry Grid */}
            <main style={{
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '0 1rem 5rem'
            }}>
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {filteredPhotos.map((photo, index) => (
                        <div
                            key={photo.id}
                            ref={(el) => (imageRefs.current[index] = el)}
                            data-index={index}
                            className="break-inside-avoid relative group cursor-pointer"
                            style={{
                                opacity: visibleImages.has(index) ? 1 : 0,
                                transform: visibleImages.has(index) ? 'translateY(0)' : 'translateY(30px)',
                                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                                transitionDelay: `${(index % 4) * 0.1}s`
                            }}
                        >
                            <div
                                className="bg-neutral-100 w-full overflow-hidden"
                                style={{ height: `${photo.height}px` }}
                            >
                                <img
                                    src={photo.url}
                                    alt="Portfolio Item"
                                    className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                                    style={{
                                        filter: 'brightness(1)',
                                    }}
                                />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none" />
                        </div>
                    ))}
                </div>

                {filteredPhotos.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '5rem 0',
                        color: 'var(--ffp-text-light)',
                        fontWeight: 300
                    }}>
                        No photos found in this category.
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="ffp-footer">
                {/* Instagram Section */}
                <div className="ffp-footer-instagram">
                    <Instagram className="instagram-icon" />
                    <h3>Instagram</h3>
                    <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="instagram-handle"
                    >
                        @FIVEFEATHERSPHOTOGRAPHYBYERIKA
                    </a>
                </div>

                {/* Footer Navigation */}
                <div className="ffp-footer-nav">
                    <div className="ffp-footer-nav-column">
                        <a href="#portfolio">PORTFOLIO</a>
                        <a href="#about">ABOUT</a>
                    </div>
                    <div className="ffp-footer-nav-column">
                        <a href="#contact">CONTACT</a>
                        <a href={socialLinks.website} target="_blank" rel="noreferrer">WEBSITE</a>
                    </div>
                </div>

                {/* Back to Top Button */}
                <button onClick={scrollToTop} className="ffp-back-to-top" aria-label="Back to top">
                    <ArrowUp />
                </button>

                {/* Copyright and Social */}
                <div className="ffp-footer-bottom">
                    <p className="copyright">All content Copyright © 2026 {businessName}</p>

                    <div className="ffp-social-icons">
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook /></a>
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
                        <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        </a>
                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
