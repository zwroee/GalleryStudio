import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import useScrollAnimation from './hooks/useScrollAnimation';

// Styles
import './styles/5feathers.css';

// Demo/Admin Pages (Gallery Studio)
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import GalleryManagement from './pages/GalleryManagement';
import ClientGalleryView from './pages/ClientGalleryView';
import PortfolioPage from './pages/PortfolioPage';
import PublicGalleriesPage from './pages/PublicGalleriesPage';

// Five Feathers Photography Pages
import HomePage from './pages/5feathers/HomePage';
import AboutPage from './pages/5feathers/AboutPage';
import PortfolioHomePage from './pages/5feathers/PortfolioHomePage';
import InvestmentPage from './pages/5feathers/InvestmentPage';
import ContactPage from './pages/5feathers/ContactPage';

// Wrapper to handle scroll animations on route change
function AnimationWrapper() {
    useScrollAnimation();
    return null;
}

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <BrowserRouter>
            <AnimationWrapper />
            <Routes>
                {/* Gallery Studio Routes (Admin/Demo System) */}
                <Route path="/" element={<Navigate to="/gallery-studio" />} />
                <Route path="/gallery-studio" element={<LoginPage />} />
                <Route path="/gallery-studio/login" element={<LoginPage />} />
                <Route path="/gallery-studio/admin" element={
                    isAuthenticated ? <AdminDashboard /> : <Navigate to="/gallery-studio/login" />
                } />
                <Route path="/gallery-studio/admin/gallery/:id" element={
                    isAuthenticated ? <GalleryManagement /> : <Navigate to="/gallery-studio/login" />
                } />
                <Route path="/gallery-studio/gallery/:id" element={<ClientGalleryView />} />
                <Route path="/gallery/:id" element={<ClientGalleryView />} />
                <Route path="/gallery-studio/portfolio" element={<PortfolioPage />} />

                {/* Five Feathers Photography Routes (Public Website) */}
                <Route path="/5feathers" element={<HomePage />} />
                <Route path="/5feathers/about" element={<AboutPage />} />
                <Route path="/5feathers/portfolio" element={<PortfolioHomePage />} />
                <Route path="/5feathers/investment" element={<InvestmentPage />} />
                <Route path="/5feathers/clients" element={<PublicGalleriesPage />} />
                <Route path="/5feathers/contact" element={<ContactPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
