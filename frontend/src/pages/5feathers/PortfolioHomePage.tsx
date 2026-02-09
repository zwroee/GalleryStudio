import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/5feathers/Navigation';
import Footer from '../../components/5feathers/Footer';
import HeroSection from '../../components/5feathers/HeroSection';

const portfolioCategories = [
    {
        id: 'wedding',
        title: 'Wedding',
        subtitle: 'THE BIG DAY',
        image: '/5fp/Print_ready_58_of_70-8c8d96ba.jpg'
    },
    {
        id: 'engagement',
        title: 'Engagement',
        subtitle: 'THE BEGINNING',
        image: '/5fp/i_dunno_1_of_2-dcb7ec61.jpg'
    },
    {
        id: 'lifestyle',
        title: 'Lifestyle',
        subtitle: 'A CASUAL SETTING',
        image: '/5fp/Share_4_of_7-0f744bdb.jpg'
    }
];

export default function PortfolioHomePage() {
    const navigate = useNavigate();

    return (
        <div className="ffp-page">
            <Navigation />

            <HeroSection
                backgroundImage="/5fp/share_2_of_9-3e4a630e.jpg"
                title="Portfolio"
                height="60vh"
            />

            <section className="ffp-portfolio-home">
                <h2 className="ffp-section-title animate-on-scroll">See My Work</h2>

                <div className="ffp-portfolio-grid">
                    {portfolioCategories.map((category, index) => (
                        <div
                            key={category.id}
                            className={`ffp-portfolio-card animate-on-scroll delay-${(index + 1) * 100}`}
                            style={{ backgroundImage: `url(${category.image})` }}
                        >
                            <div className="ffp-portfolio-card-overlay" />
                            <div className="ffp-portfolio-card-content">
                                <h3>{category.title}</h3>
                                <p>{category.subtitle}</p>
                                <ArrowRight className="arrow-icon" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Button to redirect to Gallery Studio portfolio management */}
                <div className="ffp-portfolio-admin-link">
                    <button
                        onClick={() => navigate('/gallery-studio/portfolio')}
                        className="ffp-btn ffp-btn-outline"
                    >
                        Portfolio
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
