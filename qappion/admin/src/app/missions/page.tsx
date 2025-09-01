export const dynamic="force-dynamic";
import Client from "./table";
import Link from "next/link";
export default function Page(){
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Görev Yönetimi</h1>
        <Link href="/missions/new" className="px-4 py-2 rounded-xl bg-brand-600 text-white shadow-card">Yeni Görev</Link>
      </div>
      <Client/>
    </div>
  );
}