'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProductCreateEditModal } from './ProductCreateEditModal';
import { Plus } from 'lucide-react';

export function ProductsClientWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
    // Refresh the page to show new product
    window.location.reload();
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Yeni Ürün
      </Button>
      
      <ProductCreateEditModal
        isOpen={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}
