import { Link } from 'react-router-dom'
import { MapPin, Bell, Package, CheckCircle, Star, History, Navigation, Shield, Clock } from 'lucide-react'

// ── Phone Mockup ──────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative w-[280px] h-[560px] mx-auto">
      {/* Phone body */}
      <div className="absolute inset-0 bg-gray-900 rounded-[48px] shadow-2xl border-[6px] border-gray-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
        {/* Side button */}
        <div className="absolute right-[-10px] top-28 w-[5px] h-12 bg-gray-700 rounded-r-lg" />
        <div className="absolute left-[-10px] top-20 w-[5px] h-8 bg-gray-700 rounded-l-lg" />
        <div className="absolute left-[-10px] top-32 w-[5px] h-8 bg-gray-700 rounded-l-lg" />

        {/* Screen */}
        <div className="absolute inset-[4px] rounded-[42px] overflow-hidden bg-[#e8f0e8]">
          {/* Map background */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 268 544" fill="none">
            {/* Background */}
            <rect width="268" height="544" fill="#e8f0e8"/>
            {/* Streets */}
            <line x1="0" y1="180" x2="268" y2="180" stroke="#d0d8d0" strokeWidth="10"/>
            <line x1="0" y1="320" x2="268" y2="320" stroke="#d0d8d0" strokeWidth="8"/>
            <line x1="80" y1="0" x2="80" y2="544" stroke="#d0d8d0" strokeWidth="8"/>
            <line x1="190" y1="0" x2="190" y2="544" stroke="#d0d8d0" strokeWidth="8"/>
            <line x1="0" y1="420" x2="268" y2="380" stroke="#d0d8d0" strokeWidth="6"/>
            {/* Buildings */}
            <rect x="90" y="195" width="90" height="115" rx="4" fill="#d4dbd4"/>
            <rect x="10" y="195" width="60" height="75" rx="4" fill="#d4dbd4"/>
            <rect x="200" y="195" width="58" height="115" rx="4" fill="#d4dbd4"/>
            <rect x="90" y="60" width="90" height="108" rx="4" fill="#d4dbd4"/>
            <rect x="10" y="60" width="60" height="108" rx="4" fill="#d4dbd4"/>
            <rect x="200" y="60" width="58" height="108" rx="4" fill="#d4dbd4"/>
            <rect x="10" y="335" width="60" height="60" rx="4" fill="#d4dbd4"/>
            <rect x="200" y="335" width="58" height="55" rx="4" fill="#d4dbd4"/>
            {/* Route path */}
            <path d="M 60 430 Q 55 350 80 320 Q 80 250 134 230 Q 180 218 190 180"
              stroke="#ff5c2c" strokeWidth="4" fill="none" strokeDasharray="10,5"
              strokeLinecap="round" strokeLinejoin="round"/>
            {/* Accuracy circle */}
            <circle cx="60" cy="430" r="20" fill="#ff5c2c" fillOpacity="0.15"/>
            {/* Driver dot */}
            <circle cx="60" cy="430" r="10" fill="#ff5c2c"/>
            <circle cx="60" cy="430" r="6" fill="white"/>
            {/* Destination */}
            <circle cx="190" cy="172" r="12" fill="#10b981"/>
            <circle cx="190" cy="172" r="7" fill="white"/>
          </svg>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-white/80 backdrop-blur-sm flex items-center justify-between px-5 z-10">
            <span className="text-[11px] text-gray-600 font-medium">9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-3 h-2 border border-gray-500 rounded-sm relative">
                <div className="absolute inset-[1px] bg-gray-500 w-[70%]"/>
              </div>
            </div>
          </div>

          {/* Bottom card */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-10 shadow-2xl">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            {/* Live badge */}
            <div className="flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-full text-[11px] font-bold w-fit mb-4">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse inline-block" />
              Curierul e la 3 minute
            </div>

            {/* Driver row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-brand-orange text-sm">
                  AM
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Andrei M.</p>
                  <p className="text-xs text-gray-500">Ajunge la 14:32</p>
                </div>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange rounded-full w-[72%]" />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">Preluat</span>
              <span className="text-[10px] text-gray-400">La tine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -right-6 top-20 bg-white rounded-2xl shadow-2xl px-4 py-3 w-52 border border-gray-100">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 bg-brand-orange rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-900">Livra</p>
            <p className="text-[11px] text-gray-500 leading-tight">Curierul tău pleacă spre tine! ETA 14:32 🚐</p>
          </div>
        </div>
      </div>

      {/* Delivered badge */}
      <div className="absolute -left-6 bottom-36 bg-emerald-500 text-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-bold">Livrat!</span>
      </div>
    </div>
  )
}

// ── Store Buttons ─────────────────────────────────────────────────────────────

