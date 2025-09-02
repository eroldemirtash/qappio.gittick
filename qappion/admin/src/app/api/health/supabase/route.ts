import { NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = sbAdmin();
    
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from("brands")
      .select("count")
      .limit(1);
    
    if (error) {
      return NextResponse.json(
        { 
          ok: false, 
          error: error.message,
          details: error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      ok: true, 
      message: "Supabase connection successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error 
      },
      { status: 500 }
    );
  }
}
