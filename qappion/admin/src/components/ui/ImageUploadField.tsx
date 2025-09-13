"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { ImageIcon, Upload, X } from "lucide-react";

interface ImageUploadFieldProps {
  name: string;
  register: any;
  currentValue?: string;
  onImageChange?: (url: string) => void;
  placeholder?: string;
}

export function ImageUploadField({ 
  name, 
  register, 
  currentValue, 
  onImageChange, 
  placeholder = "Resim yüklemek için tıklayın" 
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [urlInput, setUrlInput] = useState<string>(currentValue || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // currentValue değiştiğinde URL input'u güncelle
  useEffect(() => {
    if (currentValue) {
      setUrlInput(currentValue);
      setPreview(currentValue);
    }
  }, [currentValue]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert("Sadece resim dosyaları yüklenebilir");
      return;
    }

    setIsUploading(true);

    try {
      // Önce preview oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Supabase'e yükle
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'brand-assets');

      const response = await fetch('/api/storage/brand-assets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Yükleme başarısız');
      }

      const data = await response.json();
      
      if (data.url) {
        setPreview(data.url);
        setUrlInput(data.url); // URL input'u da güncelle
        onImageChange?.(data.url);
        
        // Form değerini güncelle
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          const input = form.querySelector(`input[name="${name}"]`) as HTMLInputElement;
          if (input) {
            input.value = data.url;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Resim yüklenirken bir hata oluştu');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setPreview(url);
    onImageChange?.(url);
    
    // Form değerini güncelle
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      const input = form.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      if (input) {
        input.value = url;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUrlInput("");
    onImageChange?.('');
    
    // Form değerini temizle
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      const input = form.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden input for form registration */}
      <input
        {...register(name)}
        type="hidden"
        value={preview || ''}
      />
      
      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? null : (
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-400" />
            )}
            <p className="text-sm text-slate-600">
              {isUploading ? 'Yükleniyor...' : placeholder}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
            </Button>
          </div>
        )}
      </div>
      
      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Veya URL Gir</label>
        <div className="flex space-x-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => handleUrlChange(urlInput)}
            disabled={!urlInput.trim()}
            size="sm"
          >
            Ekle
          </Button>
        </div>
      </div>
      
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
