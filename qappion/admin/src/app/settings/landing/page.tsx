import { Metadata } from 'next'
import LandingPageSettings from '@/components/settings/LandingPageSettings'

export const metadata: Metadata = {
  title: 'Landing Page Ayarları - Qappio Admin',
  description: 'Landing page içeriğini düzenle ve kontrol et',
}

export default function LandingPageSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Landing Page Ayarları
        </h1>
        <p className="text-gray-600">
          Landing page içeriğini düzenle ve canlı önizleme yap
        </p>
      </div>

      <LandingPageSettings />
    </div>
  )
}
