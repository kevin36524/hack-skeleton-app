import { NextResponse } from 'next/server';
import { supabase, type TestAccount } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('test_accounts')
      .select('id, email, oauth_token, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching test accounts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test accounts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accounts: data as TestAccount[],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
