interface HeroSectionProps {
    backgroundImage: string;
    title: string;
    subtitle?: string;
    height?: string;
    overlay?: boolean;
}

export default function HeroSection({
    backgroundImage,
    title,
    subtitle,
    height = '100vh',
    overlay = true
}: HeroSectionProps) {
    return (
        <div
            className="ffp-hero"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                height
            }}
        >
            {overlay && <div className="ffp-hero-overlay" />}
            <div className="ffp-hero-content">
                <h1 className="ffp-hero-title">{title}</h1>
                {subtitle && <p className="ffp-hero-subtitle">{subtitle}</p>}
            </div>
        </div>
    );
}
