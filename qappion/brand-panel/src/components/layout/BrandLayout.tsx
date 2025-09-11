"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Target, 
  ShoppingBag, 
  Users, 
  User, 
  BarChart3, 
  CreditCard, 
  UserPlus, 
  Bell, 
  Settings,
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Gösterge Paneli", href: "/", icon: LayoutDashboard },
  { name: "Görevler", href: "/missions", icon: Target },
  { name: "Ürünler", href: "/products", icon: ShoppingBag },
  { name: "Takipçiler", href: "/followers", icon: Users },
  { name: "Marka Profili", href: "/profile", icon: User },
  { name: "Analitik", href: "/analytics", icon: BarChart3 },
  { name: "Lisans & Plan", href: "/license", icon: CreditCard },
  { name: "Takım & Roller", href: "/team", icon: UserPlus },
  { name: "Bildirimler", href: "/notifications", icon: Bell },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export function BrandLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="font-semibold text-slate-900">Marka Paneli</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-4 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200">
          <div className="flex items-center h-16 px-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="font-semibold text-slate-900">Marka Paneli</span>
            </div>
          </div>
          <nav className="mt-4 flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-slate-900">
                  {navigation.find(item => item.href === pathname)?.name || "Gösterge Paneli"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Brand menu */}
              <div className="relative">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-600 font-semibold text-sm">N</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">Nike</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
