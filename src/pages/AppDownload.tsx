import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, Package, CheckCircle, Star, Navigation, Clock,
  History, MapPin, Zap, AlertCircle, Phone,
  XCircle, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react'

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <svg viewBox="0 0 460 120" width="140" height="36" className="flex-shrink-0 text-[#161513] dark:text-white">
      <text x="10" y="85" fontFamily="Georgia, serif" fontSize="90" fontWeight="700" fill="currentColor" letterSpacing="-2">LIVRA</text>
      <line x1="10" y1="105" x2="380" y2="105" stroke="#ff5c2c" strokeWidth="8" strokeLinecap="round"/>
      <polygon points="390,105 370,95 375,115" fill="#ff5c2c"/>
    </svg>
  )
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative w-[280px] h-[560px] mx-auto select-none">
      <div className="absolute inset-0 bg-[#1c1c1e] rounded-[48px] shadow-2xl ring-1 ring-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1c1c1e] rounded-b-3xl z-10" />
        <div className="absolute right-[-7px] top-28 w-[5px] h-10 bg-[#2a2a2e] rounded-r-lg" />
        <div className="absolute left-[-7px] top-20 w-[5px] h-7 bg-[#2a2a2e] rounded-l-lg" />
        <div className="absolute left-[-7px] top-32 w-[5px] h-10 bg-[#2a2a2e] rounded-l-lg" />

        <div className="absolute inset-[4px] rounded-[43px] overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 268 550" fill="none">
            <rect width="268" height="550" fill="#eaf2ea"/>

            {/* Roads */}
            <rect x="60" y="0" width="14" height="550" fill="#dce8dc"/>
            <rect x="148" y="0" width="14" height="550" fill="#dce8dc"/>
            <rect x="218" y="0" width="14" height="550" fill="#dce8dc"/>
            <rect x="0" y="93" width="268" height="14" fill="#dce8dc"/>
            <rect x="0" y="203" width="268" height="14" fill="#dce8dc"/>
            <rect x="0" y="313" width="268" height="14" fill="#dce8dc"/>

            {/* Road dashes */}
            <line x1="67" y1="0" x2="67" y2="550" stroke="#ccdccc" strokeWidth="1" strokeDasharray="7,5"/>
            <line x1="155" y1="0" x2="155" y2="550" stroke="#ccdccc" strokeWidth="1" strokeDasharray="7,5"/>
            <line x1="0" y1="100" x2="268" y2="100" stroke="#ccdccc" strokeWidth="1" strokeDasharray="7,5"/>
            <line x1="0" y1="210" x2="268" y2="210" stroke="#ccdccc" strokeWidth="1" strokeDasharray="7,5"/>

            {/* Buildings */}
            <rect x="4" y="4" width="52" height="85" rx="3" fill="#d4e2d4"/>
            <rect x="77" y="4" width="67" height="85" rx="3" fill="#d4e2d4"/>
            <rect x="165" y="4" width="49" height="85" rx="3" fill="#d4e2d4"/>
            <rect x="235" y="4" width="29" height="85" rx="3" fill="#d4e2d4"/>
            <rect x="4" y="110" width="52" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="77" y="110" width="67" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="165" y="110" width="49" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="235" y="110" width="29" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="4" y="220" width="52" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="77" y="220" width="67" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="165" y="220" width="49" height="89" rx="3" fill="#d4e2d4"/>
            <rect x="235" y="220" width="29" height="89" rx="3" fill="#d4e2d4"/>

            {/* Route – follows roads */}
            <path d="M 67,395 L 67,100 L 155,100 L 155,34" stroke="#ff5c2c" strokeWidth="4" fill="none" strokeDasharray="10,5" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Driver */}
            <circle cx="67" cy="395" r="22" fill="#ff5c2c" fillOpacity="0.12"/>
            <circle cx="67" cy="395" r="13" fill="#ff5c2c" fillOpacity="0.22"/>
            <circle cx="67" cy="395" r="8" fill="#ff5c2c"/>
            <circle cx="67" cy="395" r="4" fill="white"/>

            {/* Destination */}
            <circle cx="155" cy="28" r="11" fill="#10b981"/>
            <circle cx="155" cy="28" r="6" fill="white"/>
          </svg>

          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-white/75 backdrop-blur-sm flex items-center justify-between px-5 z-10">
            <span className="text-[10px] font-semibold text-gray-700">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 items-end h-[10px]">
                {[2, 3, 4, 5].map((h) => <div key={h} className="w-[3px] bg-gray-600 rounded-sm" style={{ height: h * 2 }} />)}
              </div>
              <div className="w-4 h-[9px] border border-gray-600 rounded-[2px] relative">
                <div className="absolute left-[1.5px] top-[1.5px] bottom-[1.5px] w-[60%] bg-gray-600 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Tracking card */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-10">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-3.5" />
            <div className="flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-full text-[11px] font-bold w-fit mb-4">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse inline-block" />
              Curierul e la 10 minute
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-brand-orange text-xs">AM</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Andrei M.</p>
                  <p className="text-xs text-gray-400">Ajunge la 14:32</p>
                </div>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange rounded-full" style={{ width: '78%' }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">Preluat</span>
              <span className="text-[10px] text-gray-400">La tine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -right-8 top-20 bg-white rounded-2xl shadow-2xl px-4 py-3 w-52 border border-gray-100">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 bg-brand-orange rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-900">Livra</p>
            <p className="text-[11px] text-gray-500 leading-tight">Curierul tău e la 10 min! 🚐 Fii gata.</p>
          </div>
        </div>
      </div>

      {/* Delivered */}
      <div className="absolute -left-6 bottom-36 bg-emerald-500 text-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-bold">Livrat!</span>
      </div>
    </div>
  )
}

