import { NextRequest } from 'next/server';
import { POST as adminAuthPost } from '../route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return adminAuthPost(req);
}
