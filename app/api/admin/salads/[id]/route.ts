import { NextRequest } from 'next/server';
import { proxyToFastAPI } from '@/lib/fastapi';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToFastAPI(req, `/api/salads/${params.id}`);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToFastAPI(req, `/api/admin/salads/${params.id}`);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToFastAPI(req, `/api/admin/salads/${params.id}`);
}
