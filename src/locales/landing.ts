import type { Lang } from '../context/LanguageContext'

export type LandingStrings = {
  navbar: {
    howItWorks: string
    features: string
    network: string
    pricing: string
    login: string
    requestDemo: string
  }
  hero: {
    badge: string
    title1: string
    title2: string
    title3: string
    subtitle: string
    startFree: string
    seeHow: string
    stat1Value: string
    stat1Label: string
    stat2Value: string
    stat2Label: string
    stat3Value: string
    stat3Label: string
  }
  howItWorks: {
    title: string
    subtitle: string
    steps: Array<{ title: string; desc: string }>
  }
  networkBenefits: {
    badge: string
    title1: string
    title2: string
    subtitle: string
    items: Array<{ title: string; desc: string }>
  }
  pricing: {
    title: string
    subtitle: string
    priceFrom: string
    price: string
    perDelivery: string
    requestOffer: string
    creditsTitle: string
    creditsSubtitle: string
    creditItems: Array<{ num: string; title: string; desc: string }>
    included1: string
    included2: string
    included3: string
    contactForOffer: string
  }
  onboarding: {
    badge: string
    title1: string
    title2: string
    subtitle: string
    steps: Array<{ num: string; title: string; desc: string }>
    noDowntime1: string
    noDowntime2: string
    requestDemo: string
  }
  faqs: Array<{ q: string; a: string }>
  cta: {
    title: string
    subtitle: string
    placeholder: string
    requestDemo: string
    thanks: string
  }
  footer: {
    copyright: string
    privacy: string
    terms: string
    contact: string
  }
}

