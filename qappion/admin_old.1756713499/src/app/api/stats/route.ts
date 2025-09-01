import { sbAdmin } from "@/lib/supabase-admin";
export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;
export async function GET(){
  const s = sbAdmin();
  const [{count:brands},{count:missions},{count:users},{count:parts}] = await Promise.all([
    s.from("brands").select("*",{count:"exact",head:true}),
    s.from("missions").select("*",{count:"exact",head:true}).neq("deleted",true).returns<any>(),
    s.from("profiles").select("*",{count:"exact",head:true}),
    s.from("mission_participations").select("*",{count:"exact",head:true}).returns<any>(),
  ]);
  return new Response(JSON.stringify({
    brands: brands ?? 0,
    missions: missions ?? 0,
    users: users ?? 0,
    participations: parts ?? 0
  }), { headers: { "content-type":"application/json","cache-control":"no-store" } });
}
