import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const INDUSTRII = [
  { label: 'E-commerce', to: '/industrii/ecommerce' },
  { label: 'Farmacii', to: '/industrii/farmacii' },
  { label: 'Florării & cadouri', to: '/industrii/florarii' },
  { label: 'Magazine alimentare & supermarketuri', to: '/industrii/grocery' },
  { label: 'B2B & distribuție', to: '/industrii/b2b' },
]

const CAZURI = [
  { label: 'Optimizare rute', to: '/cazuri/optimizare-rute' },
  { label: 'Tracking live', to: '/cazuri/tracking-live' },
  { label: 'Integrare WooCommerce', to: '/cazuri/integrare-woocommerce' },
  { label: 'Gestionare șoferi', to: '/cazuri/gestionare-soferi' },
  { label: 'Notificări SMS', to: '/cazuri/notificari-sms' },
]

function Dropdown({ label, items, open, onOpen, onClose }: {
  label: string
  items: { label: string; to: string }[]
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
        {label} <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-1.5 w-56">
            {items.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-4 py-2 text-[13px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LandingNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  function anchor(hash: string) {
    return isLanding ? hash : `/${hash}`
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-[15px] font-bold text-[#161513] dark:text-white tracking-widest uppercase">Livra</span>
          <svg width="36" height="4" viewBox="0 0 36 4">
            <line x1="0" y1="2" x2="28" y2="2" stroke="#ff5c2c" strokeWidth="1.5" />
            <polygon points="28,0 36,2 28,4" fill="#ff5c2c" />
          </svg>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-[13px] text-zinc-500 dark:text-zinc-400">
          <a href={anchor('#cum-functioneaza')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Cum funcționează
          </a>
          <a href={anchor('#functionalitati')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Funcționalități
          </a>
          <Dropdown
            label="Industrii"
            items={INDUSTRII}
            open={openMenu === 'industrii'}
            onOpen={() => setOpenMenu('industrii')}
            onClose={() => setOpenMenu(null)}
          />
          <Dropdown
            label="Cazuri de utilizare"
            items={CAZURI}
            open={openMenu === 'cazuri'}
            onOpen={() => setOpenMenu('cazuri')}
            onClose={() => setOpenMenu(null)}
          />
          <a href={anchor('#retea')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Rețeaua Livra
          </a>
          <a href={anchor('#preturi')} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Prețuri
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 transition-colors"
          >
            Autentificare
          </Link>
          <a
            href={anchor('#contact')}
            className="text-[13px] font-medium bg-[#ff5c2c] hover:bg-[#e04a1f] text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Solicită demo
          </a>
        </div>
      </div>
    </nav>
  )
}
