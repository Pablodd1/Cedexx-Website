import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, FileText, Eye, Server } from 'lucide-react';

export function Privacy() {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-2">Privacy Policy</h1>
              <p className="text-slate-500">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="prose prose-emerald max-w-none text-slate-600 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-emerald-500" />
                1. Introduction & HIPAA Compliance
              </h2>
              <p>
                At Cedexx, your privacy and the security of your Protected Health Information (PHI) are our highest priorities. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                or use our platform to connect with independent telemedicine providers. 
              </p>
              <p className="mt-4 font-medium text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <strong>HIPAA Notice:</strong> Cedexx is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA). 
                All medical data, consultation transcripts, and patient records are encrypted end-to-end and stored on secure, HIPAA-compliant servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-500" />
                2. Information We Collect
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Identification Information:</strong> Name, email address, phone number, date of birth, and physical address.</li>
                <li><strong>Health Information (PHI):</strong> Medical history, current symptoms, consultation notes, prescriptions, and therapist evaluations.</li>
                <li><strong>Payment Information:</strong> Credit card details and billing addresses (processed securely via third-party PCI-compliant gateways; we do not store full credit card numbers).</li>
                <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, and interaction metrics with our website and AI assistants.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-emerald-500" />
                3. How We Use Your Information
              </h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>To facilitate 24/7 telemedicine consultations with board-certified doctors and licensed therapists.</li>
                <li>To transmit prescriptions directly to your local pharmacy.</li>
                <li>To manage your $18/month family subscription (up to 6 members).</li>
                <li>To improve our AI assistants to provide faster, more accurate responses.</li>
                <li>To communicate with you regarding appointments, billing, and marketing updates (you may opt-out of marketing at any time).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Server className="h-6 w-6 text-emerald-500" />
                4. Data Sharing and Disclosure
              </h2>
              <p>
                We <strong>do not sell</strong> your personal or medical data to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Healthcare Providers:</strong> With the independent providers, therapists, and pharmacies directly involved in your care.</li>
                <li><strong>Service Providers:</strong> With trusted third-party vendors who operate under strict Business Associate Agreements (BAAs) to ensure HIPAA compliance.</li>
                <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">5. Your Privacy Rights</h2>
              <p>Depending on your jurisdiction, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Request access to your medical records and personal data.</li>
                <li>Request corrections to inaccurate or incomplete information.</li>
                <li>Request the deletion of your personal data (subject to medical record retention laws).</li>
                <li>Opt-out of marketing communications.</li>
              </ul>
            </section>

            <section className="border-t border-slate-100 pt-8 mt-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">6. Contact Us</h2>
              <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Privacy Officer at:</p>
              <div className="bg-slate-50 p-6 rounded-xl mt-4 border border-slate-200">
                <p className="font-medium text-emerald-900">Cedexx Support</p>
                <p className="mt-2"><strong>Email:</strong> Daisy@Cedexx.net</p>

              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}