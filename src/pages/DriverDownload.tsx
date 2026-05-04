import { useTheme } from '../context/ThemeContext'

const APK_VERSION = '1.0.0'
const APK_FILENAME = 'Livra-Driver.apk'
const APK_PATH = 'https://github.com/LoleWorks/livra/releases/download/v1.0.0/Livra-Driver.apk'

const STEPS = [
  {
    step: '1',
    title: 'Descarcă aplicația',
    desc: 'Apasă butonul „Descarcă aplicația" de mai jos. Fișierul APK se va salva automat în folderul Descărcări al telefonului.'
  },
  {
    step: '2',
    title: 'Permite instalarea',
    desc: 'La prima instalare, Android îți va cere permisiunea de a instala aplicații din surse externe. Apasă „Setări" și activează opțiunea, apoi revino și continuă instalarea.'
  },
  {
    step: '3',
    title: 'Instalează aplicația',
    desc: 'Deschide fișierul descărcat din notificări sau din managerul de fișiere și apasă „Instalează". Durează câteva secunde.'
  },
  {
    step: '4',
    title: 'Conectează-te la cont',
    desc: 'Deschide Livra Driver, introdu adresa de email și parola primite de la compania ta și ești gata de lucru.'
  }
]

function PhoneFrame({ children, title, desc }: { children: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: 220 }}>
        {/* Phone body */}
        <div className="bg-[#111] rounded-[2.75rem] p-[10px] shadow-2xl shadow-black/40 ring-1 ring-white/10">
          {/* Dynamic island */}
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-20 h-[22px] bg-[#111] rounded-full z-10" />
          {/* Screen */}
          <div className="rounded-[2.25rem] overflow-hidden bg-[#F4F3EF]" style={{ height: 440 }}>
            {children}
          </div>
        </div>
        {/* Side button */}
        <div className="absolute right-[-3px] top-24 w-[3px] h-10 bg-[#333] rounded-r-sm" />
        <div className="absolute left-[-3px] top-20 w-[3px] h-8 bg-[#333] rounded-l-sm" />
        <div className="absolute left-[-3px] top-32 w-[3px] h-8 bg-[#333] rounded-l-sm" />
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[180px] leading-snug">{desc}</p>
      </div>
    </div>
  )
}

