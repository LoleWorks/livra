import { Lang } from '../context/LanguageContext'

export type AppDownloadStrings = {
  navbar: {
    forBusiness: string
  }
  hero: {
    title1: string
    title2: string
    title3: string
    subtitle: string
    free: string
    iosAndroid: string
    setupSeconds: string
  }
  painPoints: {
    title: string
    subtitle: string
    points: Array<{ title: string; body: string }>
  }
  liveTracking: {
    title: string
    subtitle1: string
    subtitle2: string
    noDrop: string
    step1Title: string
    step1Desc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
    step4Title: string
    step4Desc: string
  }
  gpsPin: {
    sectionTitle: string
    sectionHighlight: string
    description1: string
    description2: string
    howItWorks: string
    howSteps: string[]
    withoutLivra: string
    withoutItems: string[]
    withLivra: string
    withItems: string[]
  }
  features: {
    title: string
    subtitle: string
    items: Array<{ title: string; desc: string }>
  }
  onboarding: {
    title: string
    subtitle: string
    steps: Array<{ title: string; desc: string }>
  }
  stats: Array<{ value: string; label: string }>
  testimonials: {
    title: string
    items: Array<{ name: string; location: string; text: string }>
  }
  faqs: {
    title: string
    items: Array<{ q: string; a: string }>
  }
  cta: {
    title: string
    subtitle: string
    installSeconds: string
  }
  footer: {
    copyright: string
    forBusiness: string
    privacy: string
    terms: string
  }
  appStore: string
  googlePlay: string
  downloadFrom: string
}

