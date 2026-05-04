import { useTheme } from '../context/ThemeContext'

export default function TermsOfUse() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Nav */}
      <nav className={`sticky top-0 z-50 border-b ${isDark ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 120 32" width="90" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="26" fontFamily="'Georgia', serif" fontSize="28" fontWeight="700" fill={isDark ? '#fff' : '#161513'}>livra</text>
            </svg>
          </a>
          <button
            onClick={toggle}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            aria-label="Schimbă tema"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3">Termeni și Condiții de Utilizare</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ultima actualizare: 04 mai 2026</p>
        </div>

        <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''} space-y-8`}>

          <Section title="1. Identificarea prestatorului de servicii" dark={isDark}>
            <p>Platforma <strong>Livra</strong> este un brand operat de <strong>SRL Lole Works</strong> (în continuare „Societatea", „noi" sau „Lole Works"), înregistrată în Republica Moldova cu codul fiscal (IDNO) <strong>1025600025216</strong>, cu sediul social la adresa <strong>mun. Chișinău, sec. Botanica, str. Decebal bd. 6, et. 4, Republica Moldova</strong>.</p>
            <p>Contact: <a href="mailto:contact@loleworks.com" className="text-[#FF5C2C]">contact@loleworks.com</a></p>
            <p>Prezentele Termeni și Condiții reglementează accesul și utilizarea platformei Livra, disponibilă la adresa <strong>livra.loleworks.com</strong> și prin aplicațiile mobile asociate, în conformitate cu <em>Legea nr. 284-XV/2004 privind comerțul electronic</em> și legislația Republicii Moldova.</p>
          </Section>

          <Section title="2. Natura serviciului" dark={isDark}>
            <p>Livra este o platformă de tip <strong>Software-as-a-Service (SaaS)</strong> destinată exclusiv persoanelor juridice și antreprenorilor individuali (clienți comerciali), care oferă:</p>
            <ul>
              <li>Gestionarea livrărilor și rutelor de distribuție;</li>
              <li>Urmărirea în timp real a expedierilor;</li>
              <li>Optimizarea rutelor prin algoritmi VRP;</li>
              <li>Aplicație mobilă dedicată pentru șoferi (Livra Driver);</li>
              <li>Integrări cu platforme e-commerce (WooCommerce, OpenCart).</li>
            </ul>
            <p>Serviciul <strong>nu se adresează consumatorilor persoane fizice</strong> în sensul Legii nr. 105-XV/2003 privind protecția consumatorilor.</p>
          </Section>

          <Section title="3. Acceptarea termenilor" dark={isDark}>
            <p>Prin crearea unui cont, accesarea sau utilizarea platformei Livra, confirmați că aveți capacitate juridică deplină de a încheia contracte în numele entității pe care o reprezentați și că acceptați în totalitate prezentele Termeni și Condiții.</p>
            <p>Dacă nu sunteți de acord cu oricare dintre prevederi, vă rugăm să nu utilizați platforma.</p>
          </Section>

          <Section title="4. Înregistrarea contului" dark={isDark}>
            <p>Pentru a accesa funcționalitățile complete ale platformei, este necesară crearea unui cont de organizație. Vă obligați să:</p>
            <ul>
              <li>Furnizați informații corecte, complete și actualizate la înregistrare;</li>
              <li>Păstrați confidențialitatea credențialelor de acces;</li>
              <li>Notificați imediat Livra în cazul oricărei utilizări neautorizate a contului;</li>
              <li>Răspundeți pentru toate activitățile desfășurate prin contul dumneavoastră.</li>
            </ul>
          </Section>

          <Section title="5. Tarife și plăți" dark={isDark}>
            <p>Platforma Livra se oferă pe baza unui abonament lunar sau anual, conform planului tarifar ales la momentul înregistrării. Tarifele curente sunt disponibile la <a href="/preturi" className="text-[#FF5C2C]">livra.loleworks.com/preturi</a>.</p>
            <ul>
              <li>Plata se efectuează anticipat, la începutul fiecărei perioade de facturare;</li>
              <li>Prețurile sunt exprimate în lei moldovenești (MDL) și includ TVA acolo unde este aplicabil;</li>
              <li>Livra își rezervă dreptul de a modifica tarifele cu notificarea prealabilă a clienților cu cel puțin <strong>30 de zile calendaristice</strong> înainte de intrarea în vigoare;</li>
              <li>Plățile efectuate nu sunt rambursabile, cu excepția cazurilor expres prevăzute de lege sau de prezentele Termeni.</li>
            </ul>
          </Section>

          <Section title="6. Obligațiile utilizatorilor" dark={isDark}>
            <p>Utilizatorul se obligă să nu utilizeze platforma pentru:</p>
            <ul>
              <li>Activități ilegale sau frauduloase;</li>
              <li>Transmiterea de date incorecte sau înșelătoare;</li>
              <li>Perturbarea funcționării normale a platformei;</li>
              <li>Accesul neautorizat la sisteme informatice terțe;</li>
              <li>Copierea, modificarea sau distribuirea neautorizată a componentelor platformei.</li>
            </ul>
          </Section>

          <Section title="7. Proprietate intelectuală" dark={isDark}>
            <p>Platforma Livra, inclusiv codul sursă, interfețele, grafica, logo-urile, algoritmii și documentația, reprezintă proprietatea exclusivă a Societății sau a licențiatorilor săi și este protejată de legislația privind dreptul de autor și drepturile conexe din Republica Moldova.</p>
            <p>Utilizatorul primește o licență <strong>limitată, neexclusivă, netransferabilă</strong> de utilizare a platformei exclusiv în scopuri comerciale interne, pe durata abonamentului activ.</p>
            <p>Orice utilizare a mărcii „Livra", a logo-ului sau a altor elemente de identitate vizuală în afara platformei necesită acordul scris prealabil al Societății.</p>
          </Section>

          <Section title="8. Confidențialitatea datelor și prelucrarea datelor cu caracter personal" dark={isDark}>
            <p>Prelucrarea datelor cu caracter personal în cadrul utilizării platformei este reglementată de <strong>Politica de Confidențialitate</strong> disponibilă la <a href="/confidentialitate" className="text-[#FF5C2C]">livra.loleworks.com/confidentialitate</a>, care face parte integrantă din prezentul contract.</p>
            <p>În cazul în care utilizatorul procesează date cu caracter personal ale terților prin intermediul platformei (ex. date ale destinatarilor de colete, date ale șoferilor), utilizatorul acționează în calitate de <strong>operator de date</strong>, iar Livra în calitate de <strong>persoană împuternicită</strong>, în sensul Legii nr. 133/2011 privind protecția datelor cu caracter personal și al Legii nr. 195/2024.</p>
            <p>Un <strong>Acord privind Prelucrarea Datelor (DPA)</strong> se consideră încheiat între părți prin acceptarea prezentelor Termeni și este disponibil la cerere.</p>
          </Section>

          <Section title="9. Disponibilitatea serviciului (SLA)" dark={isDark}>
            <p>Livra depune eforturi rezonabile pentru a asigura disponibilitatea platformei <strong>99% din timp pe lună calendaristică</strong>, excluzând:</p>
            <ul>
              <li>Perioadele de mentenanță planificată, anunțate în avans;</li>
              <li>Incidentele cauzate de terți (furnizori de infrastructură, telecomunicații);</li>
              <li>Cazurile de forță majoră.</li>
            </ul>
            <p>Livra nu garantează că platforma va fi lipsită de erori sau că va funcționa neîntrerupt în orice moment.</p>
          </Section>

          <Section title="10. Limitarea răspunderii" dark={isDark}>
            <p>În măsura permisă de legislația aplicabilă:</p>
            <ul>
              <li>Livra nu este responsabilă pentru pierderile indirecte, incidentale, speciale sau de profit ale utilizatorilor;</li>
              <li>Răspunderea totală a Livra față de un utilizator nu va depăși valoarea abonamentului plătit în ultimele <strong>3 luni calendaristice</strong> anterioare evenimentului care a generat prejudiciul;</li>
              <li>Livra nu răspunde pentru prejudiciile cauzate de utilizarea incorectă a platformei, de furnizarea de date inexacte sau de acțiunile terților.</li>
            </ul>
          </Section>

          <Section title="11. Suspendarea și încetarea serviciului" dark={isDark}>
            <p><strong>Suspendare de către Livra:</strong> Livra poate suspenda accesul la cont cu notificare prealabilă de 5 zile lucrătoare în caz de neplată sau cu efect imediat în cazul încălcării grave a prezentelor Termeni.</p>
            <p><strong>Încetare la inițiativa utilizatorului:</strong> Utilizatorul poate rezilia abonamentul în orice moment cu un preaviz de 30 de zile calendaristice. Taxele plătite anticipat nu se rambursează pentru perioada rămasă.</p>
            <p><strong>Efectele încetării:</strong> La încetarea contractului, Livra va pune la dispoziția utilizatorului datele introduse în platformă în format CSV/JSON, la cerere, pe o perioadă de 30 de zile de la data încetării.</p>
          </Section>

          <Section title="12. Modificarea termenilor" dark={isDark}>
            <p>Livra poate actualiza prezentele Termeni și Condiții. Modificările semnificative vor fi comunicate utilizatorilor prin email cu cel puțin <strong>15 zile calendaristice</strong> înainte de intrarea în vigoare. Continuarea utilizării platformei după data intrării în vigoare constituie acceptarea modificărilor.</p>
          </Section>

          <Section title="13. Soluționarea reclamațiilor" dark={isDark}>
            <p>În conformitate cu art. 19 din Legea nr. 284-XV/2004 privind comerțul electronic, orice reclamație referitoare la serviciile Livra va fi soluționată în termen de <strong>14 zile calendaristice</strong> de la primire.</p>
            <p>Reclamațiile se transmit la: <a href="mailto:contact@loleworks.com" className="text-[#FF5C2C]">contact@loleworks.com</a></p>
            <p>În cazul în care reclamația nu este soluționată satisfăcător, utilizatorul poate apela la instanțele judecătorești competente din Republica Moldova.</p>
          </Section>

          <Section title="14. Legea aplicabilă și jurisdicția" dark={isDark}>
            <p>Prezentele Termeni și Condiții sunt guvernate de legislația <strong>Republicii Moldova</strong>.</p>
            <p>Orice litigiu care nu poate fi soluționat pe cale amiabilă va fi supus jurisdicției exclusive a <strong>instanțelor judecătorești competente din municipiul Chișinău</strong>.</p>
            <p>Alternativ, părțile pot conveni prin acord scris soluționarea litigiilor prin arbitraj la <strong>Curtea de Arbitraj Internațional Comercial de pe lângă Camera de Comerț și Industrie a Republicii Moldova</strong>.</p>
            <p>SRL Lole Works este entitatea juridică responsabilă pentru toate obligațiile contractuale asumate prin intermediul platformei Livra.</p>
          </Section>

          <Section title="15. Forța majoră" dark={isDark}>
            <p>Niciuna dintre părți nu va fi responsabilă pentru neîndeplinirea obligațiilor contractuale cauzate de evenimente de forță majoră (calamități naturale, conflicte armate, acte normative restrictive, pandemii, atacuri cibernetice de amploare), cu condiția notificării celeilalte părți în termen de 5 zile lucrătoare de la producerea evenimentului.</p>
          </Section>

          <Section title="16. Dispoziții finale" dark={isDark}>
            <p>Dacă oricare prevedere a prezentelor Termeni este declarată nulă sau inaplicabilă, celelalte prevederi rămân în vigoare în măsura permisă de lege.</p>
            <p>Prezentele Termeni reprezintă întregul acord dintre Livra și utilizator cu privire la obiectul lor și înlocuiesc orice înțelegere anterioară.</p>
          </Section>

        </div>

        <div className={`mt-12 pt-8 border-t ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'} text-sm`}>
          <p>Pentru întrebări privind prezentele condiții, ne puteți contacta la <a href="mailto:contact@loleworks.com" className="text-[#FF5C2C]">contact@loleworks.com</a>.</p>
          <p className="mt-2">
            <a href="/confidentialitate" className="text-[#FF5C2C] hover:underline">Politica de Confidențialitate</a>
          </p>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children, dark }: { title: string; children: React.ReactNode; dark: boolean }) {
  return (
    <section>
      <h2 className={`text-xl font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <div className={`space-y-3 text-base leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'} [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-[#FF5C2C] [&_a:hover]:underline [&_strong]:font-semibold ${dark ? '[&_strong]:text-white' : '[&_strong]:text-gray-900'}`}>
        {children}
      </div>
    </section>
  )
}