// ── Store buttons ──────────────────────────────────────────────────────────────

function AppStoreBtn({ large = false }: { large?: boolean }) {
  const px = large ? 'px-8 py-5' : 'px-6 py-4'
  const textSize = large ? 'text-xl' : 'text-lg'
  return (
    <a href="#" aria-label="Descarcă Livra din App Store" className={`flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 ${px} rounded-2xl hover:bg-gray-700 dark:hover:bg-gray-200 active:scale-95 transition-all shadow-lg`}>
      <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      <div className="text-left">
        <div className="text-xs opacity-60">Descarcă din</div>
        <div className={`${textSize} font-bold leading-tight`}>App Store</div>
      </div>
    </a>
  )
}

function GooglePlayBtn({ large = false }: { large?: boolean }) {
  const px = large ? 'px-8 py-5' : 'px-6 py-4'
  const textSize = large ? 'text-xl' : 'text-lg'
  return (
    <a href="#" aria-label="Descarcă Livra din Google Play" className={`flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 ${px} rounded-2xl hover:bg-gray-700 dark:hover:bg-gray-200 active:scale-95 transition-all shadow-lg`}>
      <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.199c.494.287.806.808.806 1.387 0 .58-.31 1.1-.806 1.387l-1.87 1.082L13.503 12l2.325-2.325 1.87 1.033zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/>
      </svg>
      <div className="text-left">
        <div className="text-xs opacity-60">Descarcă din</div>
        <div className={`${textSize} font-bold leading-tight`}>Google Play</div>
      </div>
    </a>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    title: 'Stai acasă toată ziua așteptând',
    body: 'Ți s-a zis că vine între 9 și 17. Ai stat. La 16:58 SMS că nu au reușit să livreze.',
  },
  {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    title: '"Absent"dar tu erai acasă',
    body: 'Nu a sunat. Pe portal scrie "client absent". Tu erai în bucătărie. Conflict cu comerciantul.',
  },
  {
    icon: AlertCircle,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    title: 'Nimeni nu știe unde e coletul',
    body: 'Status-ul n-a mai mișcat de ieri. Apelezi call center. "Verificăm și revenim." Nu revin.',
  },
]

