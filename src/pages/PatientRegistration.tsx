import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User, Calendar, Phone, Mail, MapPin, Globe, ChevronRight,
  Mic, MicOff, Camera, CheckCircle2, AlertCircle, Languages,
  QrCode, HeartPulse, Shield, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chatbot } from '../components/Chatbot';

/* ─── Supported Languages ─── */
type Lang = 'en' | 'es' | 'ht' | 'ru';

const T: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Patient Registration',
    subtitle: 'Welcome to CEDEXX — Better Care. Here. Now.',
    badge: 'Powered by Lyric Health',
    step1: 'Personal Information',
    step2: 'Contact Details',
    step3: 'Health Coverage',
    step4: 'Review & Submit',
    firstName: 'First Name',
    lastName: 'Last Name',
    middleName: 'Middle Name (Optional)',
    dob: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    preferNot: 'Prefer not to say',
    phone: 'Phone Number',
    email: 'Email Address',
    address: 'Street Address',
    city: 'City',
    state: 'State',
    zip: 'ZIP Code',
    country: 'Country',
    emergencyName: 'Emergency Contact Name',
    emergencyPhone: 'Emergency Contact Phone',
    relationship: 'Relationship',
    insurance: 'Do you have insurance?',
    insuranceYes: 'Yes',
    insuranceNo: 'No',
    insuranceProvider: 'Insurance Provider',
    policyNumber: 'Policy Number',
    groupNumber: 'Group Number',
    memberID: 'Member ID',
    planType: 'Plan Type',
    whyInfo: 'Why we collect this information',
    whyInfoText: 'This information helps Lyric Health providers give you the best care. It is stored securely and never shared without your consent.',
    scanPrompt: 'Scan the QR code to open this form on your phone',
    voicePrompt: 'Tap the microphone to speak your answer',
    next: 'Next Step',
    back: 'Go Back',
    submit: 'Complete Registration',
    submitting: 'Submitting...',
    successTitle: 'Registration Complete!',
    successText: 'Your information has been received. You will receive a confirmation email within 24-48 hours with next steps to access your Lyric Health account.',
    downloadApp: 'Download Lyric Health App',
    contactSupport: 'Need Help?',
    contactText: 'If you have questions or need assistance, contact us:',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    required: 'Required',
    optional: 'Optional',
    langSelect: 'Select Language',
    english: 'English',
    spanish: 'Español',
    creole: 'Kreyòl',
    russian: 'Русский',
    barcodeTitle: 'Quick Access',
    barcodeText: 'Point your camera at this code to open this form instantly on any device.',
    formInstructions: 'Please fill out all required fields. Use the microphone button to speak your answers. Tap the language button to change languages.',
    patientType: 'Patient Type',
    individual: 'Individual',
    family: 'Family (up to 7 members)',
    senior: 'Senior / Elderly',
    employer: 'Employer / Corporate',
    facility: 'Healthcare Facility',
    languagePref: 'Preferred Language for Care',
    primaryCare: 'Do you have a primary care physician?',
    medications: 'Current Medications (Optional)',
    allergies: 'Known Allergies (Optional)',
    conditions: 'Medical Conditions (Optional)',
    consent: 'I consent to CEDEXX sharing my information with Lyric Health providers for telehealth services.',
    consentRequired: 'You must consent to proceed.',
    privacyLink: 'View our Privacy Policy',
  },
  es: {
    title: 'Registro de Paciente',
    subtitle: 'Bienvenido a CEDEXX — Mejor Atención. Aquí. Ahora.',
    badge: 'Powered by Lyric Health',
    step1: 'Información Personal',
    step2: 'Datos de Contacto',
    step3: 'Cobertura de Salud',
    step4: 'Revisar y Enviar',
    firstName: 'Nombre',
    lastName: 'Apellido',
    middleName: 'Segundo Nombre (Opcional)',
    dob: 'Fecha de Nacimiento',
    gender: 'Género',
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    preferNot: 'Prefiero no decir',
    phone: 'Teléfono',
    email: 'Correo Electrónico',
    address: 'Dirección',
    city: 'Ciudad',
    state: 'Estado',
    zip: 'Código ZIP',
    country: 'País',
    emergencyName: 'Nombre de Contacto de Emergencia',
    emergencyPhone: 'Teléfono de Emergencia',
    relationship: 'Relación',
    insurance: '¿Tiene seguro médico?',
    insuranceYes: 'Sí',
    insuranceNo: 'No',
    insuranceProvider: 'Proveedor de Seguro',
    policyNumber: 'Número de Póliza',
    groupNumber: 'Número de Grupo',
    memberID: 'ID de Miembro',
    planType: 'Tipo de Plan',
    whyInfo: '¿Por qué recopilamos esta información?',
    whyInfoText: 'Esta información ayuda a los proveedores de Lyric Health a brindarle la mejor atención. Se almacena de forma segura y nunca se comparte sin su consentimiento.',
    scanPrompt: 'Escanee el código QR para abrir este formulario en su teléfono',
    voicePrompt: 'Toque el micrófono para hablar su respuesta',
    next: 'Siguiente',
    back: 'Atrás',
    submit: 'Completar Registro',
    submitting: 'Enviando...',
    successTitle: '¡Registro Completado!',
    successText: 'Su información ha sido recibida. Recibirá un correo de confirmación en 24-48 horas con los siguientes pasos para acceder a su cuenta de Lyric Health.',
    downloadApp: 'Descargar App de Lyric Health',
    contactSupport: '¿Necesita Ayuda?',
    contactText: 'Si tiene preguntas o necesita asistencia, contáctenos:',
    phoneLabel: 'Teléfono',
    emailLabel: 'Correo',
    required: 'Requerido',
    optional: 'Opcional',
    langSelect: 'Seleccionar Idioma',
    english: 'English',
    spanish: 'Español',
    creole: 'Kreyòl',
    russian: 'Русский',
    barcodeTitle: 'Acceso Rápido',
    barcodeText: 'Apunte su cámara a este código para abrir el formulario instantáneamente en cualquier dispositivo.',
    formInstructions: 'Complete todos los campos requeridos. Use el botón de micrófono para hablar sus respuestas. Toque el botón de idioma para cambiar de idioma.',
    patientType: 'Tipo de Paciente',
    individual: 'Individual',
    family: 'Familiar (hasta 7 miembros)',
    senior: 'Adulto Mayor',
    employer: 'Empleador / Corporativo',
    facility: 'Centro de Salud',
    languagePref: 'Idioma Preferido para la Atención',
    primaryCare: '¿Tiene médico de cabecera?',
    medications: 'Medicamentos Actuales (Opcional)',
    allergies: 'Alergias Conocidas (Opcional)',
    conditions: 'Condiciones Médicas (Opcional)',
    consent: 'Doy mi consentimiento para que CEDEXX comparta mi información con los proveedores de Lyric Health para servicios de telemedicina.',
    consentRequired: 'Debe dar su consentimiento para continuar.',
    privacyLink: 'Ver nuestra Política de Privacidad',
  },
  ht: {
    title: 'Enskripsyon Pasyan',
    subtitle: 'Byenveni nan CEDEXX — Pi Bon Swen. Isit la. Kounye a.',
    badge: 'Powered by Lyric Health',
    step1: 'Enfòmasyon Pèsonèl',
    step2: 'Detay Kontak',
    step3: 'Kouvèti Sante',
    step4: 'Revize & Soumèt',
    firstName: 'Premye Non',
    lastName: 'Siyati',
    middleName: 'Dezyèm Non (Opsyonel)',
    dob: 'Dat Nesans',
    gender: 'Sèks',
    male: 'Gason',
    female: 'Fi',
    other: 'Lòt',
    preferNot: 'Mwen pa vle di',
    phone: 'Nimewo Telefòn',
    email: 'Imèl',
    address: 'Adrès',
    city: 'Vil',
    state: 'Eta',
    zip: 'Kòd Postal',
    country: 'Peyi',
    emergencyName: 'Non Kontak Ijans',
    emergencyPhone: 'Telefòn Ijans',
    relationship: 'Relasyon',
    insurance: 'Èske ou gen asirans?',
    insuranceYes: 'Wi',
    insuranceNo: 'Non',
    insuranceProvider: 'Konpayi Asirans',
    policyNumber: 'Nimewo Polis',
    groupNumber: 'Nimewo Gwoup',
    memberID: 'ID Manm',
    planType: 'Kalite Plan',
    whyInfo: 'Poukisa nou kolekte enfòmasyon sa a?',
    whyInfoText: 'Enfòmasyon sa a ede founisè Lyric Health yo ba ou pi bon swen. Li estoke san danje e pa pataje janm san konsantman ou.',
    scanPrompt: 'Eskane kòd QR la pou ouvri fòm sa a sou telefòn ou',
    voicePrompt: 'Peze mikwo a pou pale repons ou',
    next: 'Pwochen Etap',
    back: 'Retounen',
    submit: 'Konplète Enskripsyon',
    submitting: 'Ap Soumèt...',
    successTitle: 'Enskripsyon Konplè!',
    successText: 'Enfòmasyon ou resevwa. W ap resevwa yon imèl konfimasyon nan 24-48 èdtan ak pwochen etap pou aksede kont Lyric Health ou.',
    downloadApp: 'Telechaje App Lyric Health',
    contactSupport: 'Bezwen Èd?',
    contactText: 'Si ou gen kesyon oswa bezwen asistans, kontakte nou:',
    phoneLabel: 'Telefòn',
    emailLabel: 'Imèl',
    required: 'Obligatwa',
    optional: 'Opsyonel',
    langSelect: 'Chwazi Lang',
    english: 'English',
    spanish: 'Español',
    creole: 'Kreyòl',
    russian: 'Русский',
    barcodeTitle: 'Aksè Rapid',
    barcodeText: 'Dirijje kamera ou sou kòd sa a pou ouvri fòm lan nan nenpòt aparey.',
    formInstructions: 'Ranpli tout chan obligatwa yo. Sèvi ak bouton mikwo a pou pale repons ou. Peze bouton lang lan pou chanje lang.',
    patientType: 'Kalite Pasyan',
    individual: 'Endividyèl',
    family: 'Fanmi (jiska 7 manm)',
    senior: 'Granmoun Aje',
    employer: 'Anplwayè / Korporatif',
    facility: 'Sant Sante',
    languagePref: 'Lang Prefere pou Swen',
    primaryCare: 'Èske ou gen yon doktè prensipal?',
    medications: 'Medikaman Kounye a (Opsyonel)',
    allergies: 'Alerji Konni (Opsyonel)',
    conditions: 'Kondisyon Medikal (Opsyonel)',
    consent: 'Mwen bay konsantman mwen pou CEDEXX pataje enfòmasyon mwen ak founisè Lyric Health pou sèvis telemedsin.',
    consentRequired: 'Ou dwe bay konsantman ou pou kontinye.',
    privacyLink: 'Gade Politik Vi Prive nou an',
  },
  ru: {
    title: 'Регистрация Пациента',
    subtitle: 'Добро пожаловать в CEDEXX — Лучший Уход. Здесь. Сейчас.',
    badge: 'Powered by Lyric Health',
    step1: 'Личная Информация',
    step2: 'Контактные Данные',
    step3: 'Медицинское Страхование',
    step4: 'Проверка и Отправка',
    firstName: 'Имя',
    lastName: 'Фамилия',
    middleName: 'Отчество (Необязательно)',
    dob: 'Дата Рождения',
    gender: 'Пол',
    male: 'Мужской',
    female: 'Женский',
    other: 'Другой',
    preferNot: 'Предпочитаю не указывать',
    phone: 'Телефон',
    email: 'Электронная Почта',
    address: 'Адрес',
    city: 'Город',
    state: 'Штат',
    zip: 'Почтовый Индекс',
    country: 'Страна',
    emergencyName: 'Имя Контакта для Экстренных Случаев',
    emergencyPhone: 'Телефон для Экстренных Случаев',
    relationship: 'Родство',
    insurance: 'Есть ли у вас страховка?',
    insuranceYes: 'Да',
    insuranceNo: 'Нет',
    insuranceProvider: 'Страховая Компания',
    policyNumber: 'Номер Полиса',
    groupNumber: 'Номер Группы',
    memberID: 'ID Члена',
    planType: 'Тип Плана',
    whyInfo: 'Зачем мы собираем эту информацию?',
    whyInfoText: 'Эта информация помогает поставщикам Lyric Health оказывать вам лучший уход. Она хранится безопасно и никогда не передается без вашего согласия.',
    scanPrompt: 'Отсканируйте QR-код, чтобы открыть эту форму на телефоне',
    voicePrompt: 'Нажмите на микрофон, чтобы произнести ответ',
    next: 'Далее',
    back: 'Назад',
    submit: 'Завершить Регистрацию',
    submitting: 'Отправка...',
    successTitle: 'Регистрация Завершена!',
    successText: 'Ваша информация получена. Вы получите подтверждающее письмо в течение 24-48 часов со следующими шагами для доступа к вашей учетной записи Lyric Health.',
    downloadApp: 'Скачать Приложение Lyric Health',
    contactSupport: 'Нужна Помощь?',
    contactText: 'Если у вас есть вопросы или нужна помощь, свяжитесь с нами:',
    phoneLabel: 'Телефон',
    emailLabel: 'Почта',
    required: 'Обязательно',
    optional: 'Необязательно',
    langSelect: 'Выбрать Язык',
    english: 'English',
    spanish: 'Español',
    creole: 'Kreyòl',
    russian: 'Русский',
    barcodeTitle: 'Быстрый Доступ',
    barcodeText: 'Наведите камеру на этот код, чтобы мгновенно открыть форму на любом устройстве.',
    formInstructions: 'Пожалуйста, заполните все обязательные поля. Используйте кнопку микрофона для голосового ввода. Нажмите кнопку языка для смены языка.',
    patientType: 'Тип Пациента',
    individual: 'Индивидуальный',
    family: 'Семейный (до 7 человек)',
    senior: 'Пожилой',
    employer: 'Работодатель / Корпоративный',
    facility: 'Медицинское Учреждение',
    languagePref: 'Предпочтительный Язык для Ухода',
    primaryCare: 'Есть ли у вас лечащий врач?',
    medications: 'Текущие Лекарства (Необязательно)',
    allergies: 'Известные Аллергии (Необязательно)',
    conditions: 'Медицинские Состояния (Необязательно)',
    consent: 'Я даю согласие на передачу CEDEXX моей информации поставщикам Lyric Health для услуг телемедицины.',
    consentRequired: 'Вы должны дать согласие для продолжения.',
    privacyLink: 'Посмотреть нашу Политику Конфиденциальности',
  },
};

