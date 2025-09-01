"use client";
import * as React from "react";
import Input from "@/components/ui/Input"; import Select from "@/components/ui/Select"; import Switch from "@/components/ui/Switch";
import { jget, jpatch } from "@/lib/fetcher"; import type { Notification } from "@/lib/types";

export default function NotificationsTable(){
  const [rows,setRows]=React.useState<Notification[]>([]); const [q,setQ]=React.useState(""); const [ch,setCh]=React.useState<"all"|"push"|"email"|"inapp">("all");
  const [loading,setLoading]=React.useState(true); const [err,setErr]=React.useState<string|null>(null);
  React.useEffect(()=>{ (async()=>{ try{ const d=await jget<{items:Notification[]}>("/api/notifications"); setRows(d.items||[]);}catch(e:any){setErr(e.message)}finally{setLoading(false);} })(); },[]);
  const filtered = rows.filter(n => n.title.toLowerCase().includes(q.toLowerCase())).filter(n => ch==="all" ? true : n.channel===ch);
  async function toggle(id:string, curr:boolean){
    const prev=rows; setRows(rs=>rs.map(r=>r.id===id?{...r,is_active:!curr}:r));
    try{ await jpatch(`/api/notifications/${id}`,{is_active:!curr}); }catch{ setRows(prev); alert("Kaydedilemedi"); }
  }
  if (loading) return <div className="card p-6">Yükleniyor…</div>;
  if (err) return <div className="card p-6 text-red-600">Hata: {err}</div>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Başlık ara…" value={q} onChange={e=>setQ(e.target.value)} className="w-64"/>
        <Select value={ch} onChange={(e)=>setCh(e.target.value as any)} className="w-40">
          <option value="all">Tümü</option><option value="push">Push</option><option value="email">Email</option><option value="inapp">In-app</option>
        </Select>
      </div>
      <div className="space-y-3">
        {filtered.map(n=>(
          <div key={n.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{n.title} <span className="text-xs ml-2 px-2 py-0.5 rounded bg-slate-200">{n.channel}</span></div>
              <div className="text-sm text-slate-500">{n.scheduled_at ? new Date(n.scheduled_at).toLocaleString() : "Zamanlanmamış"}</div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={n.is_active} onChange={(v)=>toggle(n.id,n.is_active)} />
              <a href={`/notifications/${n.id}/edit`} className="text-brand-700 hover:underline">Düzenle</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}