function HomeScreenSVG() {
  return (
    <svg viewBox="0 0 320 640" width="200" height="440" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Status bar */}
      <rect width="320" height="30" fill="#fff" />
      <text x="24" y="20" fontSize="11" fill="#161513" fontWeight="600">9:41</text>
      {/* battery + signal */}
      <rect x="270" y="12" width="28" height="13" rx="3" fill="none" stroke="#161513" strokeWidth="1.5" />
      <rect x="272" y="14" width="22" height="9" rx="1.5" fill="#161513" />
      <rect x="299" y="15" width="2" height="7" rx="1" fill="#161513" />

      {/* Header */}
      <rect x="0" y="30" width="320" height="72" fill="#fff" />
      <line x1="0" y1="101" x2="320" y2="101" stroke="#E8E6E0" strokeWidth="1" />
      <text x="20" y="52" fontSize="9" fill="#8A8780" fontFamily="monospace" letterSpacing="0.6">LUNI, 5 MAI</text>
      <text x="20" y="78" fontSize="22" fontWeight="700" fill="#161513">Bună, Ion</text>
      {/* Avatar */}
      <circle cx="287" cy="66" r="20" fill="#F4F3EF" stroke="#E8E6E0" strokeWidth="1.5" />
      <circle cx="287" cy="61" r="7" fill="none" stroke="#8A8780" strokeWidth="1.5" />
      <path d="M273 82 Q287 75 301 82" fill="none" stroke="#8A8780" strokeWidth="1.5" strokeLinecap="round" />

      {/* Body */}
      <rect x="0" y="102" width="320" height="538" fill="#F4F3EF" />

      {/* Section label */}
      <text x="20" y="126" fontSize="9" fill="#8A8780" fontFamily="monospace" letterSpacing="0.6">RUTA DE AZI</text>

      {/* Orange card */}
      <rect x="20" y="136" width="280" height="272" rx="20" fill="#FF5C2C" />

      {/* Route ID */}
      <text x="44" y="162" fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="monospace" letterSpacing="0.5">R-3A2F</text>
      {/* Stop count */}
      <text x="44" y="198" fontSize="32" fontWeight="700" fill="white">8 opriri</text>
      {/* Icon circle */}
      <circle cx="264" cy="175" r="22" fill="rgba(255,255,255,0.2)" />
      <polyline points="252,183 258,172 264,179 272,164 277,160" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Stats dividers */}
      <line x1="40" y1="214" x2="300" y2="214" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="40" y1="252" x2="300" y2="252" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="130" y1="214" x2="130" y2="252" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="220" y1="214" x2="220" y2="252" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

      <text x="44" y="229" fontSize="8" fill="rgba(255,255,255,0.75)">DISTANȚĂ</text>
      <text x="44" y="246" fontSize="14" fontWeight="700" fill="white" fontFamily="monospace">42 km</text>
      <text x="142" y="229" fontSize="8" fill="rgba(255,255,255,0.75)">TIMP EST.</text>
      <text x="142" y="246" fontSize="14" fontWeight="700" fill="white" fontFamily="monospace">2h 15m</text>
      <text x="230" y="229" fontSize="8" fill="rgba(255,255,255,0.75)">START</text>
      <text x="230" y="246" fontSize="14" fontWeight="700" fill="white" fontFamily="monospace">08:30</text>

      {/* Timeline */}
      <circle cx="44" cy="272" r="5" fill="white" />
      <line x1="44" y1="277" x2="44" y2="318" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <rect x="39" y="318" width="10" height="10" rx="2" fill="white" />

      <text x="60" y="276" fontSize="9.5" fill="rgba(255,255,255,0.8)">Pornire · Depozit Central</text>
      <text x="60" y="292" fontSize="10.5" fontWeight="700" fill="white">Str. Ștefan cel Mare 14</text>
      <text x="60" y="316" fontSize="9.5" fill="rgba(255,255,255,0.8)">Final · Oprire 8</text>
      <text x="60" y="332" fontSize="10.5" fontWeight="700" fill="white">Bulevardul Moscova 7</text>

      {/* Footer */}
      <line x1="40" y1="352" x2="300" y2="352" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="44" y="372" fontSize="10.5" fontWeight="600" fill="white">Apasă pentru a începe</text>
      <text x="285" y="373" fontSize="16" fill="white" textAnchor="middle">›</text>

      {/* Helper note */}
      <rect x="20" y="424" width="280" height="58" rx="14" fill="#fff" stroke="#E8E6E0" strokeWidth="1" />
      <circle cx="38" cy="453" r="7" fill="none" stroke="#8A8780" strokeWidth="1.2" />
      <line x1="38" y1="449" x2="38" y2="456" stroke="#8A8780" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="38" cy="446" r="1" fill="#8A8780" />
      <text x="52" y="448" fontSize="9" fill="#5C5A55">Vei vedea detaliile fiecărei opriri</text>
      <text x="52" y="461" fontSize="9" fill="#5C5A55">pe rând, una câte una.</text>
    </svg>
  )
}

