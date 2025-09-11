'use client';
import { Controller, Control } from 'react-hook-form';
import { useMemo } from 'react';

type Props = {
  control: Control<any>;
  name?: string; // default 'images'
  max?: number;  // default 5
};

export default function ImagePickerField({ control, name = 'images', max = 5 }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field: { value, onChange } }) => {
        const files: File[] = Array.isArray(value) ? value : [];
        const previews = useMemo(
          () => files.map((f) => ({ url: URL.createObjectURL(f), name: f.name })),
          [files]
        );

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-slate-500">
                    <span className="font-semibold">Görsel seçmek için tıklayın</span>
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG (MAX. 5MB)</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []);
                    const next = [...files, ...picked].slice(0, max);
                    onChange(next);
                    console.log('🖼️ ImagePicker selected:', next.map(f => f.name));
                  }}
                />
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Seçilen Görseller:</p>
                <div className="grid grid-cols-5 gap-2">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== idx);
                          onChange(newFiles);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-slate-500 text-center">
              {files.length}/{max} görsel seçildi
            </div>
          </div>
        );
      }}
    />
  );
}