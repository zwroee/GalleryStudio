import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useScrollAnimation() {
    const location = useLocation();

    useEffect(() => {
        let observer: IntersectionObserver | null = null;

        const initAnimation = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            if (elements.length === 0) return;

            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer?.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            elements.forEach((el) => observer?.observe(el));
        };

        // Small delay to ensure DOM is ready after route transition
        const timer = setTimeout(initAnimation, 100);

        return () => {
            clearTimeout(timer);
            if (observer) observer.disconnect();
        };
    }, [location.pathname]); // Re-run when route changes
}
