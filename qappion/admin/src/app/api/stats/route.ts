import { sbAdmin } from "@/lib/supabase-admin";
export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;
export async function GET(){
  try {
    const s = sbAdmin();
    
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({
        brands: 0,
        missions: 0,
        users: 0,
        participations: 0,
        error: "Supabase configuration missing"
      }), { 
        status: 200,
        headers: { "content-type":"application/json","cache-control":"no-store" } 
      });
    }

    const [brandsResult, missionsResult, usersResult, partsResult] = await Promise.allSettled([
      s.from("brands").select("*",{count:"exact",head:true}),
      s.from("missions").select("*",{count:"exact",head:true}).neq("deleted",true).returns<any>(),
      s.from("profiles").select("*",{count:"exact",head:true}),
      s.from("mission_participations").select("*",{count:"exact",head:true}).returns<any>(),
    ]);
    
    const brands = brandsResult.status === 'fulfilled' ? brandsResult.value.count : 0;
    const missions = missionsResult.status === 'fulfilled' ? missionsResult.value.count : 0;
    const users = usersResult.status === 'fulfilled' ? usersResult.value.count : 0;
    const parts = partsResult.status === 'fulfilled' ? partsResult.value.count : 0;
    
    return new Response(JSON.stringify({
      brands: brands ?? 0,
      missions: missions ?? 0,
      users: users ?? 0,
      participations: parts ?? 0
    }), { headers: { "content-type":"application/json","cache-control":"no-store" } });
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      brands: 0,
      missions: 0,
      users: 0,
      participations: 0,
      error: error.message
    }), { 
      status: 200,
      headers: { "content-type":"application/json","cache-control":"no-store" } 
    });
  }
}
