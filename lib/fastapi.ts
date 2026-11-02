import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

export const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

let isSpawning = false;

/**
 * Automatically launch FastAPI in the background if it's not currently running.
 */
async function ensureFastAPIRunning(): Promise<boolean> {
  if (isSpawning) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const check = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(600) });
        if (check.ok) return true;
      } catch {
        // continue waiting
      }
    }
    return false;
  }

  isSpawning = true;
  try {
    const child = spawn('python', ['backend/run.py'], {
      detached: true,
      stdio: 'ignore',
      shell: true,
      cwd: process.cwd(),
    });
    child.unref();

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const check = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(600) });
        if (check.ok) {
          isSpawning = false;
          return true;
        }
      } catch {
        // continue polling
      }
    }
  } catch (err) {
    console.error('FastAPI spawn attempt:', err);
  } finally {
    isSpawning = false;
  }

  return false;
}

/**
 * High-reliability local fallback when FastAPI backend is offline or waking up.
 * Reads & writes directly to authentic local JSON stores in backend/.
 */
function getBackendFilePath(filename: string): string {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'backend', filename),
    path.join(cwd, 'greesal', 'backend', filename),
    path.join(__dirname, '..', 'backend', filename),
    path.join(__dirname, '..', '..', 'backend', filename),
    path.join(__dirname, '..', '..', 'greesal', 'backend', filename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return fs.existsSync(path.join(cwd, 'greesal', 'backend'))
    ? path.join(cwd, 'greesal', 'backend', filename)
    : path.join(cwd, 'backend', filename);
}

function writeBackendFile(filename: string, data: any) {
  const cwd = process.cwd();
  const paths = [
    path.join(cwd, 'backend', filename),
    path.join(cwd, 'greesal', 'backend', filename),
  ];
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  for (const p of paths) {
    try {
      const dir = path.dirname(p);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(p, content, 'utf8');
      }
    } catch {}
  }
}