function DeliveryDetailSVG() {
  // btn centers: Sună cx=86 cy=304, SMS cx=234 cy=304
  // GMaps cx=160 cy=490, Waze cx=160 cy=552
  // icon scale=0.65 → 15.6px; translate(icx-7.8, icy-7.8) scale(0.65)
  // text baseline = cy + fontSize*0.35
  return (
    <svg viewBox="0 0 320 640" width="200" height="440" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="320" height="30" fill="#fff" />
      <text x="24" y="20" fontSize="11" fill="#161513" fontWeight="600">9:41</text>
      <rect x="270" y="12" width="28" height="13" rx="3" fill="none" stroke="#161513" strokeWidth="1.5" />
      <rect x="272" y="14" width="22" height="9" rx="1.5" fill="#161513" />
      <rect x="299" y="15" width="2" height="7" rx="1" fill="#161513" />

      <rect x="0" y="30" width="320" height="72" fill="#fff" />
      <line x1="0" y1="101" x2="320" y2="101" stroke="#E8E6E0" strokeWidth="1" />
      <circle cx="42" cy="66" r="20" fill="#F4F3EF" stroke="#E8E6E0" strokeWidth="1.5" />
      <polyline points="47,58 38,66 47,74" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="74" y="58" fontSize="9" fill="#8A8780" fontFamily="monospace" letterSpacing="0.5">OPRIRE 3 DIN 8</text>
      <text x="74" y="78" fontSize="15" fontWeight="700" fill="#161513">Andrei Popescu</text>

      <rect x="0" y="102" width="320" height="346" fill="#F4F3EF" />

      {/* Destination card */}
      <rect x="20" y="118" width="280" height="148" rx="16" fill="#FF5C2C" />
      <text x="40" y="142" fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="monospace" letterSpacing="0.5">DESTINAȚIA</text>
      <g transform="translate(32,150) scale(0.62)" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </g>
      <text x="52" y="162" fontSize="14" fontWeight="700" fill="white">Str. Independenței 45,</text>
      <text x="52" y="178" fontSize="14" fontWeight="700" fill="white">Chișinău</text>
      <line x1="40" y1="192" x2="300" y2="192" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="40" y="209" fontSize="8" fill="rgba(255,255,255,0.75)">RECIPIENT</text>
      <text x="40" y="224" fontSize="12" fontWeight="700" fill="white">Andrei Popescu</text>
      <text x="180" y="209" fontSize="8" fill="rgba(255,255,255,0.75)">TELEFON</text>
      <text x="180" y="224" fontSize="12" fontWeight="700" fill="white">+373 69 123 456</text>

      {/* ── Sună button: cx=86 cy=304 h=48 ── */}
      {/* content: icon(16) + gap(6) + "Sună"(~32) = 54 → starts at 86-27=59 */}
      {/* icon center x=59+8=67, translate(67-8,304-8)=translate(59,296) */}
      {/* text x=59+16+6=81, baseline=304+4=308 */}
      <rect x="20" y="280" width="132" height="48" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(59,296) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12 19.79 19.79 0 01.87 3.38 2 2 0 012.86 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.65a16 16 0 006.29 6.29l1.92-1.92a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </g>
      <text x="81" y="308" fontSize="12" fontWeight="700" fill="#161513">Sună</text>

      {/* ── SMS button: cx=234 cy=304 h=48 ── */}
      {/* content: icon(16)+gap(6)+"SMS"(~20)=42 → starts at 234-21=213 */}
      {/* icon center x=213+8=221, translate(213,296) */}
      {/* text x=213+22=235, baseline=308 */}
      <rect x="168" y="280" width="132" height="48" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(213,296) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </g>
      <text x="235" y="308" fontSize="12" fontWeight="700" fill="#161513">SMS</text>

      {/* ── Bottom bar ── */}
      <rect x="0" y="448" width="320" height="192" fill="#fff" />
      <line x1="0" y1="448" x2="320" y2="448" stroke="#E8E6E0" strokeWidth="1" />

      {/* ── Google Maps: cx=160 cy=490 h=52 ── */}
      {/* content: icon(16)+gap(6)+"Deschide Google Maps"(~140)=162 → starts at 160-81=79 */}
      {/* icon center x=79+8=87, translate(79,482) */}
      {/* text x=79+22=101, baseline=490+5=495 */}
      <rect x="20" y="464" width="280" height="52" rx="14" fill="#FF5C2C" />
      <g transform="translate(79,482) scale(0.65)" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </g>
      <text x="101" y="495" fontSize="13" fontWeight="700" fill="white">Deschide Google Maps</text>

      {/* ── Waze: cx=160 cy=552 h=52 ── */}
      {/* content: wazeIcon(20)+gap(6)+"Deschide Waze"(~90)=116 → starts at 160-58=102 */}
      {/* waze ellipse cx=102+10=112, cy=552 */}
      {/* text x=102+20+6=128, baseline=552+5=557 */}
      <rect x="20" y="526" width="280" height="52" rx="14" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <ellipse cx="112" cy="552" rx="9" ry="8" fill="#33CCFF" />
      <circle cx="109" cy="549" r="1.8" fill="white" />
      <circle cx="115" cy="549" r="1.8" fill="white" />
      <path d="M108 554 Q112 558 116 554" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="118" cy="558" r="2" fill="#33CCFF" stroke="white" strokeWidth="1" />
      <text x="128" y="557" fontSize="13" fontWeight="700" fill="#161513">Deschide Waze</text>
    </svg>
  )
}

