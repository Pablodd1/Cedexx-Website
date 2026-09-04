import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User, Calendar, Phone, Mail, MapPin, ChevronRight,
  Mic, MicOff, CheckCircle2, AlertCircle, Languages,
  Building2, Home, ArrowLeft, FileText, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chatbot } from '../components/Chatbot';

/* ─── Supported Languages ─── */
type Lang = 'en' | 'es';

const T: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Member Registration',
    subtitle: 'CEDEXX Resident Enrollment — Powered by Lyric Health',
    badge: 'Powered by Lyric Health',
    instructions: 'Complete all required fields below. Use the microphone button to speak your answers. All information is securely transmitted to Lyric Health for membership activation.',
    membershipAction: 'Membership Action',
    enroll: 'Enroll',
    disenroll: 'Disenroll',
    propertyName: 'Property Name / Group Name',
    propertyType: 'Property Type',
    senior: 'Senior',
    affordable: 'Affordable',
    multifamily: 'Multifamily',
    military: 'Military',
    hoa: 'HOA',
    other: 'Other / N/A',
    residentInfo: 'Resident — Head of Household',
    planDetails: 'Plan Details',
    planSingle: 'Single User Plan',
    planSpouse: 'Single + Spouse Plan',
    planFamily: 'Family Plan',
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name',
    suffix: 'Suffix',
    suffixExample: 'Examples: Jr, III',
    address: 'Address',
    addressRequired: 'Street Address',
    address2: 'Address Line 2',
    address2Example: 'Apt, Suite (example: apt 1234)',
    city: 'City',
    state: 'State',
    stateExample: 'Two-letter abbreviation (example: TX)',
    zipcode: 'Zipcode',
    email: 'Email Address',
    primaryPhone: 'Primary Phone',
    secondaryPhone: 'Secondary Phone',
    gender: 'Gender',
    male: 'Male (M)',
    female: 'Female (F)',
    dob: 'Date of Birth',
    dobFormat: 'Format: mm/dd/yyyy or yyyy-mm-dd',
    effectiveDate: 'Effective Date',
    effectiveRequired: 'Required if enrolling',
    effectiveFormat: 'Format: mm/dd/yyyy or yyyy-mm-dd',
    language: 'Language Preference',
    english: 'English (en)',
    spanish: 'Spanish (es)',
    whyInfo: 'Why we collect this information',
    whyInfoText: 'This information is required by Lyric Health to create and manage your membership. It is stored securely and transmitted via HIPAA-compliant channels.',
    consent: 'I authorize CEDEXX to submit this information to Lyric Health for membership enrollment and consent to receive SMS/text messages for enrollment-related communications.',
    consentRequired: 'Authorization is required to proceed.',
    privacyLink: 'View our Privacy Policy',
    submit: 'Submit Registration',
    submitting: 'Submitting...',
    successTitle: 'Registration Submitted!',
    successText: 'Your membership information has been received. CEDEXX will process your registration with Lyric Health. You will receive confirmation within 24-48 hours.',
    downloadCSV: 'Download CSV Record',
    contactSupport: 'Need Help?',
    contactText: 'If you have questions about this form or need assistance:',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    required: 'Required',
    optional: 'Optional',
    langSelect: 'Select Language',
    back: 'Back to Home',
  },
  es: {
    title: 'Registro de Miembro',
    subtitle: 'Inscripción de Residentes CEDEXX — Powered by Lyric Health',
    badge: 'Powered by Lyric Health',
    instructions: 'Complete todos los campos requeridos. Use el botón de micrófono para hablar sus respuestas. Toda la información se transmite de forma segura a Lyric Health.',
    membershipAction: 'Acción de Membresía',
    enroll: 'Inscribir',
    disenroll: 'Cancelar Membresía',
    propertyName: 'Nombre de Propiedad / Grupo',
    propertyType: 'Tipo de Propiedad',
    senior: 'Adulto Mayor',
    affordable: 'Accesible',
    multifamily: 'Multifamiliar',
    military: 'Militar',
    hoa: 'HOA',
    other: 'Otro / N/A',
    residentInfo: 'Residente — Jefe de Hogar',
    planDetails: 'Detalles del Plan',
    planSingle: 'Plan Individual',
    planSpouse: 'Plan Individual + Cónyuge',
    planFamily: 'Plan Familiar',
    firstName: 'Nombre',
    middleName: 'Segundo Nombre',
    lastName: 'Apellido',
    suffix: 'Sufijo',
    suffixExample: 'Ejemplos: Jr, III',
    address: 'Dirección',
    addressRequired: 'Dirección',
    address2: 'Línea de Dirección 2',
    address2Example: 'Apto, Suite (ejemplo: apt 1234)',
    city: 'Ciudad',
    state: 'Estado',
    stateExample: 'Abreviatura de 2 letras (ejemplo: TX)',
    zipcode: 'Código Postal',
    email: 'Correo Electrónico',
    primaryPhone: 'Teléfono Principal',
    secondaryPhone: 'Teléfono Secundario',
    gender: 'Género',
    male: 'Masculino (M)',
    female: 'Femenino (F)',
    dob: 'Fecha de Nacimiento',
    dobFormat: 'Formato: mm/dd/yyyy o yyyy-mm-dd',
    effectiveDate: 'Fecha de Inicio',
    effectiveRequired: 'Requerido para inscripción',
    effectiveFormat: 'Formato: mm/dd/yyyy o yyyy-mm-dd',
    language: 'Preferencia de Idioma',
    english: 'Inglés (en)',
    spanish: 'Español (es)',
    whyInfo: '¿Por qué recopilamos esta información?',
    whyInfoText: 'Lyric Health requiere esta información para crear y administrar su membresía. Se almacena de forma segura y se transmite por canales compatibles con HIPAA.',
    consent: 'Autorizo a CEDEXX a enviar esta información a Lyric Health para la inscripción de membresía y doy mi consentimiento para recibir mensajes SMS relacionados con la inscripción.',
    consentRequired: 'Se requiere autorización para continuar.',
    privacyLink: 'Ver nuestra Política de Privacidad',
    submit: 'Enviar Registro',
    submitting: 'Enviando...',
    successTitle: '¡Registro Enviado!',
    successText: 'Su información de membresía ha sido recibida. CEDEXX procesará su registro con Lyric Health. Recibirá confirmación en 24-48 horas.',
    downloadCSV: 'Descargar Registro CSV',
    contactSupport: '¿Necesita Ayuda?',
    contactText: 'Si tiene preguntas sobre este formulario o necesita asistencia:',
    phoneLabel: 'Teléfono',
    emailLabel: 'Correo',
    required: 'Requerido',
    optional: 'Opcional',
    langSelect: 'Seleccionar Idioma',
    back: 'Volver al Inicio',
  },
};

