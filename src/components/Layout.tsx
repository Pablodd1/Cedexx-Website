import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Mail, Globe } from 'lucide-react';
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    document.title = t('seo.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('seo.description'));
    document.documentElement.lang = lang;
  }, [lang, t]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800 selection:bg-blue-100 overflow-x-hidden">
      <div 
        className="fixed inset-0 pointer-events-none z-[100] transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0) px var(--mouse-y, 0) px, rgba(56, 189, 248, 0.05), transparent 80%)` as any
        } as React.CSSProperties}
      />

      <header className="sticky top-0 z-[60] w-full border-b border-slate-100 bg-white/80 backdrop-blur-2xl">
        <div className="container mx-auto px-6 py-1 lg:py-2 flex items-center justify-between gap-8">
          <Link to="/" className="group flex items-center transition-transform duration-500 hover:scale-105">
            <Logo className="h-12 lg:h-16" variant="blue" />
          </Link>

          <nav className="hidden lg:flex items-center bg-slate-50 rounded-2xl p-1 gap-1 border border-slate-100">
            {[
              { to: '/', label: t('nav.home') },
              { to: '/about', label: t('nav.about') },
              { to: '/services', label: t('nav.services') },
              { to: '/blog', label: t('nav.blog') },
              { to: '/partners', label: t('nav.partners') },
              { to: '/investor-pitch', label: t('nav.pitch') },
              { to: '/contact', label: t('nav.contact') },
            ].map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-[#050249] text-white shadow-lg translate-y-[-1px]' 
                      : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center bg-slate-50 rounded-xl p-1 gap-1 border border-slate-100">
              {LANG_OPTIONS.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => setLang(opt.code)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    lang === opt.code
                      ? 'bg-[#050249] text-white shadow-xl translate-y-[-1px]'
                      : 'text-slate-400 hover:text-slate-900'
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

          <button className="lg:hidden text-slate-900 bg-slate-50 p-3 rounded-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-8 flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              {[
                'nav.home', 'nav.about', 'nav.services', 'nav.blog', 
                'nav.partners', 'nav.pitch', 'nav.contact'
              ].map(key => (
                <Link 
                  key={key} 
                  to={`/${key.split('.')[1] === 'home' ? '' : key.split('.')[1].replace('pitch', 'investor-pitch')}`} 
                  className="text-2xl font-black text-slate-900 border-b border-slate-50 pb-2"
                >
                  {t(key)}
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

      <footer className="bg-[#050249] text-blue-50 py-24 relative z-[60]">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="flex flex-col items-center md:items-start">
               <Link to="/">
                 <Logo className="text-4xl mb-8" variant="white" mode="text" />
               </Link>
               <p className="text-blue-100/60 max-w-sm text-sm font-medium leading-relaxed italic text-center md:text-left">{t('footer.tagline')}</p>
            </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">{t('footer.links')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">{t('nav.blog')}</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors">{t('nav.partners')}</Link></li>
              <li><Link to="/investor-pitch" className="hover:text-white transition-colors">{t('nav.pitch')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
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
                <a href="tel:9546246744" className="hover:text-white transition-all text-blue-100 font-bold">(954) 624-6744</a>
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
          <p className="text-[10px] text-blue-500/60 leading-relaxed text-center max-w-2xl mx-auto mb-8 font-medium">
            {t('disclaimer.text')}
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} Cedexx</p>
            <p className="text-blue-500/40 text-[10px] font-medium">National Digital Healthcare Platform</p>
          </div>
        </div>
      </footer>

      <SupportHub />
    </div>
  );
}
