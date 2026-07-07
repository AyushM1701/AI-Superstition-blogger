import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ success: true, message: 'Webhook received' }, { status: 200 });
}
