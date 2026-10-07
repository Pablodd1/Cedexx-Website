import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

export interface EcosystemNode {
  name: string;
  category: string;
  tagline: string;
  url: string;
  isCurrent?: boolean;
}

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    name: 'CEDEXX',
    category: 'National Telehealth',
    tagline: '24/7 Virtual Primary Care & Mental Health',
    url: 'https://www.cedexx.net',
    isCurrent: true,
  },
  {
    name: 'AI Dynamic Pro',
    category: 'Applied AI & Automation',
    tagline: 'Autonomous Voice AI & Workflow Automation',
    url: 'https://www.aidynamic.pro/',
  },
  {
    name: 'PocketScribe',
    category: 'Clinical AI & HealthTech',
    tagline: 'Ambient Clinical Documentation & EHR Entry',
    url: 'https://pocketscribe.online/',
  },
  {
    name: 'Real Estate Dates',
    category: 'PropTech & Escrow',
    tagline: 'Contract Milestones & Closing Timeline Intelligence',
    url: 'https://realestatedates.com/',
  },
  {
    name: 'Chat Building Innovation',
    category: 'AEC & Construction Tech',
    tagline: 'AI Blueprint Analysis & Permitting Intelligence',
    url: 'https://www.chatbuildinginnovation.us/',
  },
  {
    name: 'JAS Miami Method',
    category: 'Sports & Biometrics',
    tagline: 'AI Endurance Coaching & Human Performance',
    url: 'https://jasmiamimethod.fit/',
  },
  {
    name: 'Unitec USA Design',
    category: 'Design & 3D Engineering',
    tagline: 'Architectural Millwork & Parametric 3D Drafting',
    url: 'https://www.unitecusadesign.com/',
  },
  {
    name: 'Medical Billing Miami Beach',
    category: 'Healthcare RevOps',
    tagline: 'HIPAA Revenue Cycle & Automated Claims Recovery',
    url: 'https://medicalbillingmb.com/',
  },
  {
    name: '305business',
    category: 'Venture Advisory',
    tagline: 'South Florida Business Formation & Advisory',
    url: 'https://305business-llc.vercel.app/',
  },
];

export function EcosystemSection() {
  const getUtmUrl = (baseUrl: string) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}utm_source=cedexx&utm_medium=ecosystem_footer&utm_campaign=shared_network`;
  };

  return (
    <div className="w-full mt-16 pt-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center p-1 rounded-md bg-[#23d9b0]/10 text-[#23d9b0]">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#23d9b0]">
                Connected Innovation Ecosystem
              </span>
            </div>
            <p className="text-xs text-blue-200/70 font-medium">
              A collaborative network of specialized AI, healthtech, proptech, and engineering ventures.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-blue-300/60 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#23d9b0] animate-pulse" />
            <span>9 Network Nodes Active</span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ECOSYSTEM_NODES.map((node) => {
            if (node.isCurrent) {
              return (
                <div
                  key={node.name}
                  className="group relative p-4 rounded-2xl bg-white/[0.07] border border-[#23d9b0]/40 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white tracking-tight">
                          {node.name}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#23d9b0] text-[#050249]">
                          You Are Here
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#23d9b0] block mt-0.5">
                        {node.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-100/70 leading-relaxed font-medium">
                    {node.tagline}
                  </p>
                </div>
              );
            }

            return (
              <a
                key={node.name}
                href={getUtmUrl(node.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#23d9b0]/30 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-bold text-sm text-white group-hover:text-[#23d9b0] transition-colors tracking-tight">
                      {node.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-300/60 group-hover:text-blue-200 transition-colors block mt-0.5">
                      {node.category}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-300/40 group-hover:text-[#23d9b0] transition-colors shrink-0 mt-1" />
                </div>
                <p className="text-xs text-blue-200/50 group-hover:text-blue-100/80 transition-colors leading-relaxed line-clamp-2">
                  {node.tagline}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
