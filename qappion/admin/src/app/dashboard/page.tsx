export const dynamic = "force-dynamic";
async function getStats(){ 
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3010";
    const r = await fetch(`${baseUrl}/api/stats`,{cache:"no-store"}); 
    return r.ok? r.json(): {brands:0, missions:0, users:0, participations:0}; 
  } catch {
    return {brands:0, missions:0, users:0, participations:0};
  }
}
export default async function Page(){
  const s = await getStats();
  const cards = [
    { k:"brands", label:"Marka" }, { k:"missions", label:"Görev" },
    { k:"users", label:"Kullanıcı" }, { k:"participations", label:"Katılım" },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(c=>(
        <div key={c.k} className="card p-6">
          <div className="text-slate-500 text-sm">{c.label}</div>
          <div className="text-3xl font-semibold mt-2">{s[c.k] ?? 0}</div>
        </div>
      ))}
    </div>
  );
}
