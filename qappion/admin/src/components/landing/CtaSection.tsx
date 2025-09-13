'use client'

import { motion } from 'framer-motion'
import { Download, ArrowRight, Smartphone } from 'lucide-react'

interface CtaSectionProps {
  backgroundGradient?: {
    start: string
    middle: string
    end: string
  }
  appStoreButtonText?: string
  googlePlayButtonText?: string
}

export default function CtaSection({ 
  backgroundGradient = {
    start: '#fbbf24',
    middle: '#f97316',
    end: '#ef4444'
  },
  appStoreButtonText = 'App Store\'dan İndir',
  googlePlayButtonText = 'Google Play\'den İndir'
}: CtaSectionProps) {
  return (
    <section 
      className="py-20"
      style={{
        background: `linear-gradient(135deg, ${backgroundGradient.start}, ${backgroundGradient.middle}, ${backgroundGradient.end})`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-comfortaa">
              Hemen <span className="text-black">Başla</span>!
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-comfortaa">
              Qappio dünyasına katıl ve görevleri tamamlayarak ödülleri kazanmaya başla!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center font-comfortaa">
              <Download className="mr-2" size={20} />
              {appStoreButtonText}
            </button>
            <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center font-comfortaa">
              <Smartphone className="mr-2" size={20} />
              {googlePlayButtonText}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center mb-4">
              <ArrowRight className="text-white mr-2" size={24} />
              <span className="text-white font-bold text-lg font-comfortaa">Hemen Başlamak İçin</span>
            </div>
            <div className="text-white text-sm space-y-2 font-comfortaa">
              <div>✅ Ücretsiz kayıt ol</div>
              <div>✅ İlk görevini seç</div>
              <div>✅ Puanları topla</div>
              <div>✅ Ödülünü kazan!</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
