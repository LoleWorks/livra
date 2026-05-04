import { useTheme } from '../context/ThemeContext'

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold mb-3">Politica de Confidențialitate</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ultima actualizare: 04 mai 2026</p>
        </div>

        <div className="space-y-8">

          <Section title="1. Operatorul de date cu caracter personal" dark={isDark}>
            <p>Platforma <strong>Livra</strong> este un brand al <strong>SRL Lole Works</strong> (IDNO: <strong>1025600025216</strong>), cu sediul la <strong>mun. Chișinău, sec. Botanica, str. Decebal bd. 6, et. 4, Republica Moldova</strong>. SRL Lole Works este operatorul de date cu caracter personal prelucrate prin intermediul platformei Livra.</p>
            <p>Email de contact: <a href="mailto:contact@livra.loleworks.com">contact@livra.loleworks.com</a></p>
            <p>Responsabil cu Protecția Datelor (DPO): <a href="mailto:dpo@livra.loleworks.com">dpo@livra.loleworks.com</a></p>
            <p>Prezenta Politică de Confidențialitate este elaborată în conformitate cu <em>Legea nr. 133/2011 privind protecția datelor cu caracter personal</em> și anticipând cerințele <em>Legii nr. 195/2024</em> (în vigoare din august 2026).</p>
          </Section>

          <Section title="2. Categoriile de date prelucrate" dark={isDark}>
            <p>Livra prelucrează următoarele categorii de date, în funcție de tipul utilizatorului:</p>
            <p><strong>Date ale reprezentanților clienților (organizații):</strong></p>
            <ul>
              <li>Nume, prenume, funcție;</li>
              <li>Adresă de email profesională, număr de telefon;</li>
              <li>Date de facturare și plată (procesate de procesatorul de plăți, nu stocate de Livra);</li>
              <li>Adresa IP, date de sesiune, jurnal de acțiuni în platformă.</li>
            </ul>
            <p><strong>Date ale șoferilor (utilizatori ai aplicației Livra Driver):</strong></p>
            <ul>
              <li>Nume, prenume, număr de telefon;</li>
              <li>Localizare GPS în timp real pe durata turelor active;</li>
              <li>Istoricul rutelor și livrărilor efectuate;</li>
              <li>Date dispozitiv (model, sistem de operare, token push).</li>
            </ul>
            <p><strong>Date ale destinatarilor de colete (introduse de clienții Livra):</strong></p>
            <ul>
              <li>Nume, adresă de livrare, număr de telefon;</li>
              <li>Instrucțiuni speciale de livrare.</li>
            </ul>
          </Section>

          <Section title="3. Scopurile și temeiurile juridice ale prelucrării" dark={isDark}>
            <table className={`w-full text-sm border-collapse ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <thead>
                <tr className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`text-left p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'} font-semibold`}>Scop</th>
                  <th className={`text-left p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'} font-semibold`}>Temei juridic</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Prestarea serviciilor platformei', 'Executarea contractului (art. 5 Legea 133/2011)'],
                  ['Autentificarea și securitatea contului', 'Executarea contractului / Obligație legală'],
                  ['Urmărirea GPS a șoferilor pe durata turelor', 'Executarea contractului / Interes legitim al operatorului'],
                  ['Facturarea și gestiunea financiară', 'Obligație legală (legislație fiscală)'],
                  ['Comunicări despre serviciu (notificări, actualizări)', 'Executarea contractului'],
                  ['Îmbunătățirea platformei prin analize de utilizare', 'Interes legitim (Livra) / Consimțământ'],
                  ['Marketing și comunicări comerciale', 'Consimțământ'],
                  ['Conformitatea legală și prevenirea fraudei', 'Obligație legală / Interes legitim'],
                ].map(([scope, basis], i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : (isDark ? 'bg-gray-900/50' : 'bg-gray-50/50')}>
                    <td className={`p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{scope}</td>
                    <td className={`p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="4. Localizarea GPS și monitorizarea șoferilor" dark={isDark}>
            <p>Aplicația <strong>Livra Driver</strong> colectează localizarea GPS a șoferilor <strong>exclusiv pe durata turelor active</strong>, când aplicația este deschisă și tura este pornită.</p>
            <ul>
              <li>Localizarea nu este colectată în afara orelor de lucru;</li>
              <li>Datele de localizare sunt accesibile doar organizației angajatoare prin intermediul platformei Livra;</li>
              <li>Șoferii sunt informați despre colectarea localizării la prima autentificare și pot vedea statusul urmăririi în aplicație;</li>
              <li>Datele de localizare istorice sunt păstrate conform politicii de retenție a organizației, dar nu mai mult de <strong>12 luni</strong>.</li>
            </ul>
          </Section>

          <Section title="5. Destinatarii datelor (sub-procesatori)" dark={isDark}>
            <p>Livra poate transfera date cu caracter personal către următoarele categorii de destinatari:</p>
            <ul>
              <li><strong>Furnizori de infrastructură cloud</strong> (servere, baze de date) — cu garanții contractuale adecvate;</li>
              <li><strong>Procesatori de plăți</strong> — pentru gestionarea tranzacțiilor financiare;</li>
              <li><strong>Servicii de email și notificări push</strong> — pentru comunicarea cu utilizatorii;</li>
              <li><strong>Servicii de cartografiere</strong> (Google Maps, OpenStreetMap) — pentru afișarea hărților și calculul rutelor;</li>
              <li><strong>Autorități publice</strong> — exclusiv la solicitarea legală expresă.</li>
            </ul>
            <p>Lista completă a sub-procesatorilor este disponibilă la cerere la <a href="mailto:dpo@livra.loleworks.com">dpo@livra.loleworks.com</a>.</p>
          </Section>

          <Section title="6. Transferuri internaționale de date" dark={isDark}>
            <p>Unele dintre serviciile terțe utilizate de Livra pot presupune transferul datelor în afara Republicii Moldova. Astfel de transferuri se realizează exclusiv către țări care asigură un nivel adecvat de protecție sau pe baza garanțiilor contractuale standard (clauze contractuale standard echivalente celor din legislația UE).</p>
          </Section>

          <Section title="7. Drepturile persoanelor vizate" dark={isDark}>
            <p>În conformitate cu Legea nr. 133/2011 (art. 12-18) și Legea nr. 195/2024, aveți următoarele drepturi:</p>
            <ul>
              <li><strong>Dreptul de acces</strong> — dreptul de a obține confirmarea că datele dumneavoastră sunt prelucrate și o copie a acestora;</li>
              <li><strong>Dreptul la rectificare</strong> — dreptul de a solicita corectarea datelor inexacte sau completarea celor incomplete;</li>
              <li><strong>Dreptul la ștergere</strong> — dreptul de a solicita ștergerea datelor atunci când prelucrarea nu mai este necesară sau consimțământul este retras;</li>
              <li><strong>Dreptul la restricționarea prelucrării</strong> — dreptul de a limita prelucrarea în anumite circumstanțe;</li>
              <li><strong>Dreptul la portabilitatea datelor</strong> — dreptul de a primi datele în format structurat, utilizabil pe calculator (disponibil conform Legii 195/2024);</li>
              <li><strong>Dreptul la opoziție</strong> — dreptul de a vă opune prelucrării bazate pe interes legitim sau marketing direct;</li>
              <li><strong>Dreptul de a retrage consimțământul</strong> — fără a afecta legalitatea prelucrării anterioare retragerii.</li>
            </ul>
            <p>Cererile privind exercitarea drepturilor se transmit la: <a href="mailto:dpo@livra.loleworks.com">dpo@livra.loleworks.com</a>. Vom răspunde în termen de <strong>30 de zile calendaristice</strong>.</p>
          </Section>

          <Section title="8. Perioadele de retenție a datelor" dark={isDark}>
            <table className={`w-full text-sm border-collapse ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <thead>
                <tr className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <th className={`text-left p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'} font-semibold`}>Categorie de date</th>
                  <th className={`text-left p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'} font-semibold`}>Perioadă de retenție</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Date de cont (organizație)', 'Pe durata contractului + 3 ani'],
                  ['Date de facturare', '7 ani (obligație fiscală)'],
                  ['Istoricul livrărilor', 'Pe durata contractului + 1 an'],
                  ['Localizare GPS (șoferi)', 'Maximum 12 luni de la colectare'],
                  ['Jurnale de securitate (IP, sesiuni)', '12 luni'],
                  ['Date marketing (cu consimțământ)', 'Până la retragerea consimțământului'],
                ].map(([category, period], i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : (isDark ? 'bg-gray-900/50' : 'bg-gray-50/50')}>
                    <td className={`p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{category}</td>
                    <td className={`p-3 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="9. Securitatea datelor" dark={isDark}>
            <p>Livra implementează măsuri tehnice și organizatorice adecvate pentru protejarea datelor cu caracter personal:</p>
            <ul>
              <li>Criptarea datelor în tranzit (HTTPS/TLS 1.2+);</li>
              <li>Criptarea datelor stocate în baza de date;</li>
              <li>Autentificare cu doi factori pentru accesul administrativ;</li>
              <li>Controlul accesului bazat pe roluri (RBAC);</li>
              <li>Audituri de securitate periodice;</li>
              <li>Proceduri de răspuns la incidente de securitate.</li>
            </ul>
            <p>În cazul unui incident de securitate care afectează datele dumneavoastră, Livra va notifica <strong>Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP)</strong> în termen de <strong>72 de ore</strong> și persoanele afectate fără întârzieri nejustificate, în conformitate cu Legea nr. 195/2024.</p>
          </Section>

          <Section title="10. Cookie-uri și tehnologii similare" dark={isDark}>
            <p>Platforma web Livra utilizează cookie-uri și tehnologii similare pentru:</p>
            <ul>
              <li><strong>Cookie-uri esențiale</strong> — necesare funcționării platformei (sesiune, autentificare), nu necesită consimțământ;</li>
              <li><strong>Cookie-uri analitice</strong> — pentru înțelegerea modului de utilizare a platformei, cu consimțământ;</li>
              <li><strong>Cookie-uri de preferințe</strong> — pentru memorarea setărilor utilizatorului (ex. tema dark/light).</li>
            </ul>
            <p>Puteți gestiona preferințele privind cookie-urile prin setările browserului sau prin panoul de preferințe cookie disponibil pe platformă.</p>
          </Section>

          <Section title="11. Responsabilul cu Protecția Datelor (DPO)" dark={isDark}>
            <p>Livra a desemnat un Responsabil cu Protecția Datelor, accesibil la:</p>
            <ul>
              <li>Email: <a href="mailto:dpo@livra.loleworks.com">dpo@livra.loleworks.com</a></li>
            </ul>
            <p>Puteți contacta DPO pentru orice întrebare privind prelucrarea datelor dumneavoastră cu caracter personal.</p>
          </Section>

          <Section title="12. Dreptul de a depune o plângere" dark={isDark}>
            <p>Dacă considerați că drepturile dumneavoastră privind protecția datelor au fost încălcate, aveți dreptul de a depune o plângere la autoritatea de supraveghere:</p>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} mt-3`}>
              <p className="font-semibold">Centrul Național pentru Protecția Datelor cu Caracter Personal (CNPDCP)</p>
              <p>Adresă: str. Serghei Lazo 48, MD-2004, Chișinău, Republica Moldova</p>
              <p>Telefon: (022) 820 801</p>
              <p>Email: <a href="mailto:centru@datepersonale.md">centru@datepersonale.md</a></p>
              <p>Web: <a href="https://www.datepersonale.md" target="_blank" rel="noopener noreferrer">datepersonale.md</a></p>
            </div>
            <p className="mt-3">Vă încurajăm să ne contactați mai întâi la <a href="mailto:dpo@livra.loleworks.com">dpo@livra.loleworks.com</a> pentru a rezolva orice problemă direct.</p>
          </Section>

          <Section title="13. Actualizarea politicii" dark={isDark}>
            <p>Prezenta Politică de Confidențialitate poate fi actualizată periodic pentru a reflecta modificările legislative sau ale practicilor noastre de prelucrare. Versiunea curentă este întotdeauna disponibilă la <a href="/confidentialitate">livra.loleworks.com/confidentialitate</a>.</p>
            <p>Modificările semnificative vor fi notificate prin email cu cel puțin <strong>15 zile calendaristice</strong> înainte de intrarea în vigoare.</p>
          </Section>

        </div>

        <div className={`mt-12 pt-8 border-t ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'} text-sm`}>
          <p>Pentru exercitarea drepturilor sau orice întrebare privind confidențialitatea datelor: <a href="mailto:dpo@livra.loleworks.com" className="text-[#FF5C2C]">dpo@livra.loleworks.com</a></p>
          <p className="mt-2">
            <a href="/termeni" className="text-[#FF5C2C] hover:underline">Termeni și Condiții de Utilizare</a>
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
