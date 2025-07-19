import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, message: 'API routes are working' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ 
    success: true, 
    message: 'POST request received',
    received: body 
  })
}