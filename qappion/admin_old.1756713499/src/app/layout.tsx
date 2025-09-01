import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Home, BadgePercent, Target, Users, ShoppingBag, Trophy, Share2, Bell, CreditCard, Database, Settings } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/brands", label: "Marka Yönetimi", icon: BadgePercent },
  { href: "/missions", label: "Görev Yönetimi", icon: Target },
  { href: "/users", label: "Kullanıcı Yönetimi", icon: Users },
  { href: "/market", label: "Market Yönetimi", icon: ShoppingBag },
  { href: "/levels", label: "Level Ayarları", icon: Trophy },
  { href: "/sharing", label: "Paylaşım Yönetimi", icon: Share2 },
  { href: "/notifications", label: "Bildirimler", icon: Bell },
  { href: "/finance", label: "Finans & Lisanslar", icon: CreditCard },
  { href: "/mocks", label: "Mock Data", icon: Database },
  { href: "/settings", label: "Ayarlar", icon: Settings }
];

export const metadata = { title: "Qappio Admin", description: "Admin Panel" };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="body-bg min-h-dvh">
        <div className="grid grid-cols-[260px_1fr] min-h-dvh">
          <aside className="text-slate-100" style={{background:"var(--sidebar-grad)"}}>
            <div className="px-5 py-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 grid place-items-center text-white text-lg font-bold">Q</div>
              <div className="text-xl font-semibold">Qappio</div>
            </div>
            <nav className="px-3 space-y-1">
              {nav.map((n)=>(
                <Link key={n.href} href={n.href} className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200/90 hover:text-white hover:bg-white/10 transition"
                )}>
                  <n.icon className="h-5 w-5" />
                  <span className="text-base">{n.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
          <main className="p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
