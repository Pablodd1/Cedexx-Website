import React from 'react';
import { Building2, Users, Target, Shield } from 'lucide-react';

export function Corporate() {
  return (
    <div className="py-20 bg-blue-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-950 mb-6">
            Corporate Solutions
          </h1>
          <p className="text-lg text-slate-600">
            Empower your workforce with 24/7 access to board-certified healthcare professionals. 
            Cedexx offers comprehensive telemedicine packages tailored for businesses of all sizes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
            <Building2 className="w-12 h-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-blue-950 mb-4">Enterprise Plans</h3>
            <p className="text-slate-600">
              Customized healthcare solutions designed to reduce absenteeism and improve employee wellbeing. 
              Get dedicated account management and detailed utilization reporting.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
            <Users className="w-12 h-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-blue-950 mb-4">Small Business</h3>
            <p className="text-slate-600">
              Affordable, flexible plans that give your team the healthcare benefits they deserve 
              without the overhead of traditional insurance models.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
            <Target className="w-12 h-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-blue-950 mb-4">Strategic Partnerships</h3>
            <p className="text-slate-600">
              Integrate our telemedicine platform into your existing health and wellness offerings. 
              API access and white-label solutions available.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
            <Shield className="w-12 h-12 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-blue-950 mb-4">Compliance & Security</h3>
            <p className="text-slate-600">
              Rest easy knowing our platform is fully HIPAA compliant, with enterprise-grade 
              security protocols protecting your employees' sensitive health data.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6">Ready to transform your company's healthcare benefits?</p>
          <a href="mailto:daisy@cedexx.net" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 transition-colors">
            Contact Corporate Sales
          </a>
        </div>
      </div>
    </div>
  );
}