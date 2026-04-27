import { useLang, Lang } from '../context/LanguageContext'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ro', label: 'RO' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            lang === code
              ? 'bg-white dark:bg-gray-700 text-brand-black dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
