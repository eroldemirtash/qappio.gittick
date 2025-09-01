"use client";
export const dynamic="force-dynamic";
import * as React from "react";
import Switch from "@/components/ui/Switch"; import { jget, jpatch } from "@/lib/fetcher";
export default function Page(){
  const [val,setVal]=React.useState<boolean>(false); const [loaded,setLoaded]=React.useState(false);
  React.useEffect(()=>{ (async()=>{ try{ const j=await jget<{value?:{use_mocks?:boolean}}|{settings?:any}>("/api/settings"); const v=(j as any)?.value?.use_mocks ?? (j as any)?.settings?.use_mocks ?? false; setVal(!!v);}finally{setLoaded(true);} })(); },[]);
  async function save(v:boolean){ setVal(v); try{ await jpatch("/api/settings",{ use_mocks:v }); }catch{ alert("Kaydedilemedi"); } }
  if(!loaded) return <div className="card p-6">Yükleniyor…</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mock Data</h1>
      <div className="card p-5 flex items-center justify-between">
        <div>
          <div className="font-medium">Mock verileri kullan</div>
          <div className="text-sm text-slate-500">Kapalıyken Supabase'ten gerçek veriler kullanılır.</div>
        </div>
        <Switch checked={val} onChange={save}/>
      </div>
    </div>
  );
}