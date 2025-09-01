export const dynamic = "force-dynamic";
async function getStats(){
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL ?? ""}/api/stats`, { cache:"no-store" });
  return res.ok ? res.json() : { brands:0, missions:0, users:0, participations:0 };
}
export default async function Page(){
  const s = await getStats();
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[
        {k:"brands",label:"Marka",suffix:""},
        {k:"missions",label:"Görev",suffix:""},
        {k:"users",label:"Kullanıcı",suffix:""},
        {k:"participations",label:"Katılım",suffix:""}
      ].map(c=>(
        <div key={c.k} className="card p-6">
          <div className="text-slate-500 text-sm">{c.label}</div>
          <div className="text-3xl font-semibold mt-2">{s[c.k] ?? 0}{c.suffix}</div>
        </div>
      ))}
    </div>
  );
}
