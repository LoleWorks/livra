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
      title: 'Livra pentru Magazine Online | WooCommerce & OpenCart Moldova',
      description: 'Software de livrare pentru magazine online din Moldova. Conecteaza WooCommerce sau OpenCart, optimizeaza rutele soferilor tai si lasa clientii sa urmareasca coletul live.',
    },
    badge: 'Solutie pentru magazine online',
    headline: 'Comenzile din site ajung direct la soferii tai. Clientul urmareste totul live.',
    subline: 'In Moldova, livrarea rapida este cea mai buna reclama. Livra conecteaza magazinul tau online la propria flota de soferi: comenzile intra automat, rutele sunt calculate in secunde si clientul vede pe harta unde ii este coletul.',
    color: 'orange',
    icon: Package,
    painPoints: [
      {
        title: '«Unde e comanda mea?» — apeluri care iti consuma ziua',
        desc: 'Fiecare client care suna dupa colet inseamna 5 minute din ziua unui angajat. La 20 de apeluri pe zi sunt 2 ore pierdute zilnic pe informatii pe care clientul ar trebui sa le vada singur.',
      },
      {
        title: 'Soferii fac trasee lungi din cauza rutelor prost planificate',
        desc: 'Fara optimizare, soferul livreaza haotic: Botanica, Centru, Ciocana, Centru din nou. Combustibil risipit, timp pierdut, mai putine comenzi livrate pe zi. Capacitatea flotei tale nu este folosita la maximum.',
      },
      {
        title: 'Comenzile din site le introduci manual la soferi',
        desc: 'Comanda vine in WooCommerce, tu o copiezi intr-un Excel sau o trimiti pe WhatsApp soferului. La 50 de comenzi pe zi apar erori. La 200 de comenzi pe zi este haos complet.',
      },
    ],
    solutions: [
      {
        title: 'Comenzile din site merg automat la soferii tai',
        desc: 'Pluginul Livra se conecteaza la WooCommerce sau OpenCart in 5 minute. Fiecare comanda noua apare instant in aplicatia soferului tau, fara niciun pas manual din partea ta. Zero erori, zero comenzi pierdute.',
      },
      {
        title: 'Clientul urmareste live unde e soferul tau',
        desc: 'La fiecare comanda expediata, clientul primeste automat un link de tracking. Vede pe harta pozitia soferului tau si ETA-ul actualizat in timp real. Nu mai suna. Tu nu mai pierzi timp cu apeluri.',
      },
      {
        title: 'Rutele soferilor tai, optimizate in secunde',
        desc: 'Ai 200 de comenzi si 5 soferi? Livra calculeaza automat ruta optima pentru fiecare. Cu 30% mai putini kilometri, mai multe livrari pe zi, mai putin combustibil. Aceeasi flota, capacitate mai mare.',
      },
    ],
    stats: [
      { value: '−80%', label: 'apeluri de la clienti' },
      { value: '+30%', label: 'livrari pe sofer pe zi' },
      { value: '5 min', label: 'setup WooCommerce/OpenCart' },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Conectezi magazinul in 5 minute',
        desc: 'Instalezi pluginul Livra in WooCommerce sau OpenCart. De acum inainte, fiecare comanda noua din site apare automat in Livra, fara nicio actiune manuala.',
      },
      {
        step: '02',
        title: 'Livra optimizeaza rutele soferilor tai',
        desc: 'La inceputul zilei, Livra grupeaza toate comenzile si calculeaza ruta optima pentru fiecare sofer al tau. Urgentele si intervalele de livrare sunt respectate automat.',
      },
      {
        step: '03',
        title: 'Soferul pleaca cu lista pe telefon',
        desc: 'Soferul tau primeste ruta zilei direct in aplicatia Livra. Navigatie inclusa, confirmare la fiecare oprire si actualizare automata a statusului comenzii.',
      },
      {
        step: '04',
        title: 'Clientul urmareste live, tu vezi tot',
        desc: 'Clientul primeste link de tracking si vede soferul pe harta. Tu ai tabloul de bord cu toata flota in timp real si raport complet la finalul zilei.',
      },
    ],
    features: [
      {
        title: 'Plugin WooCommerce si OpenCart',
        desc: 'Integrare directa cu cele mai populare platforme de e-commerce din Moldova. Comenzile noi apar automat in Livra, fara niciun pas manual.',
      },
      {
        title: 'Tracking live pentru clientii tai',
        desc: 'Fiecare client primeste un link prin care urmareste pe harta pozitia soferului tau si timpul estimat de sosire, actualizat in timp real.',
      },
      {
        title: 'Optimizare rute pentru flota ta',
        desc: 'Livra calculeaza traseul optim pentru fiecare sofer al tau, reducand distanta totala cu pana la 30% si crescand numarul de livrari pe zi.',
      },
      {
        title: 'Aplicatie mobila pentru soferii tai',
        desc: 'Soferii tai primesc ruta zilei, navigatia integrata si confirma fiecare livrare direct din aplicatia Livra. Fara Excel, fara WhatsApp, fara hartii.',
      },
      {
        title: 'Notificari automate pentru clienti',
        desc: 'SMS automat la confirmare, la expediere si cu 15 minute inainte de sosire. Clientii sunt informati fara niciun efort din partea ta.',
      },
      {
        title: 'Rapoarte de livrare automate',
        desc: 'La finalul zilei: livrari efectuate, km parcursi per sofer, comenzi cu probleme. Totul generat automat, gata de exportat sau trimis partenerilor.',
      },
    ],
    faq: [
      {
        q: 'Livra face livrarea sau este software pentru soferii nostri?',
        a: 'Livra este software. Tu folosesti proprii soferi, Livra ii ajuta sa lucreze mai eficient: preia comenzile automat din site, le calculeaza ruta optima si permite clientilor sa urmareasca livrarea live.',
      },
      {
        q: 'Functioneaza cu WooCommerce si OpenCart?',
        a: 'Da. Livra are plugin nativ pentru WooCommerce si OpenCart. Instalarea dureaza sub 5 minute si comenzile noi apar automat in sistem fara nicio configurare suplimentara.',
      },
      {
        q: 'Ce vede clientul dupa ce comanda este expediata?',
        a: 'Clientul primeste un SMS cu un link de tracking. Da click si vede pe harta pozitia exacta a soferului tau si timpul estimat de sosire, actualizat in timp real.',
      },
      {
        q: 'Cat de mult creste eficienta soferilor dupa Livra?',
        a: 'In medie, magazinele online care folosesc Livra reduc distanta parcursa cu 25-30% si reusesc sa livreze cu 30% mai multe comenzi pe zi cu aceeasi flota de soferi.',
      },
      {
        q: 'Functioneaza si pentru volume mari, de exemplu Black Friday?',
        a: 'Da. Livra gestioneaza orice volum. Incarci toate comenzile zilei si in cateva secunde ai rutele optimizate pentru toti soferii tai, indiferent de numarul de comenzi.',
      },
    ],
  },
  farmacii: {
    slug: 'farmacii',
    seo: {
      title: 'Livra pentru Farmacii | Optimizare Rute si Tracking Live pentru Soferii Tai',
      description: 'Software de optimizare rute si tracking live pentru farmacii cu propria flota. Pacientii urmaresc soferii in timp real, tu gestionezi toate comenzile dintr-un singur loc.',
    },
    badge: 'Solutie pentru farmacii',
    headline: 'Soferii tai. Rute mai scurte. Pacienti care stiu exact cand ajungi.',
    subline: 'Farmacia ta are proprii soferi si vrei sa-i folosesti cat mai eficient. Livra calculeaza ruta optima pentru fiecare sofer, pacientul urmareste live unde se afla medicamentul sau, iar tu ai control complet asupra intregii flote dintr-un singur ecran.',
    color: 'green',
    icon: Pill,
    painPoints: [
      {
        title: '«Cand ajunge soferul?» — intrebarea care blocheaza telefonul',
        desc: 'Zece pacienti suna pe zi sa intrebe unde le sunt medicamentele. Angajatii raspund la acelasi apel in loc sa se ocupe de clientii din farmacie. Timp pierdut, pacienti iritati, reputatie afectata.',
      },
      {
        title: 'Soferul face trasee lungi cand ar putea face trasee scurte',
        desc: 'Fara optimizare, soferul merge de la Botanica la Ciocana si inapoi la Botanica. Combustibil risipit, timp pierdut, mai putine livrari pe zi. Capacitatea flotei tale nu este folosita la maximum.',
      },
      {
        title: 'Nu stii ce face soferul tau in teren',
        desc: 'A ajuns la pacient? A livrat? De ce a durat 45 de minute intre doua adrese? Fara vizibilitate in timp real, gestionezi flota prin apeluri si estimari. Nu prin date.',
      },
    ],
    solutions: [
      {
        title: 'Ruta optima calculata automat pentru fiecare sofer',
        desc: 'Introduci comenzile zilei si Livra calculeaza automat ruta care minimizeaza distanta si timpul pentru fiecare sofer al tau. Urgentele sunt plasate primul in ruta, celelalte in ordinea optima. Mai multe livrari, acelasi numar de soferi.',
      },
      {
        title: 'Pacientul urmareste live unde e soferul tau',
        desc: 'La fiecare comanda, pacientul primeste un link de tracking. Vede pe harta exact unde se afla soferul si cand ajunge la el. Zero apeluri la farmacie. Pacientul este informat, tu esti linistit.',
      },
      {
        title: 'Tu vezi toata flota dintr-un singur ecran',
        desc: 'Harta in timp real cu toti soferii tai, statusul fiecarei livrari si istoricul complet al zilei. Stii instant daca un sofer are o problema, poti redistribui comenzi si ai rapoarte automate la finalul zilei.',
      },
    ],
    stats: [
      { value: '+30%', label: 'livrari pe sofer pe zi' },
      { value: '0', label: 'apeluri «unde e soferul»' },
      { value: 'live', label: 'tracking pentru pacienti' },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Introduci comenzile zilei',
        desc: 'Adaugi manual comenzile sau le importi din sistemul farmaciei. Fiecare comanda are adresa, pacientul si daca e urgenta sau rutina.',
      },
      {
        step: '02',
        title: 'Livra optimizeaza rutele soferilor tai',
        desc: 'In cateva secunde, Livra calculeaza ruta optima pentru fiecare sofer al tau. Urgentele sunt primele, restul in ordinea care minimizeaza timpul total de mers.',
      },
      {
        step: '03',
        title: 'Soferul pleaca cu ruta pe telefon',
        desc: 'Soferul tau primeste ruta direct in aplicatia Livra de pe telefon. Navigatie integrata, lista de livrari in ordine, confirmarea fiecarei opriri cu un singur tap.',
      },
      {
        step: '04',
        title: 'Pacientul urmareste live, tu vezi tot',
        desc: 'Pacientul primeste link de tracking si vede soferul pe harta. Tu vezi toata flota in timp real si primesti raport complet la finalul zilei.',
      },
    ],
    features: [
      {
        title: 'Optimizare rute pentru flota ta',
        desc: 'Livra calculeaza traseul care minimizeaza distanta si timpul pentru fiecare sofer al tau, tinand cont de urgente si de traficul real din Chisinau.',
      },
      {
        title: 'Link de tracking pentru pacienti',
        desc: 'Pacientul primeste automat un link prin care urmareste live pozitia soferului tau pe harta si ETA-ul actualizat in timp real.',
      },
      {
        title: 'Aplicatie mobila pentru soferii tai',
        desc: 'Soferii tai descarca aplicatia Livra, primesc ruta zilei si confirma fiecare livrare direct de pe telefon. Fara hartii, fara apeluri.',
      },
      {
        title: 'Prioritizare urgente cu un singur click',
        desc: 'Marchezi o comanda ca urgenta si Livra o plaseaza automat pe primul loc in ruta soferului, fara sa deranjeze restul traseului.',
      },
      {
        title: 'Harta live cu toata flota ta',
        desc: 'Vezi in timp real unde se afla fiecare sofer al tau, ce livrare face si care e statusul fiecarei comenzi. Control complet, zero apeluri.',
      },
      {
        title: 'Rapoarte automate la finalul zilei',
        desc: 'Km parcursi per sofer, livrari efectuate, durata per oprire, comenzi cu probleme. Toate generate automat, fara introducere manuala.',
      },
    ],
    faq: [
      {
        q: 'Livra face livrarea sau e doar software pentru soferii nostri?',
        a: 'Livra este software. Tu folosesti proprii soferi, Livra ii ajuta sa lucreze mai eficient: le calculeaza ruta optima, le arata comenzile pe telefon si le permite sa confirme livrarile digital.',
      },
      {
        q: 'Cum vede pacientul unde e soferul?',
        a: 'La fiecare comanda, pacientul primeste automat un SMS cu un link de tracking. Da click pe link si vede pe harta pozitia soferului tau in timp real si timpul estimat de sosire.',
      },
      {
        q: 'Cat de mult reduce Livra distanta parcursa de soferi?',
        a: 'In medie, farmaciile care folosesc Livra reduc distanta totala parcursa cu 25-35% si reusesc sa faca cu 30% mai multe livrari pe zi cu aceeasi flota.',
      },
      {
        q: 'Se integreaza Livra cu softul farmaciei noastre?',
        a: 'Da. Livra ofera API REST si import CSV pentru conectare cu orice sistem de gestiune a farmaciei. Comenzile intra automat in Livra fara introducere manuala.',
      },
      {
        q: 'Pot gestiona mai multi soferi in acelasi timp?',
        a: 'Da. Livra gestioneaza flote de orice dimensiune. Rutele sunt distribuite automat intre soferii tai in functie de zona si volumul de comenzi al zilei.',
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
