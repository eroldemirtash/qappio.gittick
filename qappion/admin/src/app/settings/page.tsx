"use client";
export const dynamic="force-dynamic";
import * as React from "react";
import Input from "@/components/ui/Input"; import Button from "@/components/ui/Button";
import { jget, jpatch } from "@/lib/fetcher";
export default function Page(){
  const [primary,setPrimary]=React.useState("#1da6ff"); const [secondary,setSecondary]=React.useState("#0a4876"); const [dark,setDark]=React.useState(false);
  React.useEffect(()=>{ (async()=>{ const j=await jget<{theme?:any}>("/api/theme"); const t=j.theme||{}; setPrimary(t.primary??"#1da6ff"); setSecondary(t.secondary??"#0a4876"); setDark(!!t.dark); })(); },[]);
  async function save(){ try{ await jpatch("/api/theme",{ theme:{ primary, secondary, dark } }); alert("Kaydedildi"); }catch(e:any){ alert(e.message); } }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Ayarlar</h1>
      <div className="card p-5 space-y-4">
        <div className="flex gap-4">
          <div><div className="text-sm text-slate-500">Primary</div><Input type="color" value={primary} onChange={e=>setPrimary(e.target.value)} className="w-24 h-10 p-1"/></div>
          <div><div className="text-sm text-slate-500">Secondary</div><Input type="color" value={secondary} onChange={e=>setSecondary(e.target.value)} className="w-24 h-10 p-1"/></div>
          <label className="flex items-center gap-2 ml-4"><input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} /><span>Koyu tema</span></label>
        </div>
        <Button onClick={save}>Kaydet</Button>
      </div>
    </div>
  );
}