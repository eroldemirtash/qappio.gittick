"use client";
import * as React from "react";
export default function Table(){
  const [rows,setRows]=React.useState<any[]>([]); const [loading,setLoading]=React.useState(true);
  React.useEffect(()=>{ (async()=>{ const r=await fetch("/api/brands",{cache:"no-store"}); const j=await r.json(); setRows(j.items??[]); setLoading(false);})();},[]);
  const toggle = async (id:string, curr:boolean)=>{
    setRows(xs=>xs.map(x=>x.id===id?{...x,is_active:!curr}:x));
    const res = await fetch(`/api/brands/${id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({is_active:!curr})});
    if(!res.ok) setRows(xs=>xs.map(x=>x.id===id?{...x,is_active:curr}:x));
  };
  if(loading) return <div className="card p-6">Yükleniyor…</div>;
  if(!rows.length) return <div className="card p-6">Henüz marka yok.</div>;
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {rows.map(b=>(
      <div key={b.id} className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {b.brand_profiles?.avatar_url
            ? <img src={b.brand_profiles.avatar_url} className="h-10 w-10 rounded-full object-cover" alt=""/>
            : <div className="h-10 w-10 rounded-full bg-slate-200" />}
          <div>
            <div className="font-semibold">{b.name}</div>
            {!b.is_active && <div className="text-xs text-slate-500">Pasif</div>}
          </div>
        </div>
        <button onClick={()=>toggle(b.id,b.is_active)}
          className={`px-3 py-1.5 rounded-xl text-sm ${b.is_active?"bg-slate-200":"bg-green-600 text-white"}`}>
          {b.is_active?"Pasife Al":"Aktif Et"}
        </button>
      </div>
    ))}
  </div>;
}

