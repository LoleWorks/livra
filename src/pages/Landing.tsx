import { Helmet } from 'react-helmet-async'
import { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Smartphone, Package, Users, User, Bell,
  CheckCircle, ArrowRight, Star, Globe, ChevronDown, ChevronUp,
  Route, Gift, TrendingUp, Mail, MapPin, Clock, Zap,
} from 'lucide-react'

// ── Workflow diagram ───────────────────────────────────────────────────────────

const DIAGRAM_NODES = [
  {
    num: '01', icon: Package,    title: 'Magazin online', role: 'WooCommerce / OpenCart',
    dotColor: '#ff5c2c',
    bg: 'bg-orange-100 dark:bg-orange-950/40', iconCls: 'text-orange-500', borderCls: 'border-orange-300 dark:border-orange-700',
  },
  {
    num: '02', icon: Users,      title: 'Agent vânzări',  role: 'Livra Sales',
    dotColor: '#7c3aed',
    bg: 'bg-violet-100 dark:bg-violet-950/40', iconCls: 'text-violet-600', borderCls: 'border-violet-300 dark:border-violet-700',
  },
  {
    num: '03', icon: Route,      title: 'Logistician',    role: 'Livra Admin',
    dotColor: '#059669',
    bg: 'bg-emerald-100 dark:bg-emerald-950/40', iconCls: 'text-emerald-600', borderCls: 'border-emerald-300 dark:border-emerald-700',
  },
  {
    num: '04', icon: Smartphone, title: 'Șofer',           role: 'Livra Driver',
    dotColor: '#d97706',
    bg: 'bg-amber-100 dark:bg-amber-950/40', iconCls: 'text-amber-600', borderCls: 'border-amber-300 dark:border-amber-700',
  },
  {
    num: '05', icon: User,       title: 'Client',          role: 'App Livra / SMS',
    dotColor: '#2563eb',
    bg: 'bg-blue-100 dark:bg-blue-950/40', iconCls: 'text-blue-600', borderCls: 'border-blue-300 dark:border-blue-700',
  },
]

const CONNECTORS = [
  { label: 'Comandă plasată' },
  { label: 'Comanda confirmată' },
  { label: 'Rută trimisă la șofer' },
  { label: 'Livrare la ușă' },
]

const STEP_MS = 2600

