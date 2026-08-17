import React from 'react';
import { Calendar, ArrowLeft, Share2, Link2, Users, Heart, Building2, Stethoscope, Globe, TrendingUp, Handshake, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PressRelease() {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lyric Health and CEDEXX Announce Strategic Collaboration',
          text: 'Lyric Health and CEDEXX announce a strategic collaboration to redefine community wellness through innovative healthcare solutions.',
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-[#050249] text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 h-96 w-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-[#23d9b0] rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200/70 hover:text-white text-xs font-black uppercase tracking-widest mb-10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-[#23d9b0] text-[#050249] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Press Release
            </span>
            <span className="flex items-center gap-2 text-blue-200/60 text-xs font-bold uppercase tracking-widest">
              <Calendar className="h-3.5 w-3.5" />
              July 13, 2026
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter italic uppercase mb-8">
            Lyric Health and CEDEXX Announce Strategic Collaboration to Redefine Community Wellness Through Innovative Healthcare Solutions
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200/70">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#23d9b0]" />
              CEDEXX / Lyric Health
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#23d9b0]" />
              Community Healthcare
            </span>
          </div>
        </div>
      </section>

      {/* Share Bar */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-5xl py-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share this announcement</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:border-[#050249] hover:text-[#050249] transition-all"
            >
              <Link2 className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            {navigator.share && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#050249] text-white text-xs font-black uppercase tracking-widest hover:bg-[#03013b] transition-all"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="container mx-auto px-6 max-w-5xl py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-32 space-y-8">
              <div className="bg-slate-50 rounded-[2rem] p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#050249] mb-6">Highlights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
                    <Handshake className="h-4 w-4 text-[#23d9b0] mt-0.5 shrink-0" />
                    Strategic partnership between award-winning healthcare technology and community wellness implementation
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
                    <Stethoscope className="h-4 w-4 text-[#23d9b0] mt-0.5 shrink-0" />
                    Comprehensive virtual care ecosystem: primary, urgent, mental health, chronic care, pharmacy
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
                    <Users className="h-4 w-4 text-[#23d9b0] mt-0.5 shrink-0" />
                    Serving multifamily, hospitality, workforce, student, senior living, and mixed-use communities
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium text-slate-600">
                    <TrendingUp className="h-4 w-4 text-[#23d9b0] mt-0.5 shrink-0" />
                    Customized wellness strategies tailored to each community's unique demographics and goals
                  </li>
                </ul>
              </div>

              <div className="bg-[#050249] rounded-[2rem] p-8 text-white">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#23d9b0] mb-4">Contact</h3>
                <p className="text-sm text-blue-100/80 leading-relaxed mb-4">
                  For media inquiries, partnership discussions, or additional information about this collaboration:
                </p>
                <a href="mailto:info@cedexx.net" className="text-sm font-black text-white hover:text-[#23d9b0] transition-colors">
                  info@cedexx.net
                </a>
              </div>
            </div>
          </aside>

          {/* Article Body */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-600 mb-12">
                Healthcare is experiencing one of its most significant transformations in decades. Consumers increasingly expect healthcare to be as accessible, convenient, and personalized as every other service they use in their daily lives. At the same time, multifamily communities, hospitality organizations, employers, and residential developers are searching for innovative ways to improve quality of life while creating lasting value for the people they serve.
              </p>

              <p className="text-lg leading-relaxed text-slate-600 mb-8">
                Recognizing this shift, <strong className="text-[#050249]">Lyric Health</strong> and <strong className="text-[#050249]">CEDEXX</strong> are proud to announce a strategic collaboration that aims to redefine how healthcare and wellness are delivered across residential, hospitality, and emerging community ecosystems.
              </p>

              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                After more than three months of strategic planning, technology integration, product development, and market alignment, the two organizations officially unveil a partnership built around one central belief: <em className="text-[#050249] font-semibold">Healthcare should meet people where they live, work, stay, and thrive.</em>
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                A Shared Vision for the Future of Healthcare
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Traditional healthcare has historically centered around hospitals, physician offices, and urgent care clinics. While those settings remain essential, today's healthcare consumers expect solutions that are proactive rather than reactive.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Modern communities increasingly value preventive care, virtual healthcare, behavioral wellness, and concierge-style services that seamlessly integrate into everyday living.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                Lyric Health and CEDEXX believe this evolution presents an extraordinary opportunity to transform residential communities into healthier, more connected environments. Rather than asking residents to navigate a fragmented healthcare system, the collaboration brings comprehensive healthcare directly into the communities where people spend most of their lives. This approach not only improves access to care but also supports healthier lifestyles, earlier intervention, stronger community engagement, and better long-term health outcomes.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Why This Partnership Matters
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                The collaboration brings together two organizations with complementary expertise.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                <strong className="text-[#050249]">Lyric Health</strong> has earned recognition for delivering award-winning healthcare technology powered by advanced clinical intelligence. Its comprehensive virtual care ecosystem combines board-certified physicians, behavioral health professionals, care navigation specialists, pharmacy support, chronic care management, and intelligent digital healthcare solutions into one integrated platform.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                <strong className="text-[#050249]">CEDEXX</strong> contributes extensive experience in strategic partnerships, wellness implementation, community engagement, and ecosystem development. Its expertise lies in helping residential communities successfully integrate health and wellness into their operational strategies while creating meaningful experiences that benefit residents and property owners alike. Together, the organizations create a comprehensive wellness ecosystem that extends beyond traditional healthcare delivery.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Responding to Changing Consumer Expectations
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Today's residents expect far more than apartments, amenities, and maintenance services. They seek communities that actively support healthier lifestyles. Property owners are increasingly recognizing that wellness has become a competitive advantage.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Healthcare is no longer viewed solely as an insurance benefit—it has become an experience that contributes to resident satisfaction, retention, and overall community value. This shift mirrors the hospitality industry's long-standing focus on delivering exceptional customer experiences.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                By combining healthcare with hospitality-inspired service, Lyric Health and CEDEXX are helping create communities where wellness becomes part of everyday life rather than an occasional medical necessity.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                A New Standard for Community Wellness
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Unlike standardized wellness programs, every solution developed through this collaboration will be customized for each community. Every property has unique demographics, operational goals, resident populations, and healthcare priorities. The partnership embraces a consultative approach that begins with understanding each community before designing a wellness strategy that aligns with its specific needs.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Customized implementation plans may include:
              </p>
              <ul className="space-y-3 mb-12">
                {[
                  'Virtual primary and urgent care access',
                  'Behavioral and mental health support',
                  'Chronic disease management',
                  'Care navigation and coordination',
                  'Pharmacy support services',
                  'Preventive healthcare initiatives',
                  'Resident wellness education',
                  'Community engagement programs',
                  'Population health insights',
                  'Concierge healthcare experiences',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-slate-600">
                    <Heart className="h-5 w-5 text-[#23d9b0] mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                By tailoring services to each community, the collaboration ensures measurable outcomes rather than one-size-fits-all programs.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Benefits for Residents
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                For residents, accessibility becomes the foundation of better healthcare. Instead of waiting days or weeks for appointments or navigating multiple providers, residents gain convenient access to comprehensive healthcare resources designed to fit into their daily lives.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Potential benefits include:
              </p>
              <ul className="space-y-3 mb-12">
                {[
                  'Faster access to licensed healthcare professionals',
                  'Improved preventive care participation',
                  'Better chronic disease management',
                  'Reduced barriers to mental healthcare',
                  'Convenient virtual healthcare options',
                  'Improved healthcare coordination',
                  'Enhanced overall wellness and quality of life',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-slate-600">
                    <Users className="h-5 w-5 text-[#23d9b0] mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                Healthcare becomes easier to access, easier to understand, and easier to integrate into everyday routines.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Creating Value for Property Owners and Operators
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Community wellness also delivers meaningful business value. Residential communities continue to seek innovative amenities that differentiate their properties in increasingly competitive markets. By integrating healthcare into residential environments, owners and operators can enhance the resident experience while supporting long-term operational goals.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Potential advantages include:
              </p>
              <ul className="space-y-3 mb-12">
                {[
                  'Increased resident satisfaction',
                  'Stronger resident retention',
                  'Higher perceived community value',
                  'Competitive market differentiation',
                  'Enhanced resident engagement',
                  'Scalable wellness programming',
                  'Long-term community health initiatives',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-slate-600">
                    <Building2 className="h-5 w-5 text-[#23d9b0] mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                Wellness evolves from a traditional amenity into a strategic investment that benefits both residents and property stakeholders.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Expanding Beyond Multifamily Housing
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                Although the collaboration initially focuses on multifamily housing, its vision extends well beyond residential apartments. Future initiatives will support:
              </p>
              <ul className="space-y-3 mb-12">
                {[
                  'Build-to-rent communities',
                  'Hospitality organizations',
                  'Workforce housing',
                  'Student housing',
                  'Senior living communities',
                  'Employer wellness programs',
                  'Mixed-use developments',
                  'Emerging residential ecosystems',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-slate-600">
                    <Globe className="h-5 w-5 text-[#23d9b0] mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-lg leading-relaxed text-slate-600 mb-12">
                Each market shares a common objective: making quality healthcare more accessible while improving the experiences of the people they serve.
              </p>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Leadership Perspectives
              </h2>

              <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 mb-12">
                <Quote className="h-8 w-8 text-[#23d9b0] mb-6" />
                <blockquote className="text-lg md:text-xl font-medium leading-relaxed text-slate-700 italic mb-8">
                  "For the past several months, our teams have worked side by side refining our vision, aligning our strategies, and developing solutions we believe will meaningfully transform how healthcare reaches communities. Lyric Health has built its reputation by delivering award-winning healthcare technology that improves access, quality, and clinical outcomes. We immediately recognized CEDEXX's passion, strategic vision, and unique expertise in creating value within the multifamily space. Together, we'll collaborate closely with every client to deliver seamless implementation, personalized support, and community-specific wellness solutions that make healthcare more accessible while enhancing the resident experience."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#050249] flex items-center justify-center text-white font-black text-sm">
                    RC
                  </div>
                  <div>
                    <p className="font-black text-[#050249] text-sm uppercase tracking-widest">Rey Colon</p>
                    <p className="text-xs text-slate-500 font-medium">Founder and CEO, Lyric Health</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#050249] rounded-[2rem] p-8 md:p-12 mb-12 text-white">
                <Quote className="h-8 w-8 text-[#23d9b0] mb-6" />
                <blockquote className="text-lg md:text-xl font-medium leading-relaxed text-blue-50 italic mb-8">
                  "For years I prayed for clarity about my higher purpose, and one day it became unmistakably clear. I realized every chapter of my career had been preparing me for this opportunity—to bring together my experience in strategic partnerships, business development, and community engagement to help transform how healthcare reaches people. Our collaboration with Lyric Health allows us to integrate wellness into residential and hospitality ecosystems at scale, making quality healthcare more accessible while helping drive costs down through innovation, technology, and thoughtful collaboration. Together, we aren't simply launching a new wellness solution—we're creating a new model for how healthcare becomes part of everyday living."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#23d9b0] flex items-center justify-center text-[#050249] font-black text-sm">
                    DG
                  </div>
                  <div>
                    <p className="font-black text-white text-sm uppercase tracking-widest">Daisy Gonzalez</p>
                    <p className="text-xs text-blue-200/70 font-medium">Founder and CEO, CEDEXX</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-[#050249] uppercase italic tracking-tighter mb-6 mt-16">
                Looking Ahead
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                The announcement marks only the beginning of a long-term strategic relationship. As healthcare continues evolving toward more connected, preventive, and community-centered models, Lyric Health and CEDEXX remain committed to developing innovative solutions that improve accessibility while creating measurable value for residents, employers, hospitality organizations, and property owners.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                By combining advanced healthcare technology with thoughtful community implementation, the partnership establishes a new benchmark for integrated wellness.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-6">
                The vision extends beyond improving healthcare access. It is about creating healthier communities, strengthening relationships between residents and the places they call home, and building environments where wellness becomes part of everyday life.
              </p>
              <p className="text-lg leading-relaxed text-slate-600 mb-16">
                Together, Lyric Health and CEDEXX are helping shape the future of healthcare—making it more accessible, more connected, and more impactful for communities everywhere.
              </p>

              {/* CTA */}
              <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 text-center">
                <h3 className="text-xl md:text-2xl font-black text-[#050249] uppercase italic tracking-tighter mb-4">
                  Ready to Learn More?
                </h3>
                <p className="text-slate-500 font-medium mb-8 max-w-xl mx-auto">
                  Discover how your community can benefit from integrated wellness solutions designed for modern living.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/partners">
                    <button className="bg-[#050249] hover:bg-[#03013b] text-white text-sm font-black uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-[#050249]/20">
                      Explore Partnerships
                    </button>
                  </Link>
                  <Link to="/contact">
                    <button className="bg-white border-2 border-slate-200 hover:border-[#050249] text-[#050249] text-sm font-black uppercase tracking-widest px-8 py-4 rounded-xl transition-all">
                      Contact Us
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