function ConfirmSVG() {
  // btn centers: Sună cx=86 cy=286, SMS cx=234 cy=286
  // GMaps cx=86 cy=404, Waze cx=234 cy=404
  // Livrată cx=86 cy=480, Nereușită cx=234 cy=480
  return (
    <svg viewBox="0 0 320 640" width="200" height="440" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="320" height="30" fill="#fff" />
      <text x="24" y="20" fontSize="11" fill="#161513" fontWeight="600">9:41</text>
      <rect x="270" y="12" width="28" height="13" rx="3" fill="none" stroke="#161513" strokeWidth="1.5" />
      <rect x="272" y="14" width="22" height="9" rx="1.5" fill="#161513" />
      <rect x="299" y="15" width="2" height="7" rx="1" fill="#161513" />

      <rect x="0" y="30" width="320" height="72" fill="#fff" />
      <line x1="0" y1="101" x2="320" y2="101" stroke="#E8E6E0" strokeWidth="1" />
      <circle cx="42" cy="66" r="20" fill="#F4F3EF" stroke="#E8E6E0" strokeWidth="1.5" />
      <polyline points="47,58 38,66 47,74" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="74" y="58" fontSize="9" fill="#8A8780" fontFamily="monospace" letterSpacing="0.5">OPRIRE 3 DIN 8</text>
      <text x="74" y="78" fontSize="15" fontWeight="700" fill="#161513">Andrei Popescu</text>

      <rect x="0" y="102" width="320" height="270" fill="#F4F3EF" />

      {/* Destination card (compact) */}
      <rect x="20" y="118" width="280" height="130" rx="16" fill="#FF5C2C" />
      <text x="40" y="142" fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="monospace" letterSpacing="0.5">DESTINAȚIA</text>
      <g transform="translate(32,148) scale(0.62)" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </g>
      <text x="52" y="160" fontSize="13" fontWeight="700" fill="white">Str. Independenței 45,</text>
      <text x="52" y="175" fontSize="13" fontWeight="700" fill="white">Chișinău</text>
      <line x1="40" y1="187" x2="300" y2="187" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="40" y="204" fontSize="8" fill="rgba(255,255,255,0.75)">RECIPIENT</text>
      <text x="40" y="217" fontSize="12" fontWeight="700" fill="white">Andrei Popescu</text>
      <text x="180" y="204" fontSize="8" fill="rgba(255,255,255,0.75)">TELEFON</text>
      <text x="180" y="217" fontSize="12" fontWeight="700" fill="white">+373 69 123 456</text>

      {/* ── Sună: cx=86 cy=286 h=44 ── */}
      {/* content=54 → start=59; icon translate(59,278); text x=81 y=290 */}
      <rect x="20" y="264" width="132" height="44" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(59,278) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12 19.79 19.79 0 01.87 3.38 2 2 0 012.86 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.65a16 16 0 006.29 6.29l1.92-1.92a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </g>
      <text x="81" y="290" fontSize="12" fontWeight="700" fill="#161513">Sună</text>

      {/* ── SMS: cx=234 cy=286 h=44 ── */}
      {/* content=42 → start=213; icon translate(213,278); text x=235 y=290 */}
      <rect x="168" y="264" width="132" height="44" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(213,278) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </g>
      <text x="235" y="290" fontSize="12" fontWeight="700" fill="#161513">SMS</text>

      {/* ── Map row ── */}
      <rect x="0" y="372" width="320" height="64" fill="#fff" />
      <line x1="0" y1="372" x2="320" y2="372" stroke="#E8E6E0" strokeWidth="1" />

      {/* ── Google Maps: cx=86 cy=404 h=44 ── */}
      {/* content: icon(16)+gap(6)+"Google Maps"(~67)=89 → start=86-44.5=41.5≈42 */}
      {/* icon translate(42,396); text x=64 y=408 */}
      <rect x="20" y="382" width="132" height="44" rx="12" fill="#FF5C2C" />
      <g transform="translate(42,396) scale(0.65)" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </g>
      <text x="64" y="408" fontSize="11" fontWeight="700" fill="white">Google Maps</text>

      {/* ── Waze: cx=234 cy=404 h=44 ── */}
      {/* content: waze(20)+gap(6)+"Waze"(~24)=50 → start=234-25=209 */}
      {/* waze cx=209+10=219; text x=209+26=235 y=408 */}
      <rect x="168" y="382" width="132" height="44" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <ellipse cx="219" cy="404" rx="8" ry="7" fill="#33CCFF" />
      <circle cx="216" cy="401" r="1.5" fill="white" />
      <circle cx="222" cy="401" r="1.5" fill="white" />
      <path d="M215 405 Q219 409 223 405" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="225" cy="409" r="1.8" fill="#33CCFF" stroke="white" strokeWidth="1" />
      <text x="235" y="408" fontSize="11" fontWeight="700" fill="#161513">Waze</text>

      {/* ── Outcome row ── */}
      <rect x="0" y="436" width="320" height="204" fill="#fff" />
      <line x1="0" y1="436" x2="320" y2="436" stroke="#E8E6E0" strokeWidth="1" />

      {/* ── Livrată: cx=86 cy=480 h=56 ── */}
      {/* content: icon(16)+gap(6)+"Livrată"(~50)=72 → start=86-36=50 */}
      {/* icon translate(50,472); text x=72 y=484 */}
      <rect x="20" y="452" width="132" height="56" rx="14" fill="#1F9D55" />
      <g transform="translate(50,472) scale(0.65)" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,6 9,17 4,12"/>
      </g>
      <text x="72" y="484" fontSize="13" fontWeight="700" fill="white">Livrată</text>

      {/* ── Nereușită: cx=234 cy=480 h=56 ── */}
      {/* content: icon(16)+gap(6)+"Nereușită"(~68)=90 → start=234-45=189 */}
      {/* icon translate(189,472); text x=211 y=484 */}
      <rect x="168" y="452" width="132" height="56" rx="14" fill="#D43A2F" />
      <g transform="translate(189,472) scale(0.65)" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </g>
      <text x="211" y="484" fontSize="13" fontWeight="700" fill="white">Nereușită</text>
    </svg>
  )
}

