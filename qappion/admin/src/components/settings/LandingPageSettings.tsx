'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ExternalLink, Eye, Save, RefreshCw } from 'lucide-react'

interface LandingPageContent {
  visibility: {
    header: boolean
    hero: boolean
    features: boolean
    howItWorks: boolean
    stats: boolean
    testimonials: boolean
    cta: boolean
    footer: boolean
  }
  header: {
    logoUrl?: string
    backgroundGradient: {
      start: string
      middle: string
      end: string
    }
  }
  hero: {
    title: string
    subtitle: string
    description: string
    ctaText: string
    backgroundGradient: {
      start: string
      middle: string
      end: string
    }
    phoneMockupImage?: string
    buttonColors: {
      primary: string
      secondary: string
      primaryHover: string
      secondaryHover: string
    }
  }
  stats: {
    users: string
    rating: string
    missions: string
    partners: string
  }
  features: Array<{
    title: string
    description: string
    icon: string
    color: string
  }>
  testimonials: Array<{
    text: string
    author: string
    avatar?: string
  }>
  cta: {
    backgroundGradient: {
      start: string
      middle: string
      end: string
    }
    appStoreButtonText: string
    googlePlayButtonText: string
  }
  footer: {
    logoUrl?: string
    companyName: string
    description: string
    socialLinks: {
      facebook?: string
      instagram?: string
      twitter?: string
      youtube?: string
    }
    contactInfo: {
      email: string
      phone: string
      address: string
    }
  }
}