function handleOfflineFallback(req: NextRequest, reqPath: string, method: string, bodyText?: string) {
  const saladsFile = getBackendFilePath('local_salads.json');
  const ordersFile = getBackendFilePath('local_orders.json');
  const settingsFile = getBackendFilePath('local_settings.json');
  const reviewsFile = getBackendFilePath('local_reviews.json');

  const normPath = reqPath.replace(/\/api/, '').toLowerCase();

  // 1. Salads collection (GET, POST)
  if (normPath === '/salads' || normPath === '/admin/salads') {
    if (method === 'GET') {
      try {
        if (fs.existsSync(saladsFile)) {
          const raw = JSON.parse(fs.readFileSync(saladsFile, 'utf8'));
          if (Array.isArray(raw)) {
            const clean = raw.filter((s: any) => !String(s.id || '').startsWith('fallback-') && !String(s._id || '').startsWith('fallback-'));
            return NextResponse.json(clean, { status: 200 });
          }
        }
      } catch (e) {
        console.error('Error reading local_salads.json:', e);
      }
      return NextResponse.json([], { status: 200 });
    }
    if (method === 'POST') {
      try {
        const body = bodyText ? JSON.parse(bodyText) : {};
        let raw: any[] = [];
        if (fs.existsSync(saladsFile)) {
          raw = JSON.parse(fs.readFileSync(saladsFile, 'utf8'));
        }
        const newSalad = {
          ...body,
          _id: body._id || body.id || `salad-${Date.now()}`,
          id: body.id || body._id || `salad-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        raw.push(newSalad);
        writeBackendFile('local_salads.json', raw);
        return NextResponse.json({ message: 'Salad added successfully', salad: newSalad }, { status: 201 });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
      }
    }
  }

  // 2. Individual salad item (GET, PUT, DELETE)
  if (normPath.startsWith('/admin/salads/') || normPath.startsWith('/salads/')) {
    const id = reqPath.split('/').pop() || '';
    if (method === 'PUT') {
      try {
        const body = bodyText ? JSON.parse(bodyText) : {};
        if (fs.existsSync(saladsFile)) {
          const raw = JSON.parse(fs.readFileSync(saladsFile, 'utf8'));
          const idx = raw.findIndex((s: any) => s._id === id || s.id === id || s.slug === id);
          if (idx !== -1) {
            raw[idx] = { ...raw[idx], ...body, updatedAt: new Date().toISOString() };
            writeBackendFile('local_salads.json', raw);
            return NextResponse.json({ message: 'Salad updated successfully', salad: raw[idx] }, { status: 200 });
          }
        }
      } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
      }
    }
    if (method === 'DELETE') {
      try {
        if (fs.existsSync(saladsFile)) {
          const raw = JSON.parse(fs.readFileSync(saladsFile, 'utf8'));
          const filtered = raw.filter((s: any) => s._id !== id && s.id !== id && s.slug !== id);
          fs.writeFileSync(saladsFile, JSON.stringify(filtered, null, 2), 'utf8');
          return NextResponse.json({ message: 'Salad deleted successfully' }, { status: 200 });
        }
      } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
      }
    }
    if (method === 'GET') {
      try {
        if (fs.existsSync(saladsFile)) {
          const raw = JSON.parse(fs.readFileSync(saladsFile, 'utf8'));
          const found = raw.find((s: any) => s._id === id || s.id === id || s.slug === id);
          if (found) return NextResponse.json(found, { status: 200 });
        }
      } catch (e) {
        console.error('Error finding salad:', e);
      }
      return NextResponse.json({ error: 'Salad not found' }, { status: 404 });
    }
  }

  // 3. Settings endpoint (GET, POST, PUT)
  if (normPath === '/settings' || normPath === '/admin/settings') {
    if (method === 'GET') {
      try {
        if (fs.existsSync(settingsFile)) {
          const raw = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
          return NextResponse.json({ ...DEFAULT_SITE_SETTINGS, ...raw }, { status: 200 });
        }
      } catch (e) {
        console.error('Error reading local_settings.json:', e);
      }
      return NextResponse.json(DEFAULT_SITE_SETTINGS, { status: 200 });
    }
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = bodyText ? JSON.parse(bodyText) : {};
        let current = { ...DEFAULT_SITE_SETTINGS };
        if (fs.existsSync(settingsFile)) {
          current = { ...current, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) };
        }
        const merged = { ...current, ...body };
        fs.writeFileSync(settingsFile, JSON.stringify(merged, null, 2), 'utf8');
        return NextResponse.json({ message: 'Settings saved successfully', settings: merged }, { status: 200 });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
      }
    }
  }

  // 4. Orders endpoint (GET, POST, PUT)
  if (normPath === '/orders' || normPath === '/admin/orders') {
    if (method === 'GET') {
      try {
        if (fs.existsSync(ordersFile)) {
          const raw = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
          return NextResponse.json(Array.isArray(raw) ? raw : [], { status: 200 });
        }
      } catch (e) {
        console.error('Error reading local_orders.json:', e);
      }
      return NextResponse.json([], { status: 200 });
    }
    if (method === 'POST') {
      try {
        const body = bodyText ? JSON.parse(bodyText) : {};
        let raw: any[] = [];
        if (fs.existsSync(ordersFile)) {
          raw = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        }
        const newOrder = {
          ...body,
          id: body.id || `ORD-${Date.now()}`,
          _id: body._id || `order-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        raw.unshift(newOrder);
        fs.writeFileSync(ordersFile, JSON.stringify(raw, null, 2), 'utf8');
        return NextResponse.json({ message: 'Order placed successfully', order: newOrder }, { status: 201 });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 500 });
      }
    }
  }

  // 5. Reviews endpoint
  if (normPath === '/reviews' || normPath === '/admin/reviews') {
    if (method === 'GET') {
      try {
        if (fs.existsSync(reviewsFile)) {
          const raw = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
          return NextResponse.json(Array.isArray(raw) ? raw : [], { status: 200 });
        }
      } catch (e) {
        console.error('Error reading local_reviews.json:', e);
      }
      return NextResponse.json([], { status: 200 });
    }
  }

  return NextResponse.json(
    {
      error: 'Backend is offline and no local handler configured.',
      path: reqPath,
    },
    { status: 503 }
  );
}

/**
 * Universal proxy forwarder to forward Next.js API requests to Python FastAPI backend,
 * with zero-fail fallback to local JSON stores if backend is unreachable.
 */
export async function proxyToFastAPI(req: NextRequest, path: string) {
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_URL}${path}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!['host', 'connection', 'content-length'].includes(lower)) {
      headers.set(key, value);
    }
  });

  const method = req.method;
  let bodyText: string | undefined;
  if (!['GET', 'HEAD'].includes(method)) {
    try {
      bodyText = await req.text();
    } catch {
      // ignore
    }
  }

  const makeFetch = async () => {
    const init: RequestInit = {
      method,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    };
    if (bodyText) {
      init.body = bodyText;
    }
    return fetch(targetUrl, init);
  };

  try {
    let res: Response;
    try {
      res = await makeFetch();
    } catch (networkError: any) {
      // If network unreachable, return robust local fallback
      return handleOfflineFallback(req, path, method, bodyText);
    }

    if (res.status >= 500) {
      return handleOfflineFallback(req, path, method, bodyText);
    }

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection'].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: res.status,
        headers: responseHeaders,
      });
    } else {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: responseHeaders,
      });
    }
  } catch (error: any) {
    return handleOfflineFallback(req, path, method, bodyText);
  }
}
