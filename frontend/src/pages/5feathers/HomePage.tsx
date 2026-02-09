import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../../components/5feathers/Navigation';
import Footer from '../../components/5feathers/Footer';

const heroSlides = [
    {
        id: 1,
        image: '/5fp/Prfinset313of429-f94ce608-1500.jpg',
        title: 'Photography is Poetry',
        subtitle: 'THE BEAUTY OF THE MOMENT'
    },
    {
        id: 2,
        image: '/5fp/printready125of103-84b1183b-1500.jpg',
        title: 'Capturing Love',
        subtitle: 'TIMELESS MOMENTS'
    },
    {
        id: 3,
        image: '/5fp/Printreadypt43of37-5179dfb9-1500.jpg',
        title: 'Your Story',
        subtitle: 'BEAUTIFULLY TOLD'
    }
];

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="ffp-page">
            <Navigation />

            <div className="ffp-hero-carousel">
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`ffp-hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="ffp-hero-overlay" />
                        <div className="ffp-hero-content">
                            <h1 className="ffp-hero-title animate-on-scroll delay-100">{slide.title}</h1>
                            <p className="ffp-hero-subtitle animate-on-scroll delay-300">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="ffp-carousel-arrow ffp-carousel-arrow-left"
                    aria-label="Previous slide"
                >
                    <ChevronLeft />
                </button>
                <button
                    onClick={nextSlide}
                    className="ffp-carousel-arrow ffp-carousel-arrow-right"
                    aria-label="Next slide"
                >
                    <ChevronRight />
                </button>

                {/* Slide Indicators */}
                <div className="ffp-carousel-indicators">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`ffp-carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
