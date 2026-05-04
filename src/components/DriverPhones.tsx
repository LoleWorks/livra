export function PhoneFrame({ children, title, desc }: { children: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-5 flex-shrink-0 snap-center" style={{ width: 220 }}>
      <div className="relative w-full">
        <div className="bg-[#111] rounded-[2.75rem] p-[10px] shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-20 h-[22px] bg-[#111] rounded-full z-10" />
          <div className="rounded-[2.25rem] overflow-hidden bg-[#F4F3EF]" style={{ height: 440 }}>
            {children}
          </div>
        </div>
        <div className="absolute right-[-3px] top-24 w-[3px] h-10 bg-[#333] rounded-r-sm" />
        <div className="absolute left-[-3px] top-20 w-[3px] h-8 bg-[#333] rounded-l-sm" />
        <div className="absolute left-[-3px] top-32 w-[3px] h-8 bg-[#333] rounded-l-sm" />
      </div>
      <div className="text-center px-2">
        <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{desc}</p>
      </div>
    </div>
  )
}

export function HomeScreenSVG() {
  return (
    <svg viewBox="0 0 320 640" width="200" height="440" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="320" height="30" fill="#fff" />
      <text x="24" y="20" fontSize="11" fill="#161513" fontWeight="600">9:41</text>
      <rect x="270" y="12" width="28" height="13" rx="3" fill="none" stroke="#161513" strokeWidth="1.5" />
      <rect x="272" y="14" width="22" height="9" rx="1.5" fill="#161513" />
      <rect x="299" y="15" width="2" height="7" rx="1" fill="#161513" />
      <rect x="0" y="30" width="320" height="72" fill="#fff" />
      <line x1="0" y1="101" x2="320" y2="101" stroke="#E8E6E0" strokeWidth="1" />
      <text x="20" y="52" fontSize="9" fill="#8A8780" fontFamily="monospace" letterSpacing="0.6">LUNI, 5 MAI</text>
      <text x="20" y="78" fontSize="22" fontWeight="700" fill="#161513">Bună, Ion</text>
      <circle cx="287" cy="66" r="20" fill="#F4F3EF" stroke="#E8E6E0" strokeWidth="1.5" />
      <circle cx="287" cy="61" r="7" fill="none" stroke="#8A8780" strokeWidth="1.5" />
      <path d="M273 82 Q287 75 301 82" fill="none" stroke="#8A8780" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="0" y="102" width="320" height="538" fill="#F4F3EF" />
      <text x="20" y="126" fontSize="9" fill="#8A8780" fontFamily="monospace" letterSpacing="0.6">RUTA DE AZI</text>
      <rect x="20" y="136" width="280" height="272" rx="20" fill="#FF5C2C" />
      <text x="44" y="162" fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="monospace" letterSpacing="0.5">R-3A2F</text>
      <text x="44" y="198" fontSize="32" fontWeight="700" fill="white">8 opriri</text>
      <circle cx="264" cy="175" r="22" fill="rgba(255,255,255,0.2)" />
      <polyline points="252,183 258,172 264,179 272,164 277,160" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      <circle cx="44" cy="272" r="5" fill="white" />
      <line x1="44" y1="277" x2="44" y2="318" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <rect x="39" y="318" width="10" height="10" rx="2" fill="white" />
      <text x="60" y="276" fontSize="9.5" fill="rgba(255,255,255,0.8)">Pornire · Depozit Central</text>
      <text x="60" y="292" fontSize="10.5" fontWeight="700" fill="white">Str. Ștefan cel Mare 14</text>
      <text x="60" y="316" fontSize="9.5" fill="rgba(255,255,255,0.8)">Final · Oprire 8</text>
      <text x="60" y="332" fontSize="10.5" fontWeight="700" fill="white">Bulevardul Moscova 7</text>
      <line x1="40" y1="352" x2="300" y2="352" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="44" y="372" fontSize="10.5" fontWeight="600" fill="white">Apasă pentru a începe</text>
      <text x="285" y="373" fontSize="16" fill="white" textAnchor="middle">›</text>
      <rect x="20" y="424" width="280" height="58" rx="14" fill="#fff" stroke="#E8E6E0" strokeWidth="1" />
      <circle cx="38" cy="453" r="7" fill="none" stroke="#8A8780" strokeWidth="1.2" />
      <line x1="38" y1="449" x2="38" y2="456" stroke="#8A8780" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="38" cy="446" r="1" fill="#8A8780" />
      <text x="52" y="448" fontSize="9" fill="#5C5A55">Vei vedea detaliile fiecărei opriri</text>
      <text x="52" y="461" fontSize="9" fill="#5C5A55">pe rând, una câte una.</text>
    </svg>
  )
}

