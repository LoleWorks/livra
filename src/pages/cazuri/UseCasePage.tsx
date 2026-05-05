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
  howItWorks?: Array<{ step: string; title: string; desc: string }>
  features?: Array<{ title: string; desc: string }>
  faq?: Array<{ q: string; a: string }>
}

const USE_CASES: Record<string, UseCaseData> = {
  'optimizare-rute': {
    slug: 'optimizare-rute',
    seo: {
      title: 'Optimizare Rute Livrare Moldova | Software Livra',
      description: 'Livra calculeaza ruta optima pentru toti soferii tai in 5 secunde. Timpi reali de parcurs pe drumurile din Moldova, cu 30% mai putini km si 2 ore economisite zilnic.',
    },
    badge: 'Functionalitate principala',
    headline: 'Ruta optima pentru toti soferii tai in 5 secunde.',
    subline: 'Planificarea manuala cu Excel si Google Maps consuma 2 ore zilnic si produce rute ineficiente. Livra calculeaza ruta optima pentru 200 de livrari si toti soferii tai in 5 secunde, pe baza timpilor reali de parcurs din Moldova.',
    color: 'blue',
    icon: Route,
    painPoints: [
      {
        title: 'Planificarea manuala consuma 2 ore din fiecare zi',
        desc: 'Logisticianul sta in fiecare dimineata cu Google Maps deschis: ce sofer merge unde, in ce ordine, pe ce strada. Calcule pe hartie, modificari, apeluri. Doua ore pierdute inainte sa inceapa ziua.',
      },
      {
        title: 'Rutele haotice inseamna combustibil risipit',
        desc: 'Ai 10 livrari in aceeasi zona, dar soferii tai le fac in 3 curse separate in momente diferite ale zilei. De trei ori mai mult combustibil, de trei ori mai mult timp, pentru aceleasi livrari.',
      },
      {
        title: 'Planificarea manuala nu poate tine pasul cu cresterea',
        desc: 'La 5 soferi, planificarea manuala este dificila. La 15 soferi si 200 de comenzi pe zi, devine imposibila. Nu poti creste flota fara sa cresti si echipa de logistica.',
      },
    ],
    benefits: [
      {
        title: 'Un singur click, toate rutele generate',
        desc: 'Incarci comenzile zilei si apesi «Optimizeaza». In 5 secunde, Livra genereaza ruta optima pentru fiecare sofer al tau. Fiecare sofer stie exact ce livrari are si in ce ordine le face. Logisticianul tau face altceva cu cele 2 ore economisite.',
      },
      {
        title: 'Timpi reali pe drumurile din Moldova',
        desc: 'Livra nu calculeaza distante in linie dreapta. Stie ca Stefan cel Mare este aglomerat de la 8 la 10 dimineata, ca in Botanica traficul este diferit fata de Centru. Rutele sunt calculate pe timpii reali de parcurs, nu pe estimari.',
      },
      {
        title: 'Aceeasi flota, capacitate mai mare',
        desc: 'Cu rute optimizate, fiecare sofer al tau livreaza cu 30% mai putini kilometri si reuseste sa faca mai multe livrari pe zi. Nu trebuie sa angajezi soferi noi ca sa cresti volumul. Flota pe care o ai deja lucreaza mai eficient.',
      },
    ],
    stats: [
      { value: '5 sec', label: 'generare rute pentru 200 comenzi' },
      { value: '-30%', label: 'kilometri parcursi' },
      { value: '2h', label: 'timp economisit zilnic' },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Incarci comenzile zilei',
        desc: 'Adaugi comenzile manual, le importi din sistemul tau sau vin automat din WooCommerce. Fiecare comanda are adresa si, optional, o fereastra orara.',
      },
      {
        step: '02',
        title: 'Livra optimizeaza toate rutele',
        desc: 'Algoritmul analizeaza toate comenzile, toti soferii disponibili si timpii reali de parcurs. In 5 secunde genereaza ruta optima pentru fiecare sofer, tinand cont de ferestele orare si prioritati.',
      },
      {
        step: '03',
        title: 'Fiecare sofer primeste ruta pe telefon',
        desc: 'Soferii tai vad ruta zilei direct in aplicatia Livra: adresele in ordinea optima, navigatia integrata si detaliile fiecarei comenzi.',
      },
      {
        step: '04',
        title: 'Tu urmaresti progresul in timp real',
        desc: 'Pe harta din tabloul de bord vezi toti soferii tai, statusul fiecarei livrari si poti interveni daca apar modificari pe parcursul zilei.',
      },
    ],
    features: [
      {
        title: 'Algoritm VRP cu timpi reali',
        desc: 'Livra foloseste un algoritm de tip Vehicle Routing Problem (VRP) cu durate reale de parcurs pe drumurile din Moldova, nu distante teoretice.',
      },
      {
        title: 'Respectarea ferestelor orare',
        desc: 'Daca o comanda trebuie livrata intr-un interval orar specific, Livra construieste ruta astfel incat soferul sa ajunga in acea fereastra.',
      },
      {
        title: 'Prioritizare comenzi urgente',
        desc: 'Comenzile marcate ca urgente sunt plasate automat primele in ruta soferului, fara sa destabilizeze restul traseului optimizat.',
      },
      {
        title: 'Distribuire automata intre soferi',
        desc: 'Livra distribuie comenzile intre toti soferii disponibili in functie de zona, capacitate si volumul de lucru, echilibrand incarcatura flotei.',
      },
      {
        title: 'Reoptimizare pe parcursul zilei',
        desc: 'Daca apare o comanda noua sau un sofer intarzie, poti reoptimiza rutele ramase fara sa le afectezi pe cele deja in desfasurare.',
      },
      {
        title: 'Raport de eficienta zilnic',
        desc: 'La finalul zilei primesti automat: km parcursi per sofer, numar de livrari, timp mediu per oprire si economiile de combustibil estimate.',
      },
    ],
    faq: [
      {
        q: 'Cat dureaza calculul rutelor pentru o flota mare?',
        a: 'Pentru 200 de comenzi si 10 soferi, Livra genereaza rutele in aproximativ 5 secunde. Pentru volume mai mari timpul poate creste, dar raman in limita a cateva zeci de secunde.',
      },
      {
        q: 'Livra tine cont de traficul real din Chisinau?',
        a: 'Da. Livra foloseste timpi reali de parcurs pe drumurile din Moldova, nu distante in linie dreapta. Stie ca anumite artere sunt aglomerate la anumite ore si calculeaza rutele in consecinta.',
      },
      {
        q: 'Ce se intampla daca apare o comanda noua dupa ce rutele au fost generate?',
        a: 'Poti adauga comanda noua si reoptimiza rutele ramase cu un singur click. Livra recalculeaza doar traseele nefinalizate, fara sa modifice livrarile deja in curs.',
      },
      {
        q: 'Pot sa impun o fereastra orara pentru anumite livrari?',
        a: 'Da. Fiecare comanda poate avea o fereastra orara specifica. Livra construieste ruta astfel incat soferul sa respecte toate intervalele promise.',
      },
      {
        q: 'Functioneaza si pentru flote mari, de exemplu 50 de soferi?',
        a: 'Da. Livra gestioneaza flote de orice dimensiune. Cu cat ai mai multi soferi si mai multe comenzi, cu atat optimizarea produce economii mai mari de combustibil si timp.',
      },
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

      {/* How it works */}
      {useCase.howItWorks && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-4">Cum functioneaza</h2>
          <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl">
            De la comenzile zilei la soferii pe drum, totul in cateva secunde.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCase.howItWorks.map(step => (
              <div key={step.step}>
                <span className="text-[56px] font-black leading-none block text-[#ff5c2c] opacity-30 mb-3">{step.step}</span>
                <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      {useCase.features && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-4">Ce poti face cu Livra</h2>
          <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl">
            Toate instrumentele de care ai nevoie pentru a optimiza livrarile flotei tale.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCase.features.map(feat => (
              <div key={feat.title} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${colorClass[colorKey]} border-0`}>
                  <useCase.icon size={16} />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{feat.title}</h3>
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {useCase.faq && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Intrebari frecvente</h2>
          <div className="max-w-3xl space-y-6">
            {useCase.faq.map(item => (
              <div key={item.q} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{item.q}</h3>
                <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