const FEATURES = [
  {
    icon: Navigation,
    color: 'text-brand-orange',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    title: 'GPS live, la 30 de secunde',
    desc: 'Locația curierului se actualizează constant pe hartă. Nu un status. O hartă live.',
  },
  {
    icon: Bell,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    title: 'Notificare cu 10 minute înainte',
    desc: 'Trăiești normal. Livra te anunță exact când să cobori. Nicio ratare din nou.',
  },
  {
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    title: 'Pin GPS pentru orice adresă',
    desc: 'Locuiești în sat, bloc fără număr, zonă nouă? Pui pin-ul o dată. Toți curierii ajung acolo.',
  },
  {
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    title: 'Toate comenzile într-un loc',
    desc: 'Electronice, haine, farmacietoate de la toți partenerii în același feed.',
  },
  {
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    title: 'Checkout cu un tap',
    desc: 'Setezi adresa o dată. La fiecare comandă pe site partener, datele sunt deja completate.',
  },
  {
    icon: Clock,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-950/50',
    title: 'Tu alegi fereastră orară',
    desc: 'Dimineață, după-amiază sau seară. Tu decizi când vrei să primești. Nu firma de curierat.',
  },
  {
    icon: History,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    title: 'Istoric complet cu dovezi',
    desc: 'Data, ora, curierul, foto. Dacă e dispută: "Am livrat"tu ai dovada.',
  },
  {
    icon: Star,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    title: 'Evaluezi livrarea imediat',
    desc: 'Un tap după fiecare livrare. Feedback-ul tău îi ajută pe alții și pe comerciant.',
  },
]

const ONBOARDING = [
  { num: '01', title: 'Comanzi la un magazin partener', desc: 'Dai comanda ca de obicei.' },
  { num: '02', title: 'Primești SMS cu link live', desc: 'Tap pe link. Deschide hartă direct din browser, fără app.' },
  { num: '03', title: 'Primul wow moment', desc: 'Îl vezi pe curier mișcând pe hartă. Acesta e Livra.' },
  { num: '04', title: 'Descarci pentru mai mult', desc: 'Un tap. Gata. App instalat.' },
  { num: '05', title: '60 de secunde de setup', desc: 'Marchezi ușa ta pe hartă, adaugi telefon, gata. Nu mai completezi nimic niciodată.' },
]

const TESTIMONIALS = [
  {
    name: 'Sergiu D.',
    location: 'Durlești',
    text: 'Locuiesc pe o stradă care nu apare pe Google Maps. Pin-ul în Livra, o dată. De atunci niciun curier nu m-a mai sunat.',
  },
  {
    name: 'Marina C.',
    location: 'Chișinău',
    text: 'Notificare la 10 minute, am coborât exact pe timp. Niciodată nu am prins livrarea prima dată înainte de Livra.',
  },
  {
    name: 'Alexandru P.',
    location: 'Bălți',
    text: 'Comand des de la magazine diferite. Totul apare în aceeași aplicație. Atât îmi trebuia.',
  },
]

const STATS = [
  { value: '30s', label: 'Actualizare GPS' },
  { value: '10 min', label: 'Notificare înainte' },
  { value: '0', label: 'Formulare de completat' },
  { value: '100%', label: 'Gratuit pentru tine' },
]

