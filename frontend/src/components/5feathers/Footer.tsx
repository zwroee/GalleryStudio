import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, ArrowUp } from 'lucide-react';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="ffp-footer">
            {/* Instagram Section */}
            <div className="ffp-footer-instagram">
                <Instagram className="instagram-icon" />
                <h3>Instagram</h3>
                <a
                    href="https://instagram.com/fivefeathersphotographybyerika"
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
                    <Link to="/5feathers">HOME</Link>
                    <Link to="/5feathers/about">ABOUT</Link>
                    <Link to="/5feathers/portfolio">PORTFOLIO</Link>
                </div>
                <div className="ffp-footer-nav-column">
                    <Link to="/5feathers/investment">INVESTMENT</Link>
                    <Link to="/5feathers/clients">CLIENTS</Link>
                    <Link to="/5feathers/contact">CONTACT</Link>
                </div>
            </div>

            {/* Back to Top Button */}
            <button onClick={scrollToTop} className="ffp-back-to-top" aria-label="Back to top">
                <ArrowUp />
            </button>

            {/* Copyright and Social */}
            <div className="ffp-footer-bottom">
                <p className="copyright">All content Copyright © 2026 Five Feathers Photography</p>

                <div className="ffp-social-icons">
                    <a href="#" aria-label="Facebook"><Facebook /></a>
                    <a href="https://instagram.com/fivefeathersphotographybyerika" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
                    <a href="#" aria-label="TikTok">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </a>
                    <a href="#" aria-label="YouTube"><Youtube /></a>
                </div>
            </div>

        </footer>
    );
}