const RO: LandingStrings = {
  navbar: {
    howItWorks: 'Cum funcționează',
    features: 'Funcționalități',
    network: 'Rețeaua Livra',
    pricing: 'Prețuri',
    login: 'Autentificare',
    requestDemo: 'Solicită demo',
  },
  hero: {
    badge: 'Construit pentru companii din Moldova',
    title1: 'Livraza mai rapid.',
    title2: 'Crești mai mult.',
    title3: '',
    subtitle: 'Livra optimizează rutele de livrare, urmărește șoferii în timp real și îți arată exact ce se întâmplă cu fiecare comandă.',
    startFree: 'Începe gratuit',
    seeHow: 'Vezi cum funcționează',
    stat1Value: '30%',
    stat1Label: 'mai puțin combustibil',
    stat2Value: '2×',
    stat2Label: 'mai multe livrări/zi',
    stat3Value: '98%',
    stat3Label: 'satisfacție clienți',
  },
  howItWorks: {
    title: 'Cum funcționează Livra',
    subtitle: 'De la comandă la livrare, totul automatizat în 4 pași.',
    steps: [
      {
        title: 'Conectează magazinul',
        desc: 'Integrează WooCommerce, OpenCart sau adaugă comenzi manual. Toate comenzile ajung automat în Livra, gata de procesare.',
      },
      {
        title: 'Optimizăm rutele',
        desc: 'Algoritmul nostru calculează traseele optime pentru toți șoferii tăi, ținând cont de ferestre orare, distanțe și capacitate.',
      },
      {
        title: 'Șoferii livrează',
        desc: 'Aplicația mobilă Livra ghidează șoferii pas cu pas. Semnătură digitală, foto la livrare, raport în timp real.',
      },
      {
        title: 'Clienții urmăresc live',
        desc: 'Fiecare client primește un link de urmărire. Vede pe hartă unde e coletul și ETA actualizat la fiecare câteva secunde.',
      },
    ],
  },
  networkBenefits: {
    badge: 'Exclusiv pentru parteneri Livra',
    title1: 'Nu ești doar un client.',
    title2: 'Ești parte dintr-o rețea.',
    subtitle: 'Companiile din rețeaua Livra nu concurează între ele, se completează. Fiecare partener nou aduce clienți noi pentru toți ceilalți. Livra devine canalul tău de creștere, nu doar de livrare.',
    items: [
      {
        title: 'Reclame pe pagina de tracking',
        desc: 'Când un client așteaptă o livrare de la alt partener, magazinul tău apare pe ecranul lui. 10 minute de atenție pură, inclus în prețul creditelor, fără costuri extra.',
      },
      {
        title: 'Livrare gratuită la primul ordin',
        desc: 'Oferă livrare gratuită clienților noi din rețeaua Livra. Noi știm cine nu a mai comandat de la tine, tu nu trebuie să faci nimic, se aplică automat.',
      },
      {
        title: 'Promovare pe zone',
        desc: 'Vrei să crești în Botanica sau Ciocana? Targetezi clienții din zona respectivă care au comandat produse similare. Livra știe exact cine și unde.',
      },
      {
        title: 'Date despre comportamentul clienților',
        desc: 'Află când comandă cel mai mult clienții din zona ta, ce categorii de produse preferă și cum evoluează cererea. Date reale, nu presupuneri.',
      },
      {
        title: 'Bază de clienți partajată',
        desc: 'Un client care și-a salvat adresa și preferințele la un partener Livra primește automat livrare perfectă și la tine, fără să completeze nimic din nou.',
      },
      {
        title: 'Buton Livra pe site-ul tău',
        desc: 'Adaugi un buton "Livrează cu Livra" pe site-ul tău. Clienții cu cont Livra plasează comanda cu un singur click: adresa, fereastra orară și toate preferințele lor sunt completate automat. Fără formulare, fără întrebări, fără livrări ratate.',
      },
    ],
  },
  pricing: {
    title: 'Prețuri transparente, fără surprize',
    subtitle: 'Plătești per livrare, nu per lună. Fără abonament, fără contract.',
    priceFrom: 'De la',
    price: '10',
    perDelivery: 'per livrare',
    requestOffer: 'Solicită ofertă',
    creditsTitle: 'Cum funcționează creditele?',
    creditsSubtitle: '',
    creditItems: [
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
    ],
    included1: 'Aplicație mobilă șofer inclusă în orice pachet',
    included2: 'Urmărire live pentru clienți inclusă',
    included3: 'Integrări e-commerce și webhook incluse',
    contactForOffer: 'Contactează-ne pentru ofertă',
  },
  onboarding: {
    badge: 'Onboarding inclus',
    title1: 'Noi ne ocupăm de tot.',
    title2: 'Tu nu faci nimic singur.',
    subtitle: 'Când te decizi să lucrezi cu noi, echipa Livra vine la tine, fizic sau online, și se asigură că totul funcționează din prima zi.',
    steps: [
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
    ],
    noDowntime1: 'Nu pierzi nicio zi de muncă în perioada de tranziție.',
    noDowntime2: 'Onboardingul se face în paralel cu activitatea ta curentă. Când suntem gata, facem switch.',
    requestDemo: 'Solicită demo',
  },
  faqs: [
    { q: 'Cât durează să îl configurez?', a: 'Majoritatea companiilor sunt live în mai puțin de 1 oră. Conectarea WooCommerce durează 5 minute cu plugin-ul nostru.' },
    { q: 'Ce se întâmplă dacă un credit rămâne nefolosit?', a: 'Creditele nu expiră. Le poți folosi oricând, la propriul ritm.' },
    { q: 'Am nevoie de aplicație mobilă pentru șoferi?', a: 'Da, Livra Driver este disponibilă pe iOS și Android, gratuită pentru șoferi.' },
    { q: 'Funcționează și în afara Chișinăului?', a: 'Da, Livra optimizează livrări în toată Moldova și poate fi configurat pentru orice regiune.' },
    { q: 'Există un contract pe termen lung?', a: 'Nu. Funcționezi pe bază de credite prepaid, fără abonament lunar obligatoriu.' },
  ],
  cta: {
    title: 'Gata să optimizezi livrările?',
    subtitle: 'Lasă-ne adresa de email și te contactăm în maxim 24 de ore pentru un demo personalizat.',
    placeholder: 'email@compania.md',
    requestDemo: 'Solicită demo',
    thanks: 'Mulțumim! Te contactăm în curând.',
  },
  footer: {
    copyright: 'Toate drepturile rezervate.',
    privacy: 'Confidențialitate',
    terms: 'Termeni',
    contact: 'Contact',
  },
}

