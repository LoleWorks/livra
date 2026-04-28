import { Helmet } from 'react-helmet-async'
import { useParams, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import LandingNav from '../../components/LandingNav'
import {
  Package, Pill, Flower, ShoppingCart, Truck,
} from 'lucide-react'

interface IndustryData {
  slug: string
  seo: { title: string; description: string }
  badge: string
  headline: string
  subline: string
  color: string
  icon: LucideIcon
  painPoints: Array<{ title: string; desc: string }>
  solutions: Array<{ title: string; desc: string }>
  stats: Array<{ value: string; label: string }>
}

const INDUSTRIES: Record<string, IndustryData> = {
  ecommerce: {
    slug: 'ecommerce',
    seo: {
      title: 'Livra pentru Magazine Online | WooCommerce & OpenCart',
      description: 'Conectează WooCommerce sau OpenCart la Livra. Comenzile sunt trimise automat, rutele optimizate, și clienții văd urmărirea live.',
    },
    badge: 'Soluție pentru magazine online',
    headline: 'De la comandă la livrare, fără nicio intervenție manuală',
    subline: 'Livra se conectează la WooCommerce sau OpenCart și preia fiecare comandă automat. Tu te concentrezi pe vânzări, Livra livrează.',
    color: 'orange',
    icon: Package,
    painPoints: [
      {
        title: 'Comenzi introduse manual',
        desc: 'Angajații copiază fiecare comandă din site în Excel sau agende. Erori, timp pierdut și comenzi ratate la ore de vârf.',
      },
      {
        title: 'Clienții sună după colet',
        desc: '«Unde e comanda mea?» — cel mai frecvent apel. Fiecare răspuns costă 3-5 minute.',
      },
      {
        title: 'Rute neoptime',
        desc: 'Șoferii pleacă în ordine aleatorie, consumă mai mult combustibil și fac mai puține livrări pe zi.',
      },
    ],
    solutions: [
      {
        title: 'Integrare automată',
        desc: 'Pluginul Livra trimite comenzile direct din WooCommerce în tabloul de bord. Zero copiere manuală.',
      },
      {
        title: 'Tracking live pentru clienți',
        desc: 'Fiecare client primește un link cu șoferul pe hartă și notificări la fiecare etapă.',
      },
      {
        title: 'Optimizare AI a rutelor',
        desc: 'Ruta optimă pentru zeci de livrări în câteva secunde. Șoferii livrează mai mult cu mai puțin.',
      },
    ],
    stats: [
      { value: '40%', label: 'mai puțin timp risipit' },
      { value: '3×', label: 'mai multe livrări/șofer' },
      { value: '0', label: 'apeluri «unde e coletul»' },
    ],
  },
  farmacii: {
    slug: 'farmacii',
    seo: {
      title: 'Livra pentru Farmacii | Livrare Urgentă Medicamentoasă',
      description: 'Livrare rapidă de medicamente cu prioritate, POD digital și notificări automate pentru pacienți.',
    },
    badge: 'Soluție pentru farmacii',
    headline: 'Livrare medicamentoasă rapidă și urmăribilă',
    subline: 'Medicamentele nu pot aștepta. Livra prioritizează automat comenzile urgente și asigură dovezi de livrare.',
    color: 'green',
    icon: Pill,
    painPoints: [
      {
        title: 'Comenzile urgente nu au prioritate',
        desc: 'Toate comenzile ajung în aceeași ordine. Riscul de a livra o rețetă urgentă la ora greșită.',
      },
      {
        title: 'Nicio dovadă de livrare',
        desc: 'Nu poți dovedi că medicamentele au ajuns la pacient, la ora și în starea corectă.',
      },
      {
        title: 'Pacienții nu știu când vine șoferul',
        desc: 'Pacienții așteaptă ore întregi fără a ști ora de sosire exactă.',
      },
    ],
    solutions: [
      {
        title: 'Priorități de livrare',
        desc: 'Marchezi comenzile urgente iar Livra le include automat primele în ruta șoferului.',
      },
      {
        title: 'POD digital — fotografie + semnătură',
        desc: 'Șoferul fotografiază predarea și obține semnătura electronică.',
      },
      {
        title: 'Notificare 30 min înainte',
        desc: 'Pacientul primește SMS când șoferul e la 30 minute distanță.',
      },
    ],
    stats: [
      { value: '< 2h', label: 'livrare urgentă' },
      { value: '100%', label: 'comenzi cu dovadă' },
      { value: '30 min', label: 'aviz înainte' },
    ],
  },
  florarii: {
    slug: 'florarii',
    seo: {
      title: 'Livra pentru Florării | Livrare la Timp Garantată',
      description: 'Livrări de flori la intervalul exact promis. Planificare automată pentru zile de vârf, confirmare cu fotografie.',
    },
    badge: 'Soluție pentru florării',
    headline: 'Livrări la timp, pentru momente ce nu pot fi ratate',
    subline: 'O zi de naștere sau aniversare nu se poate reprograma. Livra asigură că aranjamentele ajung exact la ora promisă.',
    color: 'pink',
    icon: Flower,
    painPoints: [
      {
        title: 'Orar de livrare imposibil de respectat',
        desc: 'Clienții cer livrare «între 14:00 și 15:00» iar tu nu ai vizibilitate asupra respectării intervalului.',
      },
      {
        title: 'Produse fragile fără confirmare',
        desc: 'Nu știi dacă aranjamentul a ajuns intact și a fost predat persoanei corecte.',
      },
      {
        title: 'Planificare manuală haotică',
        desc: 'De Valentine sau 8 Martie, zeci de comenzi cu ore fixe devin imposibil de gestionat.',
      },
    ],
    solutions: [
      {
        title: 'Ferestre de livrare cu orar',
        desc: 'Fiecare comandă poate primi interval orar. Livra planifică ruta respectând toate intervalele.',
      },
      {
        title: 'Foto la predare',
        desc: 'Șoferul fotografiază predarea. Clientul primește confirmarea că aranjamentul a ajuns.',
      },
      {
        title: 'Planificare automată pentru zile de vârf',
        desc: 'Upload CSV. Livra generează rutele optimizate în câteva secunde.',
      },
    ],
    stats: [
      { value: '98%', label: 'livrări la intervalul promis' },
      { value: '0', label: 'reclamații privind predarea' },
      { value: '5 sec', label: 'timp de planificare' },
    ],
  },
  grocery: {
    slug: 'grocery',
    seo: {
      title: 'Livra pentru Grocery & Supermarketuri | Livrare în 2h',
      description: 'Livrare rapidă în fereastra promisă de 2 ore. Consolidare automată de comenzi, optimizare pentru traficul din Chișinău.',
    },
    badge: 'Soluție pentru grocery',
    headline: 'Livrare rapidă, în fereastra promisă',
    subline: 'Clienții se așteaptă la livrare în 2-4 ore. Livra optimizează rutele zilnice și menține clienții informați.',
    color: 'blue',
    icon: ShoppingCart,
    painPoints: [
      {
        title: 'Ferestre de livrare prea largi',
        desc: 'Clienții nu acceptă să aștepte toată ziua. Fără optimizare, nu poți promite interval mai mic de 6 ore.',
      },
      {
        title: 'Mai multe comenzi pe aceeași adresă',
        desc: 'Clienți din același bloc comandă separat dar sunt livrate în curse diferite.',
      },
      {
        title: 'Șoferi ineficienți în zone aglomerate',
        desc: 'Fără hartă optimizată, șoferii din Centru pierd ore în trafic.',
      },
    ],
    solutions: [
      {
        title: 'Ferestre de 2 ore garantate',
        desc: 'Livra grupează comenzile pe zone și calculează ruta pentru fiecare oprire.',
      },
      {
        title: 'Consolidare automată a adreselor',
        desc: 'Comenzi pe aceeași adresă sunt grupate automat într-o singură oprire.',
      },
      {
        title: 'Optimizare pentru traficul din Chișinău',
        desc: 'Algoritmul folosește durate reale OSRM, nu distanțe în linie dreaptă.',
      },
    ],
    stats: [
      { value: '2h', label: 'fereastră de livrare' },
      { value: '30%', label: 'mai puțin combustibil' },
      { value: '2×', label: 'comenzi/zi/șofer' },
    ],
  },
  b2b: {
    slug: 'b2b',
    seo: {
      title: 'Livra pentru Distribuție B2B | Management Flotă Complet',
      description: 'Control complet asupra flotei cu localizare live, rapoarte automate și POD digital pentru parteneri.',
    },
    badge: 'Soluție pentru distribuție B2B',
    headline: 'Flotă mare, control complet',
    subline: 'Distribui produse la zeci de puncte zilnic. Livra îți oferă vizibilitate asupra flotei și rapoarte automate.',
    color: 'purple',
    icon: Truck,
    painPoints: [
      {
        title: 'Nicio vizibilitate asupra flotei',
        desc: 'Nu știi unde e fiecare șofer. Clienții cer ETA-uri precise pe care nu le poți da.',
      },
      {
        title: 'Rapoarte de livrare manuale',
        desc: 'La finalul zilei, șoferii completează foi de parcurs. Colectarea durează ore.',
      },
      {
        title: 'Clienți cer dovezi de livrare',
        desc: 'Partenerii cer confirmare că marfa a ajuns, cine a semnat și la ce oră.',
      },
    ],
    solutions: [
      {
        title: 'Hartă live a flotei',
        desc: 'Fiecare șofer apare pe hartă în timp real. ETA se actualizează automat.',
      },
      {
        title: 'Rapoarte automate',
        desc: 'Livra generează raport complet: livrări, durate, kilometri, devieri.',
      },
      {
        title: 'POD digital pentru fiecare client',
        desc: 'Semnătură electronică + fotografie, asociate automat la comandă.',
      },
    ],
    stats: [
      { value: 'Live', label: 'localizare flotă' },
      { value: '0', label: 'rapoarte manuale' },
      { value: '100%', label: 'livrări cu POD' },
    ],
  },
}

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>()
  const industry = slug ? INDUSTRIES[slug] : null

  if (!industry) return <Navigate to="/" />

  const colorClass = {
    orange: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
    green: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
    pink: 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border-pink-300 dark:border-pink-700',
    blue: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    purple: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
  }

  const colorKey = industry.color as keyof typeof colorClass

  return (
    <>
      <Helmet>
        <title>{industry.seo.title}</title>
        <meta name="description" content={industry.seo.description} />
      </Helmet>

      <LandingNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorClass[colorKey]} border mb-6`}>
          <industry.icon size={14} />
          {industry.badge}
        </div>
        <h1 className="text-[48px] md:text-[56px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
          {industry.headline}
        </h1>
        <p className="text-[18px] text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
          {industry.subline}
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
          {industry.painPoints.map(point => (
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

      {/* Solutions */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Cum rezolvă Livra</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {industry.solutions.map(sol => (
            <div key={sol.title} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {sol.title}
              </h3>
              <p className="text-[14px] text-zinc-600 dark:text-zinc-400">
                {sol.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-3 gap-8">
          {industry.stats.map(stat => (
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
          Gata să optimizezi livrările?
        </h2>
        <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-8">
          Încearcă Livra gratuit pentru 7 zile. Nu este nevoie de card de credit.
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
