'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
  backgroundGradient?: {
    start: string
    middle: string
    end: string
  }
  phoneMockupImage?: string
  buttonColors?: {
    primary: string
    secondary: string
    primaryHover: string
    secondaryHover: string
  }
}

export default function HeroSection({ 
  title = 'Qappio ile',
  subtitle = 'Görevleri Tamamla',
  description = 'Eğlenceli görevleri tamamla, puanları topla ve harika ödüller kazan! Sosyal medyada paylaş, arkadaşlarınla yarış ve topluluk oluştur.',
  ctaText = 'Hemen İndir',
  backgroundGradient = {
    start: '#2563eb',
    middle: '#7c3aed',
    end: '#059669'
  },
  phoneMockupImage,
  buttonColors = {
    primary: '#fbbf24',
    secondary: 'transparent',
    primaryHover: '#f59e0b',
    secondaryHover: '#ffffff'
  }
}: HeroSectionProps) {
  const [currentText, setCurrentText] = useState(0)
  const texts = [
    'Görevleri Tamamla',
    'Puanları Topla', 
    'Ödülleri Kazan',
    'Arkadaşlarınla Yarış'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length)
    }, 2000)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [texts.length])

  return (
    <section 
      className="relative overflow-hidden py-20"
      style={{
        background: `linear-gradient(135deg, ${backgroundGradient.start}, ${backgroundGradient.middle}, ${backgroundGradient.end})`
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce" />
        <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-ping" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-comfortaa">
              <span className="block">{title}</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                {texts[currentText]}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl leading-relaxed font-comfortaa">
              {description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-start items-start mb-12"
          >
            <button 
              className="text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-comfortaa"
              style={{
                backgroundColor: buttonColors?.primary || '#fbbf24',
                '--hover-bg': buttonColors?.primaryHover || '#f59e0b'
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonColors?.primaryHover || '#f59e0b'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonColors?.primary || '#fbbf24'}
            >
              <Download className="inline mr-2" size={20} />
              {ctaText}
            </button>
            <button 
              className="border-2 border-white text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 font-comfortaa"
              style={{
                backgroundColor: buttonColors?.secondary || 'transparent',
                '--hover-bg': buttonColors?.secondaryHover || '#ffffff',
                '--hover-text': buttonColors?.primary || '#fbbf24'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = buttonColors?.secondaryHover || '#ffffff'
                e.currentTarget.style.color = buttonColors?.primary || '#fbbf24'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = buttonColors?.secondary || 'transparent'
                e.currentTarget.style.color = 'white'
              }}
            >
              Nasıl Çalışır?
            </button>
          </motion.div>

        </div>
      </div>

      {/* Floating phone mockup */}
      {phoneMockupImage && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
        >
          <div className="relative">
            <img 
              src={phoneMockupImage} 
              alt="Phone Mockup" 
              className="w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 lg:w-64 lg:h-96 object-cover drop-shadow-2xl border-2 border-white rounded-2xl mx-auto"
              onError={(e) => console.error('Phone mockup image failed to load:', phoneMockupImage)}
              onLoad={() => console.log('✅ Phone mockup image loaded successfully:', phoneMockupImage)}
            />
          </div>
        </motion.div>
      )}
    </section>
  )
}