function AppStoreButton({ large = false }: { large?: boolean }) {
  const px = large ? 'px-8 py-5' : 'px-6 py-4'
  const iconSize = large ? 'w-8 h-8' : 'w-7 h-7'
  const textSize = large ? 'text-xl' : 'text-lg'
  return (
    <a
      href="#"
      className={`flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 ${px} rounded-2xl hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-lg`}
    >
      <svg className={`${iconSize} flex-shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      <div className="text-left">
        <div className="text-xs opacity-60">Descarcă din</div>
        <div className={`${textSize} font-bold leading-tight`}>App Store</div>
      </div>
    </a>
  )
}

function GooglePlayButton({ large = false }: { large?: boolean }) {
  const px = large ? 'px-8 py-5' : 'px-6 py-4'
  const iconSize = large ? 'w-8 h-8' : 'w-7 h-7'
  const textSize = large ? 'text-xl' : 'text-lg'
  return (
    <a
      href="#"
      className={`flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 ${px} rounded-2xl hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-lg`}
    >
      <svg className={`${iconSize} flex-shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.199c.494.287.806.808.806 1.387 0 .58-.31 1.1-.806 1.387l-1.87 1.082L13.503 12l2.325-2.325 1.87 1.033zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/>
      </svg>
      <div className="text-left">
        <div className="text-xs opacity-60">Descarcă din</div>
        <div className={`${textSize} font-bold leading-tight`}>Google Play</div>
      </div>
    </a>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Navigation,
    bg: 'bg-orange-100 dark:bg-orange-950',
    color: 'text-brand-orange',
    title: 'Urmărire live pe hartă',
    desc: 'Vezi exact unde se află curierul tău și câte minute are până ajunge la tine.',
  },
  {
    icon: Bell,
    bg: 'bg-violet-100 dark:bg-violet-950',
    color: 'text-violet-600 dark:text-violet-400',
    title: 'Notificări în timp real',
    desc: 'Primești notificare când curierul pleacă spre tine, când e aproape și la livrare.',
  },
  {
    icon: History,
    bg: 'bg-blue-100 dark:bg-blue-950',
    color: 'text-blue-600 dark:text-blue-400',
    title: 'Istoricul comenzilor',
    desc: 'Toate livrările tale într-un singur loc, cu confirmare foto și semnătură digitală.',
  },
  {
    icon: Shield,
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    color: 'text-emerald-600 dark:text-emerald-400',
    title: 'Livrare sigură garantată',
    desc: 'Foto la livrare, semnătură electronică și raport detaliat pentru fiecare comandă.',
  },
]

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    color: 'bg-brand-orange',
    icon: Package,
    title: 'Comanzi online',
    desc: 'Plasezi o comandă la oricare magazin partener Livra din Moldova.',
  },
  {
    num: '02',
    color: 'bg-violet-500',
    icon: Bell,
    title: 'Primești SMS cu link',
    desc: 'Imediat ce curierul preia comanda, primești un SMS cu link de urmărire live.',
  },
  {
    num: '03',
    color: 'bg-emerald-500',
    icon: Navigation,
    title: 'Urmărești din aplicație',
    desc: 'Descarci Livra pentru experiența completă: hartă live, notificări și istoric.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AppDownload() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-brand-black dark:text-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-brand-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-brand-orange">L</span>ivra
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-orange transition-colors font-medium"
          >
            Pentru business →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        {/* Left */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950 text-brand-orange text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
            Aplicația #1 pentru livrări în Moldova
          </div>

          <h1 className="text-[48px] md:text-[60px] font-bold leading-[1.1] mb-6">
            Știi mereu<br />
            unde e<br />
            <span className="text-brand-orange">coletul tău</span>
          </h1>

          <p className="text-[18px] text-gray-600 dark:text-gray-300 mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Urmărește curierul live pe hartă, primește notificări instant și nu mai rata nicio livrare.
            Gratuit pentru tine.
          </p>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
            <AppStoreButton />
            <GooglePlayButton />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              iOS &amp; Android
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Fără abonament
            </span>
          </div>
        </div>

        {/* Right: phone */}
        <div className="flex-shrink-0 pt-8">
          <PhoneMockup />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[36px] md:text-[44px] font-bold mb-4">
              Tot ce ai nevoie,<br />
              <span className="text-brand-orange">într-o singură aplicație</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Livra îți arată exact ce se întâmplă cu comanda ta, de la preluare până la ușa ta.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[16px] mb-2">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[36px] md:text-[44px] font-bold mb-4">
            Cum funcționează
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            De la comandă la livrare, în 3 pași simpli.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.6%+24px)] right-[calc(16.6%+24px)] h-0.5 bg-gradient-to-r from-brand-orange via-violet-500 to-emerald-500 opacity-30" />

          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.num} className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${s.color} text-white rounded-2xl flex items-center justify-center shadow-lg mb-5 relative z-10`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className={`absolute top-0 right-1/2 translate-x-1/2 -translate-y-1 text-[11px] font-bold ${s.color.replace('bg-', 'text-')} opacity-60`}>
                  {s.num}
                </div>
                <h3 className="font-bold text-[18px] mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[220px]">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Social proof strip ─────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-gray-800 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '50k+', label: 'Livrări urmărite' },
            { value: '4.8', label: 'Rating mediu' },
            { value: '98%', label: 'Livrări la timp' },
            { value: '24/7', label: 'Urmărire non-stop' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[36px] font-bold text-brand-orange">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Download CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto bg-brand-orange rounded-3xl px-8 py-16 text-center text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-[36px] md:text-[48px] font-bold mb-4 leading-tight">
              Descarcă Livra<br />gratuit acum
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Nu mai pierde livrări. Urmărește-ți coletul live și primește notificări instant pe telefon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AppStoreButton large />
              <GooglePlayButton large />
            </div>

            <p className="mt-8 text-white/60 text-sm flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Instalare în 30 de secunde. Gratuit pentru totdeauna.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="font-bold text-lg text-brand-black dark:text-white">
            <span className="text-brand-orange">L</span>ivra
          </div>
          <p>© {new Date().getFullYear()} Livra. Toate drepturile rezervate.</p>
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
