"use client";

import { useEffect, useState } from "react";
import { jget, jpatch } from "@/lib/fetcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Database, Download, Upload, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function MocksPage() {
  const [useMocks, setUseMocks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedToken, setSeedToken] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await jget<{ settings: any }>("/api/settings");
        setUseMocks(response.settings?.use_mocks || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleMocks = async () => {
    try {
      await jpatch("/api/settings", {
        key: "use_mocks",
        value: !useMocks
      });
      setUseMocks(!useMocks);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const handleSeed = async () => {
    try {
      // Seed işlemi burada yapılacak
      console.log("Seeding with token:", seedToken);
    } catch (err) {
      console.error("Failed to seed:", err);
    }
  };

  const handleClear = async () => {
    try {
      // Clear işlemi burada yapılacak
      console.log("Clearing data");
    } catch (err) {
      console.error("Failed to clear:", err);
    }
  };

  const handleExport = async () => {
    try {
      // Export işlemi burada yapılacak
      console.log("Exporting data");
    } catch (err) {
      console.error("Failed to export:", err);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Mock Data" description="Test verilerini yönetin" />
        <div className="card p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-slate-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Mock Data" 
        description="Test verilerini yönetin"
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
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Mock Data Ayarları</h3>
            <div className="flex items-center gap-3">
              <Switch
                checked={useMocks}
                onCheckedChange={handleToggleMocks}
              />
              <span className="font-medium">Mock verileri kullan</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Mock verileri aktif olduğunda gerçek veriler yerine test verileri gösterilir.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Veri Yönetimi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seed Token
                </label>
                <Input
                  placeholder="Seed token girin..."
                  value={seedToken}
                  onChange={(e) => setSeedToken(e.target.value)}
                  className="mb-3"
                />
                <Button onClick={handleSeed} disabled={!seedToken}>
                  <Upload className="h-4 w-4 mr-2" />
                  Seed (Server)
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button variant="ghost" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Kullanım</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <strong>Seed:</strong> Test verilerini veritabanına yükler. Seed token gerekli.
              </p>
              <p>
                <strong>Clear:</strong> Tüm test verilerini temizler.
              </p>
              <p>
                <strong>Export:</strong> Mevcut verileri JSON formatında dışa aktarır.
              </p>
              <p>
                <strong>Mock Mode:</strong> Gerçek veriler yerine örnek veriler gösterir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
