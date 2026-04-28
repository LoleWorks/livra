import { Helmet } from 'react-helmet-async'
import { useParams, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import LandingNav from '../../components/LandingNav'
import {
  Route, Eye, Zap, Users, Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    badge: 'Funcționalitate principală',
    headline: 'Ruta optimă calculată în câteva secunde',
    subline: 'OR-Tools VRP cu OSRM. Nu distanțe în linie dreaptă — timpi reali pe drumuri reale din Moldova.',
    color: 'blue',
    icon: Route,
    painPoints: [
      {
        title: 'Planificare manuală a rutelor',
        desc: 'Logisticienii petrec 1-2 ore zilnic alocând comenzi și trasând rute în Google Maps.',
      },
      {
        title: 'Comenzi livrate în ordine greșită',
        desc: 'Fără rută optimă, un drum care putea dura 3 ore durează 5.',
      },
      {
        title: 'Imposibil de scalat',
        desc: 'Cu 5 șoferi merge. Cu 15 și 200 de comenzi pe zi, planificarea devine imposibilă.',
      },
    ],
    benefits: [
      {
        title: 'Un click, toate rutele generate',
        desc: 'Logistician apasă «Optimizează» și Livra alocă comenzile și calculează ruta optimă.',
      },
      {
        title: 'Timpi reali OSRM',
        desc: 'Algoritmul folosește durate reale de parcurs, nu estimări. Știe unde e trafic.',
      },
      {
        title: 'Scalare imediată',
        desc: 'Același click funcționează pentru 5 sau 500 de comenzi. Livra gestionează complexitatea.',
      },
    ],
    stats: [
      { value: '< 5 sec', label: 'generare rute' },
      { value: '40%', label: 'reducere km' },
      { value: '3×', label: 'scalabilitate' },
    ],
  },
  'tracking-live': {
    slug: 'tracking-live',
    seo: {
      title: 'Tracking Live Comenzi | Urmărire în Timp Real Livra',
      description: 'Clienții văd șoferul pe hartă. Link SMS, notificări automate la 30 minute, −80% apeluri «unde e coletul».',
    },
    badge: 'Client experience',
    headline: 'Clienții văd șoferul pe hartă, în timp real',
    subline: 'Un link unic trimis prin SMS. Nicio aplicație. Clienții știu exact când ajunge coletul.',
    color: 'green',
    icon: Eye,
    painPoints: [
      {
        title: '«Unde e comanda mea?»',
        desc: 'Cel mai frecvent apel. Fiecare răspuns costă timp și bani.',
      },
      {
        title: 'Clienți care nu sunt acasă',
        desc: 'Șoferul ajunge, nimeni nu deschide. Returul costă o cursă întreagă.',
      },
      {
        title: 'Ferestre de livrare prea largi',
        desc: '«Vine undeva azi» nu mai este acceptabil. Clienții vor precizie.',
      },
    ],
    benefits: [
      {
        title: 'Link de tracking prin SMS',
        desc: 'Clientul primește SMS cu link unic. Deschide browserul și vede șoferul pe hartă.',
      },
      {
        title: 'Notificare la 30 minute',
        desc: 'SMS automat când șoferul e la 30 minute. Clientul are timp să ajungă acasă.',
      },
      {
        title: 'ETA actualizat în timp real',
        desc: 'Ora estimată se recalculează la fiecare 60 secunde în funcție de trafic.',
      },
    ],
    stats: [
      { value: '−80%', label: 'apeluri inbound' },
      { value: '95%', label: 'clienți acasă prima cursă' },
      { value: '0', label: 'aplicații de instalat' },
    ],
  },
  'integrare-woocommerce': {
    slug: 'integrare-woocommerce',
    seo: {
      title: 'Integrare WooCommerce & OpenCart | Livra Plugin',
      description: 'Plugin WooCommerce gata de instalat. Comenzile ajung direct în Livra. Statusuri sincronizate bidirecțional.',
    },
    badge: 'Integrare e-commerce',
    headline: 'Comenzile din magazin ajung direct în Livra',
    subline: 'Plugin WooCommerce și extensie OpenCart. Fiecare comandă nouă apare automat în tabloul de bord.',
    color: 'orange',
    icon: Zap,
    painPoints: [
      {
        title: 'Copiere manuală a comenzilor',
        desc: 'Angajații exportă din WooCommerce și introduc în altă parte. Erori, duplicări, timp pierdut.',
      },
      {
        title: 'Statusuri nesincronizate',
        desc: 'Comanda e livrată în realitate, dar în WooCommerce apare «în procesare».',
      },
      {
        title: 'Mai multe sisteme, nicio coerență',
        desc: 'Stoc în WooCommerce, comenzi în Excel, livrări în altă parte. Imposibil de urmărit.',
      },
    ],
    benefits: [
      {
        title: 'Instalare în 5 minute',
        desc: 'Descarci pluginul, îl activezi, introduci cheia API. Gata. Comenzile apar automat.',
      },
      {
        title: 'Statusuri sincronizate bidirecțional',
        desc: 'Când șoferul marchează livrare, statusul se actualizează automat în WooCommerce.',
      },
      {
        title: 'Un singur loc pentru toate',
        desc: 'Indiferent de câte magazine ai, toate comenzile ajung în același tablou Livra.',
      },
    ],
    stats: [
      { value: '5 min', label: 'timp integrare' },
      { value: '0', label: 'introducere manuală' },
      { value: 'Live', label: 'sincronizare statusuri' },
    ],
  },
  'gestionare-soferi': {
    slug: 'gestionare-soferi',
    seo: {
      title: 'Gestionare Șoferi & Flotă | Management Livra',
      description: 'Hartă live cu localizarea fiecărui șofer. POD digital cu foto + semnătură. Rapoarte automate de performanță.',
    },
    badge: 'Managementul flotei',
    headline: 'Știi unde e fiecare șofer, la orice moment',
    subline: 'Localizare live, status livrare în timp real, rapoarte automate. Tot ce trebuie pentru gestionarea unei flote moderne.',
    color: 'purple',
    icon: Users,
    painPoints: [
      {
        title: 'Nu știi unde e niciun șofer',
        desc: 'Suni fiecare șofer pentru a afla statusul. Imposibil de scalat.',
      },
      {
        title: 'Nicio dovadă de livrare',
        desc: '«Am lăsat la ușă» nu e o dovadă. Fără confirmare, disputele cu clienții sunt greu de rezolvat.',
      },
      {
        title: 'Performanța șoferilor e un mister',
        desc: 'Nu știi care șofer e eficient, care pierde timp și unde apar problemele.',
      },
    ],
    benefits: [
      {
        title: 'Hartă live cu toți șoferii',
        desc: 'O singură pagină cu locația fiecărui șofer, comenzile active și statusul, în timp real.',
      },
      {
        title: 'Confirmare cu foto + semnătură',
        desc: 'Șoferul fotografiază și obține semnătura pe telefon. Dovada se salvează automat.',
      },
      {
        title: 'Rapoarte de performanță',
        desc: 'Livra calculează automat: livrări/zi, durata/oprire, deviații de rută, probleme.',
      },
    ],
    stats: [
      { value: 'Live', label: 'localizare flotă' },
      { value: '100%', label: 'livrări cu POD' },
      { value: 'Automat', label: 'rapoarte zilnice' },
    ],
  },
  'notificari-sms': {
    slug: 'notificari-sms',
    seo: {
      title: 'Notificări SMS Automate | Livra Livrare',
      description: '4 SMS-uri automate per comandă. Confirmație, plecare șofer, ETA 30 min, livrare. Branding personalizat.',
    },
    badge: 'Comunicare automată',
    headline: 'Clientul știe tot, fără să sune',
    subline: 'SMS automat la confirmație, plecare, ETA și livrare. Zero intervenție manuală. Branding personalizat.',
    color: 'blue',
    icon: Bell,
    painPoints: [
      {
        title: 'Clienții sună tot timpul',
        desc: 'Fiecare client vrea să știe unde e comanda. Costul acestor apeluri e enorm.',
      },
      {
        title: 'Clienți care nu sunt acasă',
        desc: 'Fără notificare prealabilă, șoferul ajunge și nu găsește pe nimeni.',
      },
      {
        title: 'Comunicare inconsistentă',
        desc: 'Unii clienți primesc apel, alții SMS manual, alții nimic. Fără standard.',
      },
    ],
    benefits: [
      {
        title: '4 SMS-uri automate per comandă',
        desc: 'Confirmare → Șofer plecat → 30 min ETA → Livrat. Totul automat.',
      },
      {
        title: 'Rata de prim-livrare',
        desc: 'Notificarea la 30 min înainte reduce dramatic cazurile în care clientul nu e acasă.',
      },
      {
        title: 'Branding personalizat',
        desc: 'SMS-urile ies cu numele magazinului tău, nu «Livra». Clientul asociază cu brandul tău.',
      },
    ],
    stats: [
      { value: '4', label: 'SMS-uri per comandă' },
      { value: '+25%', label: 'rată prim-livrare' },
      { value: '0', label: 'apeluri manuale' },
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
        <p className="text-[18px] text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
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
            Contactează vânzări
          </a>
        </div>
      </section>

      {/* Pain points */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Provocări comune</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCase.painPoints.map(point => (
            <div key={point.title} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6">
              <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {point.title}
              </h3>
              <p className="text-[14px] text-zinc-600 dark:text-zinc-400">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Beneficii Livra</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCase.benefits.map(benefit => (
            <div key={benefit.title} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {benefit.title}
              </h3>
              <p className="text-[14px] text-zinc-600 dark:text-zinc-400">
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
          Gata să începi?
        </h2>
        <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-8">
          Configurează-ți Livra în 5 minute. Nu este nevoie de card de credit.
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white text-[16px] font-medium rounded-xl transition-colors"
        >
          Solicită demo <ArrowRight size={18} />
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
