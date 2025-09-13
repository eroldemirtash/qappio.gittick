'use client'

import { motion } from 'framer-motion'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

interface FooterProps {
  logoUrl?: string
  companyName?: string
  description?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  contactInfo?: {
    email: string
    phone: string
    address: string
  }
}

export default function Footer({ 
  logoUrl,
  companyName = 'Qappio',
  description = 'Görevleri tamamla, puanları topla ve harika ödüller kazan! Sosyal medyada paylaş, arkadaşlarınla yarış ve topluluk oluştur.',
  socialLinks = {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  contactInfo = {
    email: 'info@qappio.com',
    phone: '+90 (212) 555-0123',
    address: 'İstanbul, Türkiye'
  }
}: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
              )}
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-comfortaa">
                {companyName}
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md font-comfortaa">
              {description}
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">i</span>
              </div>
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">y</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-4 font-comfortaa">Hızlı Linkler</h4>
            <ul className="space-y-2 font-comfortaa">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Nasıl Çalışır?</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Görevler</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Ödüller</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Liderlik Tablosu</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">SSS</a></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-bold mb-4 font-comfortaa">İletişim</h4>
            <ul className="space-y-3 font-comfortaa">
              <li className="flex items-center text-gray-300">
                <Mail className="mr-2" size={16} />
                {contactInfo.email}
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="mr-2" size={16} />
                {contactInfo.phone}
              </li>
              <li className="flex items-center text-gray-300">
                <MapPin className="mr-2" size={16} />
                {contactInfo.address}
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0 font-comfortaa">
            © 2024 Qappio. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center text-gray-400 text-sm font-comfortaa">
            <span>Made with</span>
            <Heart className="mx-1 text-red-500" size={16} />
            <span>in Turkey</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
