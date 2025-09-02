"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { Brand } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { CreditCard, Download, Eye, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default function FinancePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await jget<{ items: Brand[] }>("/api/brands");
        setBrands(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const plans = [
    {
      name: "Freemium",
      price: "₺0",
      features: [
        "Aylık 5 görev",
        "Maksimum 7 gün süre",
        "Haftalık 1 hakkı",
        "Sponsorlu hakkı yok",
        "Temel özellikler"
      ],
      color: "border-slate-200"
    },
    {
      name: "Premium",
      price: "₺299",
      features: [
        "Aylık 50 görev",
        "Maksimum 30 gün süre",
        "Haftalık 5 hakkı",
        "Sponsorlu hakkı var",
        "Gelişmiş özellikler"
      ],
      color: "border-brand-200"
    },
    {
      name: "Platinum",
      price: "₺599",
      features: [
        "Sınırsız görev",
        "Maksimum 90 gün süre",
        "Haftalık 10 hakkı",
        "Sponsorlu hakkı var",
        "Tüm özellikler"
      ],
      color: "border-amber-200"
    }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Finans & Lisanslar" description="Marka lisanslarını yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
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
        title="Finans & Lisanslar" 
        description="Marka lisanslarını yönetin"
      />

      {error ? (
        <div className="card p-6 border-rose-200 bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-rose-500"></div>
            <div>
              <h3 className="font-medium text-rose-900">Hata</h3>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`card p-6 border-2 ${plan.color}`}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">{plan.price}</div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Button className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button variant="ghost" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Markaya Ata
                </Button>
                <Button variant="ghost" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Teklif İndir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Marka Lisansları</h3>
        {brands.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz marka yok</h3>
            <p className="text-slate-500">Markalar burada görünecek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Marka</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Başlangıç</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Bitiş</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Ücret</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{brand.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-brand-100 text-brand-700">
                        {brand.brand_profiles?.license_plan || "Freemium"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {brand.brand_profiles?.license_start ? 
                        new Date(brand.brand_profiles.license_start).toLocaleDateString('tr-TR') : 
                        "-"
                      }
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {brand.brand_profiles?.license_end ? 
                        new Date(brand.brand_profiles.license_end).toLocaleDateString('tr-TR') : 
                        "-"
                      }
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {brand.brand_profiles?.license_fee ? `₺${brand.brand_profiles.license_fee}` : "₺0"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Düzenle</Button>
                        <Button variant="ghost" size="sm">Görüntüle</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
