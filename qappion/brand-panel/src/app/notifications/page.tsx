"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Filter,
  Check,
  Trash2,
  Eye,
  Clock
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'approval' | 'system' | 'message' | 'warning';
  category: 'approval' | 'system' | 'message';
  read: boolean;
  date: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'approval' | 'system' | 'message'>('all');
  const [loading] = useState(false);

  // Demo verileri
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Ürün Onayı Bekliyor",
      message: "Nike Air Force 1 ürününüz admin onayı bekliyor. İnceleme süreci 1-2 iş günü sürebilir.",
      type: "approval",
      category: "approval",
      read: false,
      date: "2 saat önce",
      action: { label: "Ürünü Görüntüle", href: "/products/1" }
    },
    {
      id: "2",
      title: "Görev Yayınlandı",
      message: "Adidas Ultraboost Deneyimi göreviniz başarıyla yayınlandı ve kullanıcılar tarafından görüntülenmeye başlandı.",
      type: "system",
      category: "system",
      read: false,
      date: "4 saat önce",
      action: { label: "Görevi Görüntüle", href: "/missions/2" }
    },
    {
      id: "3",
      title: "Yeni Yorum",
      message: "Nike Air Max Fotoğrafı görevinizde 5 yeni yorum var. Kullanıcılar görevinizle ilgili geri bildirimlerini paylaşıyor.",
      type: "message",
      category: "message",
      read: true,
      date: "6 saat önce",
      action: { label: "Yorumları Görüntüle", href: "/missions/1" }
    },
    {
      id: "4",
      title: "Sistem Güncellemesi",
      message: "Qappio platformu yeni özelliklerle güncellendi. Yeni analitik raporları ve gelişmiş filtreleme seçenekleri eklendi.",
      type: "system",
      category: "system",
      read: true,
      date: "1 gün önce"
    },
    {
      id: "5",
      title: "Görev Reddedildi",
      message: "Puma Suede Stil göreviniz reddedildi. Red sebebi: Görsel kalitesi yetersiz. Lütfen daha kaliteli görseller kullanın.",
      type: "warning",
      category: "approval",
      read: false,
      date: "2 gün önce",
      action: { label: "Görevi Düzenle", href: "/missions/3" }
    },
    {
      id: "6",
      title: "Takım Daveti",
      message: "Ali Çelik takımınıza davet edildi. Davet onayını bekliyor.",
      type: "system",
      category: "system",
      read: true,
      date: "3 gün önce"
    },
    {
      id: "7",
      title: "Lisans Uyarısı",
      message: "Premium planınızın süresi 7 gün sonra dolacak. Yenileme yapmak için lisans sayfasını ziyaret edin.",
      type: "warning",
      category: "system",
      read: false,
      date: "1 hafta önce",
      action: { label: "Lisansı Yenile", href: "/license" }
    }
  ];

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'system': return <Bell className="h-5 w-5 text-slate-600" />;
      case 'message': return <Info className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default: return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'approval': return 'bg-blue-50 border-blue-200';
      case 'system': return 'bg-slate-50 border-slate-200';
      case 'message': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.category === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const approvalCount = notifications.filter(n => n.category === 'approval' && !n.read).length;

  const markAllAsRead = () => {
    // Simulate API call
    console.log('Marking all as read');
  };

  const markAsRead = (id: string) => {
    // Simulate API call
    console.log('Marking as read:', id);
  };

  const deleteNotification = (id: string) => {
    // Simulate API call
    console.log('Deleting notification:', id);
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Bildirimler" description="Bildirimlerinizi yönetin" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-5 w-5 bg-slate-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
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
        description="Bildirimlerinizi yönetin"
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" onClick={markAllAsRead} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>
        }
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Bildirimler" }
        ]}
      />

      {/* Tab Navigation */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-brand-100 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tümü {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'approval'
                ? 'bg-brand-100 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Onaylar {approvalCount > 0 && `(${approvalCount})`}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'system'
                ? 'bg-brand-100 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sistem
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'message'
                ? 'bg-brand-100 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mesajlar
          </button>
        </div>
      </div>

      {/* Bildirim Listesi */}
      {filteredNotifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Bildirim bulunamadı</h3>
          <p className="text-slate-500">
            {activeTab === 'all' 
              ? 'Henüz bildiriminiz bulunmuyor.' 
              : `${activeTab} kategorisinde bildirim bulunmuyor.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-6 border-l-4 ${getTypeColor(notification.type)} ${
                !notification.read ? 'bg-white shadow-sm' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        !notification.read ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 h-2 w-2 bg-brand-500 rounded-full inline-block"></span>
                        )}
                      </h3>
                      <p className="text-slate-600 mb-3">{notification.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {notification.date}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {notification.action && (
                        <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700">
                          {notification.action.label}
                        </Button>
                      )}
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
