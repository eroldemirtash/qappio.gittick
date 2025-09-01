"use client";
import * as React from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import { jget, jpatch } from "@/lib/fetcher";
import type { Mission } from "@/lib/types";

export default function MissionsTable(){
  const [rows,setRows]=React.useState<Mission[]>([]);
  const [q,setQ]=React.useState(""); const [pub,setPub]=React.useState<"all"|"on"|"off">("all");
  const [loading,setLoading]=React.useState(true); const [err,setErr]=React.useState<string|null>(null);

  async function load(){
    setLoading(true); setErr(null);
    try{ const data = await jget<{items:Mission[]}>("/api/missions"); setRows(data.items||[]); }
    catch(e:any){ setErr(e.message||"Hata"); } finally{ setLoading(false); }
  }
  React.useEffect(()=>{ load(); },[]);

  const filtered = rows
    .filter(r => r.title.toLowerCase().includes(q.toLowerCase()))
    .filter(r => pub==="all" ? true : pub==="on" ? r.published : !r.published);

  async function patch(id:string, body:any){
    const prev = rows; setRows(rs=>rs.map(x=>x.id===id?{...x,...body}:x));
    try{ await jpatch(`/api/missions/${id}`, body); }catch{ setRows(prev); alert("Kaydedilemedi"); }
  }

  if (loading) return <div className="card p-6">Yükleniyor…</div>;
  if (err) return <div className="card p-6 text-red-600">Hata: {err}</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Görev ara…" value={q} onChange={e=>setQ(e.target.value)} className="w-64" />
        <Select value={pub} onChange={(e)=>setPub(e.target.value as any)} className="w-48">
          <option value="all">Tümü</option>
          <option value="on">Yayında</option>
          <option value="off">Taslak</option>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map(m=>(
          <div key={m.id} className="card p-4 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              {m.cover_url ? <img src={m.cover_url} className="h-16 w-28 rounded-xl object-cover" alt=""/> : <div className="h-16 w-28 rounded-xl bg-slate-200" />}
              <div>
                <div className="font-semibold">{m.title}</div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  {m.brand?.brand_profiles?.avatar_url && <img src={m.brand.brand_profiles.avatar_url} className="h-5 w-5 rounded-full" alt=""/>}
                  <span>{m.brand?.name ?? "—"}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {m.starts_at ? new Date(m.starts_at).toLocaleDateString() : "—"} - {m.ends_at ? new Date(m.ends_at).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">Yayında</div>
              <Switch checked={m.published} onChange={(v)=>patch(m.id,{published:v})} />
              <div className="text-sm">Haftanın Qappio'su</div>
              <Switch checked={m.is_qappio_of_week} onChange={(v)=>patch(m.id,{is_qappio_of_week:v})} />
              <a href={`/missions/${m.id}/edit`} className="text-brand-700 hover:underline">Düzenle</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}