export function DeliveryDetailSVG() {
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
      <rect x="20" y="280" width="132" height="48" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(59,296) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12 19.79 19.79 0 01.87 3.38 2 2 0 012.86 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.65a16 16 0 006.29 6.29l1.92-1.92a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </g>
      <text x="81" y="308" fontSize="12" fontWeight="700" fill="#161513">Sună</text>
      <rect x="168" y="280" width="132" height="48" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(213,296) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </g>
      <text x="235" y="308" fontSize="12" fontWeight="700" fill="#161513">SMS</text>
      <rect x="0" y="448" width="320" height="192" fill="#fff" />
      <line x1="0" y1="448" x2="320" y2="448" stroke="#E8E6E0" strokeWidth="1" />
      <rect x="20" y="464" width="280" height="52" rx="14" fill="#FF5C2C" />
      <g transform="translate(79,482) scale(0.65)" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </g>
      <text x="101" y="495" fontSize="13" fontWeight="700" fill="white">Deschide Google Maps</text>
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

export function ConfirmSVG() {
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
      <rect x="20" y="264" width="132" height="44" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(59,278) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12 19.79 19.79 0 01.87 3.38 2 2 0 012.86 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.65a16 16 0 006.29 6.29l1.92-1.92a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </g>
      <text x="81" y="290" fontSize="12" fontWeight="700" fill="#161513">Sună</text>
      <rect x="168" y="264" width="132" height="44" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <g transform="translate(213,278) scale(0.65)" fill="none" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </g>
      <text x="235" y="290" fontSize="12" fontWeight="700" fill="#161513">SMS</text>
      <rect x="0" y="372" width="320" height="64" fill="#fff" />
      <line x1="0" y1="372" x2="320" y2="372" stroke="#E8E6E0" strokeWidth="1" />
      <rect x="20" y="382" width="132" height="44" rx="12" fill="#FF5C2C" />
      <g transform="translate(42,396) scale(0.65)" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </g>
      <text x="64" y="408" fontSize="11" fontWeight="700" fill="white">Google Maps</text>
      <rect x="168" y="382" width="132" height="44" rx="12" fill="#fff" stroke="#D4D2CC" strokeWidth="1.5" />
      <ellipse cx="219" cy="404" rx="8" ry="7" fill="#33CCFF" />
      <circle cx="216" cy="401" r="1.5" fill="white" />
      <circle cx="222" cy="401" r="1.5" fill="white" />
      <path d="M215 405 Q219 409 223 405" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="225" cy="409" r="1.8" fill="#33CCFF" stroke="white" strokeWidth="1" />
      <text x="235" y="408" fontSize="11" fontWeight="700" fill="#161513">Waze</text>
      <rect x="0" y="436" width="320" height="204" fill="#fff" />
      <line x1="0" y1="436" x2="320" y2="436" stroke="#E8E6E0" strokeWidth="1" />
      <rect x="20" y="452" width="132" height="56" rx="14" fill="#1F9D55" />
      <g transform="translate(50,472) scale(0.65)" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,6 9,17 4,12"/>
      </g>
      <text x="72" y="484" fontSize="13" fontWeight="700" fill="white">Livrată</text>
      <rect x="168" y="452" width="132" height="56" rx="14" fill="#D43A2F" />
      <g transform="translate(189,472) scale(0.65)" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </g>
      <text x="211" y="484" fontSize="13" fontWeight="700" fill="white">Nereușită</text>
    </svg>
  )
}
