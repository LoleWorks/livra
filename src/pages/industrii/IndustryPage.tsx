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
  howItWorks?: Array<{ step: string; title: string; desc: string }>
  features?: Array<{ title: string; desc: string }>
  faq?: Array<{ q: string; a: string }>
}

const INDUSTRIES: Record<string, IndustryData> = {
  ecommerce: {
    slug: 'ecommerce',
    seo: {
      title: 'Livra pentru Magazine Online | WooCommerce & OpenCart',
      description: 'Conectează WooCommerce sau OpenCart la Livra. Comenzile sunt trimise automat, rutele optimizate, și clienții văd urmărirea live.',
    },
    badge: 'Soluție pentru magazine online',
    headline: 'Livrări rapide. Clienți loiali. Afaceri care cresc.',
    subline: 'În Moldova, livrarea rapidă e cea mai bună reclame. Dar doar dacă o faci bine. Livra o automatizează total — comenzile din site direct la șoferi, rutele calculate în secunde, clienții văd unde e coletul lor.',
    color: 'orange',
    icon: Package,
    painPoints: [
      {
        title: '«Unde e comanda mea?»',
        desc: 'Fiecare client care sună = 5 minute din ziua ta și o vânzare mai puțin probabil. Clienții care nu primesc răspuns rapid nu se mai întorc. Și spun 10 prieteni că ești lent.',
      },
      {
        title: 'Livrări care ajung târziu = clienți pierduti',
        desc: 'Ai promis 2 zile, dar șoferul face 4 din cauza rutelor haotice? Clintul nu mai comandă. Merge la competitor mai rapid. Și lasă o recenzie proastă.',
      },
      {
        title: 'Black Friday = haos total',
        desc: 'Azi 800 de comenzi și 2 persoane le introduc manual. Erori, comenzi pierdute, clienți furioși, returnuri, pierdeți bani.',
      },
    ],
    solutions: [
      {
        title: 'Zero introducere manuală',
        desc: 'Pluginul se conectează la WooCommerce în 5 minute. Fiecare comandă nouă apare automat la șofer. Nu mai există erori din introducere manuală. Nici o dată nu pierzi vreun client din cauza unei greșeli administrative.',
      },
      {
        title: 'Clienți informați = clienți fericiți',
        desc: 'SMS automat: comandă confirmată → șofer pe drum → sosire în 30 minute → livrat. Clienții nu sună. Tu nu pierzi timp. Nu mai stau la telefon 8 ore pe zi.',
      },
      {
        title: 'Rute optimale în secunde',
        desc: 'Ai 200 de comenzi? Livra calculează ruta optimă pentru toți șoferii automat. 30% mai puțin km, mai multe livrări pe zi, mai puțin combustibil. Duminică livrezi cât ai livrat luni-vineri.',
      },
    ],
    stats: [
      { value: '−80%', label: 'apeluri «unde e coletul»' },
      { value: '+3×', label: 'livrări pe șofer pe zi' },
      { value: '5 min', label: 'timp setup total' },
    ],
  },
  farmacii: {
    slug: 'farmacii',
    seo: {
      title: 'Livra pentru Farmacii | Livrare Urgenta Medicamente Moldova',
      description: 'Livrare rapida de medicamente cu prioritizare urgente, dovada digitala de livrare si notificari automate pentru pacienti. Solutia completa pentru farmacii din Moldova.',
    },
    badge: 'Solutie pentru farmacii',
    headline: 'Medicamentul ajunge la timp. Intotdeauna.',
    subline: 'Diabeticul care asteapta insulina, bunica care asteapta pastilele de tensiune, vietile care depind de livrarile tale. Livra prioritizeaza urgentele, livreaza in maximum 2 ore si iti ofera dovezi digitale complete pentru fiecare comanda.',
    color: 'green',
    icon: Pill,
    painPoints: [
      {
        title: 'Pacienti nemultumiti inseamna reputatie pierduta',
        desc: 'O persoana cu diabet care asteapta 3 ore inseamna reclamatie publica. Un pacient care nu primeste medicamentul la timp inseamna problema medicala si risc legal. Ratingul scade, clientii merg la concurenta.',
      },
      {
        title: 'Urgentele si comenzile obisnuite tratate la fel',
        desc: 'Cum diferentiezi o comanda urgenta de una de rutina? Fara un sistem clar, toate ajung in acelasi rand. Pacientii cu urgente ajung ultimii. Acest lucru este inacceptabil intr-o farmacie.',
      },
      {
        title: 'Fara dovada de livrare, apar dispute',
        desc: '«Am lasat la usa» versus «Nu mi-a dat nimeni nimic». Fara dovada concreta, pierzi credibilitate. Clientul sustine ca nu a primit. Tu sustii ca da. In lipsa dovezii, dai banii inapoi si pierzi si medicamentul.',
      },
    ],
    solutions: [
      {
        title: 'Urgentele, prioritizate automat',
        desc: 'Marchezi o comanda ca urgenta si Livra o plaseaza automat pe primul loc in ruta soferului. Pacientul o primeste in maximum 2 ore. Celelalte comenzi continua normal. Vieti protejate, clienti multumiti.',
      },
      {
        title: 'Dovada digitala pentru fiecare livrare',
        desc: 'Soferul fotografiaza medicamentul si colecteaza semnatura electronica a pacientului. Dovada se salveaza permanent. Nicio disputa nu mai este posibila. Farmacia ta este protejata legal la fiecare pas.',
      },
      {
        title: 'Evidenta completa si transparenta',
        desc: 'Registrul detaliat al fiecarei livrari: cine, cand, unde, fotografie. Util pentru audit intern, pentru pacienti si pentru protectie juridica. Esti 100% transparent si 100% protejat.',
      },
    ],
    stats: [
      { value: 'max 2h', label: 'livrare urgenta garantata' },
      { value: '0', label: 'dispute de livrare' },
      { value: '100%', label: 'evidenta completa a livrarilor' },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Comanda intra in sistem',
        desc: 'Pacientul comanda telefonic sau online. Comanda apare instant in Livra cu toate detaliile: adresa, medicament, urgenta sau rutina.',
      },
      {
        step: '02',
        title: 'Livra calculeaza ruta optima',
        desc: 'In functie de urgenta si locatie, Livra atribuie comanda soferului potrivit si calculeaza ruta care respecta prioritatile si intervalele promise.',
      },
      {
        step: '03',
        title: 'Pacientul urmareste livrarea',
        desc: 'SMS automat la confirmare si la sosire. Pacientul stie exact cand ajunge soferul. Zero apeluri la farmacie pentru a intreba «unde e comanda?».',
      },
      {
        step: '04',
        title: 'Dovada digitala la predare',
        desc: 'Soferul fotografiaza medicamentul si colecteaza semnatura electronica. Dovada se salveaza automat si este disponibila oricand pentru audit sau verificare.',
      },
    ],
    features: [
      {
        title: 'Prioritizare urgente cu un singur click',
        desc: 'Marcheaza orice comanda ca urgenta si ea va fi livrata inainte de toate celelalte comenzi din ruta soferului, indiferent de ordine.',
      },
      {
        title: 'Notificari automate prin SMS',
        desc: 'Pacientul primeste SMS la confirmarea comenzii, cand soferul pleaca si cu 15 minute inainte de sosire. Fara apeluri inutile.',
      },
      {
        title: 'Semnatura electronica si fotografie',
        desc: 'Fiecare livrare este confirmata cu semnatura digitala a pacientului si o fotografie a medicamentului predat. Dovezi legale valide.',
      },
      {
        title: 'Rapoarte detaliate pentru audit',
        desc: 'Exporta rapoarte complete cu toate livrarile: data, ora exacta, adresa, sofer, semnatura pacientului. Ideal pentru inspectii si audit farmaceutic.',
      },
      {
        title: 'Urmarire live a soferilor',
        desc: 'Vezi pe harta in timp real unde se afla fiecare sofer si care este statusul fiecarei livrari. Control deplin, fara apeluri constante.',
      },
      {
        title: 'Integrare cu sistemele existente',
        desc: 'Livra se conecteaza la softul farmaciei tale prin API sau import CSV. Comenzile intra automat, fara introducere manuala.',
      },
    ],
    faq: [
      {
        q: 'Cat de repede livreaza soferul o comanda urgenta?',
        a: 'Comenzile marcate ca urgente sunt plasate automat pe primul loc in ruta soferului. In Chisinau, timpul mediu de livrare urgenta este sub 2 ore de la confirmarea comenzii.',
      },
      {
        q: 'Ce se intampla daca pacientul nu este acasa?',
        a: 'Soferul fotografiaza medicamentul la usa si noteaza incidentul in aplicatie. Primesti notificare instant si poti contacta pacientul pentru a reprograma livrarea.',
      },
      {
        q: 'Cum dovedim ca am livrat medicamentul corect?',
        a: 'Fiecare livrare este insotita de fotografie si semnatura electronica a pacientului, stocate permanent in sistemul Livra. Aceste dovezi sunt valide legal in cazul oricarei dispute.',
      },
      {
        q: 'Se integreaza Livra cu softul farmaciei noastre?',
        a: 'Da. Livra ofera API REST si import CSV pentru conectare cu orice sistem de gestiune a farmaciei. Echipa tehnica te ajuta sa configurezi integrarea in mai putin de o zi.',
      },
      {
        q: 'Pot gestiona mai multi soferi in acelasi timp?',
        a: 'Absolut. Livra gestioneaza flote de orice dimensiune. Rutele sunt distribuite automat intre soferi in functie de zona si volumul de comenzi.',
      },
    ],
  },
  florarii: {
    slug: 'florarii',
    seo: {
      title: 'Livra pentru Florării | Livrare la Timp Garantată',
      description: 'Livrări de flori la intervalul exact promis. Planificare automată pentru zile de vârf, confirmare cu fotografie.',
    },
    badge: 'Soluție pentru florării',
    headline: 'Nu lăsa pe nimeni cu mâna goală.',
    subline: 'O propunere de cununie ratată, o zi de naștere uitată, o aniversare fără flori — asta nu mai se mai întâmplă cu Livra. Livrări exact la ora promisă. Clienți care se întorc pe viață.',
    color: 'pink',
    icon: Flower,
    painPoints: [
      {
        title: 'Clienți furioși = clienți pierduti',
        desc: '«Vrem livrare la 14:00 pentru cina cu soția». Tu zici «între 14 și 17». Șoferul ajunge la 18:00. Omul a făcut cina fără flori. El nu mai comandă de la tine și spune 20 de prieteni că ești neprofesionist.',
      },
      {
        title: 'Zile de vârf = imposibil',
        desc: 'De Valentine, 8 martie, ziua mamei — 500 de comenzi cu ore exacte. Cum planifici manual? Imposibil. Comenzi care se confundă, intervale ratate, clienți care amenință.',
      },
      {
        title: 'Nicio confirmare = nicio siguranță',
        desc: 'Cliente care spun că nu a sosit nimic. «Am lăsat la ușă» nu e dovadă. Client insistă că nu a venit. Cine se crede? Tu pierzi flori și bani. Asta se întâmplă constant.',
      },
    ],
    solutions: [
      {
        title: 'Planificare automată pe intervale exacte',
        desc: 'Client vrea livrare între 18:00 și 19:00 pentru cină? Tu introduci. Livra calculează ruta care respectă TOATE intervalele. Nicio oră ratată. Nicio dispută. Cliente liniștite și fericit.',
      },
      {
        title: 'Zile de vârf = ușor',
        desc: 'Valentine: upload lista cu 500 de comenzi. Livra generează rutele optime în 3 secunde. Fiecare interval respectat. Zero stres. Tu doar urmărești pe hartă. Asta-i profesionism.',
      },
      {
        title: 'Confirmare cu fotografie = zero dispută',
        desc: 'Șoferul fotografiază floarea cu persoana care o primește. Cliente nu mai pot spune că nu a venit. Tu ai dovada. Reputație protejată. Clienți care se întorc mereu.',
      },
    ],
    stats: [
      { value: '98%', label: 'satisfacție clienți' },
      { value: '3 sec', label: 'planificare 500 comenzi' },
      { value: '0', label: 'intervale ratate' },
    ],
  },
  grocery: {
    slug: 'grocery',
    seo: {
      title: 'Livra pentru Grocery & Supermarketuri | Livrare în 2h',
      description: 'Livrare rapidă în fereastra promisă de 2 ore. Consolidare automată de comenzi, optimizare pentru traficul din Chișinău.',
    },
    badge: 'Soluție pentru grocery',
    headline: 'Mâncare proaspătă = clienți fideli.',
    subline: 'Livrare în 2 ore = răcitor freschi. Răcitori freschi = clienți care comandă în fiecare zi. Livra consolidează comenzi din același bloc și optimizează rutele pe trafic real.',
    color: 'blue',
    icon: ShoppingCart,
    painPoints: [
      {
        title: 'Clienți care comanda o dată și dispar',
        desc: 'Ai promis 2h dar a venit în 5. Leii caldă, mâncarea improprie. Clintul nu mai comandă. Merge la Jumbo care e mai rapid. Pentru tine e o vânzare pierdută pentru totdeauna.',
      },
      {
        title: 'Rute prost planificate = oportunități ratate',
        desc: 'Blocul din Botanica are 15 clienți zilnici. Dar ai 5 curse separate acolo. Combustibil risipiti, șofer obosit, clienți care nu mai comandă. Și piezi bani de fiecare dată.',
      },
      {
        title: 'Ferestre prea largi = clienți care se duc la competitor',
        desc: 'Clienții nu vor să aștepte 6 ore pentru proaspete. Ei comandă de la Glovo care promite 1h. Tu nu poți competi. Clienți pierduti.',
      },
    ],
    solutions: [
      {
        title: 'Livrări în 2 ore, consolidate inteligent',
        desc: 'Livra grupează automat comenzile din același bloc în o singură oprire. Același șofer, o singură oprire, mai ieftin, mai rapid. Clienți din Botanica știu: vor livrare în 2h. Comandă de 3 ori pe săptămână.',
      },
      {
        title: 'Rute optime pe traficul real',
        desc: 'Nu distanțe în linie dreaptă — Livra știe că Ștefan cel Mare e plin la 9-10. Calculează rutele după trafic real din Chișinău. Livrări predictibile. Promisiuni ținute.',
      },
      {
        title: 'Clienți care comandă de 2 ori pe săptămână',
        desc: 'Livrare rapidă și consistentă = client loyal. Client loyal = cumpărături mai mari. Cumpărături mai mari = mai mult profit. Asta-i business growth.',
      },
    ],
    stats: [
      { value: '2h', label: 'livrare garantată' },
      { value: '+40%', label: 'comenzi zilnice repeat' },
      { value: '−25%', label: 'cost combustibil' },
    ],
  },
  b2b: {
    slug: 'b2b',
    seo: {
      title: 'Livra pentru Distribuție B2B | Management Flotă Complet',
      description: 'Control complet asupra flotei cu localizare live, rapoarte automate și POD digital pentru parteneri.',
    },
    badge: 'Soluție pentru distribuție B2B',
    headline: 'De la 5 la 50 de puncte. Livra scalează cu tine.',
    subline: 'Distribuția manuală merge la 10 puncte. La 50 crapi de administratie. Livra e sistemul care lasă să crești — tu NU trebuie să angajezi 3 persoane cu foi de parcurs și apeluri haotice.',
    color: 'purple',
    icon: Truck,
    painPoints: [
      {
        title: 'Nicio vizibilitate = pierdere de parteneri',
        desc: 'Partenerul întreabă «când ajungi?». Tu suni șoferul și zici «Cred că la 4». ETA-uri aproximative = partener nemulțumit. Partener nemulțumit = el comandă de la competitor. Tu pierzi o relație care ar putea dura ani.',
      },
      {
        title: 'Rapoarte manuale = muncă administrativă idioată',
        desc: 'La finalul zilei, fiecare șofer completează foi de parcurs. Tu colectezi, introduci în Excel, trimiți partenerilor. 2h pe zi. 400h pe an. Asta e 10 săptămâni de muncă iroșite anual.',
      },
      {
        title: 'Creștere = durere administrativă',
        desc: 'La 5 șoferi ai 1 culegător date. La 10 șoferi trebuie 2-3 persoane pe administrație. La 20 șoferi e full-time. Asta nu e scalabil. Tu nu poți să crești fără să mori în birocrație.',
      },
    ],
    solutions: [
      {
        title: 'Hartă live = transparență totală',
        desc: 'Partenerul vede pe hartă unde e șoferul tău ACUM. ETA se actualizează live. Partenerul e liniștit. Tu arăți profesionism și control. Parteneriatul crește. El vrea să mai colaboreze și mai mult.',
      },
      {
        title: 'Rapoarte automate = zero muncă manuală',
        desc: 'La finalul zilei: livrări complete, km parcurși, durate per oprire, probleme reportate. TOATE automate. Tu doar trimiți. Zero introducere manuală. Scapi de 2h de muncă zilnică.',
      },
      {
        title: 'POD digital = zero dispute',
        desc: 'Semnătură electronică + fotografie pe fiecare livrare. Partenerul vede dovada în timp real că marfa a ajuns. Zero dispute. Zero întrebări. Parteneri fericiți = relații pe termen lung.',
      },
    ],
    stats: [
      { value: 'Live', label: 'hartă flotă în timp real' },
      { value: '−2h', label: 'administrație zilnică' },
      { value: '3×', label: 'capacitate scalare' },
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
        <p className="text-[18px] text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl leading-relaxed">
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
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Provocări reale</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {industry.painPoints.map(point => (
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

      {/* Solutions */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Cum Livra rezolvă</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {industry.solutions.map(sol => (
            <div key={sol.title} className={`rounded-xl p-6 border ${colorClass[colorKey]} bg-white/50 dark:bg-zinc-950/50`}>
              <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {sol.title}
              </h3>
              <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
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

      {/* How it works */}
      {industry.howItWorks && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-4">Cum functioneaza</h2>
          <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl">
            De la comanda pana la dovada de livrare, totul este automatizat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industry.howItWorks.map(step => (
              <div key={step.step} className="relative">
                <div className={`text-[48px] font-bold mb-3 ${colorClass[colorKey]} bg-transparent border-0 inline-block`}
                  style={{ WebkitBackgroundClip: 'unset', color: 'inherit' }}>
                  <span className="text-[#ff5c2c] opacity-30 text-[56px] font-black leading-none block">{step.step}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      {industry.features && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-4">Functionalitati pentru farmacii</h2>
          <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl">
            Fiecare functionalitate a fost gandita pentru nevoile specifice ale unei farmacii cu livrare la domiciliu.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.features.map(feat => (
              <div key={feat.title} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${colorClass[colorKey]} border-0`}>
                  <Pill size={16} />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{feat.title}</h3>
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {industry.faq && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50 mb-12">Intrebari frecvente</h2>
          <div className="max-w-3xl space-y-6">
            {industry.faq.map(item => (
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
          Gata sa schimbi cum livrezi?
        </h2>
        <p className="text-[16px] text-zinc-600 dark:text-zinc-400 mb-8">
          Sute de companii din Moldova folosesc deja Livra. Tu poți începe azi, gratuit pentru 7 zile.
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff5c2c] hover:bg-[#e04a1f] text-white text-[16px] font-medium rounded-xl transition-colors"
        >
          Solicită demo gratuit <ArrowRight size={18} />
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
