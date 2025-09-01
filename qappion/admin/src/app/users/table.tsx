"use client";
import * as React from "react";
import Input from "@/components/ui/Input";
import { jget } from "@/lib/fetcher";
import type { Profile } from "@/lib/types";
export default function UsersTable(){
  const [rows,setRows]=React.useState<Profile[]>([]); const [q,setQ]=React.useState("");
  const [loading,setLoading]=React.useState(true); const [err,setErr]=React.useState<string|null>(null);
  React.useEffect(()=>{ (async()=>{ try{ const d=await jget<{items:Profile[]}>("/api/users"); setRows(d.items||[]);}catch(e:any){setErr(e.message)}finally{setLoading(false);} })(); },[]);
  const filtered = rows.filter(u => (u.full_name||u.username||"").toLowerCase().includes(q.toLowerCase()));
  if (loading) return <div className="card p-6">Yükleniyor…</div>;
  if (err) return <div className="card p-6 text-red-600">Hata: {err}</div>;
  if (!rows.length) return <div className="card p-6">Henüz kullanıcı yok.</div>;
  return (
    <div className="space-y-3">
      <Input placeholder="Kullanıcı ara…" value={q} onChange={e=>setQ(e.target.value)} className="w-64"/>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(u=>(
          <div key={u.id} className="card p-4 flex items-center gap-3">
            {u.avatar_url ? <img src={u.avatar_url} className="h-10 w-10 rounded-full" alt=""/> : <div className="h-10 w-10 rounded-full bg-slate-200" />}
            <div className="flex-1">
              <div className="font-medium">{u.full_name ?? "—"}</div>
              <div className="text-sm text-slate-500">@{u.username ?? "—"}</div>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-slate-200">{u.role ?? "user"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}