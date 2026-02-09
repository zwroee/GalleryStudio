import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleDemoLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));

        // Demo login
        await login({
            id: 'demo-id',
            username: 'demo',
            email: 'demo@example.com',
            password_hash: '',
            watermark_logo_path: null,
            created_at: new Date().toISOString()
        }, 'demo-token');
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-8 py-12 text-center">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Pixiset Demo</h2>
                    <p className="text-gray-600 mb-8">Enter the admin dashboard to manage your portfolio.</p>

                    <form onSubmit={handleDemoLogin}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
                        >
                            {isLoading ? 'Entering...' : 'Enter Admin Panel'}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <p className="mt-6 text-xs text-gray-400">
                        No password required for demo mode.
                    </p>
                </div>
            </div>
        </div>
    );
}
