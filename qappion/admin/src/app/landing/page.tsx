import { Metadata } from 'next'
import { sbAdmin } from '@/lib/supabase-admin'
import LandingPageClient from '@/components/landing/LandingPageClient'

export const metadata: Metadata = {
  title: 'Qappio - Görevleri Tamamla, Puanları Topla!',
  description: 'Qappio ile eğlenceli görevleri tamamla, puanları topla ve ödülleri kazan! Sosyal medyada paylaş, arkadaşlarınla yarış.',
  keywords: 'görev, puan, ödül, sosyal medya, yarışma, Qappio',
  openGraph: {
    title: 'Qappio - Görevleri Tamamla, Puanları Topla!',
    description: 'Eğlenceli görevleri tamamla, puanları topla ve ödülleri kazan!',
    type: 'website',
  },
}

export default async function LandingPage() {
  const supabase = sbAdmin()
  
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'landing_page')
    .single()

  const landingSettings = data?.value || {
    visibility: {
      header: true,
      hero: true,
      features: true,
      howItWorks: true,
      stats: true,
      testimonials: true,
      cta: true,
      footer: true
    },
    header: {
      logoUrl: '',
      backgroundGradient: {
        start: '#0ea5e9',
        middle: '#6366f1',
        end: '#22c55e'
      }
    },
    hero: {
      title: 'Qappio ile',
      subtitle: 'Görevleri Tamamla',
      description: 'Eğlenceli görevleri tamamla, puanları topla ve harika ödüller kazan! Sosyal medyada paylaş, arkadaşlarınla yarış ve topluluk oluştur.',
      ctaText: 'Hemen İndir',
      backgroundGradient: {
        start: '#2563eb',
        middle: '#7c3aed',
        end: '#059669'
      },
        phoneMockupImage: '',
        buttonColors: {
          primary: '#fbbf24',
          secondary: 'transparent',
          primaryHover: '#f59e0b',
          secondaryHover: '#ffffff'
        }
      },
    stats: {
      users: '50,000+',
      rating: '4.8',
      missions: '1M+',
      partners: '500+'
    },
    features: [
      {
        title: 'Eğlenceli Görevler',
        description: 'Markaların sunduğu yaratıcı görevleri tamamla ve puanları topla',
        icon: 'Target',
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Harika Ödüller',
        description: 'Topladığın puanlarla gerçek ödüller kazan ve hediye çekleri al',
        icon: 'Gift',
        color: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Sosyal Yarışma',
        description: 'Arkadaşlarınla yarış, liderlik tablosunda yerini al',
        icon: 'Users',
        color: 'from-green-500 to-green-600'
      },
      {
        title: 'Başarı Rozetleri',
        description: 'Tamamladığın görevler için özel rozetler kazan',
        icon: 'Trophy',
        color: 'from-yellow-500 to-yellow-600'
      },
      {
        title: 'Kolay Kullanım',
        description: 'Basit ve sezgisel arayüzle görevleri kolayca tamamla',
        icon: 'Smartphone',
        color: 'from-pink-500 to-pink-600'
      },
      {
        title: 'Topluluk',
        description: 'Benzer ilgi alanlarına sahip insanlarla bağlantı kur',
        icon: 'Heart',
        color: 'from-red-500 to-red-600'
      }
    ],
    testimonials: [
      {
        text: 'Qappio sayesinde hem eğleniyorum hem de para kazanıyorum!',
        author: 'Ayşe K.',
        avatar: ''
      },
      {
        text: 'Görevler çok eğlenceli, arkadaşlarımla yarışmak harika!',
        author: 'Mehmet Y.',
        avatar: ''
      },
      {
        text: 'Ödüller gerçekten değerli, kesinlikle tavsiye ederim!',
        author: 'Zeynep A.',
        avatar: ''
      }
    ],
    cta: {
      backgroundGradient: {
        start: '#fbbf24',
        middle: '#f97316',
        end: '#ef4444'
      },
      appStoreButtonText: 'App Store\'dan İndir',
      googlePlayButtonText: 'Google Play\'den İndir'
    },
    footer: {
      logoUrl: '',
      companyName: 'Qappio',
      description: 'Görevleri tamamla, puanları topla ve harika ödüller kazan! Sosyal medyada paylaş, arkadaşlarınla yarış ve topluluk oluştur.',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      },
      contactInfo: {
        email: 'info@qappio.com',
        phone: '+90 (212) 555-0123',
        address: 'İstanbul, Türkiye'
      }
    }
  }

  return <LandingPageClient settings={landingSettings} />
}
