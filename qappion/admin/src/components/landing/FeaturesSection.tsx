'use client'

import { motion } from 'framer-motion'
import { Target, Gift, Users, Trophy, Smartphone, Heart } from 'lucide-react'

const icons = {
  Target,
  Gift,
  Users,
  Trophy,
  Smartphone,
  Heart
}

const defaultFeatures = [
  {
    icon: 'Target',
    title: 'Eğlenceli Görevler',
    description: 'Markaların sunduğu yaratıcı görevleri tamamla ve puanları topla',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: 'Gift',
    title: 'Harika Ödüller',
    description: 'Topladığın puanlarla gerçek ödüller kazan ve hediye çekleri al',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: 'Users',
    title: 'Sosyal Yarışma',
    description: 'Arkadaşlarınla yarış, liderlik tablosunda yerini al',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: 'Trophy',
    title: 'Başarı Rozetleri',
    description: 'Tamamladığın görevler için özel rozetler kazan',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: 'Smartphone',
    title: 'Kolay Kullanım',
    description: 'Basit ve sezgisel arayüzle görevleri kolayca tamamla',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: 'Heart',
    title: 'Topluluk',
    description: 'Benzer ilgi alanlarına sahip insanlarla bağlantı kur',
    color: 'from-red-500 to-red-600'
  }
]

interface FeaturesSectionProps {
  features?: Array<{
    title: string
    description: string
    icon: string
    color: string
  }>
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-comfortaa">
            Neden <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Qappio</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-comfortaa">
            Qappio ile sadece görevleri tamamlamıyorsun, aynı zamanda eğleniyor, 
            öğreniyor ve topluluk oluşturuyorsun!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(features || defaultFeatures).map((feature, index) => {
            const IconComponent = icons[feature.icon as keyof typeof icons] || Target
            return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-comfortaa">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-comfortaa">
                  {feature.description}
                </p>
              </div>
            </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
