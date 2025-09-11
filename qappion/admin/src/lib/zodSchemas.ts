import { z } from 'zod';

// Enums
export const MarketplaceEnum = z.enum(['Trendyol', 'Hepsiburada', 'Pazarama', 'Amazon', 'N11', 'Diğer']);
export const LevelEnum = z.enum(['Snapper', 'Seeker', 'Crafter', 'Viralist', 'Qappian']);
export const StockStatusEnum = z.enum(['in_stock', 'low', 'out_of_stock', 'hidden']);
export const CategoryEnum = z.enum(['Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor', 'Kozmetik', 'Kitap', 'Oyuncak', 'Diğer']);

// Marketplace Schema
export const ProductMarketplaceSchema = z.object({
  marketplace: MarketplaceEnum,
  product_url: z.string().url('Geçerli bir URL girin'),
  image_url: z.string().url().optional().or(z.literal('')),
  position: z.number().int().min(0)
});

// Product Create/Update Schema
export const ProductCreateSchema = z.object({
  id: z.string().uuid().optional(),
  brand_id: z.string().uuid('Geçerli bir marka seçin'),
  title: z.string().min(3, 'Ürün adı en az 3 karakter olmalı'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(4000, 'Açıklama en fazla 4000 karakter olabilir'),
  usage_terms: z.string().min(10, 'Kullanım koşulları en az 10 karakter olmalı').max(4000, 'Kullanım koşulları en fazla 4000 karakter olabilir'),
  value_qp: z.number().int().min(0, 'QP değeri 0 veya daha büyük olmalı'),
  stock_status: StockStatusEnum,
  stock_count: z.number().int().min(0).optional(),
  category: CategoryEnum.default('Elektronik'),
  levels: z.array(LevelEnum).min(0).max(5),
  marketplaces: z.array(ProductMarketplaceSchema).min(1, 'En az bir pazaryeri eklemelisiniz'),
  images: z.array(z.instanceof(File)).max(5, 'En fazla 5 görsel yükleyebilirsiniz').optional()
});

// Brand Schema for selection
export const BrandSelectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  logo_url: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional(),
  social_media: z.record(z.string()).optional()
});

// Types
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductMarketplace = z.infer<typeof ProductMarketplaceSchema>;
export type BrandSelect = z.infer<typeof BrandSelectSchema>;
export type Marketplace = z.infer<typeof MarketplaceEnum>;
export type Level = z.infer<typeof LevelEnum>;
export type StockStatus = z.infer<typeof StockStatusEnum>;
export type Category = z.infer<typeof CategoryEnum>;
