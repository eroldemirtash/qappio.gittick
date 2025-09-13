'use client'

import Link from 'next/link'
import { useMemo } from 'react'

type HeaderProps = {
  logoUrl?: string
  gradient?: { start: string; middle: string; end: string }
}

export default function Header({ logoUrl, gradient }: HeaderProps) {
  const bg = useMemo(() => {
    const start = gradient?.start || '#2563eb'
    const middle = gradient?.middle || '#7c3aed'
    const end = gradient?.end || '#059669'
    return `linear-gradient(135deg, ${start}, ${middle}, ${end})`
  }, [gradient])

  const nav = [
    { href: '#features', label: 'Özellikler' },
    { href: '#how-it-works', label: 'Nasıl Çalışır' },
    { href: '#stats', label: 'Rakamlar' },
    { href: '#download', label: 'İndir' },
    { href: '#contact', label: 'İletişim' },
  ]

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur"
      style={{ background: bg }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Qappio" className="h-8 w-auto object-contain" />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center text-white text-lg font-bold">
              Q
            </div>
          )}
          <span className="text-white font-semibold text-lg hidden sm:inline font-comfortaa">Qappio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-white/90 hover:text-white transition-colors text-sm font-comfortaa"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="md:hidden" />
      </div>
    </header>
  )
}


