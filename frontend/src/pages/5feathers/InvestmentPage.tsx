import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navigation from '../../components/5feathers/Navigation';
import Footer from '../../components/5feathers/Footer';
import HeroSection from '../../components/5feathers/HeroSection';

const faqs = [
    {
        question: 'Do you shoot destination weddings?',
        answer: 'I do and would love to discuss the destination with you.'
    },
    {
        question: 'What kind of gear do you use?',
        answer: 'I use a Sony A7iii full frame camera body. I have external lighting when needed.'
    },
    {
        question: 'Will there be a second Photographer?',
        answer: 'If you would like a 2nd photographer or I feel I would like a 2nd photographer. I always take care of providing one.'
    },
    {
        question: 'Do I have to order prints through you?',
        answer: 'No, however I always recommend a high end printer. I\'d be happy to give you a few recommendations.'
    }
];

export default function InvestmentPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="ffp-page">
            <Navigation />

            <HeroSection
                backgroundImage="/5fp/share_5_of_13-b86492f0.jpg"
                title="Investment"
                subtitle="PRESERVE YOUR BEST MEMORIES"
                height="60vh"
            />

            <section className="ffp-investment-content">
                <div className="ffp-investment-container">
                    <div className="ffp-investment-intro animate-on-scroll">
                        <h2>Your Memories Are Priceless</h2>
                        <p>
                            I believe in providing exceptional value through beautiful, timeless photography
                            that you'll treasure for generations. Each package is thoughtfully designed to
                            capture your unique story.
                        </p>
                    </div>

                    <div className="ffp-packages">
                        <div className="ffp-package-card animate-on-scroll delay-100">
                            <h3>Wedding Photography</h3>
                            <p className="package-price">$2,500.00</p>
                            <p className="package-description">
                                Full-day coverage of your special day, from getting ready to the final dance.
                                Includes engagement session, online gallery, and print rights.
                            </p>
                            <a href="/5feathers/contact" className="ffp-btn">Inquire</a>
                        </div>

                        <div className="ffp-package-card animate-on-scroll delay-200">
                            <h3>Keepsake Reel</h3>
                            <p className="package-price">$700.00</p>
                            <p className="package-description">
                                Highlight video of the day touching on all those special moments wrapped up in a 3 to 6min video.
                            </p>
                            <a href="/5feathers/contact" className="ffp-btn">Inquire</a>
                        </div>

                        <div className="ffp-package-card animate-on-scroll delay-300">
                            <h3>Lifestyle Photography</h3>
                            <p className="package-price">$225.00</p>
                            <p className="package-description">
                                Capture authentic moments in a natural, relaxed setting. Perfect for
                                maternity, newborn, and milestone sessions.
                            </p>
                            <a href="/5feathers/contact" className="ffp-btn">Inquire</a>
                        </div>

                        <div className="ffp-package-card animate-on-scroll delay-400">
                            <h3>Family Photography</h3>
                            <p className="package-price">$300.00</p>
                            <p className="package-description">
                                Beautiful family portraits that celebrate your loved ones. Relaxed sessions
                                that capture genuine connections and joy.
                            </p>
                            <a href="/5feathers/contact" className="ffp-btn">Inquire</a>
                        </div>
                    </div>

                    <div className="ffp-investment-note animate-on-scroll delay-500">
                        <p>
                            <strong>Custom packages available.</strong> Every session is unique, and I'm happy to
                            create a package tailored to your specific needs. Contact me to discuss your vision!
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="ffp-faq-section">
                <div className="ffp-faq-container">
                    <h2 className="ffp-section-title animate-on-scroll">FAQ</h2>

                    <div className="ffp-faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`ffp-faq-item animate-on-scroll delay-${(index + 1) * 100}`}
                            >
                                <button
                                    className={`ffp-faq-question ${openFaq === index ? 'active' : ''}`}
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDown className={`faq-icon ${openFaq === index ? 'rotated' : ''}`} />
                                </button>
                                <div className={`ffp-faq-answer ${openFaq === index ? 'open' : ''}`}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
