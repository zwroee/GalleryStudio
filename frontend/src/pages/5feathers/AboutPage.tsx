import Navigation from '../../components/5feathers/Navigation';
import Footer from '../../components/5feathers/Footer';
import HeroSection from '../../components/5feathers/HeroSection';

export default function AboutPage() {
    return (
        <div className="ffp-page">
            <Navigation />

            <HeroSection
                backgroundImage="/5fp/Print_readyfamily_1_of_1-7164c304.jpg"
                title="About Me"
                subtitle="GET TO KNOW ME A LITTLE BETTER"
                height="100vh"
            />

            <section className="ffp-about-content">
                <div className="ffp-about-container">
                    <div className="ffp-about-image">
                        <img src="/5fp/share_1_of_4-71937983.jpg" alt="Erika Schwind" />
                    </div>
                    <div className="ffp-about-text">
                        <h2 className="animate-on-scroll delay-100">Hi, I am Erika Schwind.</h2>
                        <p className="animate-on-scroll delay-200">
                            I am a mother to 6 wonderful kids/ teens and one shih tzu. It all started out capturing
                            our children and their milestones. My love for photography spilled over into a little
                            business and soon I had many families reaching out to me for their special moments.
                        </p>
                        <p>
                            Whether it's a wedding, engagement, family portrait, or lifestyle session, I'm passionate
                            about telling your unique story through beautiful, authentic images that you'll treasure
                            for a lifetime.
                        </p>
                        <p>
                            My approach is relaxed and natural, allowing genuine moments to unfold. I believe the
                            best photographs happen when you're comfortable being yourself.
                        </p>
                        <a href="/5feathers/contact" className="ffp-btn">CONTACT ME</a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