/* ─── Voice Input Hook ─── */
function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => { onResult(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [onResult]);

  const toggle = () => {
    if (!recognitionRef.current) { alert('Voice input not supported. Please type.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };
  return { isListening, toggle };
}

/* ─── Voice Input Field ─── */
function VoiceField({ label, value, onChange, onBlur, placeholder, required, type = 'text', lang, helpText }: {
  label: string; value: string; onChange: (v: string) => void; onBlur?: () => void; placeholder?: string;
  required?: boolean; type?: string; lang: Lang; helpText?: string;
}) {
  const { isListening, toggle } = useVoiceInput(onChange);
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-[#050249] uppercase tracking-wider flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-slate-400 font-normal normal-case">({T[lang].optional})</span>}
      </label>
      {helpText && <p className="text-[10px] text-slate-400 font-medium">{helpText}</p>}
      <div className="relative">
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          placeholder={placeholder} required={required}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#050249] font-medium
                     placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#23d9b0] focus:border-transparent transition-all pr-10"
        />
        <button type="button" onClick={toggle}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
            isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-[#23d9b0]/10 hover:text-[#23d9b0]'
          }`} title="Speak">
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Select Field ─── */
function SelectField({ label, value, onChange, options, required, lang, hidePlaceholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean; lang: Lang; hidePlaceholder?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-[#050249] uppercase tracking-wider flex items-center gap-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#050249] font-medium
                   focus:outline-none focus:ring-2 focus:ring-[#23d9b0] focus:border-transparent transition-all appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23050249' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}>
        {!hidePlaceholder && <option value="">{T[lang].langSelect}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
      <Icon className="w-5 h-5 text-[#23d9b0]" />
      <h2 className="text-lg font-black text-[#050249] tracking-tight">{title}</h2>
    </div>
  );
}

/* ─── Main Component ─── */
export default function MemberRegistration() {
  const [lang, setLang] = useState<Lang>('en');
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = T[lang];

  const [form, setForm] = useState({
    action: '', propertyName: '', propertyType: '',
    firstName: '', middleName: '', lastName: '', suffix: '',
    address: '', address2: '', city: '', state: '', zipcode: '',
    email: '', primaryPhone: '', secondaryPhone: '',
    gender: '', dob: '', effectiveDate: '', language: lang,
    plan: '',
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const isValid = () => {
    if (!form.action || !form.propertyName || !form.propertyType) return false;
    if (!form.firstName || !form.lastName) return false;
    if (!form.address || !form.city || !form.state || !form.zipcode) return false;
    if (!form.gender || !form.dob) return false;
    if (!form.plan) return false;
    if (!form.email || !form.primaryPhone || !form.effectiveDate) return false;
    return consent;
  };

  const toCSV = () => {
    const headers = ['Status','PropertyName','PropertyType','Plan','First','Middle','Last','Suffix','Address','Address2','City','State','Zipcode','Email','PrimaryPhone','SecondaryPhone','Gender','DOB','EffectiveDate','Language'];
    const row = [
      form.action, form.propertyName, form.propertyType, form.plan,
      form.firstName, form.middleName, form.lastName, form.suffix,
      form.address, form.address2, form.city, form.state, form.zipcode,
      form.email, form.primaryPhone, form.secondaryPhone, form.gender,
      form.dob, form.effectiveDate, form.language
    ];
    return [headers.join(','), row.map(v => `"${v}"`).join(',')].join('\n');
  };

  const downloadCSV = () => {
    const blob = new Blob([toCSV()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cedexx-member-${form.lastName}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleEmailBlur = async () => {
    if (form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      try {
        await fetch('/api/track-form-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim(),
            form_field: 'patient_registration',
            page_url: window.location.pathname,
          }),
        });
      } catch (_) {}
    }
  };

  const handleSubmit = async () => {
    if (!isValid()) return;
    setSubmitting(true);
    try {
      await fetch('/api/register-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.primaryPhone.trim(),
          dob: form.dob,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipcode: form.zipcode.trim(),
          gender: form.gender,
          plan: form.plan || 'carenow',
          status: 'registered',
          consent_tos: consent,
          consent_analytics: true,
          consent_version: '2.0',
          consent_timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('[REGISTRATION PERSISTENCE WARN]', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 shadow-xl border border-blue-50 text-center">
            <div className="w-20 h-20 bg-[#23d9b0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#23d9b0]" />
            </div>
            <h1 className="text-3xl font-black text-[#050249] mb-4">{t.successTitle}</h1>
            <p className="text-slate-600 font-medium leading-relaxed mb-8">{t.successText}</p>
            <button onClick={downloadCSV}
              className="inline-flex items-center gap-2 bg-[#050249] text-white font-bold py-3 px-8 rounded-2xl text-sm hover:bg-[#03013b] transition-all mb-8">
              <Download className="w-4 h-4" /> {t.downloadCSV}
            </button>
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-black text-[#050249] mb-3">{t.contactSupport}</h4>
              <p className="text-sm text-slate-500 mb-4">{t.contactText}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:754-432-2201" className="inline-flex items-center justify-center gap-2 bg-[#050249] text-white font-bold py-3 px-6 rounded-2xl text-sm">
                  <Phone className="w-4 h-4" /> (754) 432-2201
                </a>
                <a href="mailto:support@cedexx.net" className="inline-flex items-center justify-center gap-2 bg-slate-100 text-[#050249] font-bold py-3 px-6 rounded-2xl text-sm hover:bg-slate-200 transition-all">
                  <Mail className="w-4 h-4" /> support@cedexx.net
                </a>
              </div>
            </div>
          </motion.div>
        </div>
        <Chatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* ─── Language Bar ─── */}
      <div className="bg-[#050249] text-white py-3 px-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold hover:text-[#23d9b0] transition-colors">
            <ArrowLeft className="w-4 h-4" /> CEDEXX
          </Link>
          <div className="relative">
            <button onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all">
              <Languages className="w-4 h-4" />
              {lang === 'en' ? t.english : t.spanish}
            </button>
            {showLangMenu && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 min-w-[160px]">
                <button onClick={() => { setLang('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${lang === 'en' ? 'text-[#23d9b0]' : 'text-[#050249]'}`}>
                  {t.english}
                </button>
                <button onClick={() => { setLang('es'); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${lang === 'es' ? 'text-[#23d9b0]' : 'text-[#050249]'}`}>
                  {t.spanish}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#23d9b0]/10 text-[#23d9b0] px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-4">
              <Building2 className="w-4 h-4" /> {t.badge}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#050249] mb-2 tracking-tight">{t.title}</h1>
            <p className="text-slate-500 font-medium">{t.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* ─── Instructions ─── */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 font-medium">{t.instructions}</p>
        </div>
      </div>

      {/* ─── Form ─── */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-50 space-y-8">

          {/* ── Property Information ── */}
          <section>
            <SectionHeader icon={Building2} title="Property Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label={t.membershipAction} value={form.action} onChange={v => update('action', v)} required lang={lang} hidePlaceholder
                options={[{ value: 'enroll', label: t.enroll }, { value: 'disenroll', label: t.disenroll }]} />
              <SelectField label={t.propertyType} value={form.propertyType} onChange={v => update('propertyType', v)} required lang={lang} hidePlaceholder
                options={[
                  { value: 'Senior', label: t.senior }, { value: 'Affordable', label: t.affordable },
                  { value: 'Multifamily', label: t.multifamily }, { value: 'Military', label: t.military },
                  { value: 'HOA', label: t.hoa }, { value: 'Other', label: t.other }
                ]} />
            </div>
            <div className="mt-4">
              <VoiceField label={t.propertyName} value={form.propertyName} onChange={v => update('propertyName', v)} required lang={lang} />
            </div>
          </section>

          {/* ── Plan Details ── */}
          <section>
            <SectionHeader icon={FileText} title={t.planDetails} />
            <SelectField label={t.planDetails} value={form.plan} onChange={v => update('plan', v)} required lang={lang} hidePlaceholder
              options={[
                { value: '1', label: t.planSingle }, { value: '2', label: t.planSpouse }, { value: '3', label: t.planFamily }
              ]} />
            <p className="text-xs text-slate-500 mt-2 font-medium">Select the plan available for this property/group. Some plans only offer family options while others may offer single and family but not single+spouse.</p>
          </section>

          {/* ── Resident Information ── */}
          <section>
            <SectionHeader icon={User} title={t.residentInfo} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VoiceField label={t.firstName} value={form.firstName} onChange={v => update('firstName', v)} required lang={lang} />
              <VoiceField label={t.middleName} value={form.middleName} onChange={v => update('middleName', v)} lang={lang} />
              <VoiceField label={t.lastName} value={form.lastName} onChange={v => update('lastName', v)} required lang={lang} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <VoiceField label={t.suffix} value={form.suffix} onChange={v => update('suffix', v)} lang={lang} helpText={t.suffixExample} />
              <SelectField label={t.gender} value={form.gender} onChange={v => update('gender', v)} required lang={lang} hidePlaceholder
                options={[{ value: 'M', label: t.male }, { value: 'F', label: t.female }]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <VoiceField label={t.dob} value={form.dob} onChange={v => update('dob', v)} required lang={lang} helpText={t.dobFormat} />
              <VoiceField label={t.effectiveDate} value={form.effectiveDate} onChange={v => update('effectiveDate', v)} required lang={lang} helpText={t.effectiveFormat} />
            </div>
          </section>

          {/* ── Address ── */}
          <section>
            <SectionHeader icon={Home} title="Address" />
            <VoiceField label={t.address} value={form.address} onChange={v => update('address', v)} required lang={lang} helpText={t.addressRequired} />
            <div className="mt-4">
              <VoiceField label={t.address2} value={form.address2} onChange={v => update('address2', v)} lang={lang} helpText={t.address2Example} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <VoiceField label={t.city} value={form.city} onChange={v => update('city', v)} required lang={lang} />
              <VoiceField label={t.state} value={form.state} onChange={v => update('state', v)} required lang={lang} helpText={t.stateExample} />
              <VoiceField label={t.zipcode} value={form.zipcode} onChange={v => update('zipcode', v)} required lang={lang} />
              <SelectField label={t.language} value={form.language} onChange={v => update('language', v)} required lang={lang}
                options={[{ value: 'en', label: t.english }, { value: 'es', label: t.spanish }]} />
            </div>
          </section>

          {/* ── Contact Information ── */}
          <section>
            <SectionHeader icon={Phone} title="Contact Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VoiceField label={t.primaryPhone} value={form.primaryPhone} onChange={v => update('primaryPhone', v)} required lang={lang} type="tel" />
              <VoiceField label={t.secondaryPhone} value={form.secondaryPhone} onChange={v => update('secondaryPhone', v)} lang={lang} type="tel" />
            </div>
            <div className="mt-4">
              <VoiceField label={t.email} value={form.email} onChange={v => update('email', v)} onBlur={handleEmailBlur} required lang={lang} type="email" />
            </div>
          </section>

          {/* ── Privacy & Consent ── */}
          <section className="bg-slate-50 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#050249]">{t.whyInfo}</p>
                <p className="text-sm text-slate-600 mt-1">{t.whyInfoText}</p>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-[#23d9b0] focus:ring-[#23d9b0] mt-0.5" />
              <span className="text-sm text-slate-600 font-medium">
                {t.consent} <Link to="/privacy" className="text-[#050249] underline font-bold">{t.privacyLink}</Link>
              </span>
            </label>
            {!consent && <p className="text-red-500 text-xs font-bold mt-2">{t.consentRequired}</p>}
          </section>

          {/* ── Submit ── */}
          <div className="pt-4 border-t border-slate-200">
            <button onClick={handleSubmit} disabled={!isValid()}
              className="w-full flex items-center justify-center gap-2 bg-[#23d9b0] text-white font-bold py-4 px-8 rounded-2xl text-sm
                         hover:bg-[#1bc49a] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <CheckCircle2 className="w-5 h-5" /> {t.submit}
            </button>
          </div>
        </motion.div>

        {/* ─── Contact Footer ─── */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium mb-3">{t.contactSupport}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:754-432-2201" className="inline-flex items-center justify-center gap-2 text-[#050249] font-bold text-sm hover:text-[#23d9b0] transition-colors">
              <Phone className="w-4 h-4" /> (754) 432-2201
            </a>
            <span className="hidden sm:block text-slate-300">|</span>
            <a href="mailto:support@cedexx.net" className="inline-flex items-center justify-center gap-2 text-[#050249] font-bold text-sm hover:text-[#23d9b0] transition-colors">
              <Mail className="w-4 h-4" /> support@cedexx.net
            </a>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
