import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

let isSpawning = false;

/**
 * Automatically launch FastAPI in the background if it's not currently running.
 */
async function ensureFastAPIRunning(): Promise<boolean> {
  if (isSpawning) {
    // Wait for in-progress spawn
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
    console.log('⚡ [Auto-Boot] Launching Python FastAPI server on port 8000...');
    const child = spawn('python', ['backend/run.py'], {
      detached: true,
      stdio: 'ignore',
      shell: true,
      cwd: process.cwd(),
    });
    child.unref();

    // Poll until healthy or 4 seconds timeout
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const check = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(600) });
        if (check.ok) {
          console.log('✅ [Auto-Boot] Python FastAPI server is now ONLINE!');
          isSpawning = false;
          return true;
        }
      } catch {
        // continue polling
      }
    }
  } catch (err) {
    console.error('Failed to auto-spawn FastAPI backend:', err);
  } finally {
    isSpawning = false;
  }

  return false;
}

/**
 * Universal proxy forwarder to forward Next.js API requests to the Python FastAPI backend.
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
      signal: AbortSignal.timeout(10000),
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
      // If connection refused on localhost/127.0.0.1, auto-boot FastAPI and retry
      if (BACKEND_URL.includes('127.0.0.1') || BACKEND_URL.includes('localhost')) {
        const booted = await ensureFastAPIRunning();
        if (booted) {
          res = await makeFetch();
        } else {
          throw networkError;
        }
      } else {
        throw networkError;
      }
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
    console.error(`FastAPI proxy error for ${path}:`, error?.message);
    return NextResponse.json(
      {
        error: 'Python FastAPI backend is offline or unreachable. Please run "python backend/run.py" or "run_backend.bat".',
        target: targetUrl,
        details: error?.message,
      },
      { status: 503 }
    );
  }
}
