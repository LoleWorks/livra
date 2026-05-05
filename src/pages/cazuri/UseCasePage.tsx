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
      title: 'Tracking Live Comenzi | Urmarire in Timp Real Livra',
      description: 'Clientii tai vad soferul pe harta in timp real. Link de tracking trimis automat prin SMS, notificari la fiecare pas si cu 80% mai putine apeluri despre statusul comenzii.',
    },
    badge: 'Experienta clientului',
    headline: 'Clientul vede pe harta unde ii este coletul. In timp real.',
    subline: 'In loc sa sune sa intrebe «unde e comanda mea?», clientul tau deschide linkul primit prin SMS si vede exact unde se afla soferul tau pe harta si cand ajunge. Zero incertitudine, zero apeluri inutile.',
    color: 'green',
    icon: Eye,
    painPoints: [
      {
        title: 'Apeluri despre statusul comenzii care iti consuma ziua',
        desc: 'Fiecare client care suna sa intrebe unde ii este comanda inseamna 5 minute din ziua unui angajat. La 50-100 de apeluri pe zi, vorbim de ore intregi pierdute zilnic pe informatii pe care clientul ar trebui sa le aiba automat.',
      },
      {
        title: 'Soferul ajunge si clientul nu este acasa',
        desc: 'Fara o notificare prealabila, clientul nu stie cand ajunge soferul. Rezultatul: soferul ajunge la usa, nimeni nu deschide, livrarea esueaza. Pierzi timp, combustibil si trebuie sa reprogramezi.',
      },
      {
        title: 'Incertitudinea duce clientul la concurenta',
        desc: 'Clientii care nu stiu cand ajunge comanda lor aleg data viitoare un competitor care ii tine informati. Lipsa comunicarii despre statusul livrarii este unul dintre principalele motive pentru care clientii nu recomanda si nu revin.',
      },
    ],
    benefits: [
      {
        title: 'Clientul vede soferul pe harta in timp real',
        desc: 'La expediere, clientul primeste automat un SMS cu un link de tracking. Deschide browserul si vede pe harta pozitia exacta a soferului tau, actualizata in timp real, si ETA-ul estimat de sosire. Nu mai suna, pentru ca are toate informatiile.',
      },
      {
        title: 'Cu 80% mai putine apeluri despre statusul comenzii',
        desc: 'Clientii care au acces la tracking live nu mai suna sa intrebe unde le este coletul. Echipa ta este eliberata de apeluri repetitive si se poate concentra pe activitati cu valoare mai mare.',
      },
      {
        title: 'Mai multe livrari reusite din prima incercare',
        desc: 'Notificarea cu 30 de minute inainte de sosire ii da clientului timp sa fie acasa sau sa trimita pe cineva sa preia coletul. Livrarile esuate scad semnificativ, iar costul de reprogramare dispare.',
      },
    ],
    stats: [
      { value: '-80%', label: 'apeluri despre statusul comenzii' },
      { value: '+25%', label: 'livrari reusite din prima' },
      { value: 'live', label: 'pozitia soferului pe harta' },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Comanda este expediata',
        desc: 'In momentul in care soferul tau preia comanda si pleaca spre client, Livra genereaza automat un link unic de tracking pentru acea livrare.',
      },
      {
        step: '02',
        title: 'Clientul primeste SMS cu linkul',
        desc: 'Clientul primeste automat un SMS cu linkul de tracking. Da click si vede pe harta unde se afla soferul tau in acel moment si cand este estimata sosirea.',
      },
      {
        step: '03',
        title: 'Notificare la 30 de minute inainte de sosire',
        desc: 'Cand soferul tau este la aproximativ 30 de minute distanta, clientul primeste o notificare automata. Are timp sa fie prezent la adresa de livrare.',
      },
      {
        step: '04',
        title: 'Confirmare la livrare',
        desc: 'Dupa ce soferul finalizeaza livrarea, clientul primeste o confirmare finala. Linkul de tracking se dezactiveaza automat.',
      },
    ],
    features: [
      {
        title: 'Harta live cu pozitia soferului',
        desc: 'Clientul vede pe harta pozitia exacta a soferului tau, actualizata in timp real pe masura ce acesta se deplaseaza spre adresa de livrare.',
      },
      {
        title: 'ETA actualizat in timp real',
        desc: 'Timpul estimat de sosire se recalculeaza automat in functie de pozitia curenta a soferului si conditiile de trafic. Clientul vede mereu o estimare corecta.',
      },
      {
        title: 'SMS automat la expediere',
        desc: 'Linkul de tracking este trimis automat prin SMS in momentul expedierii, fara nicio actiune manuala din partea ta sau a soferului.',
      },
      {
        title: 'Notificare la 30 de minute inainte de sosire',
        desc: 'Clientul primeste o alertа automata cand soferul este aproape. Reduce semnificativ livrarile esuate din cauza absentei clientului.',
      },
      {
        title: 'Confirmare automata la livrare',
        desc: 'Dupa finalizarea livrarii, clientul primeste automat o confirmare. Nicio actiune manuala necesara, totul este automatizat.',
      },
      {
        title: 'SMS cu brandul tau',
        desc: 'Mesajele SMS sunt trimise sub numele companiei tale, nu sub numele Livra. Clientul vede comunicare profesionala din partea brandului tau.',
      },
    ],
    faq: [
      {
        q: 'Clientul trebuie sa instaleze o aplicatie pentru tracking?',
        a: 'Nu. Clientul primeste un link prin SMS si urmareste livrarea direct in browser, fara nicio aplicatie de instalat. Functioneaza pe orice telefon.',
      },
      {
        q: 'Cat de des se actualizeaza pozitia soferului pe harta?',
        a: 'Pozitia soferului se actualizeaza la fiecare 10-30 de secunde, in functie de conexiunea la internet. Clientul vede intotdeauna o pozitie recenta.',
      },
      {
        q: 'Pot personaliza mesajele SMS trimise clientilor?',
        a: 'Da. Mesajele SMS pot fi personalizate cu numele companiei tale si cu textul pe care il doresti. Clientii vor vedea comunicare din partea brandului tau.',
      },
      {
        q: 'Ce se intampla cu linkul dupa ce livrarea este finalizata?',
        a: 'Linkul de tracking expira automat dupa finalizarea livrarii. Clientul nu mai poate vedea pozitia soferului dupa ce comanda a fost predata.',
      },
      {
        q: 'Functioneaza tracking-ul si cand soferul este in zone cu semnal slab?',
        a: 'Aplicatia soferului salveaza pozitia si o trimite imediat ce conexiunea este restabilita. In zone cu semnal intermitent, actualizarile pot fi mai rare, dar pozitia ramane vizibila.',
      },
    ],
  },
  'integrare-woocommerce': {
    slug: 'integrare-woocommerce',
    seo: {
      title: 'Integrare WooCommerce si OpenCart | Plugin Livra',
      description: 'Conecteaza WooCommerce sau OpenCart la Livra in 5 minute. Comenzile noi din site apar automat la soferi, fara nicio introducere manuala, si statusurile se sincronizeaza automat.',
    },
    badge: 'Integrare magazine online',
    headline: 'Comenzile din site ajung automat la soferii tai. Zero introducere manuala.',
    subline: 'Pluginul Livra se conecteaza la WooCommerce sau OpenCart in 5 minute. De atunci, fiecare comanda noua din site apare instant in Livra si ajunge la soferul potrivit fara nicio actiune din partea ta.',
    color: 'orange',
    icon: Zap,
    painPoints: [
      {
        title: 'Comenzile din site le copiezi manual la soferi',
        desc: 'Comanda vine in WooCommerce, tu o copiezi intr-un Excel sau o trimiti pe WhatsApp soferului. La 50 de comenzi pe zi apar erori. La 200 de comenzi pe zi este haos. O comanda pierduta sau o adresa gresita inseamna client nemultumit.',
      },
      {
        title: 'Statusul din WooCommerce nu reflecta realitatea',
        desc: 'Soferul a livrat comanda, dar in WooCommerce apare in continuare «in procesare». Clientul crede ca comanda este pierduta si suna. Tu trebuie sa actualizezi manual statusul in doua sisteme diferite in fiecare zi.',
      },
      {
        title: 'Date impartite in sisteme separate care nu comunica',
        desc: 'Comenzile sunt in WooCommerce, livrarile sunt intr-un Excel, soferii sunt pe WhatsApp. Niciodata nu ai o imagine completa si corecta a ce se intampla in timp real cu comenzile tale.',
      },
    ],
    benefits: [
      {
        title: 'Instalare in 5 minute, functioneaza de atunci automat',
        desc: 'Descarci pluginul Livra, il activezi in WooCommerce sau OpenCart si introduci cheia API. De atunci, fiecare comanda noua din site apare automat in Livra si este atribuita soferului potrivit. Nu mai exista copiere manuala, nu mai exista erori de transcriere.',
      },
      {
        title: 'Statusul comenzii se sincronizeaza automat in ambele sensuri',
        desc: 'Cand soferul tau marcheaza comanda ca livrata in aplicatia Livra, statusul se actualizeaza automat in WooCommerce sau OpenCart. Clientul vede statusul corect fara ca tu sa faci nimic.',
      },
      {
        title: 'Un singur loc pentru toate comenzile si livrarile',
        desc: 'Toate comenzile din site, statusul fiecarei livrari si pozitia soferilor se afla intr-un singur tablou de bord. Nu mai ai nevoie sa verifici mai multe sisteme pentru a sti ce se intampla.',
      },
    ],
    stats: [
      { value: '5 min', label: 'timp de instalare plugin' },
      { value: '0', label: 'comenzi introduse manual' },
      { value: '100%', label: 'sincronizare automata statusuri' },
    ],
    howItWorks: [
      {
        step: '01',
        title: 'Instalezi pluginul in WooCommerce sau OpenCart',
        desc: 'Descarci pluginul Livra din repository, il activezi in panoul de administrare al magazinului tau si introduci cheia API. Instalarea dureaza sub 5 minute.',
      },
      {
        step: '02',
        title: 'Comenzile noi apar automat in Livra',
        desc: 'De indata ce un client plaseaza o comanda in magazinul tau online, aceasta apare instant in Livra cu toate detaliile: adresa, produse, date de contact.',
      },
      {
        step: '03',
        title: 'Livra atribuie comanda soferului si optimizeaza ruta',
        desc: 'Comanda este atribuita automat soferului potrivit si inclusa in ruta optimizata a zilei. Soferul o vede pe telefon fara nicio actiune suplimentara din partea ta.',
      },
      {
        step: '04',
        title: 'Statusul se actualizeaza automat in magazinul tau',
        desc: 'Dupa livrare, statusul comenzii se sincronizeaza automat inapoi in WooCommerce sau OpenCart. Clientul vede «Livrat» fara ca tu sa intervii.',
      },
    ],
    features: [
      {
        title: 'Plugin nativ WooCommerce',
        desc: 'Integrare directa cu WooCommerce. Instalare simpla din panoul de administrare, fara cunostinte tehnice avansate.',
      },
      {
        title: 'Suport OpenCart 3.x',
        desc: 'Extensia Livra pentru OpenCart functioneaza cu versiunile 3.x. Comenzile noi apar automat in Livra la fel ca in WooCommerce.',
      },
      {
        title: 'Sincronizare statusuri bidirectionala',
        desc: 'Statusul comenzii se actualizeaza automat in ambele directii: din magazin spre Livra si din Livra inapoi spre magazin dupa livrare.',
      },
      {
        title: 'Transfer automat al datelor comenzii',
        desc: 'Adresa de livrare, datele clientului, produsele si orice note speciale sunt transferate automat din magazin in Livra, fara copiere manuala.',
      },
      {
        title: 'API REST pentru sisteme custom',
        desc: 'Daca folosesti o platforma proprie sau un ERP, Livra ofera API REST documentat pentru integrare directa cu orice sistem de gestiune a comenzilor.',
      },
      {
        title: 'Import CSV pentru comenzi in bulk',
        desc: 'Poti importa comenzile zilei si printr-un fisier CSV. Util pentru operatiunile care nu au o platforma online sau care primesc comenzi prin alte canale.',
      },
    ],
    faq: [
      {
        q: 'Functioneaza pluginul cu orice versiune de WooCommerce?',
        a: 'Pluginul Livra este compatibil cu WooCommerce 5.0 si versiunile mai noi. Daca folosesti o versiune mai veche, echipa tehnica te poate ajuta cu integrarea.',
      },
      {
        q: 'Ce date sunt transferate din WooCommerce in Livra?',
        a: 'Se transfera automat adresa de livrare, numele clientului, numarul de telefon, produsele din comanda si orice note de livrare adaugate de client la plasarea comenzii.',
      },
      {
        q: 'Trebuie sa am cunostinte tehnice pentru a instala pluginul?',
        a: 'Nu. Instalarea se face din panoul de administrare WordPress, la fel ca orice alt plugin. Introduci cheia API din contul Livra si integrarea este gata in cateva minute.',
      },
      {
        q: 'Pot integra Livra daca nu folosesc WooCommerce sau OpenCart?',
        a: 'Da. Livra ofera API REST complet documentat pentru integrare cu orice platforma sau sistem custom. De asemenea, poti importa comenzi prin fisiere CSV.',
      },
      {
        q: 'Statusul din WooCommerce se actualizeaza automat dupa livrare?',
        a: 'Da. Cand soferul tau confirma livrarea in aplicatia Livra, statusul comenzii se actualizeaza automat in WooCommerce sau OpenCart fara nicio actiune manuala.',
      },
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
