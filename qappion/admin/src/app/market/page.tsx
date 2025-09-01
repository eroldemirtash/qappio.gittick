export const dynamic="force-dynamic";
import { jget } from "@/lib/fetcher";
export default async function Page(){
  const data = await jget<{items:any[]}>("/api/market").catch(()=>({items:[]}));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Market Yönetimi</h1>
      {data.items?.length ? <div className="card p-6">Market ürünleri burada listelenir (TODO)</div> : <div className="card p-6">Henüz market verisi yok. Ürün tablosu hazır olduğunda burada göstereceğiz.</div>}
    </div>
  );
}