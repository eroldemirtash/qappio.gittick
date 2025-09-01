export const dynamic = "force-dynamic";
import Client from "./table";
import Link from "next/link";
export default function Page(){
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Marka Yönetimi</h1>
        <Link href="/brands/new" className="px-4 py-2 rounded-xl bg-brand-600 text-white shadow-card">Yeni Marka</Link>
      </div>
      <Client />
    </div>
  );
}
