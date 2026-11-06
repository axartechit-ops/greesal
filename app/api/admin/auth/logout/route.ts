import { DELETE as adminAuthDelete } from '../route';

export const dynamic = 'force-dynamic';

export async function POST() {
  return adminAuthDelete();
}

export async function DELETE() {
  return adminAuthDelete();
}