export default function DriverDownload() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      {/* Nav */}
      <nav className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
            <svg width="36" height="4" viewBox="0 0 36 4">
              <line x1="0" y1="2" x2="28" y2="2" stroke="#FF5C2C" strokeWidth="1.5"/>
              <polygon points="28,0 36,2 28,4" fill="#FF5C2C"/>
            </svg>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-5">
              <span className="w-2 h-2 bg-[#FF5C2C] rounded-full animate-pulse" />
              Android · v{APK_VERSION}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Livra Driver
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              Aplicația pentru șoferi — gestionează livrările, urmărește ruta și confirmă comenzile direct de pe telefon.
            </p>
            <a
              href={APK_PATH}
              download={APK_FILENAME}
              className="inline-flex items-center gap-3 bg-[#FF5C2C] hover:bg-[#e64f22] active:bg-[#cc4520] text-white font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-orange-500/25 text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descarcă aplicația
            </a>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
              Android 8.0 sau mai nou · ~57 MB
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/driver-icon.png"
              alt="Livra Driver"
              className="w-36 h-36 rounded-[2.5rem] shadow-2xl shadow-orange-500/30"
            />
          </div>
        </div>
      </div>

      {/* App UI Showcase */}
      <div className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Cum arată aplicația
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Interfață simplă și clară — designată pentru șoferi care lucrează în mișcare.
            </p>
          </div>

          {/* Phone mockups */}
          <div className="flex flex-col md:flex-row justify-center items-start gap-10 md:gap-8 overflow-x-auto pb-4">
            <PhoneFrame
              title="Ruta de azi"
              desc="Toate livrările zilei într-un singur card — distanță, timp estimat și primul punct de start."
            >
              <HomeScreenSVG />
            </PhoneFrame>

            <PhoneFrame
              title="Detalii livrare"
              desc="Adresa, clientul, telefonul. Un tap deschide Google Maps sau Waze cu ruta deja setată."
            >
              <DeliveryDetailSVG />
            </PhoneFrame>

            <PhoneFrame
              title="Confirmare livrare"
              desc="Marchează livrarea ca reușită sau nereușită. Aplicația trece automat la următoarea oprire."
            >
              <ConfirmSVG />
            </PhoneFrame>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Cum instalezi aplicația
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10">
          Urmează pașii de mai jos — durează mai puțin de 2 minute.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {STEPS.map(({ step, title, desc }) => (
            <div
              key={step}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-[#FF5C2C] text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md shadow-orange-500/20">
                {step}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div className="mt-8 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#FF5C2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cerințe minime
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Sistem de operare', value: 'Android 8.0+' },
              { label: 'Spațiu necesar', value: '~120 MB' },
              { label: 'Conexiune internet', value: 'Necesară pentru livrări' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="mt-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-6 flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Ai nevoie de ajutor?</p>
            <p className="text-blue-700 dark:text-blue-400">
              Contactează managerul companiei tale sau scrie-ne la{' '}
              <a href="mailto:support@livra.md" className="underline font-medium">support@livra.md</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Livra · Platformă de livrări pentru Moldova
        </div>
      </div>
    </div>
  )
}
