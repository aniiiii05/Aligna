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

const Terms = () => {
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
                        <img src="/assets/icons/Book.svg" alt="" className="w-8 h-8 opacity-60" />
                        <span className="font-body text-xs text-aligna-text-secondary tracking-[0.18em] uppercase">Legal</span>
                    </div>
                    <h1 className="font-heading text-4xl text-aligna-text mb-2">Terms of Service</h1>
                    <p className="text-aligna-text-secondary font-body text-xs">Last updated: March 2025</p>
                </div>

                <div className="bg-aligna-surface border border-aligna-border rounded-3xl p-6 md:p-8">

                    <Section title="1. Acceptance of Terms">
                        <p>
                            By accessing or using Aligna ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                        <p>
                            These terms apply to all users of the Service, including users who are browsers, customers, and contributors of content.
                        </p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>
                            Aligna is a manifestation and mindfulness application that uses the 3-6-9 method to help users set intentions and build daily ritual habits. The Service allows users to create manifestation goals, complete daily writing rituals, and track their progress over time.
                        </p>
                        <p>
                            We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
                        </p>
                    </Section>

                    <Section title="3. User Accounts">
                        <p>
                            You must sign in using a valid Google account to use the Service. You are responsible for maintaining the security of your account and all activities that occur under it.
                        </p>
                        <p>
                            You agree to provide accurate information and to keep your account information current. We reserve the right to terminate accounts that violate these terms.
                        </p>
                    </Section>

                    <Section title="4. User Content">
                        <p>
                            You retain ownership of the content you create within the Service (your goals and affirmations). By using the Service, you grant us a limited licence to store and display your content solely to provide the Service to you.
                        </p>
                        <p>
                            You agree not to post content that is unlawful, harmful, threatening, abusive, harassing, or otherwise objectionable. We reserve the right to remove content that violates these terms.
                        </p>
                    </Section>

                    <Section title="5. Subscription and Payments">
                        <p>
                            Aligna offers free and paid subscription plans. Paid plans are billed on a monthly basis through Lemon Squeezy, our payment processor and merchant of record. Prices are displayed in USD.
                        </p>
                        <p>
                            <strong className="text-aligna-text">Refund Policy:</strong> We offer a 7-day refund on first-time subscriptions. To request a refund, contact us at the email address below. Refunds are processed within 5–10 business days.
                        </p>
                        <p>
                            You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not prorate partial months.
                        </p>
                    </Section>

                    <Section title="6. Prohibited Uses">
                        <p>You agree not to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Use the Service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorised access to any part of the Service</li>
                            <li>Interfere with or disrupt the Service or servers</li>
                            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                            <li>Use automated tools to scrape or extract data from the Service</li>
                        </ul>
                    </Section>

                    <Section title="7. Disclaimers">
                        <p>
                            Aligna is provided "as is" without warranties of any kind. The Service is for personal mindfulness and goal-setting purposes only and does not constitute medical, psychological, or therapeutic advice.
                        </p>
                        <p>
                            We do not guarantee that the Service will be uninterrupted, error-free, or that results will be achieved through use of the Service.
                        </p>
                    </Section>

                    <Section title="8. Limitation of Liability">
                        <p>
                            To the maximum extent permitted by law, Aligna and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
                        </p>
                    </Section>

                    <Section title="9. Governing Law">
                        <p>
                            These terms are governed by the laws of India. Any disputes arising from these terms or the Service shall be subject to the exclusive jurisdiction of the courts of India.
                        </p>
                    </Section>

                    <Section title="10. Changes to Terms">
                        <p>
                            We may update these terms from time to time. We will notify users of significant changes by updating the "Last updated" date at the top of this page. Continued use of the Service after changes constitutes acceptance of the new terms.
                        </p>
                    </Section>

                    <Section title="11. Contact">
                        <p>
                            For questions about these Terms of Service, please contact us at:
                        </p>
                        <p className="text-aligna-text font-medium">
                            alignaa.io@gmail.com
                        </p>
                    </Section>

                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4 mt-8 opacity-20">
                    {['/assets/icons/Lotus.svg', '/assets/icons/Yin Yang.svg', '/assets/icons/Equanimity.svg'].map((icon, i) => (
                        <img key={i} src={icon} alt="" className="w-5 h-5" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Terms;
