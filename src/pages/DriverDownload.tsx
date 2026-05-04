import { useTheme } from '../context/ThemeContext'
import { PhoneFrame, HomeScreenSVG, DeliveryDetailSVG, ConfirmSVG } from '../components/DriverPhones'

const APK_VERSION = '1.0.0'
const APK_FILENAME = 'Livra-Driver.apk'
const APK_PATH = 'https://github.com/LoleWorks/livra-releases/releases/download/v1.0.0/Livra-Driver.apk'

const STEPS = [
  {
    step: '1',
    title: 'Descarcă aplicația',
    desc: 'Apasă butonul „Descarcă aplicația" de mai jos. Fișierul APK se va salva automat în folderul Descărcări al telefonului.'
  },
  {
    step: '2',
    title: 'Permite instalarea',
    desc: 'La prima instalare, Android îți va cere permisiunea de a instala aplicații din surse externe. Apasă „Setări" și activează opțiunea, apoi revino și continuă instalarea.'
  },
  {
    step: '3',
    title: 'Instalează aplicația',
    desc: 'Deschide fișierul descărcat din notificări sau din managerul de fișiere și apasă „Instalează". Durează câteva secunde.'
  },
  {
    step: '4',
    title: 'Conectează-te la cont',
    desc: 'Deschide Livra Driver, introdu adresa de email și parola primite de la compania ta și ești gata de lucru.'
  }
]

export default function DriverDownload() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      {/* Nav */}
      <nav className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
            <svg width="36" height="4" viewBox="0 0 36 4">
              <line x1="0" y1="2" x2="28" y2="2" stroke="#FF5C2C" strokeWidth="1.5"/>
              <polygon points="28,0 36,2 28,4" fill="#FF5C2C"/>
            </svg>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="flex-1 text-center md:text-left w-full">
            <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-5">
              <span className="w-2 h-2 bg-[#FF5C2C] rounded-full animate-pulse" />
              Android · v{APK_VERSION}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Livra Driver
            </h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto md:mx-0">
              Aplicația pentru șoferi. Gestionează livrările, urmărește ruta și confirmă comenzile direct de pe telefon.
            </p>
            <a
              href={APK_PATH}
              download={APK_FILENAME}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-3 bg-[#FF5C2C] hover:bg-[#e64f22] active:bg-[#cc4520] text-white font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-orange-500/25 text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descarcă aplicația
            </a>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
              Android 8.0 sau mai nou · ~57 MB
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/driver-icon.png"
              alt="Livra Driver"
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-[2.5rem] shadow-2xl shadow-orange-500/30"
            />
          </div>
        </div>
      </div>

      {/* App UI Showcase */}
      <div className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-white/10">
        <div className="py-10 md:py-16">
          <div className="text-center mb-10 px-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Cum arată aplicația
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Interfață simplă și clară, designată pentru șoferi care lucrează în mișcare.
            </p>
          </div>

          <div className="flex flex-row gap-8 overflow-x-auto snap-x snap-mandatory md:snap-none md:justify-center md:overflow-x-visible px-6 pb-6">
            <PhoneFrame
              title="Ruta de azi"
              desc="Toate livrările zilei într-un singur card: distanță, timp estimat și primul punct de start."
            >
              <HomeScreenSVG />
            </PhoneFrame>

            <PhoneFrame
              title="Detalii livrare"
              desc="Adresa, clientul, telefonul. Un tap deschide Google Maps sau Waze cu ruta deja setată."
            >
              <DeliveryDetailSVG />
            </PhoneFrame>

            <PhoneFrame
              title="Confirmare livrare"
              desc="Marchează livrarea ca reușită sau nereușită. Aplicația trece automat la următoarea oprire."
            >
              <ConfirmSVG />
            </PhoneFrame>
          </div>

          <p className="md:hidden text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            ← Glisează pentru mai multe →
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Cum instalezi aplicația
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10">
          Urmează pașii de mai jos. Durează mai puțin de 2 minute.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {STEPS.map(({ step, title, desc }) => (
            <div
              key={step}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-[#FF5C2C] text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md shadow-orange-500/20">
                {step}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div className="mt-8 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#FF5C2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cerințe minime
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Sistem de operare', value: 'Android 8.0+' },
              { label: 'Spațiu necesar', value: '~120 MB' },
              { label: 'Conexiune internet', value: 'Necesară pentru livrări' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">{label}</p>
                <p className="font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="mt-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-6 flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Ai nevoie de ajutor?</p>
            <p className="text-blue-700 dark:text-blue-400">
              Contactează managerul companiei tale sau scrie-ne la{' '}
              <a href="mailto:support@livra.md" className="underline font-medium">support@livra.md</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Livra · Platformă de livrări pentru Moldova
        </div>
      </div>
    </div>
  )
}