const RO: AppDownloadStrings = {
  navbar: {
    forBusiness: 'Pentru business →',
  },
  hero: {
    title1: 'Urmărești',
    title2: 'curierul live.',
    title3: 'Știi exact când.',
    subtitle: 'Fiecare comandă pe hartă. Notificare cu 10 minute înainte. Nu mai aștepți 6 ore. Nu mai ratezi nicio livrare.',
    free: 'Gratuit',
    iosAndroid: 'iOS & Android',
    setupSeconds: '30 secunde setup',
  },
  painPoints: {
    title: 'Recunoști situația?',
    subtitle: 'Fiecare comandă online în Moldova începe acum cu o singură speranță: "Oare mă va găsi curierul acasă?"',
    points: [
      {
        title: 'Stai acasă toată ziua așteptând',
        body: 'Ți s-a zis că vine între 9 și 17. Ai stat. La 16:58 SMS că nu au reușit să livreze.',
      },
      {
        title: '"Absent"dar tu erai acasă',
        body: 'Nu a sunat. Pe portal scrie "client absent". Tu erai în bucătărie. Conflict cu comerciantul.',
      },
      {
        title: 'Nimeni nu știe unde e coletul',
        body: 'Status-ul n-a mai mișcat de ieri. Apelezi call center. "Verificăm și revenim." Nu revin.',
      },
    ],
  },
  liveTracking: {
    title: 'GPS live. La 30 de secunde.',
    subtitle1: 'Locația curierului se actualizează constant pe hartă. Nu o imagine staică. O hartă care se mișcă în timp real. Tu știi exact unde e, pe care stradă merge, când ajunge.',
    subtitle2: 'Notificarea la 10 minute nu e doar un feature. E diferența dintre a sta cu anxietate și a fi pregătit exact pe timp.',
    noDrop: 'Nicio ratare din nou',
    step1Title: 'Deschizi Livra',
    step1Desc: 'Doar iți iei telefonul.',
    step2Title: 'Vezi curierul pe hartă',
    step2Desc: 'Mișcă-se în timp real, fiecare 30 secunde.',
    step3Title: 'ETA precis',
    step3Desc: '"Ajunge la 14:32"nu la 14:35 sau 14:28.',
    step4Title: 'Ești gata pe timp',
    step4Desc: 'Cobori din bucătărie fix când sună la ușă.',
  },
  gpsPin: {
    sectionTitle: 'Cea mai mare problemă a Moldovei:',
    sectionHighlight: 'Adresele care nu există pe hartă',
    description1: 'Sate fără nume de străzi. Blocuri noi fără număr înregistrat. Case la marginea satului. Fără Livra, curierul sună de 5 ori și pierde 20 de minute.',
    description2: 'Cu Livra: pui pin-ul pe ușa ta o singură dată. Fiecare curier de la orice comerciant ajunge direct acolo.',
    howItWorks: 'Cum funcționează:',
    howSteps: [
      'Deschizi Livra, tapezi „Setează locația mea"',
      'Marchezi pe hartă exact unde stai',
      'Numești locația (Acasă, Birou, la Bunica)',
      'Gata. Toate livrările ajung direct acolo.',
    ],
    withoutLivra: 'FĂ RĂ LIVRA',
    withoutItems: [
      'Curierul nu găsește adresa',
      'Sună tu de 3 ori',
      'Pierde 20 de minute',
      'Livrare ratată',
    ],
    withLivra: 'CU LIVRA',
    withItems: [
      'Marchezi pe hartă exact unde stai',
      'Curierul navigă direct',
      'Zero telefoane',
      'Livrare de prima dată',
    ],
  },
  features: {
    title: 'Tot ce ai nevoie',
    subtitle: '8 feature-uri care fac din Livra aplicația numarul 1 pentru livrări în Moldova.',
    items: [
      {
        title: 'GPS live, la 30 de secunde',
        desc: 'Locația curierului se actualizează constant pe hartă. Nu un status. O hartă live.',
      },
      {
        title: 'Notificare cu 10 minute înainte',
        desc: 'Trăiești normal. Livra te anunță exact când să cobori. Nicio ratare din nou.',
      },
      {
        title: 'Pin GPS pentru orice adresă',
        desc: 'Locuiești în sat, bloc fără număr, zonă nouă? Pui pin-ul o dată. Toți curierii ajung acolo.',
      },
      {
        title: 'Toate comenzile într-un loc',
        desc: 'Electronice, haine, farmacie—toate de la toți partenerii în același feed.',
      },
      {
        title: 'Checkout cu un tap',
        desc: 'Setezi adresa o dată. La fiecare comandă pe site partener, datele sunt deja completate.',
      },
      {
        title: 'Tu alegi fereastră orară',
        desc: 'Dimineață, după-amiază sau seară. Tu decizi când vrei să primești. Nu firma de curierat.',
      },
      {
        title: 'Istoric complet cu dovezi',
        desc: 'Data, ora, curierul, foto. Dacă e dispută: "Am livrat"tu ai dovada.',
      },
      {
        title: 'Evaluezi livrarea imediat',
        desc: 'Un tap după fiecare livrare. Feedback-ul tău îi ajută pe alții și pe comerciant.',
      },
    ],
  },
  onboarding: {
    title: 'Cum ajungi de la comandă la hartă în 5 minute',
    subtitle: 'Onboarding simplu. Valoare imediată. Nici o durere.',
    steps: [
      { title: 'Comanzi la un magazin partener', desc: 'Dai comanda ca de obicei.' },
      { title: 'Primești SMS cu link live', desc: 'Tap pe link. Deschide hartă direct din browser, fără app.' },
      { title: 'Primul wow moment', desc: 'Îl vezi pe curier mișcând pe hartă. Acesta e Livra.' },
      { title: 'Descarci pentru mai mult', desc: 'Un tap. Gata. App instalat.' },
      { title: '60 de secunde de setup', desc: 'Marchezi ușa ta pe hartă, adaugi telefon, gata. Nu mai completezi nimic niciodată.' },
    ],
  },
  stats: [
    { value: '30s', label: 'Actualizare GPS' },
    { value: '10 min', label: 'Notificare înainte' },
    { value: '0', label: 'Formulare de completat' },
    { value: '100%', label: 'Gratuit pentru tine' },
  ],
  testimonials: {
    title: 'Recenzii de la utilizatori reali',
    items: [
      {
        name: 'Sergiu D.',
        location: 'Durlești',
        text: 'Locuiesc pe o stradă care nu apare pe Google Maps. Pin-ul în Livra, o dată. De atunci niciun curier nu m-a mai sunat.',
      },
      {
        name: 'Marina C.',
        location: 'Chișinău',
        text: 'Notificare la 10 minute, am coborât exact pe timp. Niciodată nu am prins livrarea prima dată înainte de Livra.',
      },
      {
        name: 'Alexandru P.',
        location: 'Bălți',
        text: 'Comand des de la magazine diferite. Totul apare în aceeași aplicație. Atât îmi trebuia.',
      },
    ],
  },
  faqs: {
    title: 'Întrebări frecvente',
    items: [
      {
        q: 'Livra e gratuit?',
        a: 'Da, complet gratuit. Plătesc comercianții. Tu doar primești beneficiile.',
      },
      {
        q: 'Funcționează și în sate / zone neobișnuite?',
        a: 'E punctul nostru forte. Nu ai nevoie de adresă pe hartă. Marchezi pe hartă exact unde stai și gata. Toți curierii ajung acolo.',
      },
      {
        q: 'Trebuie obligatoriu aplicația?',
        a: 'Nu. Primești SMS cu link. Deschide hartă direct din browser. Dar cu app, ai notificări și checkout instant.',
      },
      {
        q: 'De ce comercianți pot comanda?',
        a: 'Dacă folosesc Livra, o vei vedea automat. Fiecare partener nou = un motiv să ții aplicația.',
      },
      {
        q: 'Ce se întâmplă dacă curierul nu mă găsește?',
        a: 'Curierul navigă direct la pin-ul tău pe GPS. Dacă e ceva în neregulă, suportul Livra intervine imediat.',
      },
      {
        q: 'Cum salvez o locație?',
        a: 'Prima dată când deschizi Livra, ți se va cere locația. Marchezi pe hartă exact unde stai, dai un nume (Acasă, Birou) și gata. Se salvează forever.',
      },
      {
        q: 'Lucrează Livra și pe iOS?',
        a: 'Da, pe iOS și Android în egală măsură. App Store și Google Play sunt linkurile principale de download.',
      },
    ],
  },
  cta: {
    title: 'Urmărești-ți coletul live\nacum',
    subtitle: 'Fără așteptări. Fără surprize. Doar GPS-ul curierului către ușa ta. Descarcă Livra azi.',
    installSeconds: 'Instalare în 30 de secunde. Gratuit pentru totdeauna.',
  },
  footer: {
    copyright: '© 2026 Livra. Toate drepturile rezervate.',
    forBusiness: 'Pentru business',
    privacy: 'Confidențialitate',
    terms: 'Termeni',
  },
  appStore: 'Descarcă din App Store',
  googlePlay: 'Descarcă din Google Play',
  downloadFrom: 'Descarcă din',
}

