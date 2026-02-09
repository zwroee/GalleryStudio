import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="ffp-nav">
            <div className="ffp-nav-container">
                <div className="ffp-nav-left">
                    <Link to="/5feathers" className={isActive('/5feathers') ? 'active' : ''}>HOME</Link>
                    <Link to="/5feathers/about" className={isActive('/5feathers/about') ? 'active' : ''}>ABOUT</Link>
                    <Link to="/5feathers/portfolio" className={isActive('/5feathers/portfolio') ? 'active' : ''}>PORTFOLIO</Link>
                </div>

                <div className="ffp-nav-center">
                    <Link to="/5feathers" className="ffp-brand">
                        Five Feathers<br />Photography
                    </Link>
                </div>

                <div className="ffp-nav-right">
                    <Link to="/5feathers/investment" className={isActive('/5feathers/investment') ? 'active' : ''}>INVESTMENT</Link>
                    <Link to="/5feathers/clients" className={isActive('/5feathers/clients') ? 'active' : ''}>CLIENTS</Link>
                    <Link to="/5feathers/contact" className={isActive('/5feathers/contact') ? 'active' : ''}>CONTACT</Link>
                </div>
            </div>
        </nav>
    );
}
