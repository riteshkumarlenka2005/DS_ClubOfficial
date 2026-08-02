import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
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
                            <FileText size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-[#1A0B2E] tracking-tight">Terms of Service</h1>
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
                        <Section title="1. Acceptance of Terms">
                            <p>By accessing and using the Data Science Club (DSC) GIETU website and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.</p>
                        </Section>

                        <Section title="2. Membership">
                            <p>Membership in the DSC is open to all currently enrolled students of GIET University. By registering:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>You confirm that all information provided is accurate and up-to-date</li>
                                <li>You agree to maintain the confidentiality of your account credentials</li>
                                <li>You accept responsibility for all activities conducted under your account</li>
                                <li>You agree to abide by the club's code of conduct and university regulations</li>
                            </ul>
                        </Section>

                        <Section title="3. Code of Conduct">
                            <p>All members are expected to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Treat fellow members with respect and dignity</li>
                                <li>Refrain from any form of harassment, discrimination, or abusive behavior</li>
                                <li>Respect intellectual property rights of others</li>
                                <li>Use club resources responsibly and ethically</li>
                                <li>Not engage in any activity that could harm the club's reputation</li>
                            </ul>
                        </Section>

                        <Section title="4. Intellectual Property">
                            <p>Unless otherwise stated:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Content published on this website is the property of DSC GIETU</li>
                                <li>Projects developed collaboratively during club activities are jointly owned by the contributors</li>
                                <li>Members retain individual ownership of personal projects they bring to the club</li>
                                <li>Club branding, logos, and original content may not be used without authorization</li>
                            </ul>
                        </Section>

                        <Section title="5. Events & Workshops">
                            <p>For all club events, workshops, and hackathons:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Registration is on a first-come, first-served basis unless otherwise specified</li>
                                <li>The club reserves the right to cancel or modify events at its discretion</li>
                                <li>Participants agree to follow event-specific rules and guidelines</li>
                                <li>Photography and recordings may be taken during events for promotional purposes</li>
                            </ul>
                        </Section>

                        <Section title="6. Website Usage">
                            <p>When using our website, you agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Attempt to gain unauthorized access to any portion of the website</li>
                                <li>Use the website for any unlawful purpose</li>
                                <li>Upload or transmit harmful content, including viruses or malware</li>
                                <li>Scrape, crawl, or use automated tools to extract data without permission</li>
                            </ul>
                        </Section>

                        <Section title="7. Disclaimer">
                            <p>This website and its content are provided "as is" without warranty of any kind. DSC GIETU does not guarantee the accuracy, completeness, or usefulness of any information on the site. The club is not liable for any damages arising from the use of this website or participation in club activities.</p>
                        </Section>

                        <Section title="8. Modifications">
                            <p>DSC GIETU reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on this page. Continued use of our services after any modifications indicates acceptance of the updated terms.</p>
                        </Section>

                        <Section title="9. Governing Law">
                            <p>These terms are governed by the policies of GIET University and the laws of India. Any disputes arising from these terms shall be resolved through the university's internal dispute resolution mechanisms.</p>
                        </Section>

                        <Section title="10. Contact">
                            <p>For questions regarding these Terms of Service, reach out to us:</p>
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

export default Terms;
