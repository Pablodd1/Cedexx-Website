import React from 'react';
import { motion } from 'motion/react';
import { Shield, AlertTriangle, Scale, Users, FileText, Phone, Stethoscope, BarChart3 } from 'lucide-react';

export function Terms() {
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
              <Scale className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-950 mb-2">Terms of Service</h1>
              <p className="text-slate-500">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Emergency Banner */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-10 text-red-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-lg mb-1">IF YOU HAVE A MEDICAL EMERGENCY, CALL 911 IMMEDIATELY.</p>
                <p className="text-red-800 text-sm">Do not use this platform for emergencies. Go to the nearest emergency room or call emergency services.</p>
              </div>
            </div>
          </div>

          <div className="prose prose-emerald max-w-none text-slate-600 space-y-10">
            
            {/* SECTION 1: Platform Nature */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-500" />
                1. Platform Nature — Powered by Lyric Health
              </h2>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl mb-4 text-amber-900">
                <p className="font-bold mb-2">IMPORTANT: CEDEXX IS A TECHNOLOGY PLATFORM POWERED BY LYRIC HEALTH.</p>
                <p className="text-sm">Cedexx does not provide medical services, medical advice, diagnosis, or treatment. We operate as a technology platform that connects users with Lyric Health, our exclusive telehealth partner.</p>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>1.1</strong> Cedexx is a technology platform and referral service. We do not provide medical care, medical advice, or healthcare services.</li>
                <li><strong>1.2</strong> We connect users with Lyric Health licensed providers who are licensed to practice in their respective jurisdictions.</li>
                <li><strong>1.3</strong> Lyric Health is solely responsible for clinical services. Lyric Health providers are part of their nationwide network solely responsible for their services.</li>
              </ul>
            </section>

            {/* SECTION 2: No Medical Relationship */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-emerald-500" />
                2. No Doctor-Patient Relationship with Cedexx
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>2.1</strong> No doctor-patient relationship is created between you and Cedexx through your use of this platform.</li>
                <li><strong>2.2</strong> Any doctor-patient relationship is formed exclusively between you and the healthcare provider you choose to engage.</li>
                <li><strong>2.3</strong> We do not review, approve, or interfere with any provider's clinical decisions or medical advice.</li>
              </ul>
            </section>

            {/* SECTION 3: What We Do and Don't Do */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-500" />
                3. Platform = Technology Only
              </h2>
              <p className="mb-3">We provide technology and referral services only. We do not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Practice medicine</li>
                <li>Provide medical advice</li>
                <li>Diagnose conditions</li>
                <li>Prescribe medications</li>
                <li>Interfere with provider clinical decisions</li>
              </ul>
            </section>

            {/* SECTION 4: Providers Are Independent */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-emerald-500" />
                4. Providers Are Independent Contractors
              </h2>
              <p>
                All healthcare providers accessible through our platform are part of Lyric Health, 
                not employees or agents of Cedexx. Each provider is solely responsible for their own services, 
                advice, and medical decisions. We attempt to verify provider credentials but cannot guarantee 
                the quality of any medical service.
              </p>
            </section>

            {/* SECTION 5: Emergency Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Phone className="h-6 w-6 text-emerald-500" />
                5. Emergency Disclaimer
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-4 text-red-900">
                <p className="font-bold">IF YOU HAVE A MEDICAL EMERGENCY, CALL 911 IMMEDIATELY OR GO TO THE NEAREST EMERGENCY ROOM.</p>
              </div>
              <p>
                Our services are not intended for life-threatening conditions, severe trauma, psychiatric emergencies, 
                or any situation requiring immediate in-person medical attention. Our platform is not a replacement 
                for primary care physicians in all situations.
              </p>
            </section>

            {/* SECTION 6: No Medical Advice */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">6. No Medical Advice</h2>
              <p>
                Information provided on this platform is for informational purposes only and does not constitute medical advice. 
                Always consult a qualified healthcare provider for medical concerns. Content on our website, blog, AI assistants, 
                and any marketing materials should not be interpreted as medical guidance.
              </p>
            </section>

            {/* SECTION 7: Telemedicine Services */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">7. Telemedicine Services & Prescriptions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provider Relationship:</strong> Using our platform establishes a provider-patient relationship with the specific board-certified doctor or licensed therapist you consult with, not with Cedexx as a corporate entity.</li>
                <li><strong>Prescription Policy:</strong> Lyric Health providers may prescribe medications when medically necessary. However, <strong>they cannot and will not prescribe DEA-controlled substances</strong>, non-therapeutic drugs, or certain other medications that may be harmful because of their potential for abuse.</li>
                <li><strong>Availability:</strong> While we strive for 24/7/365 availability, wait times may vary based on demand. Most consultations begin within 10–15 minutes.</li>
              </ul>
            </section>

            {/* SECTION 8: Pricing */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">8. Subscription, Pricing, and Billing</h2>
              <p>Cedexx offers affordable family subscription plans:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Family Plan:</strong> Covers the primary account holder and up to additional family members.</li>
                <li><strong>Individual Plan:</strong> Single member 24/7 access.</li>
                <li><strong>Copays:</strong> Depending on your insurance plan, copays may be as low as $0. For uninsured patients, the consultation fee is clearly displayed before the visit begins.</li>
                <li><strong>Billing Cycle:</strong> Subscriptions are billed monthly to the payment method on file.</li>
                <li><strong>Cancellation:</strong> You may cancel your subscription at any time through your account portal. Cancellations take effect at the end of the current billing cycle. No partial refunds are provided.</li>
                <li><strong>No Insurance Guarantees:</strong> We do not guarantee insurance coverage or reimbursement. Payment arrangements are between you and the provider.</li>
              </ul>
            </section>

            {/* SECTION 9: Referral Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">9. Referral Disclosure</h2>
              <p>
                Cedexx may receive compensation from Lyric Health for facilitating connections. 
                This does not affect your cost or our neutrality in presenting Lyric Health as our sole telehealth partner. 
                We are a referral service only and do not control provider pricing or availability.
              </p>
            </section>

            {/* SECTION 10: Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">10. Limitation of Liability</h2>
              <p className="mb-3">TO THE MAXIMUM EXTENT PERMITTED BY LAW, CEDEXX DISCLAIMS ALL LIABILITY FOR:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>(a) Any medical services provided by Lyric Health providers</li>
                <li>(b) Quality of care or treatment outcomes</li>
                <li>(c) Misdiagnosis, delayed diagnosis, or medical errors</li>
                <li>(d) Technical failures preventing access to care</li>
                <li>(e) Actions or omissions of Lyric Health providers</li>
                <li>(f) Any indirect, incidental, special, consequential, or punitive damages</li>
              </ul>
              <p className="mt-4 text-sm text-slate-500">
                Our total liability to you shall not exceed the fees you paid to us in the 12 months preceding the claim, 
                or $100, whichever is greater.
              </p>
            </section>

            {/* SECTION 11: No Endorsement */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">11. No Endorsement</h2>
              <p>
                We do not endorse, recommend, or guarantee any specific Lyric Health provider, treatment, or medical advice. 
                Provider selection is your sole responsibility. Verify provider credentials independently.
              </p>
            </section>

            {/* SECTION 12: Assumption of Risk */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">12. Assumption of Risk</h2>
              <p>
                YOU ASSUME ALL RISK when using this platform and engaging with Lyric Health providers. 
                You agree that Cedexx is not responsible for any harm resulting from medical services 
                obtained through our platform.
              </p>
            </section>

            {/* SECTION 13: Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">13. Indemnification</h2>
              <p>You agree to indemnify and hold harmless Cedexx from any claims, damages, or expenses arising from:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your use of the platform</li>
                <li>Your interactions with healthcare providers</li>
                <li>Any medical decisions made based on platform information</li>
                <li>Your violation of these terms</li>
              </ul>
            </section>

            {/* SECTION 14: User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">14. User Responsibilities</h2>
              <p>By using our platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Provide accurate, current, and complete personal information.</li>
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Not use the platform for any illegal, abusive, or fraudulent purposes.</li>
                <li>Not attempt to reverse-engineer or disrupt the website or our AI systems.</li>
                <li>Be 18 years of age or older, or have parental/guardian consent.</li>
              </ul>
            </section>

            {/* SECTION 15: Data Handling */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">15. Data Handling & HIPAA</h2>
              <p>
                Cedexx operates under HIPAA-compliant data handling practices. Health information submitted through 
                the platform is shared only with the providers you select. Please refer to our Privacy Policy for 
                complete details on data collection, use, and storage.
              </p>
            </section>

            {/* SECTION 16: Analytics & Consent */}
            <section>
              <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-emerald-500" />
                16. Analytics, Member Tracking & Consent
              </h2>
              <p className="mb-3">
                By using our enrollment form, you acknowledge that Cedexx collects and processes limited demographic 
                information (name, email, phone, date of birth, plan selection) for operational purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Membership Processing:</strong> To create and manage your subscription account.</li>
                <li><strong>Analytics & Conversion Tracking:</strong> To understand how users interact with our enrollment flow and improve the platform. Aggregate data is used for business intelligence; individual identities are not disclosed in public reports.</li>
                <li><strong>Administrative Dashboard:</strong> Authorized Cedexx administrators may view enrollment data through a secure, password-protected dashboard for customer support and business planning.</li>
              </ul>
              <div className="mt-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 font-medium">
                <strong>Explicit Consent Required:</strong> Before your enrollment data is logged, you must check a box confirming that you have read our Privacy Policy and agree to our Terms of Service. Optional analytics consent is presented separately and may be declined without affecting your ability to enroll.
              </div>
              <p className="mt-4 text-sm text-slate-500">
                We do not sell your enrollment data to third parties. All data is stored with encryption and access controls 
                as described in our Privacy Policy. You may request deletion of your personal data at any time by contacting 
                Daisy@Cedexx.net, subject to legal retention requirements for tax and accounting records.
              </p>
            </section>

            {/* SECTION 16: Contact */}
            <section className="border-t border-slate-100 pt-8 mt-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">16. Contact Information</h2>
              <p>For questions regarding these Terms of Service, please contact us:</p>
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
