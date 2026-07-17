import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, FileText, Eye, Server, Cookie, BarChart3, Trash2, CalendarDays, Scale, UserX, Bell } from 'lucide-react';

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
              <p className="text-xs text-slate-400 font-medium mt-1">Version 2.0 — Effective for all enrollments on or after July 17, 2026</p>
            </div>
          </div>

          <div className="prose prose-emerald max-w-none text-slate-600 space-y-10">
            {/* 1. Introduction & HIPAA */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-emerald-500" />
                1. Introduction & HIPAA Compliance
              </h2>
              <p>
                At Cedexx, your privacy and the security of your Protected Health Information (PHI) are our highest priorities.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                or use our platform to connect with Lyric Health.
              </p>
              <div className="mt-4 space-y-3">
                <p className="font-medium text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <strong>HIPAA Notice:</strong> Cedexx operates as a technology platform and referral service. We do not practice medicine or provide medical advice. Lyric Health is our exclusive telehealth partner and is solely responsible for all clinical services. Lyric Health maintains Business Associate Agreements (BAAs) with all downstream vendors that handle PHI. All medical data, consultation transcripts, and patient records are encrypted end-to-end and stored on secure, HIPAA-compliant servers managed by Lyric Health.
                </p>
                <p className="font-medium text-blue-800 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <strong>Analytics & Member Tracking Notice:</strong> We collect limited enrollment and demographic data (name, email, phone, date of birth, plan selection) to process your membership, track conversion analytics, and improve our service. This data is stored separately from your clinical PHI and is used for operational analytics only. You must provide explicit consent before we collect this data. See Section 5 for details.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-500" />
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">A. Personal Identification Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number, date of birth, and physical address.</li>
                <li>This information is collected during enrollment to create your membership account and facilitate plan selection.</li>
              </ul>
              <h3 className="text-lg font-bold text-emerald-800 mb-2 mt-4">B. Health Information (PHI)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Medical history, current symptoms, consultation notes, prescriptions, and therapist evaluations.</li>
                <li>PHI is <strong>never collected or stored by Cedexx</strong> on this website. It is handled exclusively by Lyric Health through their HIPAA-compliant telehealth platform after you complete enrollment.</li>
              </ul>
              <h3 className="text-lg font-bold text-emerald-800 mb-2 mt-4">C. Payment Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Credit card details and billing addresses are processed securely via Stripe (PCI-DSS Level 1 compliant). We do not store full credit card numbers on our servers.</li>
              </ul>
              <h3 className="text-lg font-bold text-emerald-800 mb-2 mt-4">D. Device & Usage Data (Analytics)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address, browser type, operating system, referral source, and page interaction metrics.</li>
                <li>We use this data to analyze website performance, track enrollment conversion rates, and improve user experience.</li>
                <li>We do <strong>not</strong> use third-party advertising cookies or sell browsing data to advertisers.</li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-emerald-500" />
                3. How We Use Your Information
              </h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Membership Processing:</strong> To create your account, process payments, and manage your subscription plan.</li>
                <li><strong>Healthcare Referral:</strong> To transmit your contact information to Lyric Health so they can provision your telehealth account.</li>
                <li><strong>Analytics & Conversion Tracking:</strong> To track how many visitors enroll, which plans are selected, and how we can improve the enrollment experience. This is aggregated operational data, not clinical data.</li>
                <li><strong>Communication:</strong> To send you membership confirmations, billing receipts, plan updates, and optional marketing communications (you may opt-out of marketing at any time).</li>
                <li><strong>Security & Fraud Prevention:</strong> To detect suspicious activity and protect our platform from abuse.</li>
              </ul>
            </section>

            {/* 4. Analytics, Cookies & Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-emerald-500" />
                4. Analytics, Cookies & Tracking Technologies
              </h2>
              <p>
                We use essential cookies and limited analytics tracking to operate and improve the platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function (e.g., language preference, session state). These cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> We use basic server-side analytics to track enrollment conversions and page visits. We do not use Google Analytics, Facebook Pixel, or other invasive third-party trackers.</li>
                <li><strong>No Advertising Cookies:</strong> We do not serve targeted advertisements and do not share your data with advertising networks.</li>
                <li><strong>Stripe Cookies:</strong> When you proceed to checkout, Stripe may set cookies necessary for fraud prevention and payment processing. See Stripe's Privacy Policy for details.</li>
              </ul>
              <p className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 font-medium">
                <strong>Consent Required:</strong> Before collecting any analytics or enrollment data, we obtain your explicit consent through a checkbox on the enrollment form. You may decline analytics tracking while still completing enrollment.
              </p>
            </section>

            {/* 5. Consent for Analytics & Member Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Cookie className="h-6 w-6 text-emerald-500" />
                5. Consent for Analytics & Member Tracking
              </h2>
              <p>
                When you begin the enrollment process, we ask for explicit consent to collect and process your demographic information for operational analytics. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Logging your name, email, phone number, date of birth, and plan selection in our secure member database.</li>
                <li>Tracking whether you complete payment (conversion analytics) to improve our offerings.</li>
                <li>Generating aggregate reports on membership trends (e.g., "CareNow is our most popular plan"). Individual identities are never disclosed in these reports.</li>
              </ul>
              <p className="mt-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Enroll <strong>without</strong> consenting to analytics tracking (essential enrollment data is still collected to process your membership).</li>
                <li>Withdraw consent at any time by contacting us at Daisy@Cedexx.net. Withdrawal does not affect the lawfulness of processing before withdrawal.</li>
                <li>Request a copy of all data we have collected about you.</li>
              </ul>
            </section>

            {/* 6. Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Server className="h-6 w-6 text-emerald-500" />
                6. Data Sharing and Disclosure
              </h2>
              <p>
                We <strong>do not sell</strong> your personal or medical data to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Healthcare Providers:</strong> With Lyric Health providers and pharmacies directly involved in your care. This is governed by Lyric Health's HIPAA-compliant BAA.</li>
                <li><strong>Payment Processors:</strong> With Stripe to process your subscription payments securely.</li>
                <li><strong>Service Providers:</strong> With trusted vendors who operate under strict confidentiality agreements to support our infrastructure (e.g., hosting, email delivery).</li>
                <li><strong>Legal Requirements:</strong> If required by law, subpoena, court order, or other legal process.</li>
              </ul>
            </section>

            {/* 7. Data Retention Policy */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-emerald-500" />
                7. Data Retention Policy
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Memberships:</strong> We retain your enrollment data for as long as your subscription is active, plus 3 years after cancellation to comply with tax and accounting regulations.</li>
                <li><strong>Inactive Registrations:</strong> If you register but do not complete payment, we retain your data for 12 months for follow-up and analytics, then automatically delete it unless you request earlier deletion.</li>
                <li><strong>Analytics Aggregates:</strong> De-identified aggregate analytics data may be retained indefinitely for business intelligence purposes.</li>
                <li><strong>Medical Records:</strong> Cedexx does not store medical records. Retention of clinical data is governed by Lyric Health's HIPAA policies.</li>
              </ul>
            </section>

            {/* 8. Your Privacy Rights (GDPR / CCPA) */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-emerald-500" />
                8. Your Privacy Rights (GDPR / CCPA)
              </h2>
              <p>Depending on your jurisdiction, you have the following rights:</p>

              <h3 className="text-lg font-bold text-emerald-800 mt-4 mb-2">For All Users:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
                <li><strong>Opt-out:</strong> Opt-out of marketing communications at any time by clicking the unsubscribe link in emails or contacting us.</li>
              </ul>

              <h3 className="text-lg font-bold text-emerald-800 mt-4 mb-2">For EU Residents (GDPR):</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to be Informed:</strong> This Privacy Policy fulfills our obligation to inform you about our data processing activities.</li>
                <li><strong>Right to Object:</strong> You may object to processing based on legitimate interests (e.g., analytics).</li>
                <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
                <li><strong>Right to Withdraw Consent:</strong> If processing is based on consent, you may withdraw it at any time.</li>
                <li><strong>Complaint:</strong> You have the right to lodge a complaint with your local Data Protection Authority.</li>
                <li><strong>Legal Basis:</strong> We process enrollment data under Contractual Necessity (to provide your membership) and Legitimate Interest (for analytics). We obtain explicit consent for analytics tracking.</li>
              </ul>

              <h3 className="text-lg font-bold text-emerald-800 mt-4 mb-2">For California Residents (CCPA):</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information we collect.</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information subject to certain exceptions.</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
                <li><strong>Notice at Collection:</strong> At the time of collection, we notify you of the categories of personal information collected and the purposes for which it will be used (this Privacy Policy serves as that notice).</li>
              </ul>
              <p className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <strong>Categories of Personal Information Collected (CCPA):</strong> Identifiers (name, email, phone, DOB); Commercial Information (plan selected, purchase history); Internet Activity (IP, browser type); Geolocation Data (derived from IP).
              </p>
            </section>

            {/* 9. Data Security Standards */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-500" />
                9. Data Security Standards
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data transmitted between your browser and our servers uses TLS 1.3 encryption. Data at rest is encrypted using AES-256.</li>
                <li><strong>Access Control:</strong> Member data is accessible only through a password-protected admin dashboard. Passwords are hashed using bcrypt.</li>
                <li><strong>Serverless Architecture:</strong> Our API runs on Vercel's serverless infrastructure with ephemeral compute. Member data is stored in isolated temporary files with no public access.</li>
                <li><strong>Regular Review:</strong> We review access logs and security configurations quarterly.</li>
                <li><strong>Breach Notification:</strong> In the event of a data breach affecting your personal information, we will notify you within 72 hours as required by applicable law.</li>
              </ul>
            </section>

            {/* 10. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <GlobeIcon className="h-6 w-6 text-emerald-500" />
                10. International Data Transfers
              </h2>
              <p>
                Our servers are located in the United States. If you are accessing our platform from outside the U.S.,
                your data will be transferred to and processed in the U.S. By using our services, you consent to this transfer.
                We ensure appropriate safeguards are in place for EU users, including reliance on Standard Contractual Clauses where applicable.
              </p>
            </section>

            {/* 11. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <UserX className="h-6 w-6 text-emerald-500" />
                11. Children's Privacy
              </h2>
              <p>
                Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately
                at Daisy@Cedexx.net and we will delete such information.
              </p>
            </section>

            {/* 12. Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Bell className="h-6 w-6 text-emerald-500" />
                12. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email
                (if you have provided one) or by posting a prominent notice on our website. The "Last Updated" date at the top
                of this policy indicates when it was last revised. Continued use of the platform after changes constitutes acceptance
                of the revised policy. We maintain a version history and will provide previous versions upon request.
              </p>
            </section>

            {/* 13. Contact Us */}
            <section className="border-t border-slate-100 pt-8 mt-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">13. Contact Us</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Privacy Officer:</p>
              <div className="bg-slate-50 p-6 rounded-xl mt-4 border border-slate-200">
                <p className="font-medium text-emerald-900">Cedexx Privacy Officer</p>
                <p className="mt-2"><strong>Email:</strong> Daisy@Cedexx.net</p>
                <p className="mt-1"><strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 48 hours.</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
