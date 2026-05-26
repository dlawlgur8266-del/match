import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const value = req.nextUrl.searchParams.get('value')
  if (!value) return NextResponse.json({ exists: false })

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('nickname', value)
    .maybeSingle()

  return NextResponse.json({ exists: !!data })
}