const EN: AppDownloadStrings = {
  navbar: {
    forBusiness: 'For business →',
  },
  hero: {
    title1: 'Track the',
    title2: 'courier live.',
    title3: 'Know exactly when.',
    subtitle: 'Every order on the map. 10-minute notice before arrival. No more waiting. No more missed deliveries.',
    free: 'Free',
    iosAndroid: 'iOS & Android',
    setupSeconds: '30 seconds setup',
  },
  painPoints: {
    title: 'Sound familiar?',
    subtitle: 'Every online order in Moldova starts with one hope: "Will the courier actually find me home?"',
    points: [
      {
        title: 'You wait all day',
        body: 'You were told it arrives between 9 and 5. You waited. At 4:58 PM, SMS says they couldn\'t deliver.',
      },
      {
        title: '"Absent" but you were home',
        body: 'They didn\'t ring. Portal says "client absent". You were in the kitchen. Conflict with the store.',
      },
      {
        title: 'Nobody knows where your package is',
        body: 'Status hasn\'t moved since yesterday. You call support. "We\'ll check and get back to you." They don\'t.',
      },
    ],
  },
  liveTracking: {
    title: 'Live GPS. Every 30 seconds.',
    subtitle1: 'The courier\'s location updates constantly on the map. Not a static image. A map that moves in real time. You know exactly where they are, which street they\'re on, when they\'ll arrive.',
    subtitle2: 'The 10-minute notification isn\'t just a feature. It\'s the difference between standing anxious and being ready on time.',
    noDrop: 'No more missed deliveries',
    step1Title: 'Open Livra',
    step1Desc: 'Just grab your phone.',
    step2Title: 'See the courier on the map',
    step2Desc: 'Moving in real time, every 30 seconds.',
    step3Title: 'Accurate ETA',
    step3Desc: '"Arriving at 2:32 PM"not 2:35 or 2:28.',
    step4Title: 'You\'re ready on time',
    step4Desc: 'You come down from the kitchen exactly when they ring.',
  },
  gpsPin: {
    sectionTitle: 'Moldova\'s biggest problem:',
    sectionHighlight: 'Addresses that don\'t exist on maps',
    description1: 'Villages without street names. New buildings not registered. Houses at the edge of town. Without Livra, the courier calls 5 times and wastes 20 minutes.',
    description2: 'With Livra: You drop a pin on your door once. Every courier from any store arrives there directly.',
    howItWorks: 'How it works:',
    howSteps: [
      'Open Livra, tap "Set my location"',
      'Mark on the map exactly where you are',
      'Name the location (Home, Office, Grandma\'s)',
      'Done. All deliveries arrive straight there.',
    ],
    withoutLivra: 'WITHOUT LIVRA',
    withoutItems: [
      'Courier can\'t find the address',
      'You call 3 times',
      'Wastes 20 minutes',
      'Delivery missed',
    ],
    withLivra: 'WITH LIVRA',
    withItems: [
      'Mark on the map exactly where you are',
      'Courier navigates directly',
      'Zero phone calls',
      'First-time delivery',
    ],
  },
  features: {
    title: 'Everything you need',
    subtitle: '8 features that make Livra the #1 app for deliveries in Moldova.',
    items: [
      {
        title: 'Live GPS every 30 seconds',
        desc: 'Courier location updates constantly on the map. Not a status. Live tracking.',
      },
      {
        title: '10-minute advance notice',
        desc: 'Live your life. Livra tells you exactly when to head down. No more misses.',
      },
      {
        title: 'GPS pin for any address',
        desc: 'Live in a village, unnumbered building, new area? Pin it once. Every courier gets there.',
      },
      {
        title: 'All orders in one place',
        desc: 'Electronics, clothes, pharmacy—all from every partner in the same feed.',
      },
      {
        title: 'One-tap checkout',
        desc: 'Set your address once. On every partner site, your info is pre-filled.',
      },
      {
        title: 'You choose the time window',
        desc: 'Morning, afternoon, evening. You decide when to receive. Not the courier company.',
      },
      {
        title: 'Complete history with proof',
        desc: 'Date, time, courier, photo. If there\'s a dispute: "I delivered"—you have proof.',
      },
      {
        title: 'Rate the delivery instantly',
        desc: 'One tap after each delivery. Your feedback helps others and the store.',
      },
    ],
  },
  onboarding: {
    title: 'From order to map in 5 minutes',
    subtitle: 'Simple onboarding. Instant value. No pain.',
    steps: [
      { title: 'Order from a partner store', desc: 'Place your order like always.' },
      { title: 'Get SMS with live link', desc: 'Tap the link. Map opens straight in your browser, no app needed.' },
      { title: 'Your first "wow" moment', desc: 'You see the courier moving on the map. This is Livra.' },
      { title: 'Download for more', desc: 'One tap. Done. App installed.' },
      { title: '60 seconds of setup', desc: 'Mark your door on the map, add your phone, done. Never fill anything out again.' },
    ],
  },
  stats: [
    { value: '30s', label: 'GPS update' },
    { value: '10 min', label: 'Advance notice' },
    { value: '0', label: 'Forms to fill' },
    { value: '100%', label: 'Free for you' },
  ],
  testimonials: {
    title: 'Real user reviews',
    items: [
      {
        name: 'Sergiu D.',
        location: 'Durlești',
        text: 'I live on a street that doesn\'t appear on Google Maps. One pin in Livra. Since then, no courier has ever called me.',
      },
      {
        name: 'Marina C.',
        location: 'Chișinău',
        text: '10-minute notice, I came down on time. I\'ve never caught a delivery first try without Livra.',
      },
      {
        name: 'Alexandru P.',
        location: 'Bălți',
        text: 'I order from different stores often. Everything shows in the same app. That\'s all I needed.',
      },
    ],
  },
  faqs: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Is Livra free?',
        a: 'Yes, completely free. Stores pay. You just get the benefits.',
      },
      {
        q: 'Does it work in villages or unusual areas?',
        a: 'That\'s our strength. You don\'t need a map address. Mark exactly where you are and done. Every courier gets there.',
      },
      {
        q: 'Do I have to download the app?',
        a: 'No. You get an SMS link. Open the map straight in your browser. But with the app, you get notifications and instant checkout.',
      },
      {
        q: 'Which stores can I order from?',
        a: 'Any store using Livra you\'ll see automatically. Every new partner is a reason to keep the app.',
      },
      {
        q: 'What if the courier can\'t find me?',
        a: 'The courier navigates to your pin via GPS. If something\'s wrong, Livra support steps in immediately.',
      },
      {
        q: 'How do I save a location?',
        a: 'First time you open Livra, you\'ll be asked for your location. Mark where you are on the map, give it a name (Home, Office) and done. It\'s saved forever.',
      },
      {
        q: 'Does Livra work on iOS?',
        a: 'Yes, on iOS and Android equally. App Store and Google Play are the main download links.',
      },
    ],
  },
  cta: {
    title: 'Track your package live\nright now',
    subtitle: 'No waiting. No surprises. Just the courier\'s GPS heading to your door. Download Livra today.',
    installSeconds: 'Install in 30 seconds. Free forever.',
  },
  footer: {
    copyright: '© 2026 Livra. All rights reserved.',
    forBusiness: 'For business',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  appStore: 'Download from App Store',
  googlePlay: 'Download from Google Play',
  downloadFrom: 'Download from',
}

