import { NextRequest } from 'next/server';
import { proxyToFastAPI } from '@/lib/fastapi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return proxyToFastAPI(req, '/api/admin/auth');
}

export async function POST(req: NextRequest) {
  return proxyToFastAPI(req, '/api/admin/auth');
}

export async function DELETE(req: NextRequest) {
  return proxyToFastAPI(req, '/api/admin/auth');
}
