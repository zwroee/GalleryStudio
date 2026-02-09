import { useState, useEffect } from 'react';
import { Instagram, Facebook, Mail, Phone, Globe, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '../store/portfolioStore';

export default function PortfolioPage() {
    const { businessName, website, phone, email, images, categories, fetchImages } = usePortfolioStore();
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    // Filter photos
    const filteredPhotos = images.filter(photo =>
        activeCategory === "ALL" || photo.category === activeCategory
    );

    return (
        <div className="min-h-screen bg-white font-sans text-neutral-900">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
                <div className="flex gap-4">
                    <a href="#" className="text-neutral-600 hover:text-black">
                        <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-neutral-600 hover:text-black">
                        <Instagram className="w-5 h-5" />
                    </a>
                </div>

                <div className="flex items-center gap-2 border-b border-neutral-200 pb-1 w-64">
                    <Search className="w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-sm outline-none placeholder:text-neutral-400 font-light"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")}>
                            <X className="w-4 h-4 text-neutral-400 hover:text-black" />
                        </button>
                    )}
                </div>
            </div>

            {/* Header Section */}
            <header className="flex flex-col items-center justify-center pt-8 pb-12 px-4 text-center">
                {/* Logo Placeholder */}
                <div className="w-24 h-24 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-6">
                    <span className="font-serif text-2xl italic">FF</span>
                </div>

                <h1 className="text-3xl tracking-widest font-semibold mb-8 uppercase">
                    {businessName}
                </h1>

                <div className="space-y-2 text-sm font-light text-gray-600 flex flex-col items-center">
                    <a href={`https://${website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-black transition-colors">
                        <Globe className="w-3 h-3" />
                        {website}
                    </a>
                    <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-black transition-colors">
                        <Phone className="w-3 h-3" />
                        {phone}
                    </a>
                    <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-black transition-colors">
                        <Mail className="w-3 h-3" />
                        {email}
                    </a>
                </div>
            </header>

            {/* Navigation Categories */}
            <nav className="max-w-7xl mx-auto px-4 mb-16">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[11px] font-medium tracking-widest text-neutral-500 uppercase leading-relaxed">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`hover:text-black transition-colors ${activeCategory === cat ? 'text-black underline underline-offset-4 decoration-1' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Masonry Grid */}
            <main className="max-w-[1600px] mx-auto px-4 pb-20">
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {filteredPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            className="break-inside-avoid relative group cursor-pointer"
                        >
                            <div
                                className="bg-neutral-100 w-full overflow-hidden"
                                style={{ height: `${photo.height}px` }}
                            >
                                <img
                                    src={photo.url}
                                    alt="Portfolio Item"
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                                />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300 pointer-events-none" />
                        </div>
                    ))}
                </div>

                {filteredPhotos.length === 0 && (
                    <div className="text-center py-20 text-neutral-400 font-light">
                        No photos found in this category.
                    </div>
                )}
            </main>

            {/* Admin Link (Temporary for Demo) */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => navigate('/admin')}
                    className="bg-black text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg hover:bg-neutral-800 transition-colors"
                >
                    Admin Panel
                </button>
            </div>
        </div>
    );
}
