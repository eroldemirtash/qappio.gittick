"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Users,
  Target,
  Upload,
  RefreshCw,
  Crown,
  Zap
} from "lucide-react";

export default function LicensePage() {
  const [loading] = useState(false);

  // Demo verileri
  const currentPlan = {
    name: "Premium",
    price: "₺299",
    period: "aylık",
    endDate: "2024-12-15",
    features: [
      "Aylık 50 görev",
      "Maksimum 30 gün süre",
      "Haftalık 5 hakkı",
      "Sponsorlu hakkı var",
      "Gelişmiş analitikler",
      "Öncelikli destek"
    ]
  };

  const usageStats = [
    { name: "Aktif Görevler", used: 12, limit: 50, unit: "görev" },
    { name: "Aylık İçerik Yükleme", used: 8, limit: 100, unit: "dosya" },
    { name: "Takım Üyeleri", used: 3, limit: 10, unit: "kişi" },
    { name: "API Çağrıları", used: 2500, limit: 10000, unit: "çağrı" }
  ];

  const billingHistory = [
    { date: "2024-11-15", amount: 299, status: "paid", description: "Premium Plan - Kasım 2024" },
    { date: "2024-10-15", amount: 299, status: "paid", description: "Premium Plan - Ekim 2024" },
    { date: "2024-09-15", amount: 299, status: "paid", description: "Premium Plan - Eylül 2024" },
    { date: "2024-08-15", amount: 0, status: "free", description: "Ücretsiz Plan - Ağustos 2024" }
  ];

  const planComparison = [
    {
      name: "Freemium",
      price: "₺0",
      period: "aylık",
      features: [
        "Aylık 5 görev",
        "Maksimum 7 gün süre",
        "Haftalık 1 hakkı",
        "Temel analitikler",
        "E-posta destek"
      ],
      current: false,
      popular: false
    },
    {
      name: "Premium",
      price: "₺299",
      period: "aylık",
      features: [
        "Aylık 50 görev",
        "Maksimum 30 gün süre",
        "Haftalık 5 hakkı",
        "Sponsorlu hakkı var",
        "Gelişmiş analitikler",
        "Öncelikli destek"
      ],
      current: true,
      popular: true
    },
    {
      name: "Platinum",
      price: "₺599",
      period: "aylık",
      features: [
        "Sınırsız görev",
        "Maksimum 90 gün süre",
        "Haftalık 10 hakkı",
        "Sponsorlu hakkı var",
        "Tüm özellikler",
        "7/24 destek",
        "Özel API erişimi"
      ],
      current: false,
      popular: false
    }
  ];

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'free': return <AlertCircle className="h-4 w-4 text-slate-600" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Lisans & Plan" description="Planınızı ve kullanımınızı yönetin" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Lisans & Plan" 
        description="Planınızı ve kullanımınızı yönetin"
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Lisans & Plan" }
        ]}
      />

      {/* Mevcut Plan */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
              <Crown className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{currentPlan.name} Plan</h3>
              <p className="text-sm text-slate-600">Aktif planınız</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{currentPlan.price}</p>
            <p className="text-sm text-slate-600">/{currentPlan.period}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Yenileme Tarihi</p>
            <p className="font-medium text-slate-900">
              {new Date(currentPlan.endDate).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Kalan Gün</p>
            <p className="font-medium text-slate-900">
              {Math.ceil((new Date(currentPlan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button variant="ghost" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fatura Geçmişi
          </Button>
        </div>
      </div>

      {/* Kullanım İstatistikleri */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Kullanım İstatistikleri</h3>
        <div className="space-y-4">
          {usageStats.map((stat, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{stat.name}</span>
                <span className="text-sm text-slate-600">
                  {stat.used} / {stat.limit} {stat.unit}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(stat.used, stat.limit)}`}
                  style={{ width: `${Math.min((stat.used / stat.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Karşılaştırması */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Plan Karşılaştırması</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planComparison.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-lg border-2 ${
                plan.current
                  ? 'border-brand-200 bg-brand-50'
                  : plan.popular
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Popüler
                  </span>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Mevcut Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.current
                    ? 'bg-brand-600 hover:bg-brand-700'
                    : plan.popular
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Mevcut Plan' : 'Planı Seç'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Faturalama Geçmişi */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Faturalama Geçmişi</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Açıklama</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tutar</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((bill, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {new Date(bill.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">{bill.description}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {bill.amount === 0 ? 'Ücretsiz' : `₺${bill.amount}`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(bill.status)}
                      <span className="text-sm text-slate-600 capitalize">
                        {bill.status === 'paid' ? 'Ödendi' : 'Ücretsiz'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">
                      İndir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
