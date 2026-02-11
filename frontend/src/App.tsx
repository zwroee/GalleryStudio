import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import useScrollAnimation from './hooks/useScrollAnimation';

// Gallery Studio Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import GalleryManagement from './pages/GalleryManagement';
import ClientGalleryView from './pages/ClientGalleryView';
import PortfolioPage from './pages/PortfolioPage';

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
                {/* Gallery Studio Routes */}
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
