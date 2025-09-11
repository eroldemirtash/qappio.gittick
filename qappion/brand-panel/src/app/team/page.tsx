"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail,
  Shield,
  Edit,
  Trash2,
  Crown,
  Users,
  UserCheck,
  UserX,
  AlertTriangle
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'editor' | 'analyst' | 'viewer';
  avatar: string;
  lastActive: string;
  status: 'active' | 'pending' | 'inactive';
}

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');
  const [loading] = useState(false);

  // Demo verileri
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Ahmet Yılmaz",
      email: "ahmet@nike.com",
      role: "owner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      lastActive: "Şimdi",
      status: "active"
    },
    {
      id: "2",
      name: "Ayşe Kaya",
      email: "ayse@nike.com",
      role: "manager",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      lastActive: "2 saat önce",
      status: "active"
    },
    {
      id: "3",
      name: "Mehmet Öz",
      email: "mehmet@nike.com",
      role: "editor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      lastActive: "1 gün önce",
      status: "active"
    },
    {
      id: "4",
      name: "Zeynep Demir",
      email: "zeynep@nike.com",
      role: "analyst",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      lastActive: "3 gün önce",
      status: "active"
    },
    {
      id: "5",
      name: "Ali Çelik",
      email: "ali@nike.com",
      role: "viewer",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      lastActive: "1 hafta önce",
      status: "pending"
    }
  ];

  const roleInfo = {
    owner: { 
      label: 'Sahip', 
      color: 'bg-purple-100 text-purple-800', 
      icon: Crown,
      description: 'Tam yetki, faturalama ve lisans yönetimi'
    },
    manager: { 
      label: 'Yönetici', 
      color: 'bg-blue-100 text-blue-800', 
      icon: Shield,
      description: 'Görev/ürün oluşturma, takım yönetimi'
    },
    editor: { 
      label: 'Editör', 
      color: 'bg-green-100 text-green-800', 
      icon: Edit,
      description: 'İçerik düzenleme, yayın talebi'
    },
    analyst: { 
      label: 'Analist', 
      color: 'bg-orange-100 text-orange-800', 
      icon: UserCheck,
      description: 'Okuma + export yetkisi'
    },
    viewer: { 
      label: 'Görüntüleyici', 
      color: 'bg-slate-100 text-slate-800', 
      icon: UserX,
      description: 'Sadece görüntüleme yetkisi'
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Beklemede';
      case 'inactive': return 'Pasif';
      default: return 'Bilinmiyor';
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) return;
    
    // Simulate API call
    console.log('Inviting:', { email: inviteEmail, role: inviteRole });
    
    // Reset form
    setInviteEmail("");
    setInviteRole('viewer');
    setShowInviteModal(false);
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Takım & Roller" description="Takım üyelerinizi yönetin" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
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
        title="Takım & Roller" 
        description="Takım üyelerinizi yönetin"
        action={
          <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Takım Davet Et
          </Button>
        }
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Takım & Roller" }
        ]}
      />

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Toplam Üye</p>
              <p className="text-xl font-bold text-slate-900">{teamMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Aktif Üye</p>
              <p className="text-xl font-bold text-slate-900">
                {teamMembers.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Bekleyen</p>
              <p className="text-xl font-bold text-slate-900">
                {teamMembers.filter(m => m.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Yönetici</p>
              <p className="text-xl font-bold text-slate-900">
                {teamMembers.filter(m => m.role === 'owner' || m.role === 'manager').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Arama */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Takım üyesi ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Takım Listesi */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Üye</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Son Aktivite</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const role = roleInfo[member.role];
                const RoleIcon = role.icon;
                
                return (
                  <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-4 w-4 text-slate-400" />
                        <span className={`badge ${role.color}`}>
                          {role.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusColor(member.status)}`}>
                        {getStatusLabel(member.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {member.lastActive}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {member.role !== 'owner' && (
                          <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Davet Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Takım Üyesi Davet Et</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  E-posta Adresi
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ornek@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="viewer">Görüntüleyici</option>
                  <option value="analyst">Analist</option>
                  <option value="editor">Editör</option>
                  <option value="manager">Yönetici</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {roleInfo[inviteRole].description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowInviteModal(false)}>
                İptal
              </Button>
              <Button onClick={handleInvite} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Davet Gönder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
