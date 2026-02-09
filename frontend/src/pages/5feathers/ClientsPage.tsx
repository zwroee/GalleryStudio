import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/5feathers/Navigation';
import Footer from '../../components/5feathers/Footer';
import HeroSection from '../../components/5feathers/HeroSection';
import { galleryApi } from '../../services/api';
import type { Gallery } from '../../types';

export default function ClientsPage() {
    const navigate = useNavigate();
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch public galleries from the backend
        const fetchGalleries = async () => {
            try {
                const response = await galleryApi.getPublic();
                // Filter to only show public galleries
                // Note: The backend endpoint /galleries/public should already filter this, 
                // but we filter here just in case or if using the general endpoint
                const publicGalleries = response.galleries.filter(g => g.is_public !== false);
                setGalleries(publicGalleries);
            } catch (error) {
                console.error('Failed to fetch galleries:', error);
                // If backend is not available, show empty state
                setGalleries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGalleries();
    }, []);

    const handleGalleryClick = (galleryId: string) => {
        navigate(`/gallery-studio/gallery/${galleryId}`);
    };

    return (
        <div className="ffp-page">
            <Navigation />

            <HeroSection
                backgroundImage="/5fp/Print_ready_46_of_56-f8075850.jpg"
                title="Client Gallery"
                subtitle="YOUR MEMORIES"
                height="60vh"
            />

            <section className="ffp-clients animate-on-scroll">
                {loading ? (
                    <div className="ffp-clients-loading">
                        <p>Loading galleries...</p>
                    </div>
                ) : galleries.length > 0 ? (
                    <div className="ffp-clients-grid">
                        {galleries.map((gallery) => (
                            <div
                                key={gallery.id}
                                className="ffp-client-card"
                                onClick={() => handleGalleryClick(gallery.id)}
                            >
                                <div
                                    className="ffp-client-card-image"
                                    style={{
                                        backgroundImage: gallery.cover_image_path
                                            ? `url(${gallery.cover_image_path})`
                                            : 'url(/5fp/placeholder.png)'
                                    }}
                                />
                                <h3 className="ffp-client-card-title">{gallery.title}</h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="ffp-clients-empty">
                        <h3>No Galleries Yet</h3>
                        <p>Check back soon for beautiful moments captured!</p>
                    </div>
                )}

                <div className="ffp-clients-note">
                    <p>
                        Looking for your gallery? If you don't see it here, please check your email
                        for the direct link or <a href="/5feathers/contact">contact me</a> for assistance.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
