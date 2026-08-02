import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-4xl">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-[#9667E0] hover:text-[#4B2C82] transition-colors mb-10 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1A0B2E] flex items-center justify-center">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-[#1A0B2E] tracking-tight">Privacy Policy</h1>
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-[#9667E0] uppercase tracking-widest mt-4">
                        Last updated: February 2026
                    </p>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="prose prose-lg max-w-none"
                >
                    <div className="space-y-10">
                        <Section title="1. Introduction">
                            <p>Welcome to the Data Science Club (DSC) at GIET University. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or participate in our activities.</p>
                        </Section>

                        <Section title="2. Information We Collect">
                            <p>We may collect the following types of information:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li><strong>Personal Information:</strong> Name, email address, university roll number, and department details when you register as a member or for events.</li>
                                <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and browser type.</li>
                                <li><strong>Event Data:</strong> Participation records, project submissions, and hackathon entries.</li>
                            </ul>
                        </Section>

                        <Section title="3. How We Use Your Information">
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Process membership registrations and event sign-ups</li>
                                <li>Communicate about club events, workshops, and announcements</li>
                                <li>Improve our website and services</li>
                                <li>Maintain accurate records of club participation</li>
                                <li>Generate anonymized analytics to improve our programs</li>
                            </ul>
                        </Section>

                        <Section title="4. Data Sharing">
                            <p>We do not sell, trade, or rent your personal information to third parties. We may share information with:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li><strong>GIET University Administration:</strong> For verification and academic coordination purposes</li>
                                <li><strong>Event Partners:</strong> Only when necessary for collaborative events, with your consent</li>
                                <li><strong>Service Providers:</strong> Third-party tools we use to operate our website (e.g., hosting, analytics)</li>
                            </ul>
                        </Section>

                        <Section title="5. Data Security">
                            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
                        </Section>

                        <Section title="6. Your Rights">
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Access the personal data we hold about you</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Opt out of communications at any time</li>
                            </ul>
                        </Section>

                        <Section title="7. Cookies">
                            <p>Our website may use cookies and similar technologies to enhance your browsing experience. These are small files stored on your device that help us understand how you use our site. You can control cookie preferences through your browser settings.</p>
                        </Section>

                        <Section title="8. Changes to This Policy">
                            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>
                        </Section>

                        <Section title="9. Contact Us">
                            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                            <div className="mt-3 bg-[#EEEAFD] rounded-2xl p-6 border border-[#D8CAF6]">
                                <p className="font-bold text-[#1A0B2E]">Data Science Club — GIET University</p>
                                <p className="text-[#2D164B]">Gunupur, Rayagada, Odisha 765022</p>
                                <p className="text-[#9667E0] font-semibold">datascienceclub@giet.edu</p>
                            </div>
                        </Section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#1A0B2E] mb-4 tracking-tight">{title}</h2>
        <div className="text-[#2D164B] text-sm md:text-base font-medium leading-relaxed opacity-80">
            {children}
        </div>
    </div>
);

export default PrivacyPolicy;
