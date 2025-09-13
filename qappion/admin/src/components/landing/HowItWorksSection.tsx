'use client'

import { motion } from 'framer-motion'
import { Download, Target, Gift, Share2 } from 'lucide-react'

const steps = [
  {
    icon: Download,
    title: 'Uygulamayı İndir',
    description: 'Qappio\'yu App Store veya Google Play\'den ücretsiz indir',
    color: 'bg-blue-500'
  },
  {
    icon: Target,
    title: 'Görevleri Seç',
    description: 'İlgi alanlarına uygun görevleri seç ve başla',
    color: 'bg-purple-500'
  },
  {
    icon: Share2,
    title: 'Paylaş ve Tamamla',
    description: 'Görevleri sosyal medyada paylaş ve tamamla',
    color: 'bg-green-500'
  },
  {
    icon: Gift,
    title: 'Ödülünü Al',
    description: 'Puanları topla ve harika ödüller kazan',
    color: 'bg-yellow-500'
  }
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-comfortaa">
            Nasıl <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Çalışır</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-comfortaa">
            Sadece 4 basit adımda Qappio dünyasına katıl ve ödülleri kazanmaya başla!
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0" />
                )}
                
                <div className="relative z-10 text-center">
                  <div className={`w-32 h-32 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                    <step.icon className="text-white" size={40} />
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-2 font-comfortaa">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 font-comfortaa">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-comfortaa">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-comfortaa">
            Hemen Başla!
          </button>
        </motion.div>
      </div>
    </section>
  )
}