const FAQS = [
  {
    q: 'Livra e gratuit?',
    a: 'Da, complet gratuit. Plătesc comercianții. Tu doar primești beneficiile.',
  },
  {
    q: 'Funcționează și în sate / zone neobișnuite?',
    a: 'E punctul nostru forte. Nu ai nevoie de adresă pe hartă. Marchezi pe hartă exact unde stai și gata. Toți curierii ajung acolo.',
  },
  {
    q: 'Trebuie obligatoriu aplicația?',
    a: 'Nu. Primești SMS cu link. Deschide hartă direct din browser. Dar cu app, ai notificări și checkout instant.',
  },
  {
    q: 'De ce comercianți pot comanda?',
    a: 'Dacă folosesc Livra, o vei vedea automat. Fiecare partener nou = un motiv să ții aplicația.',
  },
  {
    q: 'Ce se întâmplă dacă curierul nu mă găsește?',
    a: 'Curierul navigă direct la pin-ul tău pe GPS. Dacă e ceva în neregulă, suportul Livra intervine imediat.',
  },
  {
    q: 'Cum salvez o locație?',
    a: 'Prima dată când deschizi Livra, ți se va cere locația. Marchezi pe hartă exact unde stai, dai un nume (Acasă, Birou) și gata. Se salvează forever.',
  },
  {
    q: 'Lucrează Livra și pe iOS?',
    a: 'Da, pe iOS și Android în egală măsură. App Store și Google Play sunt linkurile principale de download.',
  },
]

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AppDownload() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-brand-black dark:text-white">
      <Helmet>
        <title>Livra | Urmărești curierul live pe hartă | App Moldova</title>
        <meta name="description" content="Descarcă Livra și urmărește fiecare colet pe hartă în timp real. Notificare cu 10 minute înainte. Pin GPS pentru orice adresă din Moldova. Gratuit." />
        <meta name="keywords" content="aplicatie livrare Moldova, urmarire colet live, GPS curier, tracking livraare, livra app, descarca livra" />
        <meta property="og:title" content="Livra | Urmărești curierul live pe hartă" />
        <meta property="og:description" content="GPS live, notificare cu 10 minute înainte, pin GPS pentru orice adresă. Nicio livrare ratată. Descarcă gratuit." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://livra.delivery/app" />
        <link rel="canonical" href="https://livra.delivery/app" />
      </Helmet>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-brand-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-orange transition-colors font-medium">
            Pentru business →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pb-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
            Urmărești<br />curierul live.<br />
            <span className="text-brand-orange">Știi exact când.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 lg:mb-10 leading-relaxed max-w-md">
            Fiecare comandă pe hartă. Notificare cu 10 minute înainte. Nu mai aștepți 6 ore. Nu mai ratezi nicio livrare.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8 lg:mb-10">
            <AppStoreBtn />
            <GooglePlayBtn />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              iOS & Android
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              30 secunde setup
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto flex justify-center lg:justify-end">
          <div className="scale-75 sm:scale-90 lg:scale-100 origin-top">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Pain section */}
      <section className="bg-brand-black dark:bg-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Recunoști situația?</h2>
          <p className="text-gray-300 text-lg text-center mb-12 max-w-2xl mx-auto">
            Fiecare comandă online în Moldova începe acum cu o singură speranță: "Oare mă va găsi curierul acasă?"
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((pain) => {
              const Icon = pain.icon
              return (
                <div key={pain.title} className="bg-gray-800 dark:bg-gray-800 rounded-2xl p-6">
                  <div className={`w-12 h-12 ${pain.bg} ${pain.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{pain.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{pain.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Live tracking feature */}
      <section className="bg-gradient-to-br from-brand-orange to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">GPS live. La 30 de secunde.</h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Locația curierului se actualizează constant pe hartă. Nu o imagine staică. O hartă care se mișcă în timp real. Tu știi exact unde e, pe care stradă merge, când ajunge.
              </p>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Notificarea la 10 minute nu e doar un feature. E diferența dintre a sta cu anxietate și a fi pregătit exact pe timp.
              </p>
              <div className="flex items-center gap-2 text-white/80">
                <ArrowRight className="w-5 h-5" />
                <span>Nicio ratare din nou</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-orange rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-brand-black">Deschizi Livra</p>
                    <p className="text-sm text-gray-600">Doar iți iei telefonul.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-orange rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-brand-black">Vezi curierul pe hartă</p>
                    <p className="text-sm text-gray-600">Mișcă-se în timp real, fiecare 30 secunde.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-orange rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-brand-black">ETA precis</p>
                    <p className="text-sm text-gray-600">„Ajunge la 14:32"nu la 14:35 sau 14:28.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-brand-orange rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-brand-black">Ești gata pe timp</p>
                    <p className="text-sm text-gray-600">Cobori din bucătărie fix când sună la ușă.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GPS pin – biggest differentiator */}
      <section className="bg-brand-cream dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                <span className="text-brand-orange">Cea mai mare problemă a Moldovei:</span><br />
                Adresele care nu există pe hartă
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Sate fără nume de străzi. Blocuri noi fără număr înregistrat. Case la marginea satului. Fără Livra, curierul sună de 5 ori și pierde 20 de minute.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-bold text-brand-orange">
                Cu Livra: pui pin-ul pe ușa ta o singură dată. Fiecare curier de la orice comerciant ajunge direct acolo.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-3">
                <p className="font-bold text-brand-black dark:text-white">Cum funcționează:</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-orange font-bold">•</span>
                    <span>Deschizi Livra, tapezi „Setează locația mea"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-orange font-bold">•</span>
                    <span>Marchezi pe hartă exact unde stai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-orange font-bold">•</span>
                    <span>Numești locația (Acasă, Birou, la Bunica)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-orange font-bold">•</span>
                    <span>Gata. Toate livrările ajung direct acolo.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-2">FĂ Ră LIVRA</p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Curierul nu găsește adresa</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Sună tu de 3 ori</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Pierde 20 de minute</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Livrare ratată</span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-brand-orange font-bold mb-2">CU LIVRA</p>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4 space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Marchezi pe hartă exact unde stai</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Curierul navigă direct</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Zero telefoane</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Livrare de prima dată</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4 text-center">Tot ce ai nevoie</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center mb-12 max-w-2xl mx-auto">
            8 feature-uri care fac din Livra aplicația numarul 1 pentru livrări în Moldova.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className={`${f.bg} rounded-2xl p-6`}>
                  <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-4 bg-opacity-100`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="bg-brand-cream dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4 text-center">Cum ajungi de la comandă la hartă în 5 minute</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg text-center mb-12 max-w-2xl mx-auto">
            Onboarding simplu. Valoare imediată. Nici o durere.
          </p>
          <div className="space-y-4">
            {ONBOARDING.map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold">
                  {step.num}
                </div>
                <div className="flex-1 py-2">
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 dark:border-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-brand-orange">{s.value}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Recenzii de la utilizatori reali</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-brand-cream dark:bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed italic">
                  "{t.text}"
                </p>
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-brand-cream dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Întrebări frecvente</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="font-bold text-lg text-left">{faq.q}</h3>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="bg-brand-orange text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Package className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-5xl font-bold mb-4 leading-tight">
            Urmărești-ți coletul live<br />
            acum
          </h2>
          <p className="text-lg text-white/90 mb-12 leading-relaxed">
            Fără așteptări. Fără surprize. Doar GPS-ul curierului către ușa ta. Descarcă Livra azi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <AppStoreBtn large />
            <GooglePlayBtn large />
          </div>
          <p className="text-sm text-white/70 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Instalare în 30 de secunde. Gratuit pentru totdeauna.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg viewBox="0 0 460 120" width="120" height="32" className="flex-shrink-0 text-[#161513] dark:text-white">
              <text x="10" y="85" fontFamily="Georgia, serif" fontSize="90" fontWeight="700" fill="currentColor" letterSpacing="-2">LIVRA</text>
              <line x1="10" y1="105" x2="380" y2="105" stroke="#ff5c2c" strokeWidth="8" strokeLinecap="round"/>
              <polygon points="390,105 370,95 375,115" fill="#ff5c2c"/>
            </svg>
          </div>
          <p>© 2026 Livra. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-brand-orange transition-colors">Pentru business</Link>
            <a href="#" className="hover:text-brand-orange transition-colors">Confidențialitate</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Termeni</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
