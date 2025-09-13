import { NextResponse } from 'next/server'
import { sbAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const supabase = sbAdmin()
    
    // Test if settings table exists by trying to select from it
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Settings table error:', error)
      return NextResponse.json({ 
        error: 'Settings table issue', 
        details: error.message,
        code: error.code,
        hint: error.hint
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings table exists',
      data: data || []
    })
  } catch (error: any) {
    console.error('❌ Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}
