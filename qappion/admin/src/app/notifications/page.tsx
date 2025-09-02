"use client";

import { useEffect, useState } from "react";
import { jget, jpatch } from "@/lib/fetcher";
import { Notification } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Bell, Search, Plus, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await jget<{ items: Notification[] }>("/api/notifications");
        setNotifications(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleToggleActive = async (notification: Notification) => {
    try {
      await jpatch(`/api/notifications/${notification.id}`, { is_active: !notification.is_active });
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_active: !n.is_active } : n
      ));
    } catch (err) {
      console.error("Failed to update notification:", err);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase()) ||
                         notification.message.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "all" || notification.channel === channelFilter;
    
    return matchesSearch && matchesChannel;
  });

  const stats = {
    total: notifications.length,
    active: notifications.filter(n => n.is_active).length,
    thisMonth: notifications.filter(n => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      return n.created_at.startsWith(thisMonth);
    }).length
  };

  const getChannelBadge = (channel: string) => {
    const badges = {
      push: "bg-blue-100 text-blue-700",
      email: "bg-green-100 text-green-700",
      sms: "bg-purple-100 text-purple-700",
      in_app: "bg-orange-100 text-orange-700"
    };
    return badges[channel as keyof typeof badges] || "bg-slate-100 text-slate-700";
  };

  const getChannelLabel = (channel: string) => {
    const labels = {
      push: "Push",
      email: "E-posta",
      sms: "SMS",
      in_app: "Uygulama İçi"
    };
    return labels[channel as keyof typeof labels] || channel;
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Bildirimler" description="Tüm bildirimleri yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Bildirimler" 
        description="Tüm bildirimleri yönetin"
        action={<Button><Plus className="h-4 w-4 mr-2" />Yeni Bildirim</Button>}
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
        <>
          <StatsRow>
            <StatCard title="Toplam Bildirim" value={stats.total} icon={Bell} />
            <StatCard title="Aktif Bildirim" value={stats.active} icon={Bell} />
            <StatCard title="Bu Ay Gönderilen" value={stats.thisMonth} icon={Bell} />
          </StatsRow>

          <div className="card p-6">
            <div className="toolbar mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Bildirim ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Tüm Kanallar</option>
                  <option value="push">Push</option>
                  <option value="email">E-posta</option>
                  <option value="sms">SMS</option>
                  <option value="in_app">Uygulama İçi</option>
                </Select>
              </div>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz bildirim yok</h3>
                <p className="text-slate-500">İlk bildiriminizi oluşturmak için yukarıdaki butonu kullanın.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                          <span className={`badge ${getChannelBadge(notification.channel)}`}>
                            {getChannelLabel(notification.channel)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={notification.is_active}
                              onCheckedChange={() => handleToggleActive(notification)}
                            />
                            <span className="text-sm font-medium">
                              {notification.is_active ? "Aktif" : "Pasif"}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Oluşturulma: {new Date(notification.created_at).toLocaleDateString('tr-TR')}</span>
                          {notification.scheduled_at && (
                            <span>Planlanan: {new Date(notification.scheduled_at).toLocaleDateString('tr-TR')}</span>
                          )}
                          {notification.sent_count && (
                            <span>Gönderim: {notification.sent_count}</span>
                          )}
                          {notification.read_rate && (
                            <span>Okunma: %{notification.read_rate}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
