import { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'ro' | 'en' | 'ru'

const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'ro',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('livra_lang') as Lang) || 'ro'
  )
  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('livra_lang', l)
  }
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
