import React from 'react';
import { HeartPulse, Brain, Stethoscope, Activity, ShieldCheck, TrendingUp, Users, Smartphone, CheckCircle2, Dna, Clock, Zap } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import newHeroImg from '../assets/mission-hero.png';
import therapyImg from '../assets/therapy_session.png';
import apartmentImg from '../assets/apartment_exterior.png';

export function Services() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#050249] text-white py-24 md:py-32 relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 pointer-events-none">
           <Logo className="h-[600px] w-auto" variant="white" />
        </div>
        
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight uppercase italic">Healthcare Without the Friction</h1>
          <p className="text-base md:text-xl text-blue-100 font-medium leading-relaxed italic">
            CEDEXX removes common barriers by providing immediate access to everyday health concerns without insurance premiums, co-pays, or urgent care wait times.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-[#050249] mb-4">Built for Everyday Life</h2>
            <p className="text-slate-500 font-medium">Whether managing a sudden illness or addressing routine health concerns, we connect you to licensed care quickly and securely.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Stethoscope, title: 'Urgent Care', desc: 'Treatment for common illnesses like flu, allergies, infections, and more. Available 24/7 in under 15 minutes.' },
              { icon: Brain, title: 'Mental Wellness', desc: 'Immediate support and counseling for anxiety, depression, and stress management.' },
              { icon: HeartPulse, title: 'Prescription Access', desc: 'Evaluation and digital prescriptions sent instantly to your local pharmacy in real time.' },
              { icon: Activity, title: 'Pediatric Care', desc: 'Board-certified pediatric specialists for your children when your regular doctor is unavailable.' },
              { icon: ShieldCheck, title: 'Work & School Notes', desc: 'Medically necessary documentation for employers and schools provided digitally after consults.' },
              { icon: Users, title: 'Family Wellness', desc: 'Holistic support including nutrition counseling and preventative coaching for your whole household.' }
            ].map((service, i) => (
              <Card key={i} className="p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-blue-50 bg-[#EBF3FB] rounded-[2.5rem] group">
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center mb-8 text-[#050249] group-hover:bg-[#050249] group-hover:text-white transition-all duration-300 shadow-sm">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-[#050249] mb-4">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">{service.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Service Breakdown */}
      <section className="py-24 bg-[#EBF3FB]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-32">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1">
                <div className="inline-block bg-white text-[#050249] text-[10px] font-black px-3 py-1 rounded-full mb-6 border border-blue-200">INSTANT ACCESS</div>
                <h3 className="text-3xl md:text-5xl font-black text-[#050249] mb-8 leading-tight">Digital Prescriptions & Documentation</h3>
                <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed">
                  Don't wait hours in a clinic. Providers on our platform can diagnose and treat common conditions in minutes. If medication is needed, they'll send the prescription directly to your pharmacy in real time.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {[
                     'Sinus & Respiratory Infections',
                     'Cold & Flu Symptoms',
                     'Ear & Eye Infections',
                     'Prescription Refills',
                     'School & Work Notes',
                     'Digital Health Records'
                   ].map((item, id) => (
                     <div key={id} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="font-bold text-[#050249] text-sm">{item}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="flex-1 relative min-h-[300px] lg:min-h-[400px]">
                <div className="absolute -inset-4 bg-white/50 blur-2xl rounded-[3.5rem]" />
                <img src={newHeroImg} alt="Cedexx mobile healthcare" className="absolute inset-0 rounded-[3.5rem] shadow-2xl object-cover w-full h-full" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
              <div className="flex-1">
                  <div className="inline-block bg-[#050249] text-white text-[10px] font-black px-3 py-1 rounded-full mb-6 shadow-lg shadow-blue-900/20">24/7 SUPPORT</div>
                <h3 className="text-3xl md:text-5xl font-black text-[#050249] mb-8 leading-tight">Mental Wellness Integration</h3>
                <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed">
                  Every family membership includes access to mental health support professionals. Connect for consultations in a secure, private environment.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {[
                     'Anxiety & Depression Support',
                     'Stress Management',
                     'Relationship Support',
                     'Grief & Loss',
                     'Workplace Stress',
                     'General Wellness Counseling'
                   ].map((item, id) => (
                     <div key={id} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="font-bold text-[#050249] text-sm">{item}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="absolute -inset-4 bg-white/50 blur-2xl rounded-[3.5rem]" />
                <img src={therapyImg} alt="Therapy session" className="relative rounded-[3.5rem] shadow-2xl" />
              </div>
            </div>

            {/* Scale Opportunity: Property Groups */}
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1">
                <div className="inline-block bg-blue-100 text-[#050249] text-[10px] font-black px-3 py-1 rounded-full mb-6 border border-blue-200 uppercase tracking-widest tracking-tighter">Scalable Solution</div>
                <h3 className="text-3xl md:text-5xl font-black text-[#050249] mb-8 leading-[0.9] tracking-tighter italic uppercase underline decoration-[#23d9b0] decoration-8 underline-offset-8">Property & Hospitality Scale</h3>
                <p className="text-xl text-slate-600 mb-10 font-medium leading-relaxed italic">
                  CEDEXX enables property groups to offer "Rent-Included" healthcare access as a revenue-mindful amenity. Scale your property's value across Student Housing, Multifamily complexes, and Hotels.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     'Built-in Student Housing Wellness',
                     'Multifamily "Rent-Included" Care Access',
                     'Hotel Guest Virtual Concierge',
                     'Scalable Amenity Revenue Models',
                     'Enhanced Tenant Retention',
                     'Digital-First Property Value'
                   ].map((item, id) => (
                     <div key={id} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#23d9b0] flex-shrink-0" />
                        <span className="font-black text-[#050249] text-xs uppercase tracking-wider">{item}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="absolute -inset-4 bg-white/50 blur-2xl rounded-[3.5rem]" />
                <img src={apartmentImg} alt="Modern apartment building" className="relative rounded-[3.5rem] shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#050249] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-[4rem] p-16 border border-white/10 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight">Better Care. Here. <span className="text-[#23d9b0]">Now.</span></h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium italic">
              "Connect with a provider in minutes!" — Enrollment now open for individuals and families at one fixed monthly rate.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/enroll">
                <button className="px-9 py-4.5 rounded-2xl text-lg font-black bg-white text-[#050249] hover:bg-blue-50 hover:scale-105 transition-all shadow-xl">
                  Enroll Now
                </button>
              </Link>
              <Link to="/contact">
                <span className="text-blue-300 hover:text-white transition-colors cursor-pointer font-bold underline underline-offset-8">
                  Speak to a Specialist
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-[#050249] mb-16">The Value of CEDEXX</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Smartphone, title: 'Frictionless Access', desc: 'No insurance premiums, co-pays, or hidden fees. Just one simple membership.' },
              { icon: ShieldCheck, title: 'Military-Grade Security', desc: 'Your private health data is protected with bank-level encryption and HIPAA compliance.' },
              { icon: Activity, title: '24/7 Provider Access', desc: 'Secure video or audio consults from home, work, or while traveling.' },
              { icon: TrendingUp, title: 'Save Time & Resources', desc: 'Reduce unnecessary trips to urgent care and miss less time from work or family.' },
              { icon: Users, title: 'Full Family Coverage', desc: 'Our family plan covers your entire household with unlimited provider consultations.' },
              { icon: Dna, title: 'National Network', desc: 'Independent board-certified providers licensed in your state for high-quality care.' }
            ].map((value, i) => (
              <Card key={i} className="p-10 border-blue-50 bg-[#EBF3FB] rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="h-16 w-16 mx-auto bg-white rounded-2xl flex items-center justify-center mb-8 text-[#050249] shadow-sm">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#050249] mb-4">{value.title}</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}