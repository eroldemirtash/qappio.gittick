export type Brand = { id:string; name:string; is_active:boolean; created_at?:string;
  brand_profiles?:{ display_name?:string|null; avatar_url?:string|null; license_plan?:string|null; license_start?:string|null; license_end?:string|null; license_fee?:number|null }|null };
export type Mission = { id:string; title:string; description?:string|null; brand_id?:string|null; cover_url?:string|null;
  reward_qp?:number|null; published:boolean; is_qappio_of_week:boolean; starts_at?:string|null; ends_at?:string|null;
  brand?:{ id:string; name:string; brand_profiles?:{ avatar_url?:string|null }|null }|null; created_at?:string };
export type Profile = { id:string; full_name?:string|null; username?:string|null; role?:string|null; avatar_url?:string|null; created_at?:string };
export type Notification = { id:string; title:string; message:string; channel:"push"|"email"|"inapp"; scheduled_at?:string|null; is_active:boolean; created_at?:string };
export type AppTheme = { primary?:string; secondary?:string; dark?:boolean; logo_url?:string|null; updated_at?:string };