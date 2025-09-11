"use client";

import { useEffect, useState } from "react";
import { jget, jpatch } from "@/lib/fetcher";
import { Mission } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MissionCard } from "@/components/missions/MissionCard";
import { MissionListItem } from "@/components/missions/MissionListItem";
import { MissionDetailModal } from "@/components/missions/MissionDetailModal";
import { DeleteConfirmModal } from "@/components/missions/DeleteConfirmModal";
import { Target, Eye, Star, Calendar, Plus, Search, Grid3X3, List } from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        console.log("Fetching missions...");
        const response = await jget<{ items: any[] }>("/api/missions");
        console.log("Missions response:", response);
        
        // Simple mapping without complex brand logic
        const mappedMissions = (response.items || []).map(mission => ({
          ...mission,
          reward_qp: mission.reward_qp ?? 0,
          published: mission.published ?? false,
          brand: mission.brand || null
        }));
        
        console.log("Mapped missions:", mappedMissions);
        setMissions(mappedMissions);
        console.log("Missions set successfully");
        setLoading(false);
      } catch (err) {
        console.error("Missions fetch error:", err);
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const handleTogglePublished = async (mission: Mission) => {
    try {
      await jpatch(`/api/missions/${mission.id}`, { published: !mission.published });
      setMissions(prev => prev.map(m => 
        m.id === mission.id ? { ...m, published: !m.published } : m
      ));
    } catch (err) {
      console.error("Failed to update mission:", err);
    }
  };

  const handleToggleQappioOfWeek = async (mission: Mission) => {
    try {
      await jpatch(`/api/missions/${mission.id}`, { is_qappio_of_week: !mission.is_qappio_of_week });
      setMissions(prev => prev.map(m => 
        m.id === mission.id ? { ...m, is_qappio_of_week: !m.is_qappio_of_week } : m
      ));
      // Update selected mission if it's the same
      if (selectedMission?.id === mission.id) {
        setSelectedMission(prev => prev ? { ...prev, is_qappio_of_week: !prev.is_qappio_of_week } : null);
      }
    } catch (err) {
      console.error("Failed to update mission:", err);
    }
  };

  const handleViewDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (mission: Mission) => {
    router.push(`/missions/${mission.id}/edit`);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMission(null);
  };

  const handleDelete = (mission: Mission) => {
    setMissionToDelete(mission);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (mission: Mission) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }
      
      // Remove from local state
      setMissions(prev => prev.filter(m => m.id !== mission.id));
      
      // Close modal
      setIsDeleteModalOpen(false);
      setMissionToDelete(null);
    } catch (err) {
      console.error("Failed to delete mission:", err);
      setError("Görev silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMissionToDelete(null);
  };

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(search.toLowerCase()) ||
                         mission.brand?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && mission.published) ||
                         (statusFilter === "draft" && !mission.published);
    const matchesBrand = brandFilter === "all" || mission.brand_id === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const stats = {
    total: missions.length,
    published: missions.filter(m => m.published).length,
    qappioOfWeek: missions.filter(m => m.is_qappio_of_week).length,
    today: missions.filter(m => {
      const today = new Date().toISOString().split('T')[0];
      return m.starts_at?.startsWith(today);
    }).length
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Görev Yönetimi" description="Tüm görevleri yönetin" />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Görevler yükleniyor...</p>
          <p className="mt-2 text-xs text-slate-400">Loading state: {loading ? 'true' : 'false'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Görev Yönetimi" 
        description="Tüm görevleri yönetin"
        action={
          <Button onClick={() => router.push("/missions/new")}>
            <Plus className="h-4 w-4 mr-2" />Yeni Görev
          </Button>
        }
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
            <StatCard title="Toplam Görev" value={stats.total} icon={Target} />
            <StatCard title="Yayında" value={stats.published} icon={Eye} />
            <StatCard title="Haftanın Qappio'su" value={stats.qappioOfWeek} icon={Star} />
            <StatCard title="Bugün Başlayan" value={stats.today} icon={Calendar} />
          </StatsRow>

          <div className="card p-6">
            <div className="toolbar mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Görev ara..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-40"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                  </Select>
                  <Select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-40"
                  >
                    <option value="all">Tüm Markalar</option>
                    {missions.map(mission => (
                      <option key={`brand-${mission.id}`} value={mission.brand_id}>
                        {mission.brand?.name}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {filteredMissions.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz görev yok</h3>
                <p className="text-slate-500">İlk görevinizi oluşturmak için yukarıdaki butonu kullanın.</p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMissions.map((mission) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        onTogglePublished={handleTogglePublished}
                        onToggleQappioOfWeek={handleToggleQappioOfWeek}
                        onEdit={handleEdit}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMissions.map((mission) => (
                      <MissionListItem
                        key={mission.id}
                        mission={mission}
                        onTogglePublished={handleTogglePublished}
                        onToggleQappioOfWeek={handleToggleQappioOfWeek}
                        onEdit={handleEdit}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Mission Detail Modal */}
      <MissionDetailModal
        mission={selectedMission}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={handleEdit}
        onTogglePublished={handleTogglePublished}
        onToggleQappioOfWeek={handleToggleQappioOfWeek}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        mission={missionToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}