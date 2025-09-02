"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { User } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { Users, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await jget<{ items: User[] }>("/api/users");
        setUsers(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.username?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || user.level === levelFilter;
    const matchesStatus = statusFilter === "all" || user.role === statusFilter;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Kullanıcı Yönetimi" description="Tüm kullanıcıları yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Kullanıcı Yönetimi" 
        description="Tüm kullanıcıları yönetin"
      />

      {error ? (
        <div className="card p-6 border-rose-200 bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-rose-500"></div>
            <div>
              <h3 className="font-medium text-rose-900">Hata</h3>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <div className="toolbar mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="Snapper">Snapper</option>
                <option value="Seeker">Seeker</option>
                <option value="Crafter">Crafter</option>
                <option value="Viralist">Viralist</option>
                <option value="Qappian">Qappian</option>
              </Select>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
                <option value="brand_manager">Marka Yöneticisi</option>
              </Select>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz kullanıcı yok</h3>
              <p className="text-slate-500">Kullanıcılar burada görünecek.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="card p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={user.avatar_url}
                      fallback={user.full_name?.[0] || user.username?.[0] || "U"}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{user.full_name || "İsimsiz"}</h3>
                      <p className="text-sm text-slate-500">@{user.username || "kullanici"}</p>
                      <span className="badge bg-brand-100 text-brand-700 mt-1">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{user.total_missions || 0}</p>
                      <p className="text-xs text-slate-500">Toplam Görev</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{user.completed_missions || 0}</p>
                      <p className="text-xs text-slate-500">Tamamlanan</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{user.total_qp || 0}</p>
                      <p className="text-xs text-slate-500">Toplam QP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{user.spendable_qp || 0}</p>
                      <p className="text-xs text-slate-500">Harcanabilir QP</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">Detay</Button>
                    <Button variant="ghost" size="sm" className="flex-1">Düzenle</Button>
                    <Button variant="ghost" size="sm" className="flex-1" disabled>Sil</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
