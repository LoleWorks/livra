import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const APK_VERSION = '1.0.0'
const APK_FILENAME = 'Livra-Driver.apk'
const APK_PATH = `/downloads/${APK_FILENAME}`

export default function DriverDownload() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      {/* Nav */}
      <nav className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#161616]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#FF5C2C"/>
              <path d="M8 26L14 14L20 22L26 16L32 26H8Z" fill="white" fillOpacity="0.9"/>
            </svg>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Livra</span>
            <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
              Intern
            </span>
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

      {/* Main */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagină internă — acces restricționat
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Aplicația Livra Driver
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Versiunea Android pentru șoferii echipei Livra. Descarcă și instalează direct pe telefon.
          </p>
        </div>

        {/* Download card */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-6">
            {/* App icon */}
            <div className="flex-shrink-0 w-20 h-20 bg-[#FF5C2C] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 30L16 14L22 24L30 16L36 30H8Z" fill="white" fillOpacity="0.95"/>
                <rect x="10" y="32" width="24" height="3" rx="1.5" fill="white" fillOpacity="0.5"/>
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Livra Driver
              </h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  v{APK_VERSION}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Android 8.0+
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  arm64-v8a
                </span>
              </div>
              <a
                href={APK_PATH}
                download={APK_FILENAME}
                className="inline-flex items-center gap-2 bg-[#FF5C2C] hover:bg-[#e64f22] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-orange-500/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descarcă APK
              </a>
            </div>
          </div>
        </div>

        {/* Install instructions */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-8 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Instrucțiuni de instalare
          </h3>
          <ol className="space-y-5">
            {[
              {
                step: '1',
                title: 'Descarcă fișierul APK',
                desc: 'Apasă butonul „Descarcă APK" de mai sus. Fișierul se va salva în folderul Descărcări.'
              },
              {
                step: '2',
                title: 'Permite instalarea din surse necunoscute',
                desc: 'Mergi la Setări → Securitate (sau Aplicații → Instalare aplicații necunoscute) și activează permisiunea pentru browserul sau managerul de fișiere folosit.'
              },
              {
                step: '3',
                title: 'Deschide fișierul APK',
                desc: 'Din notificarea de descărcare sau din managerul de fișiere, apasă pe Livra-Driver.apk și selectează „Instalează".'
              },
              {
                step: '4',
                title: 'Deschide aplicația',
                desc: 'După instalare, găsești Livra Driver în lista de aplicații. La primul acces vei fi rugat să acorzi permisiunile necesare (locație, cameră).'
              }
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#FF5C2C] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">{title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Share link */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                Partajează link-ul cu șoferii
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-500 mb-3">
                Această pagină este accesibilă doar prin link direct. Nu o distribui public.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-300 truncate">
                  {typeof window !== 'undefined' ? window.location.href : ''}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {copied ? 'Copiat!' : 'Copiază'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-white/10 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Livra · Pagină internă · Nu distribui public
        </div>
      </div>
    </div>
  )
}