function WorkflowDiagram() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setStep(s => (s + 1) % DIAGRAM_NODES.length), STEP_MS)
    return () => clearTimeout(t)
  }, [step])

  return (
    <>
      <style>{`
        @keyframes wf-pkg-h {
          0%   { left: -12px; opacity: 0; }
          6%   { opacity: 1; }
          90%  { left: calc(100% + 12px); opacity: 1; }
          100% { left: calc(100% + 12px); opacity: 0; }
        }
        @keyframes wf-sms-h {
          0%   { left: -10px; opacity: 0; }
          10%  { opacity: 1; }
          85%  { left: calc(100% + 10px); opacity: 1; }
          100% { left: calc(100% + 10px); opacity: 0; }
        }
        @keyframes wf-pkg-v {
          0%   { top: -12px; opacity: 0; }
          6%   { opacity: 1; }
          90%  { top: calc(100% + 12px); opacity: 1; }
          100% { top: calc(100% + 12px); opacity: 0; }
        }
      `}</style>

      {/* ── Desktop horizontal ── */}
      <div className="hidden lg:flex items-start">
        {DIAGRAM_NODES.map((node, i) => {
          const Icon = node.icon
          const isActive = step === i
          const clientDelivered = i === 4 && step === 4
          return (
            <Fragment key={i}>
              {/* Node */}
              <button
                onClick={() => setStep(i)}
                className="flex flex-col items-center flex-shrink-0 w-28 xl:w-32"
              >
                <div className="text-[10px] font-bold tracking-widest text-zinc-300 dark:text-zinc-600 mb-3">{node.num}</div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border-2 transition-all duration-300 ${node.bg} ${node.borderCls}`}
                  style={isActive ? { boxShadow: `0 0 0 5px ${node.dotColor}22, 0 0 18px ${node.dotColor}35`, transform: 'scale(1.08)' } : undefined}
                >
                  <Icon size={22} className={node.iconCls} />
                </div>
                <div className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-50 text-center leading-tight">{node.title}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-0.5">{node.role}</div>

                {/* Driver: en-route badge */}
                {i === 3 && step === 3 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <MapPin size={8} /> En route
                  </div>
                )}

                {/* Client: notified / delivered badge */}
                {i === 4 && step >= 3 && (
                  <div className={`mt-2 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-500 ${
                    clientDelivered
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  }`}>
                    {clientDelivered ? <><CheckCircle size={8} /> Livrat!</> : <><Bell size={8} /> Notificat</>}
                  </div>
                )}
              </button>

              {/* Connector */}
              {i < DIAGRAM_NODES.length - 1 && (
                <div className="flex-1 flex flex-col items-center min-w-0 px-1 pt-[50px]">
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap mb-2">
                    {CONNECTORS[i].label}
                  </span>
                  <div className="relative w-full h-px bg-zinc-200 dark:bg-zinc-700">
                    {/* Arrowhead */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
                      style={{ borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '5px solid #d4d4d8' }}
                    />
                    {/* Traveling package */}
                    {step === i && (
                      <div
                        key={`pkg-${step}`}
                        className="absolute top-0 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border-2 shadow-md"
                        style={{ borderColor: node.dotColor, animation: `wf-pkg-h ${STEP_MS}ms ease-in-out forwards` }}
                      >
                        <Package size={11} style={{ color: node.dotColor }} />
                      </div>
                    )}
                    {/* SMS notification sliding to client simultaneously when logistician fires (step 2) */}
                    {i === 3 && step === 2 && (
                      <div
                        key="sms-notif"
                        className="absolute top-0 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 shadow-sm"
                        style={{ animation: `wf-sms-h ${STEP_MS * 1.15}ms ease-in-out forwards`, animationDelay: `${STEP_MS * 0.04}ms` }}
                      >
                        <Bell size={9} className="text-blue-500" />
                      </div>
                    )}
                  </div>
                  {/* SMS sub-label */}
                  {i === 2 && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 whitespace-nowrap">
                      <Bell size={8} /> SMS notificare → client
                    </div>
                  )}
                  {/* GPS sub-label */}
                  {i === 3 && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 whitespace-nowrap">
                      <MapPin size={8} /> GPS live tracking
                    </div>
                  )}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      {/* ── Mobile vertical ── */}
      <div className="flex lg:hidden flex-col items-start max-w-xs mx-auto w-full">
        {DIAGRAM_NODES.map((node, i) => {
          const Icon = node.icon
          const isActive = step === i
          const clientDelivered = i === 4 && step === 4
          return (
            <Fragment key={i}>
              <button onClick={() => setStep(i)} className="flex items-center gap-4 w-full py-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${node.bg} ${node.borderCls}`}
                  style={isActive ? { boxShadow: `0 0 0 4px ${node.dotColor}22`, transform: 'scale(1.06)' } : undefined}
                >
                  <Icon size={20} className={node.iconCls} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold tracking-widest text-zinc-300 dark:text-zinc-600 mb-0.5">{node.num}</div>
                  <div className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{node.title}</div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{node.role}</div>
                  {i === 4 && step >= 3 && (
                    <div className={`mt-0.5 text-[10px] font-medium ${clientDelivered ? 'text-emerald-600' : 'text-blue-500'}`}>
                      {clientDelivered ? '✓ Livrat!' : '🔔 Notificat · GPS live'}
                    </div>
                  )}
                </div>
              </button>

              {i < DIAGRAM_NODES.length - 1 && (
                <div className="flex items-start gap-3 pl-5 my-1">
                  <div className="relative w-px flex-shrink-0 overflow-visible bg-zinc-200 dark:bg-zinc-700" style={{ height: i === 2 ? 52 : 36 }}>
                    {step === i && (
                      <div
                        key={`v-${step}`}
                        className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border-2 shadow-sm"
                        style={{ borderColor: node.dotColor, animation: `wf-pkg-v ${STEP_MS}ms ease-in-out forwards` }}
                      >
                        <Package size={9} style={{ color: node.dotColor }} />
                      </div>
                    )}
                  </div>
                  <div className="pt-1">
                    <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{CONNECTORS[i].label}</div>
                    {i === 2 && <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1"><Bell size={8} /> SMS → client</div>}
                    {i === 3 && <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1"><MapPin size={8} /> GPS live</div>}
                  </div>
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      {/* ── Step dots ── */}
      <div className="flex justify-center gap-2.5 mt-10">
        {DIAGRAM_NODES.map((node, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`rounded-full transition-all duration-300 ${step === i ? 'w-5 h-2' : 'w-2 h-2 bg-zinc-200 dark:bg-zinc-700'}`}
            style={step === i ? { backgroundColor: node.dotColor } : undefined}
          />
        ))}
      </div>
    </>
  )
}

// ── Network ───────────────────────────────────────────────────────────────────

const NETWORK_BENEFITS = [
  {
    icon: Smartphone,
    title: 'Reclame pe pagina de tracking',
    desc: 'Când un client așteaptă o livrare de la alt partener, magazinul tău apare pe ecranul lui. 10 minute de atenție pură, inclus în prețul creditelor, fără costuri extra.',
    comingSoon: true,
  },
  {
    icon: Gift,
    title: 'Livrare gratuită la primul ordin',
    desc: 'Oferă livrare gratuită clienților noi din rețeaua Livra. Noi știm cine nu a mai comandat de la tine, tu nu trebuie să faci nimic, se aplică automat.',
  },
  {
    icon: MapPin,
    title: 'Promovare pe zone',
    desc: 'Vrei să crești în Botanica sau Ciocana? Targetezi clienții din zona respectivă care au comandat produse similare. Livra știe exact cine și unde.',
    comingSoon: true,
  },
  {
    icon: TrendingUp,
    title: 'Date despre comportamentul clienților',
    desc: 'Află când comandă cel mai mult clienții din zona ta, ce categorii de produse preferă și cum evoluează cererea. Date reale, nu presupuneri.',
  },
  {
    icon: Users,
    title: 'Bază de clienți partajată',
    desc: 'Un client care și-a salvat adresa și preferințele la un partener Livra primește automat livrare perfectă și la tine, fără să completeze nimic din nou.',
  },
  {
    icon: Zap,
    title: 'Buton Livra pe site-ul tău',
    desc: 'Adaugi un buton „Livrează cu Livra" pe site-ul tău. Clienții cu cont Livra plasează comanda cu un singur click: adresa, fereastra orară și toate preferințele lor sunt completate automat. Fără formulare, fără întrebări, fără livrări ratate.',
  },
]

// ── Pricing ───────────────────────────────────────────────────────────────────


// ── Onboarding ────────────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  {
    num: '01',
    title: 'Creăm conturile',
    desc: 'Tu ne dai datele companiei, noi ne ocupăm de tot: contul tău de manager, conturile șoferilor, conturile agenților de vânzări. Nu trebuie să configurezi nimic.',
  },
  {
    num: '02',
    title: 'Instalăm aplicația pe telefoanele șoferilor',
    desc: 'Mergem la șoferi sau îi ghidăm pas cu pas la distanță. Fiecare telefon iese configurat și gata de prima livrare.',
  },
  {
    num: '03',
    title: 'Instruim echipa',
    desc: 'Fiecare șofer știe exact ce să facă: cum pornește ruta, cum confirmă livrarea, cum raportează un eșec. Fără surprize în prima zi.',
  },
  {
    num: '04',
    title: 'Conectăm magazinul tău',
    desc: 'Instalăm plugin-ul în WooCommerce sau OpenCart, configurăm webhook-ul dacă folosești altă platformă și testăm că totul funcționează înainte să plecăm.',
  },
  {
    num: '05',
    title: 'Prima zi, împreună',
    desc: 'La prima zi de livrări reale, suntem disponibili. Dacă apare ceva, rezolvăm pe loc. Tu nu ești lăsat singur niciodată.',
  },
]

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Cât durează să îl configurez?', a: 'Majoritatea companiilor sunt live în mai puțin de 1 oră. Conectarea WooCommerce durează 5 minute cu plugin-ul nostru.' },
  { q: 'Ce se întâmplă dacă un credit rămâne nefolosit?', a: 'Creditele nu expiră. Le poți folosi oricând, la propriul ritm.' },
  { q: 'Am nevoie de aplicație mobilă pentru șoferi?', a: 'Da, Livra Driver este disponibilă pe iOS și Android, gratuită pentru șoferi.' },
  { q: 'Funcționează și în afara Chișinăului?', a: 'Da, Livra optimizează livrări în toată Moldova și poate fi configurat pentru orice regiune.' },
  { q: 'Există un contract pe termen lung?', a: 'Nu. Funcționezi pe bază de credite prepaid, fără abonament lunar obligatoriu.' },
]

// ── Feature section data ───────────────────────────────────────────────────────

const FEATURE_SECTIONS = [
  {
    tag: 'Rute optimizate',
    headline: 'Gata cu haosul\nde dimineață.',
    body: [
      'Înainte, cineva petrecea ore întregi în fiecare dimineață: cine duce ce, pe unde trece, în ce ordine. Hârtii, telefoane, greșeli.',
      'Acum introduci comenzile și Livra calculează automat cine merge unde, pe cel mai scurt drum posibil. Toți șoferii pleacă în câteva minute, nu în câteva ore.',
    ],
    bullets: [
      'Cu 30% mai puțin combustibil consumat',
      'De 2× mai multe livrări într-o zi',
      'Șoferii ajung acasă la timp',
    ],
    visual: 'routes' as const,
    flip: false,
  },
  {
    tag: 'Urmărire în timp real',
    headline: 'Clienții tăi știu\nexact când sosești.',
    body: [
      'Nimeni nu vrea să stea o zi întreagă cu ochii pe geam, așteptând o livrare. Asta frustrează și îi face să sune de 3 ori.',
      'Cu Livra, fiecare client primește un link pe telefon. Vede live unde e șoferul, câte opriri mai are și la ce oră ajunge. Fără apeluri, fără anxietate.',
    ],
    bullets: [
      'Zero telefoane „unde e coletul meu?"',
      'Experiență de livrare memorabilă',
      'Clienți care revin și recomandă',
    ],
    visual: 'tracking' as const,
    flip: true,
  },
  {
    tag: 'Aplicație mobilă șofer',
    headline: 'Șoferii tăi livrează\nfără să întrebe nimic.',
    body: [
      'Listele tipărite se pierd. Numerele de telefon nu se citesc. Șoferul nu știe exact unde să parcheze sau dacă a livrat la adresa corectă.',
      'Livra Driver îi arată tot: adresa exactă, navigarea, ordinea opririlor. La fiecare stop confirmă cu semnătură sau fotografie. Tu vezi totul în timp real, de pe orice device.',
    ],
    bullets: [
      'Dovadă de livrare la fiecare stop',
      'Fără hârtii, fără confuzii',
      'Tu controlezi, ei livrează',
    ],
    visual: 'driver' as const,
    flip: false,
  },
  {
    tag: 'Rapoarte & analize',
    headline: 'Știi în fiecare\ndimineață ce merge.',
    body: [
      'Câte livrări au reușit ieri? Care șofer are cele mai multe ratate? Unde se pierde cel mai mult timp? Fără Livra, răspunsurile vin prea târziu.',
      'Dashboardul Livra îți arată totul clar și simplu: performanța fiecărui șofer, rata de succes, motivele eșecurilor. Iei decizii bazate pe ce s-a întâmplat, nu pe ce crezi tu.',
    ],
    bullets: [
      'Raport zilnic complet cu un singur click',
      'Identifici problemele înainte să devină mari',
      'Echipa ta devine mai bună în fiecare săptămână',
    ],
    visual: 'reports' as const,
    flip: true,
  },
  {
    tag: 'Jurnal de activitate',
    headline: 'Știi exact ce s-a\nîntâmplat cu fiecare livrare.',
    body: [
      'Nu mai dai vina pe nimeni fără dovezi. Nu mai auzi „nu știu ce s-a întâmplat". Livra înregistrează fiecare acțiune a fiecărui șofer: când a plecat, când a ajuns, când a confirmat, de ce a eșuat.',
      'Dacă un client reclamă că nu a primit coletul, ai imediat răspunsul: ora exactă, fotografia de confirmare, semnătura digitală. Jurnal complet, mereu la îndemână.',
    ],
    bullets: [
      'Istoric complet per șofer și per zi',
      'Dovezi instantanee pentru orice dispută',
      'Îmbunătățești echipa cu date reale, nu cu presupuneri',
    ],
    visual: 'activity' as const,
    flip: false,
  },
  {
    tag: 'Conectori e-commerce',
    headline: 'Comenzile vin singure.\nTu nu ridici un deget.',
    body: [
      'Înainte, cineva copia comenzi dintr-un loc în altul. Greșeli de adresă, timp pierdut, frustrare la final de zi.',
      'Cu Livra ai trei moduri să primești comenzi: plugin direct pentru WooCommerce și OpenCart, webhook pentru orice altă platformă, sau adaugi manual în câteva secunde. Indiferent de unde vine comanda, ea apare gata de livrat.',
    ],
    bullets: [
      'Plugin WooCommerce & OpenCart, conectare în 5 minute',
      'Webhook universal pentru orice platformă sau sistem propriu',
      'Adăugare manuală rapidă când e nevoie',
    ],
    visual: 'connectors' as const,
    flip: true,
  },
  {
    tag: 'Notificări SMS automate',
    headline: 'Clientul tău știe tot,\nînainte să întrebe.',
    body: [
      'Nimeni nu vrea să sune să întrebe unde e comanda. Asta irită și clientul, și echipa ta.',
      'Livra trimite automat SMS-uri la momentele cheie: când comanda pleacă la drum, când șoferul e la 10 minute distanță și când coletul a fost livrat. Clientul e liniștit, tu ești liniștit.',
    ],
    bullets: [
      'SMS automat la fiecare etapă importantă',
      'Clientul nu mai sună niciodată să întrebe',
      'Experiență premium fără niciun efort din partea ta',
    ],
    visual: 'sms' as const,
    flip: false,
  },
  {
    tag: 'Dashboard vânzări',
    headline: 'Echipa ta de vânzări\nare tot ce îi trebuie.',
    body: [
      'Agenții de vânzări adaugă comenzi, urmăresc livrările și gestionează retururile, fără să deranjeze managementul la fiecare pas.',
      'Fiecare agent vede doar comenzile lui, primește notificări când o livrare eșuează și poate relua contactul cu clientul direct din același loc.',
    ],
    bullets: [
      'Comenzi noi în câteva click-uri',
      'Retururi și eșecuri gestionate automat',
      'Fiecare agent vede exact ce îl privește',
    ],
    visual: 'sales' as const,
    flip: true,
  },
]

// ── Visual panels ─────────────────────────────────────────────────────────────

function RoutesVisual() {
  return (
    <div className="relative">
      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-0.5">Azi, 07:42</div>
            <div className="text-[18px] font-bold text-zinc-900 dark:text-zinc-50">3 șoferi · 47 livrări</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center">
            <Route size={18} className="text-white" />
          </div>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Alexandru M.', stops: 16, km: '34 km', color: 'bg-orange-500', w: 'w-full' },
            { name: 'Ion P.',        stops: 14, km: '28 km', color: 'bg-violet-500', w: 'w-4/5' },
            { name: 'Vadim T.',      stops: 17, km: '31 km', color: 'bg-emerald-500', w: 'w-11/12' },
          ].map(d => (
            <div key={d.name} className="bg-white dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{d.name}</span>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span>{d.stops} opriri</span>
                  <span>{d.km}</span>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full ${d.color} ${d.w} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-[12px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Rute calculate în 4 secunde
          </span>
          <span className="text-brand-orange dark:text-orange-400 font-semibold">-31% combustibil</span>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-brand-orange text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
        Optimizat ✓
      </div>
    </div>
  )
}

function TrackingVisual() {
  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Phone frame */}
      <div className="w-[230px] bg-zinc-900 rounded-[2.8rem] p-[10px] shadow-2xl border-[5px] border-zinc-800">
        <div className="bg-white rounded-[2.2rem] overflow-hidden flex flex-col" style={{ height: '460px' }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-0 flex-shrink-0 bg-[#e8e0d5]">
            <span className="text-[9px] font-semibold text-zinc-700">9:41</span>
            <div className="w-14 h-2 bg-zinc-400/40 rounded-full" />
            <div className="flex gap-0.5 items-end">
              <div className="w-0.5 h-1.5 bg-zinc-600 rounded-sm" />
              <div className="w-0.5 h-2 bg-zinc-600 rounded-sm" />
              <div className="w-0.5 h-2.5 bg-zinc-600 rounded-sm" />
              <div className="w-0.5 h-3 bg-zinc-600 rounded-sm" />
            </div>
          </div>

          {/* Map, Yandex-style street map */}
          <div className="relative flex-1 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 210 300" preserveAspectRatio="xMidYMid slice">
              {/* Base */}
              <rect width="210" height="300" fill="#e8e0d5"/>
              {/* City blocks */}
              <rect x="0"   y="0"   width="55"  height="48" fill="#d9d0c4" rx="1"/>
              <rect x="65"  y="0"   width="75"  height="48" fill="#d9d0c4" rx="1"/>
              <rect x="150" y="0"   width="60"  height="48" fill="#d9d0c4" rx="1"/>
              <rect x="0"   y="58"  width="38"  height="65" fill="#d9d0c4" rx="1"/>
              <rect x="48"  y="58"  width="52"  height="32" fill="#d9d0c4" rx="1"/>
              <rect x="110" y="58"  width="100" height="65" fill="#d9d0c4" rx="1"/>
              <rect x="0"   y="133" width="50"  height="55" fill="#d9d0c4" rx="1"/>
              <rect x="60"  y="108" width="40"  height="75" fill="#d9d0c4" rx="1"/>
              <rect x="110" y="133" width="100" height="55" fill="#d9d0c4" rx="1"/>
              <rect x="0"   y="198" width="75"  height="102" fill="#d9d0c4" rx="1"/>
              <rect x="85"  y="198" width="125" height="102" fill="#d9d0c4" rx="1"/>
              {/* Main roads */}
              <rect x="0"   y="48"  width="210" height="10" fill="#fff" opacity="0.95"/>
              <rect x="0"   y="98"  width="210" height="10" fill="#fff" opacity="0.95"/>
              <rect x="0"   y="188" width="210" height="10" fill="#fff" opacity="0.95"/>
              <rect x="55"  y="0"   width="10"  height="300" fill="#fff" opacity="0.95"/>
              <rect x="100" y="0"   width="10"  height="300" fill="#fff" opacity="0.95"/>
              <rect x="150" y="0"   width="10"  height="300" fill="#fff" opacity="0.95"/>
              {/* Secondary roads */}
              <rect x="0"   y="128" width="210" height="6" fill="#f0ece4" opacity="0.95"/>
              <rect x="0"   y="163" width="210" height="6" fill="#f0ece4" opacity="0.95"/>
              <rect x="30"  y="0"   width="6"   height="300" fill="#f0ece4" opacity="0.95"/>
              <rect x="78"  y="0"   width="6"   height="300" fill="#f0ece4" opacity="0.95"/>
              <rect x="128" y="0"   width="6"   height="300" fill="#f0ece4" opacity="0.95"/>
              {/* Route highlight */}
              <path
                d="M 78 255 L 78 188 Q 78 163 100 163 L 155 163 Q 155 128 155 98 L 155 70"
                stroke="#7c3aed" strokeWidth="3.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.9"
              />
              <path
                d="M 78 255 L 78 188 Q 78 163 100 163 L 155 163 Q 155 128 155 98 L 155 70"
                stroke="#c4b5fd" strokeWidth="1.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="5 7" opacity="0.6"
              />
            </svg>

            {/* Van marker */}
            <div className="absolute" style={{ left: '66px', top: '162px', transform: 'translate(-50%, -50%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 38" width="46" height="27"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))' }}>
                <rect x="1" y="3" width="36" height="26" rx="3.5" fill="#7c3aed"/>
                <path d="M37 3 L49 3 Q58 3 60 13 L60 29 L37 29 Z" fill="#5b21b6"/>
                <path d="M39 6 L46 6 Q53 6 55 14 L55 25 L39 25 Z" fill="#ede9fe" opacity="0.75"/>
                <rect x="4" y="6" width="29" height="15" rx="2" fill="#ede9fe" opacity="0.45"/>
                <rect x="59" y="22" width="4" height="7" rx="2" fill="#5b21b6"/>
                <ellipse cx="59" cy="18" rx="2" ry="2.5" fill="#fef08a"/>
                <rect x="1" y="14" width="2.5" height="7" rx="1.25" fill="#fca5a5"/>
                <rect x="4" y="28" width="54" height="4" rx="2" fill="#5b21b6" opacity="0.35"/>
                <circle cx="14" cy="32" r="6" fill="#1e293b"/>
                <circle cx="14" cy="32" r="3.5" fill="#475569"/>
                <circle cx="14" cy="32" r="1.5" fill="#94a3b8"/>
                <circle cx="47" cy="32" r="6" fill="#1e293b"/>
                <circle cx="47" cy="32" r="3.5" fill="#475569"/>
                <circle cx="47" cy="32" r="1.5" fill="#94a3b8"/>
              </svg>
            </div>

            {/* Destination pin */}
            <div className="absolute" style={{ left: '155px', top: '56px', transform: 'translate(-50%, -100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="22" height="29"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="#2563eb"/>
                <circle cx="12" cy="12" r="5" fill="white"/>
              </svg>
            </div>

            {/* Zoom controls */}
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow-md border border-zinc-200 overflow-hidden">
              <div className="w-6 h-6 flex items-center justify-center text-zinc-500 text-[13px] font-light border-b border-zinc-100 hover:bg-zinc-50">+</div>
              <div className="w-6 h-6 flex items-center justify-center text-zinc-500 text-[13px] font-light">−</div>
            </div>
          </div>

          {/* Bottom card, exact Track.tsx mobile card */}
          <div className="flex-shrink-0 bg-white" style={{ borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.09)', borderTop: '1px solid #f4f4f5' }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-200" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-1 pb-2.5 border-b border-zinc-100">
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#161513] tracking-widest uppercase">Livra</span>
                <svg width="22" height="3" viewBox="0 0 22 3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#ff5c2c" strokeWidth="1.5"/><polygon points="16,0 22,1.5 16,3" fill="#ff5c2c"/></svg>
              </div>
            </div>
            {/* Body */}
            <div className="px-4 pt-2.5 pb-3 space-y-2.5">
              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0" />
                <span className="text-[10px] font-semibold text-zinc-700">În drum spre tine</span>
              </div>
              {/* Time window */}
              <div>
                <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Interval de livrare</p>
                <p className="text-[19px] font-bold text-zinc-900 leading-none">
                  10:00<span className="text-zinc-400 font-normal mx-1 text-[14px]">–</span>12:30
                </p>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-end text-[8px] text-zinc-400 mb-1"><span>3/8</span></div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full ${i < 2 ? 'bg-emerald-400' : i === 2 ? 'bg-violet-500' : 'bg-zinc-100'}`} />
                  ))}
                </div>
              </div>
              {/* Address */}
              <div className="flex items-start gap-2 bg-zinc-50 rounded-xl px-2.5 py-2">
                <MapPin size={10} className="text-violet-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] text-zinc-400 mb-0.5">Adresa de livrare</p>
                  <p className="text-[10px] font-medium text-zinc-800 leading-snug">Str. Albișoara 34, ap. 7</p>
                </div>
              </div>
              {/* Last update */}
              <div className="flex items-center gap-1 text-[8px] text-zinc-300">
                <Clock size={7} />
                <span>Actualizat acum 3s</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SMS notification bubble */}
      <div className="absolute -top-1 -right-6 bg-white dark:bg-zinc-800 rounded-2xl rounded-br-sm px-3 py-2 shadow-xl border border-zinc-100 dark:border-zinc-700 max-w-[158px]">
        <div className="text-[9px] font-semibold text-zinc-400 mb-0.5">Livra · acum</div>
        <div className="text-[11px] text-zinc-800 dark:text-zinc-200 leading-snug">Coletul tău e pe drum! Urmărește: livra.md/t/…</div>
      </div>
    </div>
  )
}

function DriverVisual() {
  const list = [
    { addr: 'Str. Trandafirilor 12', status: 'done',   time: '09:14' },
    { addr: 'Bd. Ștefan cel Mare 89', status: 'done',  time: '09:41' },
    { addr: 'Str. Albișoara 34',     status: 'active', time: 'Acum' },
    { addr: 'Str. Miorița 7',        status: 'next',   time: '~10:20' },
    { addr: 'Calea Orheiului 55',    status: 'next',   time: '~10:48' },
  ]
  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-0.5">Alexandru M.</div>
          <div className="text-[16px] font-bold text-zinc-900 dark:text-zinc-50">16 livrări azi</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-400 mb-0.5">Completate</div>
          <div className="text-[22px] font-bold text-emerald-500">2/16</div>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-4 overflow-hidden">
        <div className="h-full w-[12%] bg-emerald-400 rounded-full" />
      </div>
      <div className="space-y-2">
        {list.map((d, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              d.status === 'active' ? 'bg-emerald-500'
              : d.status === 'done'   ? 'bg-white/60 dark:bg-zinc-800/40'
              : 'bg-white/40 dark:bg-zinc-800/20'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              d.status === 'done'   ? 'bg-emerald-400'
              : d.status === 'active' ? 'bg-white'
              : 'bg-zinc-200 dark:bg-zinc-600'
            }`}>
              {d.status === 'done'   && <CheckCircle size={11} className="text-white" />}
              {d.status === 'active' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              {d.status === 'next'   && <span className="text-[9px] font-bold text-zinc-400">{i + 1}</span>}
            </div>
            <span className={`text-[12px] font-medium flex-1 truncate ${
              d.status === 'active' ? 'text-white'
              : d.status === 'done' ? 'text-zinc-400 line-through'
              : 'text-zinc-700 dark:text-zinc-300'
            }`}>{d.addr}</span>
            <span className={`text-[10px] flex-shrink-0 ${d.status === 'active' ? 'text-emerald-100 font-bold' : 'text-zinc-400'}`}>{d.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportsVisual() {
  const weeks = [
    { label: 'S1', v: 45 }, { label: 'S2', v: 52 }, { label: 'S3', v: 61 },
    { label: 'S4', v: 58 }, { label: 'S5', v: 74 }, { label: 'S6', v: 83 },
    { label: 'S7', v: 79 }, { label: 'S8', v: 95 }, { label: 'S9', v: 108 },
    { label: 'S10', v: 127 },
  ]
  const W = 260, H = 56, min = 36, max = 136
  const pts = weeks.map((w, i) => ({
    x: parseFloat(((i / (weeks.length - 1)) * W).toFixed(1)),
    y: parseFloat((H - ((w.v - min) / (max - min)) * H).toFixed(1)),
    ...w,
  }))
  const line = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${line} ${W},${H} 0,${H}`

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { value: '94%', label: 'Rată succes',  color: 'text-emerald-500' },
          { value: '127', label: 'Livrări ieri', color: 'text-brand-orange' },
          { value: '3',   label: 'Eșecuri',      color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-zinc-800/60 rounded-xl p-3 text-center border border-zinc-100 dark:border-zinc-700/50">
            <div className={`text-[22px] font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-zinc-400">Livrări · ultimele 10 săptămâni</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
            <TrendingUp size={11} />+182%
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full" height={70}>
          <defs>
            <linearGradient id="lineAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5c2c" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff5c2c" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* horizontal grid lines */}
          {[0.25, 0.5, 0.75].map(t => (
            <line key={t} x1="0" y1={H * (1 - t)} x2={W} y2={H * (1 - t)}
              stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3 3" />
          ))}
          {/* area fill */}
          <polygon points={area} fill="url(#lineAreaFill)" />
          {/* line */}
          <polyline points={line} fill="none" stroke="#ff5c2c"
            strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
          {/* dots */}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={i === pts.length - 1 ? 3.5 : 2.5}
              fill={i === pts.length - 1 ? '#ff5c2c' : '#fff'}
              stroke="#ff5c2c" strokeWidth="1.5" />
          ))}
          {/* x-axis labels */}
          {pts.filter((_, i) => i === 0 || i === 3 || i === 6 || i === 9).map(p => (
            <text key={p.label} x={p.x} y={H + 11}
              textAnchor="middle" fontSize="7.5" fill="#9ca3af">{p.label}</text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function ActivityVisual() {
  const events = [
    { time: '09:14', icon: '✓', color: 'bg-emerald-500', text: 'Livrat cu succes', sub: 'Str. Trandafirilor 12 · Semnat de client', driver: 'Alexandru M.' },
    { time: '09:41', icon: '✓', color: 'bg-emerald-500', text: 'Livrat cu succes', sub: 'Bd. Ștefan cel Mare 89 · Foto confirmare', driver: 'Alexandru M.' },
    { time: '10:03', icon: '!', color: 'bg-red-500',     text: 'Livrare eșuată', sub: 'Str. Miorița 7 · Motiv: client absent', driver: 'Ion P.' },
    { time: '10:21', icon: '✓', color: 'bg-emerald-500', text: 'Livrat cu succes', sub: 'Calea Orheiului 55 · Semnat de client', driver: 'Vadim T.' },
    { time: '10:38', icon: '↗', color: 'bg-violet-500',  text: 'În drum spre client', sub: 'Str. Albișoara 34 · ETA 4 min', driver: 'Alexandru M.' },
  ]
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Activitate · Azi</div>
          <div className="text-[16px] font-bold text-zinc-900 dark:text-zinc-50">Toți șoferii</div>
        </div>
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-500 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />32 livrate</span>
          <span className="flex items-center gap-1 text-red-400 font-semibold"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />2 eșuate</span>
        </div>
      </div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-3 bg-white dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 border border-zinc-100 dark:border-zinc-700/50">
            <div className={`w-6 h-6 rounded-full ${e.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <span className="text-white text-[10px] font-bold">{e.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">{e.text}</span>
                <span className="text-[10px] text-zinc-400 flex-shrink-0">{e.time}</span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">{e.sub}</p>
              <p className="text-[10px] text-zinc-300 dark:text-zinc-600">{e.driver}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConnectorsVisual() {
  const sources = [
    { name: 'WooCommerce', badge: '14 comenzi', color: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
    { name: 'OpenCart',    badge: '8 comenzi',  color: 'bg-orange-100 dark:bg-orange-950/40',    text: 'text-orange-700 dark:text-orange-400',   dot: 'bg-orange-500' },
    { name: 'Webhook',     badge: 'API propriu', color: 'bg-zinc-100 dark:bg-zinc-800',       text: 'text-zinc-600 dark:text-zinc-400',   dot: 'bg-zinc-400' },
    { name: 'Manual',      badge: '+ Adaugă',   color: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-400' },
  ]
  return (
    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
      <div className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-4">De oriunde vine comanda</div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {sources.map(s => (
          <div key={s.name} className={`${s.color} rounded-xl px-3 py-2.5`}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.dot !== 'bg-zinc-400' ? 'animate-pulse' : ''}`} />
              <span className={`text-[12px] font-bold ${s.text}`}>{s.name}</span>
            </div>
            <span className={`text-[10px] font-medium ${s.text} opacity-70`}>{s.badge}</span>
          </div>
        ))}
      </div>
      {/* Converging arrows */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-3 bg-blue-300" />
          <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center text-white text-[13px] font-bold shadow-md">↓</div>
          <div className="w-px h-3 bg-blue-300" />
        </div>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>
      {/* Livra dashboard */}
      <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col leading-none mr-0.5">
            <span className="text-[9px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
            <svg width="18" height="2" viewBox="0 0 18 2"><line x1="0" y1="1" x2="14" y2="1" stroke="#ff5c2c" strokeWidth="1"/><polygon points="14,0 18,1 14,2" fill="#ff5c2c"/></svg>
          </div>
          <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-50">Dashboard Livra</span>
          <span className="ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">22 comenzi gata</span>
        </div>
        <div className="space-y-1.5">
          {[
            { addr: 'Bd. Ștefan cel Mare 89', src: 'WooCommerce' },
            { addr: 'Str. Albișoara 34',       src: 'OpenCart' },
            { addr: 'Calea Orheiului 55',      src: 'Manual' },
          ].map((o, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-400 flex-1 truncate">{o.addr}</span>
              <span className="text-zinc-300 dark:text-zinc-600 text-[9px]">{o.src}</span>
            </div>
          ))}
          <div className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">+ 19 alte comenzi…</div>
        </div>
      </div>
    </div>
  )
}

function SMSVisual() {
  const messages = [
    {
      time: '09:02',
      text: 'Bună ziua! Comanda ta #4821 a plecat la drum. Urmărește live șoferul: livra.md/t/xk92p',
      stage: 'Comanda a plecat',
      color: 'border-violet-200 dark:border-violet-800',
      dot: 'bg-violet-500',
    },
    {
      time: '10:44',
      text: 'Șoferul tău e la aproximativ 10 minute distanță. Pregătește-te! 🚚',
      stage: 'Șofer la 10 min',
      color: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    {
      time: '10:57',
      text: 'Comanda ta #4821 a fost livrată cu succes. Mulțumim că ne-ai ales! ✓',
      stage: 'Livrare confirmată',
      color: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
  ]
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-5">SMS trimise automat de Livra</div>
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`bg-white dark:bg-zinc-800/60 rounded-2xl p-4 border-2 ${m.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${m.dot}`} />
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{m.stage}</span>
              <span className="ml-auto text-[10px] text-zinc-400">{m.time}</span>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-zinc-500">L</div>
              <div className="bg-zinc-100 dark:bg-zinc-700 rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
                <p className="text-[11px] text-zinc-700 dark:text-zinc-200 leading-relaxed">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SalesVisual() {
  const orders = [
    { id: '#4821', customer: 'Maria Ionescu',  addr: 'Str. Albișoara 34',   status: 'livrat',   statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { id: '#4822', customer: 'Andrei Popa',    addr: 'Bd. Dacia 18, ap. 3', status: 'în drum',  statusColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' },
    { id: '#4823', customer: 'Elena Rusu',     addr: 'Str. Miorița 7',      status: 'eșuat',    statusColor: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
    { id: '#4824', customer: 'Victor Ciobanu', addr: 'Calea Orheiului 55',  status: 'planificat', statusColor: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
  ]
  return (
    <div className="bg-violet-50 dark:bg-violet-950/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-900/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider mb-0.5">Agent: Mihai D.</div>
          <div className="text-[16px] font-bold text-zinc-900 dark:text-zinc-50">Comenzile mele</div>
        </div>
        <button className="flex items-center gap-1.5 bg-violet-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg">
          <span className="text-[14px] leading-none">+</span> Comandă nouă
        </button>
      </div>
      {/* Order list */}
      <div className="space-y-2 mb-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 border border-zinc-100 dark:border-zinc-700/50 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">{o.customer}</span>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-600">{o.id}</span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">{o.addr}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${o.statusColor}`}>{o.status}</span>
          </div>
        ))}
      </div>
      {/* Return alert */}
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">Elena Rusu necesită recontact</p>
          <p className="text-[10px] text-red-400">Livrarea #4823 a eșuat · client absent</p>
        </div>
      </div>
    </div>
  )
}

// ── Misc components ───────────────────────────────────────────────────────────

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 py-4">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 text-left">
        <span className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-zinc-400 flex-shrink-0" />
          : <ChevronDown size={16} className="text-zinc-400 flex-shrink-0" />
        }
      </button>
      {open && <p className="mt-3 text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{a}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Landing() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Helmet>
        <title>Livra | Livrări mai rapide, costuri mai mici | Software livrare Moldova</title>
        <meta name="description" content="Livra optimizează rutele de livrare pentru companii din Moldova. Integrare WooCommerce și OpenCart, tracking live, șoferi monitorizați în timp real. Încearcă gratuit." />
        <meta name="keywords" content="optimizare rute livrare Moldova, software livrare Chisinau, WooCommerce livrare, OpenCart livrare, last-mile delivery Moldova, tracking soferi timp real, livrare rapida Moldova" />
        <meta property="og:title" content="Livra | Software livrare pentru companii din Moldova" />
        <meta property="og:description" content="Optimizare rute, tracking live, integrare WooCommerce & OpenCart. Livrări mai rapide cu mai puțin combustibil." />
        <meta property="og:url" content="https://livra.delivery" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://livra.delivery" />
      </Helmet>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
            <svg width="36" height="4" viewBox="0 0 36 4"><line x1="0" y1="2" x2="28" y2="2" stroke="#ff5c2c" strokeWidth="1.5"/><polygon points="28,0 36,2 28,4" fill="#ff5c2c"/></svg>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-zinc-500 dark:text-zinc-400">
            <a href="#cum-functioneaza" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Cum funcționează</a>
            <a href="#functionalitati" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Funcționalități</a>
            <a href="#retea" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Rețeaua Livra</a>
            <a href="#preturi" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Prețuri</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 transition-colors">
              Autentificare
            </Link>
            <a href="#contact" className="text-[13px] font-medium bg-brand-orange hover:bg-brand-orange-hover text-white px-4 py-1.5 rounded-lg transition-colors">
              Solicită demo
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 text-[12px] font-medium text-orange-700 dark:text-orange-400 mb-6">
          <Star size={11} className="fill-current" />
          Construit pentru companii din Moldova
        </div>
        <h1 className="text-[48px] md:text-[60px] font-bold tracking-tight leading-[1.1] text-zinc-900 dark:text-zinc-50 mb-6">
          <span className="text-brand-orange">Livra</span>za mai rapid.<br />
          Crești mai mult.
        </h1>
        <p className="text-[18px] text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Livra optimizează rutele de livrare, urmărește șoferii în timp real și îți arată exact ce se întâmplă cu fiecare comandă.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-[15px] font-medium rounded-xl transition-colors">
            Începe gratuit <ArrowRight size={16} />
          </a>
          <a href="#cum-functioneaza" className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 text-[15px] font-medium rounded-xl transition-colors">
            Vezi cum funcționează
          </a>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '30%', label: 'mai puțin combustibil' },
            { value: '2×',  label: 'mai multe livrări/zi' },
            { value: '98%', label: 'satisfacție clienți' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-[32px] font-bold text-brand-orange">{value}</div>
              <div className="text-[13px] text-zinc-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="cum-functioneaza" className="bg-zinc-50 dark:bg-zinc-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold tracking-tight mb-3">De la comandă la livrare</h2>
            <p className="text-[16px] text-zinc-500 dark:text-zinc-400">Cum circulă o comandă prin Livra, de la magazin până la șofer.</p>
          </div>
          <WorkflowDiagram />
        </div>
      </section>

      {/* ── Feature Sections ── */}
      {FEATURE_SECTIONS.map((f, i) => {
        const Visual =
          f.visual === 'routes'     ? RoutesVisual
          : f.visual === 'tracking'   ? TrackingVisual
          : f.visual === 'driver'     ? DriverVisual
          : f.visual === 'reports'    ? ReportsVisual
          : f.visual === 'activity'   ? ActivityVisual
          : f.visual === 'connectors' ? ConnectorsVisual
          : f.visual === 'sms'        ? SMSVisual
          : SalesVisual

        const textBlock = (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              {f.tag}
            </div>
            <h2 className="text-[36px] md:text-[44px] font-bold tracking-tight leading-[1.15] text-zinc-900 dark:text-zinc-50 mb-5 whitespace-pre-line">
              {f.headline}
            </h2>
            {f.body.map((p, j) => (
              <p key={j} className="text-[16px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{p}</p>
            ))}
            <ul className="space-y-2.5 mt-6">
              {f.bullets.map(b => (
                <li key={b} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={11} className="text-emerald-500" />
                  </div>
                  <span className="text-[15px] text-zinc-700 dark:text-zinc-300">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )

        const visualBlock = <Visual />

        const bg = i % 2 === 0
          ? 'bg-white dark:bg-zinc-950'
          : 'bg-zinc-50 dark:bg-zinc-900'

        return (
          <section
            key={f.tag}
            id={i === 0 ? 'functionalitati' : undefined}
            className={`py-20 ${bg}`}
          >
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {f.flip
                  ? <>{visualBlock}{textBlock}</>
                  : <>{textBlock}{visualBlock}</>
                }
              </div>
            </div>
          </section>
        )
      })}

      {/* ── Livra Network ── */}
      <section id="retea" className="py-20 bg-gradient-to-br from-brand-orange to-violet-700">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[12px] font-medium text-white/80 mb-6">
              <Globe size={11} />
              Exclusiv pentru parteneri Livra
            </div>
            <h2 className="text-[36px] md:text-[44px] font-bold tracking-tight text-white mb-4 leading-tight">
              Nu ești doar un client.<br />Ești parte dintr-o rețea.
            </h2>
            <p className="text-[17px] text-blue-100 leading-relaxed max-w-2xl mx-auto mb-6">
              Companiile din rețeaua Livra nu concurează între ele, se completează. Fiecare partener nou aduce clienți noi pentru toți ceilalți. <strong className="text-white">Livra devine canalul tău de creștere, nu doar de livrare.</strong>
            </p>
          </div>

          {/* 5 feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NETWORK_BENEFITS.map(({ icon: Icon, title, desc, comingSoon }) => (
              <div key={title} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 flex gap-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[14px] font-semibold text-white">{title}</span>
                    {comingSoon && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-blue-100 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="preturi" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold tracking-tight mb-3">Prețuri transparente, fără surprize</h2>
          <p className="text-[16px] text-zinc-500 dark:text-zinc-400">
            Plătești per livrare, nu per lună. Fără abonament, fără contract.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Hero price */}
          <div className="bg-brand-orange rounded-3xl p-10 text-center mb-6">
            <p className="text-blue-200 text-[14px] font-medium mb-2">De la</p>
            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-[72px] font-bold text-white leading-none">10</span>
              <span className="text-[24px] text-blue-200 mb-3">MDL</span>
            </div>
            <p className="text-blue-100 text-[18px] font-medium mb-6">per livrare</p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-orange text-[15px] font-semibold rounded-xl hover:bg-orange-50 transition-colors"
            >
              Solicită ofertă <ArrowRight size={16} />
            </a>
          </div>

          {/* How credits work */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
            <h3 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-50 mb-6">Cum funcționează creditele?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                {
                  num: '1',
                  title: '1 credit = 1 livrare',
                  desc: 'Fiecare livrare optimizată consumă un singur credit, indiferent de distanță sau complexitate.',
                },
                {
                  num: '2',
                  title: 'Cumperi în avans',
                  desc: 'Alegi câte credite vrei și le plătești o singură dată. Cu cât cumperi mai multe, cu atât prețul per livrare scade.',
                },
                {
                  num: '3',
                  title: 'Nu expiră niciodată',
                  desc: 'Creditele rămân în contul tău până le folosești. Nu există presiune de timp și nu pierzi nimic.',
                },
              ].map(item => (
                <div key={item.num} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400 text-[14px] font-bold flex items-center justify-center flex-shrink-0">
                    {item.num}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{item.title}</p>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                {[
                  'Aplicație mobilă șofer inclusă în orice pachet',
                  'Urmărire live pentru clienți inclusă',
                  'Integrări e-commerce și webhook incluse',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                    <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href="#contact"
                className="flex-shrink-0 px-5 py-2.5 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[13px] font-medium rounded-xl hover:border-orange-400 hover:text-brand-orange transition-colors"
              >
                Contactează-ne pentru ofertă
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Onboarding ── */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 text-[12px] font-medium text-brand-orange dark:text-orange-400 mb-5">
              Onboarding inclus
            </div>
            <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Noi ne ocupăm de tot.<br />
              <span className="text-zinc-400">Tu nu faci nimic singur.</span>
            </h2>
            <p className="text-[16px] text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Când te decizi să lucrezi cu noi, echipa Livra vine la tine, fizic sau online, și se asigură că totul funcționează din prima zi.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-zinc-200 dark:bg-zinc-700 mx-[10%]" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {ONBOARDING_STEPS.map((s, i) => (
                <div key={s.num} className="relative flex flex-col items-start lg:items-center">
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center mb-5 flex-shrink-0">
                    <span className="text-white text-[13px] font-bold tracking-wider">{s.num}</span>
                  </div>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <div className="lg:hidden absolute left-8 top-16 w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
                  )}
                  <div className="lg:text-center">
                    <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50 mb-2 leading-snug">{s.title}</h3>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom callout */}
          <div className="mt-14 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Nu pierzi nicio zi de muncă în perioada de tranziție.</p>
              <p className="text-[14px] text-zinc-500 dark:text-zinc-400">Onboardingul se face în paralel cu activitatea ta curentă. Când suntem gata, facem switch.</p>
            </div>
            <a
              href="#contact"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-[14px] font-medium rounded-xl transition-colors"
            >
              Solicită demo <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-[28px] font-bold tracking-tight text-center mb-10">Întrebări frecvente</h2>
          <div>
            {FAQS.map(faq => <Faq key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA / Contact ── */}
      <section id="contact" className="py-20 max-w-6xl mx-auto px-6">
        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-12 text-center">
          <h2 className="text-[32px] font-bold text-white mb-3">Gata să optimizezi livrările?</h2>
          <p className="text-[16px] text-zinc-400 mb-8 max-w-lg mx-auto">
            Lasă-ne adresa de email și te contactăm în maxim 24 de ore pentru un demo personalizat.
          </p>
          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-medium">Mulțumim! Te contactăm în curând.</p>
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true) }}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1 w-full">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@compania.md"
                  className="w-full pl-9 pr-4 py-3 bg-zinc-800 dark:bg-zinc-700 border border-zinc-700 dark:border-zinc-600 rounded-xl text-white placeholder:text-zinc-500 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-[14px] font-medium rounded-xl transition-colors whitespace-nowrap"
              >
                Solicită demo
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
            <svg width="32" height="4" viewBox="0 0 32 4"><line x1="0" y1="2" x2="25" y2="2" stroke="#ff5c2c" strokeWidth="1.5"/><polygon points="25,0 32,2 25,4" fill="#ff5c2c"/></svg>
          </div>
          <p className="text-[12px] text-zinc-400">© {new Date().getFullYear()} Livra. Toate drepturile rezervate.</p>
          <div className="flex items-center gap-4 text-[12px] text-zinc-400">
            <a href="#" className="hover:text-zinc-600 transition-colors">Confidențialitate</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Termeni</a>
            <a href="mailto:contact@livra.md" className="hover:text-zinc-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
