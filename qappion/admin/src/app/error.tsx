"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Panel Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Bir şeyler ters gitti
          </h2>
          
          <p className="text-slate-600 mb-6">
            Admin panelinde beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-mono text-slate-700 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
