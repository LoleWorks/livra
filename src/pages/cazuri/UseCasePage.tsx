import { Helmet } from 'react-helmet-async'
import { useParams, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import LandingNav from '../../components/LandingNav'
import {
  Route, Eye, Zap, Users, Bell,
} from 'lucide-react'

interface UseCaseData {
  slug: string
  seo: { title: string; description: string }
  badge: string
  headline: string
  subline: string
  color: string
  icon: LucideIcon
  painPoints: Array<{ title: string; desc: string }>
  benefits: Array<{ title: string; desc: string }>
  stats: Array<{ value: string; label: string }>
}

const USE_CASES: Record<string, UseCaseData> = {
  'optimizare-rute': {
    slug: 'optimizare-rute',
    seo: {
      title: 'Optimizare Rute Livrare | Software Livra',
      description: 'OR-Tools VRP cu OSRM. Timpi reali de parcurs, rute optimizate în secundă, 40% mai puțin combustibil.',
    },
    badge: 'Inima Livra',
    headline: 'Ruta optimă în 5 secunde. Nu în 2 ore.',
    subline: 'Oamenii cu Excel și Google Maps pierd 2 ore zilnic. Livra calculează ruta optimă pentru 200 de livrări în 5 secunde. 30% mai puțin km. Punct. Gata.',
    color: 'blue',
    icon: Route,
    painPoints: [
      {
        title: 'Planificare manuală = pierdere de timp',
        desc: 'Logistician stă 2 ore zilnic: «Pe cine trimit pe această rută?» Drag pe Google Maps, calcule pe hârtie, schimbări. Asta se întâmplă zilnic.',
      },
      {
        title: 'Rute haotice = pierdere de bani',
        desc: 'Ai 10 livrări în aceeași zonă dar le trimit în 3 curse diferite. 3 galoane de benzină în loc de 1. Asta-i bani iroșiți zilnic.',
      },
      {
        title: 'Imposibil să crești',
        desc: 'La 5 șoferi merge planificare manuală. La 15 șoferi și 200 de comenzi, crezi că un om poate planifica? Nu. Te-ai blocat la creștere.',
      },
    ],
    benefits: [
      {
        title: 'Un click, toate rutele gata',
        desc: 'Tu apesi «Optimizează». Livra calculează ruta optimă pentru toți șoferii. Fiecare șofer știe exact pe cine să viziteze și în ce ordine. Aia e. Nu mai vorbesc cu logistician. Nu mai așteptă comenzi.',
      },
      {
        title: 'Timpi reali, nu estimări',
        desc: 'Nu distanțe în linie dreaptă. Livra ȘTIE că Ștefan cel Mare e plin de 9-10 dimineața. Că la Centru e trafic. Calculează după durate reale din Moldova. Rutele sunt corecte.',
      },
      {
        title: 'Scalare fără limită',
        desc: 'Ai 5 șoferi? Click. Ai 50 șoferi? Același click. Livra gestionează complexitatea. Tu doar lucrezi. Aia-i business scaling.',
      },
    ],
    stats: [
      { value: '5 sec', label: 'generare rute 200 comenzi' },
      { value: '−30%', label: 'kilometri parcurși' },
      { value: '2h', label: 'timp economisit zilnic' },
    ],
  },
  'tracking-live': {
    slug: 'tracking-live',
    seo: {
      title: 'Tracking Live Comenzi | Urmărire în Timp Real Livra',
      description: 'Clienții văd șoferul pe hartă. Link SMS, notificări automate la 30 minute, −80% apeluri «unde e coletul».',
    },
    badge: 'Client experience',
    headline: '«Unde e coletul?» — răspunsul e în SMS.',
    subline: 'Clintul primește link și vede șoferul pe hartă ACUM. Nu mai sună. Nu mai așteptă. Nu mai e stres. Tu economisești 100 apeluri pe zi.',
    color: 'green',
    icon: Eye,
    painPoints: [
      {
        title: '«Unde e comanda mea?» — 100 apeluri zilnic',
        desc: 'Fiecare apel = 5 minute din ziua ta. 100 apeluri = 8 ore. Tu stai la telefon cu clienții în loc să faci altceva. Si clintul e frustrat că nu știe.',
      },
      {
        title: 'Clienți care nu sunt acasă = pierdere dublă',
        desc: 'Șoferul ajunge, nimeni nu deschide. Returul. Tu pierzi timp, combustibil și încredere clientului. Fără notificare prealabilă, asta se întâmplă constant.',
      },
      {
        title: 'Clienți care nu se mai întorc',
        desc: 'Nu știind când vine, clientul comandă de la altcineva care-l notifică. Livra move. Incertitudinea = pierdere de client.',
      },
    ],
    benefits: [
      {
        title: 'Clientul vede pe hartă. Real-time.',
        desc: 'SMS cu link. Clientul deschide browserul. Vede pe hartă unde e șoferul ACUM. Vede ETA-ul actualizat la fiecare 60 de secunde. Zero incertitudine. Client calm.',
      },
      {
        title: '−80% apeluri inbound',
        desc: 'Clienții nu mai sună. Vor să știe unde e? Deschid linkul. Nu-ți mai ocupă linia. Nu-ți mai pierzi angajații cu «unde e coletul mea». Tu scapi de 8 ore de telefon zilnic.',
      },
      {
        title: '+25% prim-livrare',
        desc: 'Notificare la 30 minute: «Șoferul e la 30 de minute distanță». Clientul stie. E acasă când ajunge. Prim-livrare. Asta-i profit.',
      },
    ],
    stats: [
      { value: '−80%', label: 'apeluri «unde e coletul»' },
      { value: '+25%', label: 'prim-livrare rate' },
      { value: 'Real-time', label: 'ETA pe hartă' },
    ],
  },
  'integrare-woocommerce': {
    slug: 'integrare-woocommerce',
    seo: {
      title: 'Integrare WooCommerce & OpenCart | Livra Plugin',
      description: 'Plugin WooCommerce gata de instalat. Comenzile ajung direct în Livra. Statusuri sincronizate bidirecțional.',
    },
    badge: 'Integrare e-commerce',
    headline: 'Instaleaza si uita-te cum lucrurile se intampla',
    subline: 'Nu mai introduci comenzi manual. Plugin-ul Livra se conectează la WooCommerce în 5 minute. Fiecare comandă nouă apare automat. Basta cu Excel.',
    color: 'orange',
    icon: Zap,
    painPoints: [
      {
        title: 'Copiere manuală = erori și pierderi',
        desc: 'Comenzi din WooCommerce trebuie copiate în altă parte. Angajatul se greșeste. Comandă se pierde. Client furious. Asta se întâmplă zilnic.',
      },
      {
        title: 'Statusuri nesincronizate = confuzie',
        desc: 'Comanda e livrată de fapt, dar în WooCommerce apare «în procesare». Client crede că e pierdută. Te sună. Tu zici că e livrată. Cine are dreptate? Nimeni. Chaos.',
      },
      {
        title: 'Mai multe sisteme = mai mult stres',
        desc: 'Stoc în WooCommerce. Comenzi în altă parte. Livrări în a treia parte. Niciodată nu știi versiunea corectă a adevărului.',
      },
    ],
    benefits: [
      {
        title: '5 minute setup, 0 ore munca',
        desc: 'Download plugin. Apesi activate. Introduci API key. Gata. Fiecare comandă nouă apare automat în Livra. Zero introducere manuală. Zero erori. Zero stres.',
      },
      {
        title: 'Statusuri sincronizate automat',
        desc: 'Șoferul marchează comanda ca livrată. Statusul se actualizează automat în WooCommerce. Clintul vede că e livrată. WooCommerce vede că e livrată. Un adevăr.',
      },
      {
        title: 'Un sistem, adevărul singular',
        desc: 'Tot ce conteaza e în Livra. Stoc, comenzi, livrări. Oamenii te vor cere statusul comenzii? Link tracking. Aia e. Nu mai zile cu 3 sisteme conflictuale.',
      },
    ],
    stats: [
      { value: '5 min', label: 'timp setup total' },
      { value: '0', label: 'introducere manuală' },
      { value: '100%', label: 'sincronizare automata' },
    ],
  },
  'gestionare-soferi': {
    slug: 'gestionare-soferi',
    seo: {
      title: 'Gestionare Șoferi & Flotă | Management Livra',
      description: 'Hartă live cu localizarea fiecărui șofer. POD digital cu foto + semnătură. Rapoarte automate de performanță.',
    },
    badge: 'Management',
    headline: 'Vrei să știi unde e fiecare șofer? Privesc pe hartă.',
    subline: 'O hartă cu toți șoferii. Unde sunt, ce livrări au, cum merg. Deschizi telefonul și-i vezi pe toți. Aia-i control real.',
    color: 'purple',
    icon: Users,
    painPoints: [
      {
        title: 'Nicio vizibilitate = nicio control',
        desc: 'Ai 10 șoferi pe rute. Tu nu știi unde sunt. Clientul îți zice «Unde e livrare mea?» și tu suni șoferul. Asta e sistem primitiv.',
      },
      {
        title: 'Nicio dovadă = dispute permanente',
        desc: 'Șoferul zice: «Am lăsat la ușă». Clientul zice: «Nu mi-a dat nimeni nimic». Tu ești în mijloc, neputincios. Fără dovadă, pierzi.',
      },
      {
        title: 'Care șofer e eficient? Nu știi',
        desc: 'Ai 5 șoferi. Care e mai rapid? Care pierde timp? Care are probleme? Fără date, nu poți face nimic.',
      },
    ],
    benefits: [
      {
        title: 'Hartă live = control total',
        desc: 'Deschizi appul. Vezi toți șoferii pe hartă ACUM. Unde sunt, ce livrări au, pana cand. ETA se actualizează live. Client te sună: «Unde-i șoferul?». Tu privești pe hartă și dai veste exactă.',
      },
      {
        title: 'POD digital = zero dispute',
        desc: 'Șoferul fotografiază comanda și obține semnătură pe telefon. Dovada se salvează. Clientul nu mai poate spune «Nu mi-a dat nimic». Tu ești protejat.',
      },
      {
        title: 'Rapoarte automate = management cu date',
        desc: 'La finalul zilei: care șofer a livrat cât, în cât timp, pe câți km. Care a avut probleme. Tu poți vedea perfor-anta pe numere, nu pe simțiri.',
      },
    ],
    stats: [
      { value: 'Live', label: 'hartă flotă 24/7' },
      { value: '100%', label: 'POD digital' },
      { value: 'Automat', label: 'rapoarte zilnice' },
    ],
  },
  'notificari-sms': {
    slug: 'notificari-sms',
    seo: {
      title: 'Notificări SMS Automate | Livra Livrare',
      description: '4 SMS-uri automate per comandă. Confirmație, plecare șofer, ETA 30 min, livrare. Branding personalizat.',
    },
    badge: 'Comunicare',
    headline: 'Clientul știe TOT. Tu nu mai răspunzi la telefon.',
    subline: '4 SMS-uri automate: comanda confirmată → șofer pe drum → sosire în 30 min → livrat. Clintul e liniștit. Tu ești liber.',
    color: 'blue',
    icon: Bell,
    painPoints: [
      {
        title: 'Clienți care sună tot ziua',
        desc: 'Fiecare client vrea să știe status-ul. Fiecare apel = 5 minute. 100 apeluri = 8 ore din ziua ta la telefon. Nu mai e productiv.',
      },
      {
        title: 'Clientul nu e acasă = livrare pierdută',
        desc: 'Fără notificare, clientul nu știe că vine. Șoferul ajunge, nimeni nu deschide. Returul. Pierdere dublă.',
      },
      {
        title: 'Comunicare inconsistenta = confuzie',
        desc: 'Unii clienți primesc apel, alții SMS manual, alții nimic. Fără standard, clientul e confuz si frustrat.',
      },
    ],
    benefits: [
      {
        title: '4 SMS automate = 0 apeluri',
        desc: 'Comandă confirmată → SMS. Șofer pe drum → SMS. Sosire în 30 min → SMS. Livrat → SMS. Clientul stie pe fiecare pas. Nu-ți sună. Tu nu mai stai la telefon.',
      },
      {
        title: '+25% prim-livrare rate',
        desc: 'Notificare la 30 minute: clientul e alertat. E acasă când vine șoferul. Prim-livrare. Asta-i success. Asta-i profit.',
      },
      {
        title: 'SMS cu brandul tău, nu cu Livra',
        desc: 'SMS-ul sună ca din parte ta: «Comanda ta de la [magazinul tău] e pe drum». Nu vede Livra. Vede brandul tău. Client vede profesionalism.',
      },
    ],
    stats: [
      { value: '4', label: 'SMS automate per comandă' },
      { value: '−100', label: 'apeluri zilnic' },
      { value: '+25%', label: 'prim-livrare' },
    ],
  },
}

export default function UseCasePage() {
  const { slug } = useParams<{ slug: string }>()
  const useCase = slug ? USE_CASES[slug] : null

  if (!useCase) return <Navigate to="/" />

  const colorClass = {
    blue: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    green: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
    orange: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
    purple: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
  }

  const colorKey = useCase.color as keyof typeof colorClass

  return (
    <>
      <Helmet>
        <title>{useCase.seo.title}</title>
        <meta name="description" content={useCase.seo.description} />
      </Helmet>

      <LandingNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorClass[colorKey]} border mb-6`}>
          <useCase.icon size={14} />
          {useCase.badge}
        </div>
        <h1 className="text-[48px] md:text-[56px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
          {useCase.headline}
        </h1>
        <p className="text-[18px] text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl leading-relaxed">
          {useCase.subline}
        </p>
        <div className="flex gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white text-[15px] font-medium rounded-xl transition-colors"
          >
            Solicită demo <ArrowRight size={16} />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[15px] font-medium rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Contactează echipa
          </a>
        </div>
      </section>

      {/* Pain points */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Problemele pe care le-ai acum</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCase.painPoints.map(point => (
            <div key={point.title} className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
              <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {point.title}
              </h3>
              <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Cum Livra schimbă jocul</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCase.benefits.map(benefit => (
            <div key={benefit.title} className={`rounded-xl p-6 border ${colorClass[colorKey]} bg-white/50 dark:bg-zinc-950/50`}>
              <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {benefit.title}
              </h3>
              <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-3 gap-8">
          {useCase.stats.map(stat => (
            <div key={stat.value} className="text-center">
              <div className="text-[40px] font-bold text-[#ff5c2c] mb-2">{stat.value}</div>
              <div className="text-[14px] text-zinc-600 dark:text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Vrei asta pentru afacerea ta?
        </h2>
        <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-8">
          Încarcă azi. Fără card. Fără contract. Doar solutia care merge.
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white text-[16px] font-medium rounded-xl transition-colors"
        >
          Încearcă acum <ArrowRight size={18} />
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-[13px] text-zinc-600 dark:text-zinc-400">
          © 2024 Livra. Optimizare rute de livrare pentru Moldova.
        </div>
      </footer>
    </>
  )
}
