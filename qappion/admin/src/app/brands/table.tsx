"use client";
import * as React from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import { jget, jpatch } from "@/lib/fetcher";
import type { Brand } from "@/lib/types";

export default function BrandsTable(){
  const [rows,setRows]=React.useState<Brand[]>([]);
  const [q,setQ]=React.useState(""); const [status,setStatus]=React.useState<"all"|"active"|"passive">("all");
  const [loading,setLoading]=React.useState(true); const [err,setErr]=React.useState<string|null>(null);

  async function load(){
    setLoading(true); setErr(null);
    try{
      const url = status==="all" ? "/api/brands" : `/api/brands?active=${status==="active"}`;
      const data = await jget<{items:Brand[]}>(url);
      setRows(data.items||[]);
    }catch(e:any){ setErr(e.message||"Hata"); } finally{ setLoading(false); }
  }
  React.useEffect(()=>{ load(); },[status]);

  const filtered = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));

  async function toggle(id:string, curr:boolean){
    const prev = rows;
    setRows(rs=>rs.map(r=>r.id===id?{...r,is_active:!curr}:r));
    try{ await jpatch(`/api/brands/${id}`,{is_active:!curr}); }catch{ setRows(prev); alert("Güncellenemedi");}
  }

  if (loading) return <div className="card p-6">Yükleniyor…</div>;
  if (err) return <div className="card p-6 text-red-600">Hata: {err}</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Marka ara…" value={q} onChange={e=>setQ(e.target.value)} className="w-64" />
        <Select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="w-40">
          <option value="all">Tümü</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(b=>(
          <div key={b.id} className="card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {b.brand_profiles?.avatar_url ? (
                <img src={b.brand_profiles.avatar_url!} className="h-10 w-10 rounded-full object-cover" alt=""/>
              ) : <div className="h-10 w-10 rounded-full bg-slate-200" />}
              <div>
                <div className="font-semibold">{b.name}</div>
                {!b.is_active && <div className="text-xs text-slate-500">Pasif</div>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={b.is_active} onChange={()=>toggle(b.id,b.is_active)} />
              <a href={`/brands/${b.id}/edit`} className="text-brand-700 hover:underline">Düzenle</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}