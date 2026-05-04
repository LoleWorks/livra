import { useTheme } from '../context/ThemeContext'

const APK_VERSION = '1.0.0'
const APK_FILENAME = 'Livra-Driver.apk'
const APK_PATH = 'https://github.com/LoleWorks/livra/releases/download/v1.0.0/Livra-Driver.apk'

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
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#FF5C2C"/>
              <path d="M8 26L14 14L20 22L26 16L32 26H8Z" fill="white" fillOpacity="0.9"/>
            </svg>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Livra</span>
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
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-5">
              <span className="w-2 h-2 bg-[#FF5C2C] rounded-full animate-pulse" />
              Android · v{APK_VERSION}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Livra Driver
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              Aplicația pentru șoferi — gestionează livrările, urmărește ruta și confirmă comenzile direct de pe telefon.
            </p>
            <a
              href={APK_PATH}
              download={APK_FILENAME}
              className="inline-flex items-center gap-3 bg-[#FF5C2C] hover:bg-[#e64f22] active:bg-[#cc4520] text-white font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-orange-500/25 text-lg"
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

          {/* App icon */}
          <div className="flex-shrink-0">
            <div className="w-36 h-36 bg-[#FF5C2C] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M12 56L26 26L38 46L54 30L68 56H12Z" fill="white" fillOpacity="0.95"/>
                <rect x="16" y="60" width="48" height="5" rx="2.5" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Cum instalezi aplicația
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10">
          Urmează pașii de mai jos — durează mai puțin de 2 minute.
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
