import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Mail, Globe, Shield, Check, LayoutDashboard } from 'lucide-react';
import { SupportHub } from './SupportHub';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { useLanguage, type Lang } from '../context/LanguageContext';

const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ru', label: 'RU' },
  { code: 'ht', label: 'HT' },
];

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cedexx_cookie_consent');
    if (!consent) setShowCookieBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cedexx_cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cedexx_cookie_consent', 'declined');
    setShowCookieBanner(false);
  };

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}`);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // SEO: Dynamic Title/Meta update when language changes
  useEffect(() => {
    document.title = t('seo.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('seo.description'));
    document.documentElement.lang = lang;
  }, [lang, t]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800 selection:bg-blue-100 overflow-x-hidden">
      {/* Premium Mouse Effect - z-0 to not block clicks */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(56, 189, 248, 0.05), transparent 80%)`
        } as React.CSSProperties}
      />

      {/* ── HEADER (Enlarged for Brand Emphasis) ── */}
      <header className={`sticky top-0 z-[60] w-full transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-100 py-1' 
          : (location.pathname === '/' 
              ? 'bg-transparent py-3' 
              : 'bg-white/50 backdrop-blur-xl border-b border-slate-100 py-2')
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between gap-8 h-full">
          <Link to="/" className="group flex items-center transition-transform duration-500 hover:scale-105">
            <Logo 
              className={`transition-all duration-500 ${scrolled ? 'h-30 lg:h-42' : 'h-42 lg:h-54'}`} 
              variant="blue" 
            />
          </Link>

          {/* Desktop nav with capsule effect to match language menu */}
          <nav className={`hidden lg:flex items-center rounded-2xl p-1 gap-1 border transition-all duration-500 ${
            scrolled || location.pathname !== '/' ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/20 backdrop-blur-md'
          }`}>
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/services', label: t('nav.services') },
                { to: '/pricing', label: 'Pricing' },
                { to: '/blog', label: t('nav.blog') },
                { to: '/press-release', label: t('nav.press') },
                { to: '/partners', label: t('nav.partners') },
                { to: '/investor-pitch', label: t('nav.pitch') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/admin', label: t('nav.dashboard') },
              ].map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-[#050249] text-white shadow-lg translate-y-[-1px]' 
                      : 'text-[#050249]/80 hover:text-[#050249]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <div className={`flex items-center rounded-xl p-1 gap-1 border transition-all duration-500 ${
              scrolled || location.pathname !== '/' ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/20 backdrop-blur-md'
            }`}>
              {LANG_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => setLang(opt.code)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                    lang === opt.code
                      ? 'bg-[#050249] text-white shadow-xl translate-y-[-1px]'
                      : 'text-[#050249]/80 hover:text-[#050249]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Link to="/enroll">
              <button className="bg-[#050249] hover:bg-[#03013b] text-white text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-xl hover:shadow-[#050249]/20 hover:-translate-y-1 active:translate-y-0">
                {t('nav.enroll')}
              </button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className={`lg:hidden p-3 rounded-2xl transition-all ${
            scrolled || location.pathname !== '/' ? 'text-[#050249] bg-slate-50' : 'text-[#050249] bg-black/5 backdrop-blur-md'
          }`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-8 flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              {[
                { key: 'nav.home', to: '/' },
                { key: 'nav.about', to: '/about' },
                { key: 'nav.services', to: '/services' },
                { key: 'Pricing', to: '/pricing' },
                { key: 'nav.blog', to: '/blog' },
                { key: 'nav.press', to: '/press-release' },
                { key: 'nav.partners', to: '/partners' },
                { key: 'nav.pitch', to: '/investor-pitch' },
                { key: 'nav.contact', to: '/contact' },
                { key: 'nav.dashboard', to: '/admin' },
              ].map(item => (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  className="text-2xl font-black text-slate-900 border-b border-slate-50 pb-2"
                >
                  {item.key.startsWith('nav.') ? t(item.key as any) : item.key}
                </Link>
              ))}

              <div className="flex items-center bg-slate-50 rounded-2xl p-1 gap-1">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => setLang(opt.code)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                      lang === opt.code ? 'bg-[#050249] text-white' : 'text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <Link to="/enroll">
                <button className="w-full bg-[#050249] text-white font-black py-4 rounded-2xl text-base shadow-2xl shadow-[#050249]/20">
                  {t('nav.enroll')}
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#050249] text-blue-50 py-24 relative z-[60]">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="flex flex-col items-center md:items-start">
               <Link to="/" className="mb-6 block group">
                 <Logo mode="text" className="text-3xl" variant="white" />
               </Link>
               <div className="space-y-1">
                 <p className="text-blue-100/60 max-w-sm text-[11px] font-medium leading-relaxed italic whitespace-pre-line text-center md:text-left">
                   Better Care. Here. <span className="text-[#23d9b0]">Now.</span> Keep It in Your Back Pocket.
                 </p>
               </div>
            </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">{t('footer.links')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">{t('nav.blog')}</Link></li>
              <li><Link to="/press-release" className="hover:text-white transition-colors">{t('nav.press')}</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors">{t('nav.partners')}</Link></li>
              <li><Link to="/investor-pitch" className="hover:text-white transition-colors">{t('nav.pitch')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">{t('nav.dashboard')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">{t('footer.contact')}</h4>
            <ul className="space-y-6 text-sm font-medium">
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 italic">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <a href="mailto:info@cedexx.net" className="hover:text-white transition-all text-blue-100">info@cedexx.net</a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#23d9b0]/20 transition-all duration-500">
                  <Globe className="h-4 w-4 text-blue-400" />
                </div>
                <a href="https://cedexx.net" className="hover:text-white transition-all text-blue-100 font-bold">cedexx.net</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">{t('footer.legal')}</h4>
            <ul className="space-y-4 text-sm font-medium text-blue-200">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-6 mt-20 pt-10 border-t border-white/5">
          <p className="text-[15px] text-blue-500/60 leading-relaxed text-center max-w-3xl mx-auto mb-8 font-medium">
            {t('disclaimer.text')}
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest">© {new Date().getFullYear()} Cedexx</p>
            <p className="text-blue-500/40 text-[10px] font-medium">National Digital Healthcare Platform</p>
          </div>
        </div>
      </footer>

      <SupportHub />

      {/* Cookie / Privacy Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-6 py-5 md:py-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-10 w-10 rounded-xl bg-[#050249] text-white flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#050249]">Your Privacy Matters</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                  We use essential cookies to make the site work and limited analytics to understand enrollment trends.
                  We do not sell your data or use third-party advertising trackers.
                  By clicking "Accept", you consent to these practices as described in our{' '}
                  <Link to="/privacy" className="text-[#050249] font-bold underline hover:text-[#23d9b0]" onClick={() => setShowCookieBanner(false)}>Privacy Policy</Link>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={declineCookies}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Decline Analytics
              </button>
              <button
                onClick={acceptCookies}
                className="px-5 py-2.5 rounded-xl bg-[#050249] text-white text-xs font-bold hover:bg-[#03013b] transition-colors flex items-center gap-2 shadow-lg"
              >
                <Check className="h-3.5 w-3.5" /> Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
