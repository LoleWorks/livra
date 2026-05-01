import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('livra-theme') as Theme | null
    return saved ?? 'light'
  })

  useEffect(() => {
    // Apply to html element so Tailwind dark: variants match via CSS
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('livra-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {/* Wrapper div carries .dark class so React re-renders propagate the change */}
      <div className={theme === 'dark' ? 'dark h-full' : 'h-full'}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
