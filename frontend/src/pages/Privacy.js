import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="font-heading text-xl text-aligna-text mb-3">{title}</h2>
        <div className="text-aligna-text-secondary font-body text-sm leading-relaxed space-y-3">
            {children}
        </div>
    </div>
);

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh bg-aligna-bg">
            <div className="max-w-2xl mx-auto px-5 py-8 md:px-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-aligna-text-secondary hover:text-aligna-text transition-colors mb-8 font-body text-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <img src="/assets/icons/Ajna.svg" alt="" className="w-8 h-8 opacity-60" />
                        <span className="font-body text-xs text-aligna-text-secondary tracking-[0.18em] uppercase">Legal</span>
                    </div>
                    <h1 className="font-heading text-4xl text-aligna-text mb-2">Privacy Policy</h1>
                    <p className="text-aligna-text-secondary font-body text-xs">Last updated: March 2025</p>
                </div>

                <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 md:p-8">

                    <Section title="1. Introduction">
                        <p>
                            At Aligna, your privacy matters. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal data when you use Aligna ("the Service").
                        </p>
                        <p>
                            By using the Service, you agree to the collection and use of information as described in this policy.
                        </p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p><strong className="text-aligna-text">Information from Google Sign-In:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Your name (as set in your Google account)</li>
                            <li>Your email address</li>
                            <li>Your Google profile picture URL</li>
                        </ul>
                        <p className="mt-3"><strong className="text-aligna-text">Information you create:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Manifestation goals and affirmations you write</li>
                            <li>Daily ritual entries (the affirmations you write during rituals)</li>
                            <li>Your subscription plan and payment status</li>
                        </ul>
                        <p className="mt-3"><strong className="text-aligna-text">Technical information:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Session tokens (stored as secure cookies)</li>
                            <li>Usage dates for streak and progress calculations</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Information">
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Provide, operate, and maintain the Service</li>
                            <li>Authenticate your account and maintain your session</li>
                            <li>Store and display your goals, affirmations, and progress</li>
                            <li>Process subscription payments and manage your plan</li>
                            <li>Send ritual reminder notifications (only with your permission)</li>
                            <li>Respond to your support requests</li>
                        </ul>
                        <p>
                            We do not sell, rent, or share your personal information with third parties for their marketing purposes.
                        </p>
                    </Section>

                    <Section title="4. Data Storage and Security">
                        <p>
                            Your data is stored in MongoDB Atlas, a cloud database service. We use industry-standard security practices including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>HTTPS encryption for all data in transit</li>
                            <li>Secure, httpOnly cookies for session management</li>
                            <li>No storage of passwords (we use Google OAuth only)</li>
                        </ul>
                        <p>
                            While we implement reasonable security measures, no method of transmission over the internet is 100% secure.
                        </p>
                    </Section>

                    <Section title="5. Third-Party Services">
                        <p>We use the following third-party services:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-aligna-text">Google OAuth</strong> — for secure sign-in (subject to Google's Privacy Policy)</li>
                            <li><strong className="text-aligna-text">Lemon Squeezy</strong> — for payment processing and subscription management (subject to Lemon Squeezy's Privacy Policy)</li>
                            <li><strong className="text-aligna-text">MongoDB Atlas</strong> — for database hosting</li>
                            <li><strong className="text-aligna-text">Render</strong> — for backend hosting</li>
                            <li><strong className="text-aligna-text">Vercel</strong> — for frontend hosting</li>
                        </ul>
                        <p>
                            These services have their own privacy policies. We do not control their practices.
                        </p>
                    </Section>

                    <Section title="6. Cookies">
                        <p>
                            We use a single session cookie ("session_token") to keep you logged in. This cookie is:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>httpOnly — not accessible to JavaScript</li>
                            <li>Secure — transmitted over HTTPS only in production</li>
                            <li>Expires after 7 days or on sign-out</li>
                        </ul>
                        <p>
                            We do not use advertising, tracking, or analytics cookies.
                        </p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-aligna-text">Access</strong> — request a copy of the personal data we hold about you</li>
                            <li><strong className="text-aligna-text">Correction</strong> — request that inaccurate data be corrected</li>
                            <li><strong className="text-aligna-text">Deletion</strong> — request that your account and all associated data be deleted</li>
                            <li><strong className="text-aligna-text">Portability</strong> — request an export of your data</li>
                        </ul>
                        <p>
                            To exercise any of these rights, please contact us at the email address below. We will respond within 30 days.
                        </p>
                    </Section>

                    <Section title="8. Data Retention">
                        <p>
                            We retain your personal data for as long as your account is active. If you request deletion of your account, we will delete your personal data within 30 days, except where retention is required by law.
                        </p>
                    </Section>

                    <Section title="9. Children's Privacy">
                        <p>
                            The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                    </Section>

                    <Section title="10. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of changes by updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance.
                        </p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p>
                            For any questions about this Privacy Policy or to exercise your data rights, contact us at:
                        </p>
                        <p className="text-aligna-text font-medium">
                            alignaa.io@gmail.com
                        </p>
                    </Section>

                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4 mt-8 opacity-20">
                    {['/assets/icons/Ajna.svg', '/assets/icons/Lotus.svg', '/assets/icons/Equanimity.svg'].map((icon, i) => (
                        <img key={i} src={icon} alt="" className="w-5 h-5" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Privacy;