const EN: LandingStrings = {
  navbar: {
    howItWorks: 'How it works',
    features: 'Features',
    network: 'Livra Network',
    pricing: 'Pricing',
    login: 'Login',
    requestDemo: 'Request demo',
  },
  hero: {
    badge: 'Built for companies in Moldova',
    title1: 'Deliver faster.',
    title2: 'Grow more.',
    title3: '',
    subtitle: 'Livra optimizes delivery routes, tracks drivers in real time, and shows you exactly what\'s happening with every order.',
    startFree: 'Start free',
    seeHow: 'See how it works',
    stat1Value: '30%',
    stat1Label: 'less fuel',
    stat2Value: '2×',
    stat2Label: 'more deliveries/day',
    stat3Value: '98%',
    stat3Label: 'customer satisfaction',
  },
  howItWorks: {
    title: 'How Livra Works',
    subtitle: 'From order to delivery, everything automated in 4 steps.',
    steps: [
      {
        title: 'Connect your store',
        desc: 'Integrate WooCommerce, OpenCart, or add orders manually. All orders flow into Livra, ready to go.',
      },
      {
        title: 'We optimize routes',
        desc: 'Our algorithm calculates optimal routes for all your drivers, considering time windows, distance, and capacity.',
      },
      {
        title: 'Drivers deliver',
        desc: 'Livra app guides drivers step by step. Digital signature, delivery photo, real-time reporting.',
      },
      {
        title: 'Customers track live',
        desc: 'Every customer gets a tracking link. Sees the package on the map and updated ETA every few seconds.',
      },
    ],
  },
  networkBenefits: {
    badge: 'Exclusive for Livra partners',
    title1: 'You\'re not just a client.',
    title2: 'You\'re part of a network.',
    subtitle: 'Companies in the Livra network don\'t compete, they complement each other. Every new partner brings new customers to everyone else. Livra becomes your growth channel, not just delivery.',
    items: [
      {
        title: 'Ads on tracking page',
        desc: 'When a customer waits for a delivery from another partner, your store appears on their screen. 10 minutes of pure attention, included in credit price, no extra cost.',
      },
      {
        title: 'Free first order delivery',
        desc: 'Offer free delivery to new customers from the Livra network. We know who hasn\'t ordered from you, you don\'t do anything, it applies automatically.',
      },
      {
        title: 'Zone promotion',
        desc: 'Want to grow in Botanica or Ciocana? Target customers from that zone who ordered similar products. Livra knows exactly who and where.',
      },
      {
        title: 'Customer behavior data',
        desc: 'Find out when your zone customers order most, what product categories they prefer, and how demand evolves. Real data, not guesses.',
      },
      {
        title: 'Shared customer base',
        desc: 'A customer who saved their address and preferences at a Livra partner gets perfect delivery from you too, without filling anything out again.',
      },
      {
        title: 'Livra button on your site',
        desc: 'Add a "Deliver with Livra" button to your site. Customers with Livra accounts place orders with one click: address, time window, and all preferences pre-filled. No forms, no questions, no missed deliveries.',
      },
    ],
  },
  pricing: {
    title: 'Transparent pricing, no surprises',
    subtitle: 'Pay per delivery, not per month. No subscription, no contract.',
    priceFrom: 'From',
    price: '10',
    perDelivery: 'per delivery',
    requestOffer: 'Request offer',
    creditsTitle: 'How do credits work?',
    creditsSubtitle: '',
    creditItems: [
      {
        num: '1',
        title: '1 credit = 1 delivery',
        desc: 'Every optimized delivery costs one credit, regardless of distance or complexity.',
      },
      {
        num: '2',
        title: 'Buy in advance',
        desc: 'Choose how many credits you want and pay once. The more you buy, the lower the per-delivery price.',
      },
      {
        num: '3',
        title: 'Never expire',
        desc: 'Credits stay in your account until you use them. No time pressure and you don\'t lose anything.',
      },
    ],
    included1: 'Driver mobile app included in any package',
    included2: 'Live tracking for customers included',
    included3: 'E-commerce integrations and webhooks included',
    contactForOffer: 'Contact us for an offer',
  },
  onboarding: {
    badge: 'Onboarding included',
    title1: 'We handle everything.',
    title2: 'You do nothing alone.',
    subtitle: 'When you decide to work with us, the Livra team comes to you, in person or online, and makes sure everything works from day one.',
    steps: [
      {
        num: '01',
        title: 'We set up accounts',
        desc: 'You give us your company details, we handle it all: your manager account, driver accounts, sales agent accounts. You don\'t configure anything.',
      },
      {
        num: '02',
        title: 'Install app on driver phones',
        desc: 'We go to the drivers or guide them step by step remotely. Every phone comes out configured and ready for the first delivery.',
      },
      {
        num: '03',
        title: 'Train the team',
        desc: 'Every driver knows exactly what to do: how to start a route, confirm delivery, report failure. No surprises on day one.',
      },
      {
        num: '04',
        title: 'Connect your store',
        desc: 'We install the plugin in WooCommerce or OpenCart, set up the webhook if you use another platform, and test everything works before we leave.',
      },
      {
        num: '05',
        title: 'First day, together',
        desc: 'On the first day of real deliveries, we\'re available. If something comes up, we fix it on the spot. You\'re never left alone.',
      },
    ],
    noDowntime1: 'You don\'t lose a single work day during transition.',
    noDowntime2: 'Onboarding happens in parallel with your current activity. When we\'re ready, we switch.',
    requestDemo: 'Request demo',
  },
  faqs: [
    { q: 'How long does it take to set up?', a: 'Most companies are live in less than 1 hour. WooCommerce connection takes 5 minutes with our plugin.' },
    { q: 'What if a credit goes unused?', a: 'Credits don\'t expire. Use them anytime, at your own pace.' },
    { q: 'Do I need a driver mobile app?', a: 'Yes, Livra Driver is available on iOS and Android, free for drivers.' },
    { q: 'Does it work outside Chișinău?', a: 'Yes, Livra optimizes deliveries across Moldova and can be configured for any region.' },
    { q: 'Is there a long-term contract?', a: 'No. You work on prepaid credits, no mandatory monthly subscription.' },
  ],
  cta: {
    title: 'Ready to optimize deliveries?',
    subtitle: 'Leave us your email and we\'ll contact you within 24 hours for a personalized demo.',
    placeholder: 'email@company.md',
    requestDemo: 'Request demo',
    thanks: 'Thank you! We\'ll contact you soon.',
  },
  footer: {
    copyright: 'All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
  },
}

