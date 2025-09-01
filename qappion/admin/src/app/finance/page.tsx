export const dynamic="force-dynamic";
import * as React from "react";
import { jget } from "@/lib/fetcher"; import type { Brand } from "@/lib/types";
export default async function Page(){
  const { items } = await jget<{items:Brand[]}>("/api/brands");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Finans & Lisanslar</h1>
      <div className="card p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr><th className="px-4 py-3 text-left">Marka</th><th className="px-4 py-3 text-left">Plan</th><th className="px-4 py-3">Başlangıç</th><th className="px-4 py-3">Bitiş</th><th className="px-4 py-3 text-right">Ücret (₺)</th></tr>
          </thead>
          <tbody>
            {(items||[]).map(b=>(
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3">{b.name}</td>
                <td className="px-4 py-3">{b.brand_profiles?.license_plan ?? "—"}</td>
                <td className="px-4 py-3 text-center">{b.brand_profiles?.license_start ?? "—"}</td>
                <td className="px-4 py-3 text-center">{b.brand_profiles?.license_end ?? "—"}</td>
                <td className="px-4 py-3 text-right">{b.brand_profiles?.license_fee ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}