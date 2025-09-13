'use client'

import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import StatsSection from '@/components/landing/StatsSection'
import CtaSection from '@/components/landing/CtaSection'
import Footer from '@/components/landing/Footer'

interface LandingPageClientProps {
  settings: any
}

export default function LandingPageClient({ settings }: LandingPageClientProps) {
  const visibility = settings.visibility || {
    header: true,
    hero: true,
    features: true,
    howItWorks: true,
    stats: true,
    testimonials: true,
    cta: true,
    footer: true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {visibility.header && (
        <Header 
          logoUrl={settings.header?.logoUrl}
          gradient={settings.header?.backgroundGradient}
        />
      )}
      {visibility.hero && (
        <section id="hero">
          <HeroSection 
            title={settings.hero?.title}
            subtitle={settings.hero?.subtitle}
            description={settings.hero?.description}
            ctaText={settings.hero?.ctaText}
            backgroundGradient={settings.hero?.backgroundGradient}
            phoneMockupImage={settings.hero?.phoneMockupImage}
            buttonColors={settings.hero?.buttonColors || {
              primary: '#fbbf24',
              secondary: 'transparent',
              primaryHover: '#f59e0b',
              secondaryHover: '#ffffff'
            }}
          />
        </section>
      )}
      {visibility.features && (
        <section id="features">
          <FeaturesSection features={settings.features} />
        </section>
      )}
      {visibility.howItWorks && (
        <section id="how-it-works">
          <HowItWorksSection />
        </section>
      )}
      {visibility.stats && (
        <section id="stats">
          <StatsSection stats={settings.stats} />
        </section>
      )}
      {visibility.cta && (
        <section id="download">
          <CtaSection 
            backgroundGradient={settings.cta?.backgroundGradient}
            appStoreButtonText={settings.cta?.appStoreButtonText}
            googlePlayButtonText={settings.cta?.googlePlayButtonText}
          />
        </section>
      )}
      {visibility.footer && (
        <section id="contact">
          <Footer 
            logoUrl={settings.footer?.logoUrl}
            companyName={settings.footer?.companyName}
            description={settings.footer?.description}
            socialLinks={settings.footer?.socialLinks}
            contactInfo={settings.footer?.contactInfo}
          />
        </section>
      )}
    </div>
  )
}
