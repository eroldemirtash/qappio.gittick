import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Sayfa bulunamadı
          </h2>
          
          <p className="text-slate-600 mb-6">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>

          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Ana Sayfa
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()}>
              Geri Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