const RU: AppDownloadStrings = {
  navbar: {
    forBusiness: 'Для бизнеса →',
  },
  hero: {
    title1: 'Отслеживай',
    title2: 'курьера онлайн.',
    title3: 'Знай точное время.',
    subtitle: 'Каждый заказ на карте. Уведомление за 10 минут. Больше не ждешь 6 часов. Больше не пропускаешь доставки.',
    free: 'Бесплатно',
    iosAndroid: 'iOS и Android',
    setupSeconds: '30 секунд настройки',
  },
  painPoints: {
    title: 'Узнаешь себя?',
    subtitle: 'Каждый интернет-заказ в Молдове начинается с одной надежды: "А вообще найдет ли меня курьер?"',
    points: [
      {
        title: 'Ждешь весь день',
        body: 'Сказали, приедут между 9 и 17. Ждал. В 16:58 СМС, что не смогли доставить.',
      },
      {
        title: '"Отсутствует", а ты был дома',
        body: 'Не позвонил. В системе "клиент отсутствует". Ты был на кухне. Конфликт с магазином.',
      },
      {
        title: 'Никто не знает, где твой заказ',
        body: 'Статус не менялся со вчера. Позвонил в поддержку. "Проверим и ответим." Не ответили.',
      },
    ],
  },
  liveTracking: {
    title: 'GPS онлайн. Каждые 30 секунд.',
    subtitle1: 'Местоположение курьера обновляется постоянно на карте. Не статичная картинка. Карта, которая движется в реальном времени. Ты точно знаешь, где он, на какой улице, когда приедет.',
    subtitle2: 'Уведомление за 10 минут это не просто фишка. Это разница между тревогой и уверенностью.',
    noDrop: 'Больше не пропускаешь',
    step1Title: 'Открываешь Livra',
    step1Desc: 'Просто берешь телефон.',
    step2Title: 'Видишь курьера на карте',
    step2Desc: 'Движется в реальном времени, каждые 30 секунд.',
    step3Title: 'Точное время прибытия',
    step3Desc: '"Приедет в 14:32"точно, не в 14:35 и не в 14:28.',
    step4Title: 'Ты готов в нужный момент',
    step4Desc: 'Спускаешься с кухни ровно когда звонит в дверь.',
  },
  gpsPin: {
    sectionTitle: 'Главная проблема Молдовы:',
    sectionHighlight: 'Адреса, которых нет на картах',
    description1: 'Деревни без названий улиц. Новые дома без номеров. Дома на краю села. Без Livra курьер звонит 5 раз и теряет 20 минут.',
    description2: 'С Livra: ставишь пин на дверь один раз. Каждый курьер от любого магазина приезжает прямо туда.',
    howItWorks: 'Как это работает:',
    howSteps: [
      'Открываешь Livra, нажимаешь "Установить мою локацию"',
      'Отмечаешь на карте точно где ты',
      'Называешь место (Дом, Офис, У бабушки)',
      'Готово. Все доставки приезжают прямо туда.',
    ],
    withoutLivra: 'БЕЗ LIVRA',
    withoutItems: [
      'Курьер не находит адрес',
      'Ты звонишь 3 раза',
      'Теряет 20 минут',
      'Доставка не состоялась',
    ],
    withLivra: 'С LIVRA',
    withItems: [
      'Отмечаешь на карте точно где ты',
      'Курьер едет прямо туда',
      'Никаких звонков',
      'Доставка с первого раза',
    ],
  },
  features: {
    title: 'Все что нужно',
    subtitle: '8 фишек которые делают Livra топ-приложением для доставок в Молдове.',
    items: [
      {
        title: 'GPS онлайн каждые 30 секунд',
        desc: 'Локация курьера обновляется постоянно на карте. Не статус. Live карта.',
      },
      {
        title: 'Уведомление за 10 минут',
        desc: 'Живи нормально. Livra сообщит точно когда спускаться. Больше не пропускаешь.',
      },
      {
        title: 'GPS пин для любого адреса',
        desc: 'Живешь в селе, в доме без номера, в новой зоне? Один раз поставишь пин. Все курьеры приезжают туда.',
      },
      {
        title: 'Все заказы в одном месте',
        desc: 'Электроника, одежда, аптека всё от всех партнеров в одной ленте.',
      },
      {
        title: 'Оплата одним тапом',
        desc: 'Один раз указываешь адрес. На каждом сайте партнера данные уже заполнены.',
      },
      {
        title: 'Ты выбираешь время',
        desc: 'Утро, день или вечер. Ты решаешь когда получить. Не служба доставки.',
      },
      {
        title: 'История с доказательствами',
        desc: 'Дата, время, курьер, фото. При спорах: "Доставил"у тебя есть доказательство.',
      },
      {
        title: 'Оценишь доставку сразу',
        desc: 'Один тап после каждой доставки. Твой отзыв помогает другим и магазину.',
      },
    ],
  },
  onboarding: {
    title: 'От заказа до карты за 5 минут',
    subtitle: 'Простая регистрация. Сразу видишь результат. Никаких сложностей.',
    steps: [
      { title: 'Заказ у партнера', desc: 'Оформляешь как обычно.' },
      { title: 'СМС со ссылкой', desc: 'Нажимаешь ссылку. Карта открывается сразу в браузере, без приложения.' },
      { title: 'Первый wow момент', desc: 'Видишь как курьер движется по карте. Это и есть Livra.' },
      { title: 'Скачиваешь приложение', desc: 'Один тап. Готово. Приложение установлено.' },
      { title: '60 секунд настройки', desc: 'Отмечаешь дверь на карте, добавляешь номер, готово. Больше ничего заполнять не нужно.' },
    ],
  },
  stats: [
    { value: '30s', label: 'Обновление GPS' },
    { value: '10 мин', label: 'Уведомление заранее' },
    { value: '0', label: 'Форм для заполнения' },
    { value: '100%', label: 'Бесплатно для тебя' },
  ],
  testimonials: {
    title: 'Отзывы реальных пользователей',
    items: [
      {
        name: 'Сергей Д.',
        location: 'Дурлешты',
        text: 'Я живу на улице которой нет в Google Maps. Один раз поставил пин в Livra. С тех пор ни один курьер не звонит.',
      },
      {
        name: 'Марина К.',
        location: 'Кишинев',
        text: 'Уведомление за 10 минут, я спускаюсь вовремя. Никогда не ловил доставку с первой попытки без Livra.',
      },
      {
        name: 'Александр П.',
        location: 'Бельцы',
        text: 'Часто заказываю из разных магазинов. Всё видно в одном приложении. Вот и всё что нужно.',
      },
    ],
  },
  faqs: {
    title: 'Часто задаваемые вопросы',
    items: [
      {
        q: 'Livra бесплатная?',
        a: 'Да, полностью бесплатная. Платят магазины. Ты просто получаешь выгоду.',
      },
      {
        q: 'Работает ли в селах и необычных местах?',
        a: 'Это наша сила. Не нужен адрес на карте. Отмечаешь точно где ты и готово. Все курьеры приезжают туда.',
      },
      {
        q: 'Обязательно скачивать приложение?',
        a: 'Нет. Приходит СМС со ссылкой. Открываешь карту прямо в браузере. Но с приложением удобнее: уведомления и быстрая оплата.',
      },
      {
        q: 'Какие магазины есть в Livra?',
        a: 'Любой магазин что использует Livra ты увидишь автоматически. Каждый новый партнер причина держать приложение.',
      },
      {
        q: 'Что если курьер меня не найдет?',
        a: 'Курьер едет прямо на твой пин по GPS. Если что-то не так, поддержка Livra вмешается сразу.',
      },
      {
        q: 'Как сохранить адрес?',
        a: 'Когда первый раз откроешь Livra, попросит локацию. Отмечаешь где ты, даешь имя (Дом, Офис) и готово. Сохранится навсегда.',
      },
      {
        q: 'Livra работает на iOS?',
        a: 'Да, на iOS и Android одинаково. App Store и Google Play основные ссылки для скачивания.',
      },
    ],
  },
  cta: {
    title: 'Отслеживай заказ онлайн\nпрямо сейчас',
    subtitle: 'Никаких ожиданий. Никаких сюрпризов. Просто GPS курьера к твоей двери. Скачай Livra сегодня.',
    installSeconds: 'Установка за 30 секунд. Бесплатно навсегда.',
  },
  footer: {
    copyright: '© 2026 Livra. Все права защищены.',
    forBusiness: 'Для бизнеса',
    privacy: 'Приватность',
    terms: 'Условия',
  },
  appStore: 'Скачать из App Store',
  googlePlay: 'Скачать из Google Play',
  downloadFrom: 'Скачать из',
}

export function getAppDownloadStrings(lang: Lang): AppDownloadStrings {
  switch (lang) {
    case 'en':
      return EN
    case 'ru':
      return RU
    default:
      return RO
  }
}
