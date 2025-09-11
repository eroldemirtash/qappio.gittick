'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { MarketplaceEnum } from '@/lib/zodSchemas';

const marketplaceOptions = [
  { value: 'Trendyol', label: 'Trendyol' },
  { value: 'Hepsiburada', label: 'Hepsiburada' },
  { value: 'Pazarama', label: 'Pazarama' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'N11', label: 'N11' },
  { value: 'Diğer', label: 'Diğer' },
];

export function MarketplaceLinksField() {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'marketplaces'
  });

  const addMarketplace = () => {
    append({
      marketplace: 'Trendyol',
      product_url: '',
      image_url: '',
      position: fields.length
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < fields.length) {
      move(index, newIndex);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          Pazaryeri Linkleri
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMarketplace}
        >
          <Plus className="w-4 h-4 mr-2" />
          Pazaryeri Ekle
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
          Henüz pazaryeri eklenmemiş
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Pazaryeri #{index + 1}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, 'down')}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pazaryeri
              </label>
              <Select
                {...register(`marketplaces.${index}.marketplace`)}
                defaultValue={(field as any).marketplace}
              >
                {marketplaceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {(errors.marketplaces as any)?.[index]?.marketplace && (
                <p className="text-sm text-red-600 mt-1">
                  {(errors.marketplaces as any)[index]?.marketplace?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ürün URL'si
              </label>
              <Input
                {...register(`marketplaces.${index}.product_url`)}
                placeholder="https://..."
                defaultValue={(field as any).product_url}
              />
              {(errors.marketplaces as any)?.[index]?.product_url && (
                <p className="text-sm text-red-600 mt-1">
                  {(errors.marketplaces as any)[index]?.product_url?.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Görsel URL'si (Opsiyonel)
            </label>
            <Input
              {...register(`marketplaces.${index}.image_url`)}
              placeholder="https://..."
                defaultValue={(field as any).image_url}
            />
            {(errors.marketplaces as any)?.[index]?.image_url && (
              <p className="text-sm text-red-600 mt-1">
                {(errors.marketplaces as any)[index]?.image_url?.message}
              </p>
            )}
          </div>
        </div>
      ))}

      {errors.marketplaces && typeof errors.marketplaces === 'object' && 'message' in errors.marketplaces && (
        <p className="text-sm text-red-600">
          {(errors.marketplaces as any).message}
        </p>
      )}
    </div>
  );
}