const RU: LandingStrings = {
  navbar: {
    howItWorks: 'Как это работает',
    features: 'Возможности',
    network: 'Сеть Livra',
    pricing: 'Цены',
    login: 'Вход',
    requestDemo: 'Запросить демо',
  },
  hero: {
    badge: 'Создано для компаний Молдовы',
    title1: 'Доставляй быстрее.',
    title2: 'Расти больше.',
    title3: '',
    subtitle: 'Livra оптимизирует маршруты, отслеживает водителей в реальном времени и показывает ровно то, что происходит с каждым заказом.',
    startFree: 'Начать бесплатно',
    seeHow: 'Узнать как',
    stat1Value: '30%',
    stat1Label: 'меньше топлива',
    stat2Value: '2×',
    stat2Label: 'больше доставок/день',
    stat3Value: '98%',
    stat3Label: 'довольны клиенты',
  },
  howItWorks: {
    title: 'Как работает Livra',
    subtitle: 'От заказа до доставки, все автоматизировано в 4 шага.',
    steps: [
      {
        title: 'Подключи свой магазин',
        desc: 'Интеграция WooCommerce, OpenCart или добавление заказов вручную. Все заказы поступают в Livra, готовые к отправке.',
      },
      {
        title: 'Мы оптимизируем маршруты',
        desc: 'Наш алгоритм вычисляет оптимальные маршруты для всех водителей, учитывая временные окна, расстояние и грузоподъемность.',
      },
      {
        title: 'Водители доставляют',
        desc: 'Приложение Livra направляет водителей пошагово. Цифровая подпись, фото доставки, отчеты в реальном времени.',
      },
      {
        title: 'Клиенты отслеживают онлайн',
        desc: 'Каждый клиент получает ссылку для отслеживания. Видит посылку на карте и обновленное ETA каждые несколько секунд.',
      },
    ],
  },
  networkBenefits: {
    badge: 'Только для партнеров Livra',
    title1: 'Ты не просто клиент.',
    title2: 'Ты часть сети.',
    subtitle: 'Компании в сети Livra не конкурируют, они дополняют друг друга. Каждый новый партнер приносит новых клиентов для всех остальных. Livra становится твоим каналом роста, а не просто доставки.',
    items: [
      {
        title: 'Рекламa на странице отслеживания',
        desc: 'Когда клиент ждет доставку от другого партнера, твой магазин появляется на его экране. 10 минут чистого внимания, включено в цену кредитов, без дополнительных затрат.',
      },
      {
        title: 'Бесплатная доставка первого заказа',
        desc: 'Предложи бесплатную доставку новым клиентам из сети Livra. Мы знаем кто у тебя не заказывал, ты ничего не делаешь, применяется автоматически.',
      },
      {
        title: 'Зональное продвижение',
        desc: 'Хочешь расти в Ботанике или Чокане? Таргетируй клиентов из этой зоны которые заказывали похожие товары. Livra знает точно кто и где.',
      },
      {
        title: 'Данные о поведении клиентов',
        desc: 'Узнай когда чаще всего заказывают клиенты из твоей зоны, какие категории товаров они предпочитают и как меняется спрос. Реальные данные, не гадания.',
      },
      {
        title: 'Общая база клиентов',
        desc: 'Клиент который сохранил адрес и предпочтения у партнера Livra получит идеальную доставку и от тебя, без заполнения чего-либо заново.',
      },
      {
        title: 'Кнопка Livra на твоем сайте',
        desc: 'Добавь кнопку "Доставить с Livra" на свой сайт. Клиенты с аккаунтом Livra оформляют заказ одним кликом: адрес, время и все предпочтения уже заполнены. Без форм, без вопросов, без ошибок доставки.',
      },
    ],
  },
  pricing: {
    title: 'Прозрачные цены без сюрпризов',
    subtitle: 'Плати за доставку, не за месяц. Никаких подписок, никаких контрактов.',
    priceFrom: 'От',
    price: '10',
    perDelivery: 'за доставку',
    requestOffer: 'Запросить предложение',
    creditsTitle: 'Как работают кредиты?',
    creditsSubtitle: '',
    creditItems: [
      {
        num: '1',
        title: '1 кредит = 1 доставка',
        desc: 'Каждая оптимизированная доставка стоит один кредит, независимо от расстояния и сложности.',
      },
      {
        num: '2',
        title: 'Покупай заранее',
        desc: 'Выбери сколько кредитов нужно и заплати один раз. Чем больше покупаешь, тем меньше цена за доставку.',
      },
      {
        num: '3',
        title: 'Никогда не истекают',
        desc: 'Кредиты остаются в твоем аккаунте пока ты их не используешь. Нет спешки и ничего не потеряешь.',
      },
    ],
    included1: 'Мобильное приложение для водителя включено в любой пакет',
    included2: 'Live отслеживание для клиентов включено',
    included3: 'Интеграции e-commerce и вебхуки включены',
    contactForOffer: 'Свяжись с нами для предложения',
  },
  onboarding: {
    badge: 'Подключение включено',
    title1: 'Мы берем все на себя.',
    title2: 'Ты ничего не делаешь один.',
    subtitle: 'Когда ты решишь работать с нами, команда Livra приедет к тебе, лично или онлайн, и убедится что все работает с первого дня.',
    steps: [
      {
        num: '01',
        title: 'Мы создаем аккаунты',
        desc: 'Ты даешь нам детали компании, мы берем все: твой аккаунт менеджера, аккаунты водителей, аккаунты агентов продаж. Ты ничего не настраиваешь.',
      },
      {
        num: '02',
        title: 'Установим приложение на телефоны',
        desc: 'Мы идем к водителям или направляем их пошагово удаленно. Каждый телефон выходит настроенным и готовым к первой доставке.',
      },
      {
        num: '03',
        title: 'Обучим команду',
        desc: 'Каждый водитель знает точно что делать: как запустить маршрут, подтвердить доставку, сообщить об ошибке. Без сюрпризов в первый день.',
      },
      {
        num: '04',
        title: 'Подключим твой магазин',
        desc: 'Установим плагин в WooCommerce или OpenCart, настроим webhook если ты используешь другую платформу, и протестируем все работает перед уходом.',
      },
      {
        num: '05',
        title: 'Первый день вместе',
        desc: 'В первый день реальных доставок мы доступны. Если что-то случится, мы исправим сразу. Ты никогда не один.',
      },
    ],
    noDowntime1: 'Ты не теряешь ни одного рабочего дня во время перехода.',
    noDowntime2: 'Подключение происходит параллельно с твоей текущей деятельностью. Когда готово, мы переключаемся.',
    requestDemo: 'Запросить демо',
  },
  faqs: [
    { q: 'Сколько времени займет настройка?', a: 'Большинство компаний запускаются за час. Подключение WooCommerce займет 5 минут с нашим плагином.' },
    { q: 'Что если кредит не использован?', a: 'Кредиты не истекают. Используй их когда угодно, в своем темпе.' },
    { q: 'Нужно ли мобильное приложение для водителей?', a: 'Да, Livra Driver доступно на iOS и Android, бесплатно для водителей.' },
    { q: 'Работает ли вне Кишинева?', a: 'Да, Livra оптимизирует доставки по всей Молдове и может быть настроено для любого региона.' },
    { q: 'Есть ли долгосрочный контракт?', a: 'Нет. Ты работаешь на предоплаченных кредитах, без обязательной ежемесячной подписки.' },
  ],
  cta: {
    title: 'Готов оптимизировать доставки?',
    subtitle: 'Дай нам свой email и мы свяжемся с тобой в течение 24 часов для персонализированного демо.',
    placeholder: 'email@company.md',
    requestDemo: 'Запросить демо',
    thanks: 'Спасибо! Скоро свяжемся.',
  },
  footer: {
    copyright: 'Все права защищены.',
    privacy: 'Приватность',
    terms: 'Условия',
    contact: 'Контакт',
  },
}

export function getLandingStrings(lang: Lang): LandingStrings {
  switch (lang) {
    case 'en':
      return EN
    case 'ru':
      return RU
    default:
      return RO
  }
}
