import { useState } from 'react';
import emailjs from '@emailjs/browser';
import Navigation from '../../components/5feathers/Navigation';
import Footer from '../../components/5feathers/Footer';
import HeroSection from '../../components/5feathers/HeroSection';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        sessionType: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // EmailJS configuration
            const serviceId = 'service_5feathers'; // You'll need to create this in EmailJS
            const templateId = 'template_contact'; // You'll need to create this in EmailJS
            const publicKey = 'YOUR_PUBLIC_KEY'; // You'll need to get this from EmailJS

            const templateParams = {
                to_email: 'e_stickley@yahoo.com',
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone || 'Not provided',
                session_type: formData.sessionType,
                message: formData.message
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                sessionType: '',
                message: ''
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="ffp-page">
            <Navigation />

            <HeroSection
                backgroundImage="/5fp/PS2-25c9172d.jpg"
                title="Contact Me"
                subtitle="YOUR STORY BEGINS HERE"
                height="60vh"
            />

            <section className="ffp-contact-content">
                <div className="ffp-contact-container">
                    <h2 className="animate-on-scroll">Let's Start Your Journey</h2>
                    <p className="ffp-contact-intro animate-on-scroll delay-100">
                        Let's start by sending me a message about what type of session you are looking for.
                        From there we can set up a date, time and location for your session.
                    </p>

                    <form onSubmit={handleSubmit} className="ffp-contact-form animate-on-scroll delay-200">
                        <div className="ffp-form-row">
                            <div className="ffp-form-group">
                                <label htmlFor="name">Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="ffp-form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="ffp-form-row">
                            <div className="ffp-form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="ffp-form-group">
                                <label htmlFor="sessionType">Session Type *</label>
                                <select
                                    id="sessionType"
                                    name="sessionType"
                                    value={formData.sessionType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a session type</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="engagement">Engagement</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="family">Family</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="ffp-form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Tell me about your vision for the session..."
                                required
                            />
                        </div>

                        <button type="submit" className="ffp-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>

                        {submitStatus === 'success' && (
                            <p className="ffp-form-message success">
                                Thank you for your message! I will get back to you soon.
                            </p>
                        )}
                        {submitStatus === 'error' && (
                            <p className="ffp-form-message error">
                                Sorry, there was an error sending your message. Please try again or email me directly at e_stickley@yahoo.com
                            </p>
                        )}
                    </form>
                </div>
            </section>

            <Footer />
        </div>
    );
}
