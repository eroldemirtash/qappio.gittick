'use client'

import { motion } from 'framer-motion'
import { Users, Star, Zap, Award } from 'lucide-react'

const defaultStatsArray = [
  {
    icon: Users,
    value: 'users',
    label: 'Aktif Kullanıcı',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    icon: Star,
    value: 'rating',
    label: 'Uygulama Puanı',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    icon: Zap,
    value: 'missions',
    label: 'Tamamlanan Görev',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    icon: Award,
    value: 'partners',
    label: 'Marka Partneri',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }
]

interface StatsSectionProps {
  stats?: {
    users: string
    rating: string
    missions: string
    partners: string
  }
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const defaultStats = {
    users: '50,000+',
    rating: '4.8',
    missions: '1M+',
    partners: '500+'
  }
  
  const statsData = stats || defaultStats
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-comfortaa">
            Rakamlarla <span className="text-yellow-300">Qappio</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto font-comfortaa">
            Milyonlarca kullanıcının tercih ettiği platformda sen de yerini al!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {defaultStatsArray.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className={`w-20 h-20 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <stat.icon className={stat.color} size={32} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-comfortaa">
                  {stat.value === 'users' ? statsData.users :
                   stat.value === 'rating' ? statsData.rating :
                   stat.value === 'missions' ? statsData.missions :
                   stat.value === 'partners' ? statsData.partners : stat.value}
                </div>
                <div className="text-blue-100 text-lg font-medium font-comfortaa">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-yellow-300 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-white mb-4 italic">
                "Qappio sayesinde hem eğleniyorum hem de para kazanıyorum!"
              </p>
              <div className="text-blue-100 font-medium">- Ayşe K.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-yellow-300 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-white mb-4 italic">
                "Görevler çok eğlenceli, arkadaşlarımla yarışmak harika!"
              </p>
              <div className="text-blue-100 font-medium">- Mehmet Y.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2xl p-6 text-center">
              <div className="text-yellow-300 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-white mb-4 italic">
                "Ödüller gerçekten değerli, kesinlikle tavsiye ederim!"
              </p>
              <div className="text-blue-100 font-medium">- Zeynep A.</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
