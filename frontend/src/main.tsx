import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Mounting App...', { mode: import.meta.env.MODE, base: import.meta.env.BASE_URL });

try {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
} catch (e) {
    console.error('Failed to mount app:', e);
}
