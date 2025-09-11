"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  onMultipleChange?: (urls: string[]) => void;
}

export function ImageUploadField({ 
  value, 
  onChange, 
  label = "Görsel URL", 
  placeholder = "https://example.com/image.jpg",
  multiple = false,
  onMultipleChange
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if multiple files are selected but multiple is false
    if (files.length > 1 && !multiple) {
      alert('Lütfen tek bir dosya seçin');
      return;
    }

    // Check file types
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert(`Lütfen geçerli bir görsel dosyası seçin: ${file.name}`);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Dosya boyutu 5MB'dan küçük olmalıdır: ${file.name}`);
        return;
      }
    }

    setIsUploading(true);

    try {
      if (multiple && onMultipleChange) {
        // Multiple file upload
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'product-images');

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const { url } = await response.json();
            return url;
          } else {
            const error = await response.json();
            throw new Error(`Yükleme hatası: ${error.message || 'Bilinmeyen hata'}`);
          }
        });

        const urls = await Promise.all(uploadPromises);
        onMultipleChange(urls);
      } else {
        // Single file upload
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'product-images');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          onChange(url);
        } else {
          const error = await response.json();
          alert(`Yükleme hatası: ${error.message || 'Bilinmeyen hata'}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Görsel yüklenirken hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Yükleniyor...' : 'PC\'den Seç'}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={clearImage}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
              className="bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-slate-500">
        <p>• PC'den seçmek için "PC'den Seç" butonuna tıklayın</p>
        <p>• Desteklenen formatlar: JPG, PNG, GIF, WebP</p>
        <p>• Maksimum dosya boyutu: 5MB</p>
      </div>
    </div>
  );
}
