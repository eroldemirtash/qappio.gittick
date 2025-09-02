"use client";

import { Mission } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mission: Mission) => void;
  isLoading?: boolean;
}

export function DeleteConfirmModal({ 
  mission, 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false
}: DeleteConfirmModalProps) {
  if (!isOpen || !mission) return null;

  const handleConfirm = () => {
    onConfirm(mission);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Görev Sil</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 mb-4">
            <strong>"{mission.title}"</strong> görevini silmek istediğinizden emin misiniz?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">Dikkat!</h4>
                <p className="text-sm text-red-700">
                  Bu işlem geri alınamaz. Görev ve tüm ilgili veriler kalıcı olarak silinecektir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-slate-50">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            İptal
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Siliniyor..." : "Sil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
