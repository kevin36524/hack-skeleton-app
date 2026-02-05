import { NextResponse } from 'next/server';
import { supabase, type TestAccount } from '@/lib/supabase';

export async function GET() {
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    // Return empty array if Supabase is not configured
    return NextResponse.json({
      success: true,
      accounts: [],
    });
  }

  try {
    const { data, error } = await supabase
      .from('test_accounts')
      .select('id, email, oauth_token, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching test accounts:', error);
      return NextResponse.json({
        success: true,
        accounts: [],
      });
    }

    return NextResponse.json({
      success: true,
      accounts: data as TestAccount[],
    });
  } catch (error) {
    console.error('Unexpected error fetching test accounts:', error);
    // Return empty array instead of error to prevent UI issues
    return NextResponse.json({
      success: true,
      accounts: [],
    });
  }
}