export default function LandingPageSettings() {
  const [content, setContent] = useState<LandingPageContent>({
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
  })

  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/landing')
        if (response.ok) {
          const { landingSettings } = await response.json()
          if (landingSettings) {
            // Eğer visibility objesi yoksa default değerleri ekle
            const settingsWithVisibility = {
              ...landingSettings,
              visibility: landingSettings.visibility || {
                header: true,
                hero: true,
                features: true,
                howItWorks: true,
                stats: true,
                testimonials: true,
                cta: true,
                footer: true
              },
              hero: {
                ...landingSettings.hero,
                buttonColors: landingSettings.hero?.buttonColors || {
                  primary: '#fbbf24',
                  secondary: 'transparent',
                  primaryHover: '#f59e0b',
                  secondaryHover: '#ffffff'
                }
              }
            }
            setContent(settingsWithVisibility)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/landing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Save error details:', errorData)
        throw new Error(`Failed to save settings: ${errorData.details || errorData.message || response.statusText}`)
      }

      alert('Landing page ayarları başarıyla kaydedildi!')
    } catch (error: any) {
      console.error('Error saving content:', error)
      alert(`Ayarlar kaydedilirken hata oluştu! Detay: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    window.open('/landing', '_blank')
  }

  const handleImageUpload = async (file: File, type: string) => {
    setUploading(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'landing-assets')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      
      // Update the appropriate field based on type
      if (type === 'header-logo') {
        setContent(prev => ({
          ...prev,
          header: { ...prev.header, logoUrl: url }
        }))
      } else
      if (type === 'hero-phone') {
        setContent(prev => ({
          ...prev,
          hero: { ...prev.hero, phoneMockupImage: url }
        }))
      } else if (type.startsWith('testimonial-avatar-')) {
        const index = parseInt(type.split('-')[2])
        setContent(prev => ({
          ...prev,
          testimonials: prev.testimonials.map((t, i) => 
            i === index ? { ...t, avatar: url } : t
          )
        }))
      } else if (type === 'footer-logo') {
        setContent(prev => ({
          ...prev,
          footer: { ...prev.footer, logoUrl: url }
        }))
      }
      
    } catch (err) {
      console.error('Image upload failed:', err)
      alert('Resim yüklenirken hata oluştu')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="ghost">
            <Eye className="mr-2" size={16} />
            Önizleme
          </Button>
          <Button onClick={handlePreview} variant="ghost">
            <ExternalLink className="mr-2" size={16} />
            Canlı Sayfayı Aç
          </Button>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="mr-2 animate-spin" size={16} />
          ) : (
            <Save className="mr-2" size={16} />
          )}
          Kaydet
        </Button>
      </div>

      {/* Sayfa Görünürlük Kontrolleri */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Sayfa Görünürlük Ayarları</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries({
            header: 'Header',
            hero: 'Hero Bölümü',
            features: 'Özellikler',
            howItWorks: 'Nasıl Çalışır',
            stats: 'İstatistikler',
            testimonials: 'Kullanıcı Yorumları',
            cta: 'Çağrı Bölümü',
            footer: 'Footer'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`visibility-${key}`}
                checked={content.visibility?.[key as keyof typeof content.visibility] ?? true}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  visibility: {
                    ...(prev.visibility || {
                      header: true,
                      hero: true,
                      features: true,
                      howItWorks: true,
                      stats: true,
                      testimonials: true,
                      cta: true,
                      footer: true
                    }),
                    [key]: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`visibility-${key}`} className="text-sm font-medium text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Header Section */}
        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Header</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={content.header.logoUrl || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    header: { ...prev.header, logoUrl: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo Yükle</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'header-logo');
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  disabled={uploading === 'header-logo'}
                />
                {uploading === 'header-logo' && (
                  <p className="text-xs text-blue-600 mt-1">Yükleniyor...</p>
                )}
              </div>
            </div>

            {content.header.logoUrl && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo Ön İzleme</label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <img
                    src={content.header.logoUrl}
                    alt="Header Logo Preview"
                    className="h-12 w-auto object-contain mx-auto"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Header Arka Plan Gradyanı</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Rengi</label>
                  <Input
                    type="color"
                    value={content.header.backgroundGradient.start}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      header: { 
                        ...prev.header,
                        backgroundGradient: { ...prev.header.backgroundGradient, start: e.target.value }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orta Renk</label>
                  <Input
                    type="color"
                    value={content.header.backgroundGradient.middle}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      header: { 
                        ...prev.header,
                        backgroundGradient: { ...prev.header.backgroundGradient, middle: e.target.value }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş Rengi</label>
                  <Input
                    type="color"
                    value={content.header.backgroundGradient.end}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      header: { 
                        ...prev.header,
                        backgroundGradient: { ...prev.header.backgroundGradient, end: e.target.value }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradyan Ön İzleme</label>
                <div
                  className="h-12 w-full rounded"
                  style={{
                    background: `linear-gradient(135deg, ${content.header.backgroundGradient.start}, ${content.header.backgroundGradient.middle}, ${content.header.backgroundGradient.end})`
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Hero Bölümü</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="hero-title" className="block text-sm font-medium text-slate-700 mb-1">Ana Başlık</label>
              <Input
                id="hero-title"
                value={content.hero.title}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  hero: { ...prev.hero, title: e.target.value }
                }))}
              />
            </div>
            <div>
              <label htmlFor="hero-subtitle" className="block text-sm font-medium text-slate-700 mb-1">Alt Başlık</label>
              <Input
                id="hero-subtitle"
                value={content.hero.subtitle}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  hero: { ...prev.hero, subtitle: e.target.value }
                }))}
              />
            </div>
            <div>
              <label htmlFor="hero-description" className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
              <Textarea
                id="hero-description"
                value={content.hero.description}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  hero: { ...prev.hero, description: e.target.value }
                }))}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="hero-cta" className="block text-sm font-medium text-slate-700 mb-1">CTA Metni</label>
              <Input
                id="hero-cta"
                value={content.hero.ctaText}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  hero: { ...prev.hero, ctaText: e.target.value }
                }))}
              />
            </div>
            
            {/* Hero Background Gradient */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Arka Plan Gradyan Renkleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Rengi</label>
                  <Input
                    type="color"
                    value={content.hero.backgroundGradient.start}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { 
                        ...prev.hero, 
                        backgroundGradient: { 
                          ...prev.hero.backgroundGradient, 
                          start: e.target.value 
                        }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orta Renk</label>
                  <Input
                    type="color"
                    value={content.hero.backgroundGradient.middle}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { 
                        ...prev.hero, 
                        backgroundGradient: { 
                          ...prev.hero.backgroundGradient, 
                          middle: e.target.value 
                        }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş Rengi</label>
                  <Input
                    type="color"
                    value={content.hero.backgroundGradient.end}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { 
                        ...prev.hero, 
                        backgroundGradient: { 
                          ...prev.hero.backgroundGradient, 
                          end: e.target.value 
                        }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradyan Ön İzleme</label>
                <div 
                  className="h-16 w-full rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${content.hero.backgroundGradient.start}, ${content.hero.backgroundGradient.middle}, ${content.hero.backgroundGradient.end})`
                  }}
                />
              </div>
            </div>

            {/* Phone Mockup Image */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Telefon Mockup Görseli</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Görsel URL</label>
                  <Input
                    placeholder="https://example.com/phone-mockup.png"
                    value={content.hero.phoneMockupImage || ""}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, phoneMockupImage: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Görsel Yükle</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'hero-phone');
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    disabled={uploading === 'hero-phone'}
                  />
                  {uploading === 'hero-phone' && (
                    <p className="text-xs text-blue-600 mt-1">Yükleniyor...</p>
                  )}
                </div>
              </div>
              {content.hero.phoneMockupImage && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Görsel Ön İzleme</label>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <img 
                      src={content.hero.phoneMockupImage} 
                      alt="Phone Mockup Preview" 
                      className="h-32 w-auto object-contain mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hero Button Colors */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-700">Buton Renkleri</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hero-btn-primary" className="block text-sm font-medium text-slate-700 mb-1">Ana Buton Rengi</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="hero-btn-primary"
                      value={content.hero.buttonColors?.primary || '#fbbf24'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), primary: e.target.value }
                        }
                      }))}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={content.hero.buttonColors?.primary || '#fbbf24'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), primary: e.target.value }
                        }
                      }))}
                      placeholder="#fbbf24"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="hero-btn-primary-hover" className="block text-sm font-medium text-slate-700 mb-1">Ana Buton Hover</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="hero-btn-primary-hover"
                      value={content.hero.buttonColors?.primaryHover || '#f59e0b'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), primaryHover: e.target.value }
                        }
                      }))}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={content.hero.buttonColors?.primaryHover || '#f59e0b'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), primaryHover: e.target.value }
                        }
                      }))}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="hero-btn-secondary" className="block text-sm font-medium text-slate-700 mb-1">İkinci Buton Arka Plan</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="hero-btn-secondary"
                      value={content.hero.buttonColors?.secondary || 'transparent'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), secondary: e.target.value }
                        }
                      }))}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={content.hero.buttonColors?.secondary || 'transparent'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), secondary: e.target.value }
                        }
                      }))}
                      placeholder="transparent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="hero-btn-secondary-hover" className="block text-sm font-medium text-slate-700 mb-1">İkinci Buton Hover</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="hero-btn-secondary-hover"
                      value={content.hero.buttonColors?.secondaryHover || '#ffffff'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), secondaryHover: e.target.value }
                        }
                      }))}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={content.hero.buttonColors?.secondaryHover || '#ffffff'}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { 
                          ...prev.hero, 
                          buttonColors: { ...(prev.hero.buttonColors || {}), secondaryHover: e.target.value }
                        }
                      }))}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">İstatistikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stats-users" className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Sayısı</label>
              <Input
                id="stats-users"
                value={content.stats.users}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, users: e.target.value }
                }))}
              />
            </div>
            <div>
              <label htmlFor="stats-rating" className="block text-sm font-medium text-slate-700 mb-1">Uygulama Puanı</label>
              <Input
                id="stats-rating"
                value={content.stats.rating}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, rating: e.target.value }
                }))}
              />
            </div>
            <div>
              <label htmlFor="stats-missions" className="block text-sm font-medium text-slate-700 mb-1">Tamamlanan Görev</label>
              <Input
                id="stats-missions"
                value={content.stats.missions}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, missions: e.target.value }
                }))}
              />
            </div>
            <div>
              <label htmlFor="stats-partners" className="block text-sm font-medium text-slate-700 mb-1">Marka Partneri</label>
              <Input
                id="stats-partners"
                value={content.stats.partners}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  stats: { ...prev.stats, partners: e.target.value }
                }))}
              />
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Özellikler</h3>
          <div className="space-y-4">
            {content.features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`feature-title-${index}`} className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                    <Input
                      id={`feature-title-${index}`}
                      value={feature.title}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        features: prev.features.map((f, i) => 
                          i === index ? { ...f, title: e.target.value } : f
                        )
                      }))}
                    />
                  </div>
                  <div>
                    <label htmlFor={`feature-icon-${index}`} className="block text-sm font-medium text-slate-700 mb-1">İkon</label>
                    <select
                      id={`feature-icon-${index}`}
                      value={feature.icon}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        features: prev.features.map((f, i) => 
                          i === index ? { ...f, icon: e.target.value } : f
                        )
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Target">Target</option>
                      <option value="Gift">Gift</option>
                      <option value="Users">Users</option>
                      <option value="Trophy">Trophy</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Heart">Heart</option>
                      <option value="Star">Star</option>
                      <option value="Zap">Zap</option>
                      <option value="Award">Award</option>
                      <option value="Shield">Shield</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor={`feature-desc-${index}`} className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <Textarea
                    id={`feature-desc-${index}`}
                    value={feature.description}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      features: prev.features.map((f, i) => 
                        i === index ? { ...f, description: e.target.value } : f
                      )
                    }))}
                    rows={2}
                  />
                </div>
                <div>
                  <label htmlFor={`feature-color-${index}`} className="block text-sm font-medium text-slate-700 mb-1">Renk Gradyanı</label>
                  <select
                    id={`feature-color-${index}`}
                    value={feature.color}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      features: prev.features.map((f, i) => 
                        i === index ? { ...f, color: e.target.value } : f
                      )
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="from-blue-500 to-blue-600">Mavi</option>
                    <option value="from-purple-500 to-purple-600">Mor</option>
                    <option value="from-green-500 to-green-600">Yeşil</option>
                    <option value="from-yellow-500 to-yellow-600">Sarı</option>
                    <option value="from-pink-500 to-pink-600">Pembe</option>
                    <option value="from-red-500 to-red-600">Kırmızı</option>
                    <option value="from-indigo-500 to-indigo-600">İndigo</option>
                    <option value="from-teal-500 to-teal-600">Teal</option>
                    <option value="from-orange-500 to-orange-600">Turuncu</option>
                    <option value="from-cyan-500 to-cyan-600">Cyan</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Müşteri Yorumları</h3>
          <div className="space-y-4">
            {content.testimonials.map((testimonial, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div>
                  <label htmlFor={`testimonial-text-${index}`} className="block text-sm font-medium text-slate-700 mb-1">Yorum</label>
                  <Textarea
                    id={`testimonial-text-${index}`}
                    value={testimonial.text}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      testimonials: prev.testimonials.map((t, i) => 
                        i === index ? { ...t, text: e.target.value } : t
                      )
                    }))}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`testimonial-author-${index}`} className="block text-sm font-medium text-slate-700 mb-1">Yazar</label>
                    <Input
                      id={`testimonial-author-${index}`}
                      value={testimonial.author}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        testimonials: prev.testimonials.map((t, i) => 
                          i === index ? { ...t, author: e.target.value } : t
                        )
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Avatar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, `testimonial-avatar-${index}`);
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                      disabled={uploading === `testimonial-avatar-${index}`}
                    />
                    {uploading === `testimonial-avatar-${index}` && (
                      <p className="text-xs text-blue-600 mt-1">Yükleniyor...</p>
                    )}
                  </div>
                </div>
                {testimonial.avatar && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Avatar Ön İzleme</label>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <img 
                        src={testimonial.avatar} 
                        alt="Avatar Preview" 
                        className="h-16 w-16 rounded-full object-cover mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Call-to-Action Bölümü</h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Arka Plan Gradyan Renkleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Rengi</label>
                  <Input
                    type="color"
                    value={content.cta.backgroundGradient.start}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      cta: { 
                        ...prev.cta, 
                        backgroundGradient: { 
                          ...prev.cta.backgroundGradient, 
                          start: e.target.value 
                        }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Orta Renk</label>
                  <Input
                    type="color"
                    value={content.cta.backgroundGradient.middle}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      cta: { 
                        ...prev.cta, 
                        backgroundGradient: { 
                          ...prev.cta.backgroundGradient, 
                          middle: e.target.value 
                        }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş Rengi</label>
                  <Input
                    type="color"
                    value={content.cta.backgroundGradient.end}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      cta: { 
                        ...prev.cta, 
                        backgroundGradient: { 
                          ...prev.cta.backgroundGradient, 
                          end: e.target.value 
                        }
                      }
                    }))}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradyan Ön İzleme</label>
                <div 
                  className="h-16 w-full rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${content.cta.backgroundGradient.start}, ${content.cta.backgroundGradient.middle}, ${content.cta.backgroundGradient.end})`
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">App Store Buton Metni</label>
                <Input
                  value={content.cta.appStoreButtonText}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    cta: { ...prev.cta, appStoreButtonText: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Play Buton Metni</label>
                <Input
                  value={content.cta.googlePlayButtonText}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    cta: { ...prev.cta, googlePlayButtonText: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <section className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Footer Bölümü</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şirket Adı</label>
                <Input
                  value={content.footer.companyName}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    footer: { ...prev.footer, companyName: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={content.footer.logoUrl || ""}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    footer: { ...prev.footer, logoUrl: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
              <Textarea
                value={content.footer.description}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  footer: { ...prev.footer, description: e.target.value }
                }))}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Sosyal Medya Linkleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
                  <Input
                    placeholder="https://facebook.com/qappio"
                    value={content.footer.socialLinks.facebook || ""}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        socialLinks: { ...prev.footer.socialLinks, facebook: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
                  <Input
                    placeholder="https://instagram.com/qappio"
                    value={content.footer.socialLinks.instagram || ""}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        socialLinks: { ...prev.footer.socialLinks, instagram: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Twitter</label>
                  <Input
                    placeholder="https://twitter.com/qappio"
                    value={content.footer.socialLinks.twitter || ""}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        socialLinks: { ...prev.footer.socialLinks, twitter: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">YouTube</label>
                  <Input
                    placeholder="https://youtube.com/qappio"
                    value={content.footer.socialLinks.youtube || ""}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        socialLinks: { ...prev.footer.socialLinks, youtube: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">İletişim Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                  <Input
                    value={content.footer.contactInfo.email}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        contactInfo: { ...prev.footer.contactInfo, email: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                  <Input
                    value={content.footer.contactInfo.phone}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        contactInfo: { ...prev.footer.contactInfo, phone: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                  <Input
                    value={content.footer.contactInfo.address}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      footer: { 
                        ...prev.footer, 
                        contactInfo: { ...prev.footer.contactInfo, address: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
