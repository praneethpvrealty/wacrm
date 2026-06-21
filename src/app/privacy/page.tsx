import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, Trash2 } from 'lucide-react';
import { BRANDING } from '@/config/branding';

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRANDING.name}`,
  description: `Privacy policy and user data deletion instructions for ${BRANDING.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="size-8 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-white">{BRANDING.name}</h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="size-3.5" />
            Back to Showcase
          </Link>
        </div>

        {/* Card Block */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="space-y-2 border-b border-slate-800/50 pb-4">
            <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
            <p className="text-xs text-slate-400">Last updated: June 21, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">1. Introduction</h3>
              <p>
                Welcome to {BRANDING.name} (accessible at {BRANDING.websiteUrl}). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy or our practices with regards to your personal information, please contact us.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">2. Information We Collect</h3>
              <p>
                We collect personal information that you voluntarily provide to us when you express interest in obtaining information about us or our products, when you participate in activities on the website (such as submitting property inquiries, request forms, or contacting agents via WhatsApp) or otherwise when you contact us.
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-400">
                <li>Name and contact details (email address, phone number).</li>
                <li>Real estate preferences (budget, locations of interest, property types).</li>
                <li>WhatsApp communications metadata (when interacting with our messaging bots).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">3. How We Use Your Information</h3>
              <p>
                We use personal information collected via our website for a variety of business purposes, including:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-400">
                <li>Facilitating account creation and logon processes.</li>
                <li>Delivering matching property listings and updates via WhatsApp.</li>
                <li>Responding to user inquiries and offering support.</li>
                <li>Enhancing the user experience on our showcase application.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">4. Share of Information</h3>
              <p>
                We do not sell, rent, or trade your personal information with third parties. We only share information with your consent, to comply with laws, to provide you with services (such as forwarding your inquiries to matched agents), to protect your rights, or to fulfill business obligations.
              </p>
            </section>

            {/* Crucial Data Deletion Section for Meta App Review */}
            <section id="data-deletion" className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Trash2 className="size-5" />
                <h3 className="text-base font-black text-white">Data Deletion Instructions</h3>
              </div>
              <p className="text-slate-300">
                According to Meta's developer policies, we provide a clean path for users to request the deletion of their personal data stored within our application.
              </p>
              <p className="text-slate-300">
                If you want to delete your activities or request data erasure for your contact details, phone numbers, or metadata, you can do so at any time by following these steps:
              </p>
              <ol className="list-decimal list-inside pl-2 space-y-1.5 text-slate-400">
                <li>Send an email request to our support desk.</li>
                <li>Clearly specify your registered phone number and/or name.</li>
                <li>Our team will process the deletion within 48 hours and send you a confirmation email.</li>
              </ol>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 mt-8">
          &copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved.
        </div>

      </div>
    </div>
  );
}
