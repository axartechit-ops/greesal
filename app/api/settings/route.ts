import { NextRequest } from 'next/server';
import { proxyToFastAPI } from '@/lib/fastapi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return proxyToFastAPI(req, '/api/settings');
}

export async function POST(req: NextRequest) {
  return proxyToFastAPI(req, '/api/settings');
}

export async function PUT(req: NextRequest) {
  return proxyToFastAPI(req, '/api/settings');
}