/* ─── Barcode SVG Generator ─── */
function BarcodeSVG({ value }: { value: string }) {
  // Simple visual barcode representation
  const bars = value.split('').map((c, i) => {
    const w = (c.charCodeAt(0) % 3) + 1;
    const gap = (i % 2 === 0) ? 2 : 1;
    return { w, gap, key: i };
  });

  let x = 0;
  return (
    <svg viewBox="0 0 200 60" className="w-full max-w-[200px] mx-auto">
      {bars.map(({ w, key }) => {
        const rect = <rect key={key} x={x} y="0" width={w} height="60" fill="#050249" />;
        x += w + 2;
        return rect;
      })}
    </svg>
  );
}

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
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [onResult]);

  const toggle = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported on this device. Please type your answer.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return { isListening, toggle };
}

/* ─── Form Input with Voice ─── */
function VoiceInput({
  label, value, onChange, placeholder, required, type = 'text', lang
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  lang: Lang;
}) {
  const { isListening, toggle } = useVoiceInput((text) => onChange(text));

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-[#050249] uppercase tracking-widest flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-slate-400 font-normal normal-case">({T[lang].optional})</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-[#050249] font-medium
                     placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#23d9b0] focus:border-transparent
                     transition-all pr-12"
        />
        <button
          type="button"
          onClick={toggle}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
            isListening
              ? 'bg-red-100 text-red-500 animate-pulse'
              : 'bg-slate-100 text-slate-400 hover:bg-[#23d9b0]/10 hover:text-[#23d9b0]'
          }`}
          title={T[lang].voicePrompt}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Select Input ─── */
function SelectInput({
  label, value, onChange, options, required, lang
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  lang: Lang;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-[#050249] uppercase tracking-widest flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-[#050249] font-medium
                   focus:outline-none focus:ring-2 focus:ring-[#23d9b0] focus:border-transparent transition-all appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23050249' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
      >
        <option value="">{T[lang].langSelect}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              i + 1 <= step
                ? 'bg-[#23d9b0] text-white'
                : 'bg-slate-200 text-slate-400'
            }`}>
              {i + 1 < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`text-[10px] font-bold mt-1 hidden sm:block ${i + 1 <= step ? 'text-[#050249]' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#23d9b0] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function PatientRegistration() {
  const [lang, setLang] = useState<Lang>('en');
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = T[lang];

  const [form, setForm] = useState({
    firstName: '', lastName: '', middleName: '', dob: '', gender: '',
    phone: '', email: '', address: '', city: '', state: '', zip: '', country: 'United States',
    emergencyName: '', emergencyPhone: '', relationship: '',
    hasInsurance: '', insuranceProvider: '', policyNumber: '', groupNumber: '', memberID: '', planType: '',
    patientType: '', languagePref: lang,
    hasPrimaryCare: '', medications: '', allergies: '', conditions: '',
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const validateStep = (s: number) => {
    if (s === 1) {
      return form.firstName && form.lastName && form.dob && form.gender;
    }
    if (s === 2) {
      return form.phone && form.email && form.address && form.city && form.state && form.zip;
    }
    if (s === 3) {
      return form.hasInsurance !== '' && form.patientType && form.languagePref;
    }
    return consent;
  };

  const handleSubmit = async () => {
    if (!consent) return;
    setSubmitted(true);
    // In production: POST to API
    console.log('[PATIENT REGISTRATION]', form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 shadow-xl border border-blue-50 text-center"
          >
            <div className="w-20 h-20 bg-[#23d9b0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#23d9b0]" />
            </div>
            <h1 className="text-3xl font-black text-[#050249] mb-4">{t.successTitle}</h1>
            <p className="text-slate-600 font-medium leading-relaxed mb-8">{t.successText}</p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-black text-[#050249] mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                {t.downloadApp}
              </h3>
              <ol className="space-y-2 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-[#23d9b0] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                  Search "Lyric Health" in your App Store
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#23d9b0] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
                  Download and open the app
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#23d9b0] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
                  Tap "First Time User?" and enter your details
                </li>
              </ol>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-black text-[#050249] mb-3">{t.contactSupport}</h4>
              <p className="text-sm text-slate-500 mb-4">{t.contactText}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:954-624-6744" className="inline-flex items-center justify-center gap-2 bg-[#050249] text-white font-bold py-3 px-6 rounded-2xl text-sm">
                  <Phone className="w-4 h-4" />
                  954-624-6744
                </a>
                <a href="mailto:support@cedexx.net" className="inline-flex items-center justify-center gap-2 bg-slate-100 text-[#050249] font-bold py-3 px-6 rounded-2xl text-sm hover:bg-slate-200 transition-all">
                  <Mail className="w-4 h-4" />
                  support@cedexx.net
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
      <div className="bg-[#050249] text-white py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold hover:text-[#23d9b0] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            CEDEXX
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Languages className="w-4 h-4" />
              {lang === 'en' && t.english}
              {lang === 'es' && t.spanish}
              {lang === 'ht' && t.creole}
              {lang === 'ru' && t.russian}
            </button>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 min-w-[160px]"
              >
                {(['en', 'es', 'ht', 'ru'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLangMenu(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${
                      lang === l ? 'text-[#23d9b0]' : 'text-[#050249]'
                    }`}
                  >
                    {l === 'en' && t.english}
                    {l === 'es' && t.spanish}
                    {l === 'ht' && t.creole}
                    {l === 'ru' && t.russian}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#23d9b0]/10 text-[#23d9b0] px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-4">
              <HeartPulse className="w-4 h-4" />
              {t.badge}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#050249] mb-2 tracking-tight">{t.title}</h1>
            <p className="text-slate-500 font-medium">{t.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* ─── Barcode Scanner Section ─── */}
      <div className="bg-slate-100 py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="bg-white p-3 rounded-xl border-2 border-dashed border-slate-300">
              <BarcodeSVG value="CEDEXX-PATIENT-2026" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-black text-[#050249] text-lg mb-1 flex items-center gap-2 justify-center sm:justify-start">
                <Camera className="w-5 h-5" />
                {t.barcodeTitle}
              </h3>
              <p className="text-slate-500 text-sm font-medium">{t.barcodeText}</p>
              <p className="text-[#23d9b0] text-xs font-bold mt-2">{t.scanPrompt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Instructions ─── */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 font-medium">{t.formInstructions}</p>
        </div>
      </div>

      {/* ─── Form ─── */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <ProgressBar
          step={step}
          total={4}
          labels={[t.step1, t.step2, t.step3, t.step4]}
        />

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-50"
        >
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#050249] flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.step1}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VoiceInput label={t.firstName} value={form.firstName} onChange={(v) => update('firstName', v)} required lang={lang} />
                <VoiceInput label={t.lastName} value={form.lastName} onChange={(v) => update('lastName', v)} required lang={lang} />
              </div>

              <VoiceInput label={t.middleName} value={form.middleName} onChange={(v) => update('middleName', v)} lang={lang} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VoiceInput label={t.dob} value={form.dob} onChange={(v) => update('dob', v)} type="date" required lang={lang} />
                <SelectInput
                  label={t.gender}
                  value={form.gender}
                  onChange={(v) => update('gender', v)}
                  required
                  lang={lang}
                  options={[
                    { value: 'male', label: t.male },
                    { value: 'female', label: t.female },
                    { value: 'other', label: t.other },
                    { value: 'prefer-not', label: t.preferNot },
                  ]}
                />
              </div>

              <SelectInput
                label={t.patientType}
                value={form.patientType}
                onChange={(v) => update('patientType', v)}
                required
                lang={lang}
                options={[
                  { value: 'individual', label: t.individual },
                  { value: 'family', label: t.family },
                  { value: 'senior', label: t.senior },
                  { value: 'employer', label: t.employer },
                  { value: 'facility', label: t.facility },
                ]}
              />

              <SelectInput
                label={t.languagePref}
                value={form.languagePref}
                onChange={(v) => update('languagePref', v)}
                required
                lang={lang}
                options={[
                  { value: 'en', label: t.english },
                  { value: 'es', label: t.spanish },
                  { value: 'ht', label: t.creole },
                  { value: 'ru', label: t.russian },
                ]}
              />
            </div>
          )}

          {/* STEP 2: Contact Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#050249] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t.step2}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VoiceInput label={t.phone} value={form.phone} onChange={(v) => update('phone', v)} type="tel" required lang={lang} />
                <VoiceInput label={t.email} value={form.email} onChange={(v) => update('email', v)} type="email" required lang={lang} />
              </div>

              <VoiceInput label={t.address} value={form.address} onChange={(v) => update('address', v)} required lang={lang} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <VoiceInput label={t.city} value={form.city} onChange={(v) => update('city', v)} required lang={lang} />
                <VoiceInput label={t.state} value={form.state} onChange={(v) => update('state', v)} required lang={lang} />
                <VoiceInput label={t.zip} value={form.zip} onChange={(v) => update('zip', v)} required lang={lang} />
                <VoiceInput label={t.country} value={form.country} onChange={(v) => update('country', v)} required lang={lang} />
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-black text-[#050249] mb-4 text-sm uppercase tracking-wider">{t.emergencyName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VoiceInput label={t.emergencyName} value={form.emergencyName} onChange={(v) => update('emergencyName', v)} required lang={lang} />
                  <VoiceInput label={t.emergencyPhone} value={form.emergencyPhone} onChange={(v) => update('emergencyPhone', v)} type="tel" required lang={lang} />
                </div>
                <VoiceInput label={t.relationship} value={form.relationship} onChange={(v) => update('relationship', v)} required lang={lang} />
              </div>
            </div>
          )}

          {/* STEP 3: Health Coverage */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#050249] flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t.step3}
              </h2>

              <SelectInput
                label={t.insurance}
                value={form.hasInsurance}
                onChange={(v) => update('hasInsurance', v)}
                required
                lang={lang}
                options={[
                  { value: 'yes', label: t.insuranceYes },
                  { value: 'no', label: t.insuranceNo },
                ]}
              />

              {form.hasInsurance === 'yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 bg-slate-50 rounded-2xl p-6"
                >
                  <VoiceInput label={t.insuranceProvider} value={form.insuranceProvider} onChange={(v) => update('insuranceProvider', v)} required={form.hasInsurance === 'yes'} lang={lang} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <VoiceInput label={t.policyNumber} value={form.policyNumber} onChange={(v) => update('policyNumber', v)} required={form.hasInsurance === 'yes'} lang={lang} />
                    <VoiceInput label={t.groupNumber} value={form.groupNumber} onChange={(v) => update('groupNumber', v)} lang={lang} />
                    <VoiceInput label={t.memberID} value={form.memberID} onChange={(v) => update('memberID', v)} required={form.hasInsurance === 'yes'} lang={lang} />
                  </div>
                  <VoiceInput label={t.planType} value={form.planType} onChange={(v) => update('planType', v)} lang={lang} />
                </motion.div>
              )}

              <SelectInput
                label={t.primaryCare}
                value={form.hasPrimaryCare}
                onChange={(v) => update('hasPrimaryCare', v)}
                required
                lang={lang}
                options={[
                  { value: 'yes', label: t.insuranceYes },
                  { value: 'no', label: t.insuranceNo },
                ]}
              />

              <div className="grid grid-cols-1 gap-4">
                <VoiceInput label={t.medications} value={form.medications} onChange={(v) => update('medications', v)} lang={lang} />
                <VoiceInput label={t.allergies} value={form.allergies} onChange={(v) => update('allergies', v)} lang={lang} />
                <VoiceInput label={t.conditions} value={form.conditions} onChange={(v) => update('conditions', v)} lang={lang} />
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900">{t.whyInfo}</p>
                  <p className="text-sm text-blue-700 mt-1">{t.whyInfoText}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#050249] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t.step4}
              </h2>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-black text-[#050249] text-sm uppercase tracking-wider">{t.step1}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">{t.firstName}:</span> <span className="font-bold text-[#050249]">{form.firstName}</span>
                  <span className="text-slate-500">{t.lastName}:</span> <span className="font-bold text-[#050249]">{form.lastName}</span>
                  <span className="text-slate-500">{t.dob}:</span> <span className="font-bold text-[#050249]">{form.dob}</span>
                  <span className="text-slate-500">{t.gender}:</span> <span className="font-bold text-[#050249]">{form.gender}</span>
                </div>

                <h3 className="font-black text-[#050249] text-sm uppercase tracking-wider pt-4 border-t border-slate-200">{t.step2}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-500">{t.phone}:</span> <span className="font-bold text-[#050249]">{form.phone}</span>
                  <span className="text-slate-500">{t.email}:</span> <span className="font-bold text-[#050249]">{form.email}</span>
                  <span className="text-slate-500">{t.address}:</span> <span className="font-bold text-[#050249]">{form.address}, {form.city}, {form.state} {form.zip}</span>
                </div>

                {form.hasInsurance === 'yes' && (
                  <>
                    <h3 className="font-black text-[#050249] text-sm uppercase tracking-wider pt-4 border-t border-slate-200">{t.step3}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-500">{t.insuranceProvider}:</span> <span className="font-bold text-[#050249]">{form.insuranceProvider}</span>
                      <span className="text-slate-500">{t.policyNumber}:</span> <span className="font-bold text-[#050249]">{form.policyNumber}</span>
                    </div>
                  </>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-[#23d9b0] focus:ring-[#23d9b0] mt-0.5"
                />
                <span className="text-sm text-slate-600 font-medium">
                  {t.consent}{' '}
                  <Link to="/privacy" className="text-[#050249] underline font-bold">{t.privacyLink}</Link>
                </span>
              </label>
              {!consent && (
                <p className="text-red-500 text-xs font-bold">{t.consentRequired}</p>
              )}
            </div>
          )}

          {/* ─── Navigation ─── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-[#050249] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => validateStep(step) && setStep(step + 1)}
                disabled={!validateStep(step)}
                className="flex items-center gap-2 bg-[#050249] text-white font-bold py-3 px-8 rounded-2xl text-sm
                           hover:bg-[#03013b] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.next}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!consent}
                className="flex items-center gap-2 bg-[#23d9b0] text-white font-bold py-3 px-8 rounded-2xl text-sm
                           hover:bg-[#1bc49a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.submit}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ─── Contact Footer ─── */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium mb-3">{t.contactSupport}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:954-624-6744" className="inline-flex items-center justify-center gap-2 text-[#050249] font-bold text-sm hover:text-[#23d9b0] transition-colors">
              <Phone className="w-4 h-4" />
              954-624-6744
            </a>
            <span className="hidden sm:block text-slate-300">|</span>
            <a href="mailto:support@cedexx.net" className="inline-flex items-center justify-center gap-2 text-[#050249] font-bold text-sm hover:text-[#23d9b0] transition-colors">
              <Mail className="w-4 h-4" />
              support@cedexx.net
            </a>
          </div>
        </div>
      </div>

      {/* ─── Chatbot ─── */}
      <Chatbot />
    </div>
  );
}
