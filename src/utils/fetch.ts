type _RequestInfo = URL | RequestInfo | string;

let tauriFetch: typeof fetch | null = null;

async function getTauriFetch(): Promise<typeof fetch | null> {
  if (tauriFetch) return tauriFetch;

  // Check if running in Tauri
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    try {
      const { fetch: tauriHttpFetch } = await import('@tauri-apps/plugin-http');
      tauriFetch = tauriHttpFetch;
      return tauriFetch;
    } catch {
      return null;
    }
  }

  return null;
}

export async function fetch(input: _RequestInfo, init?: RequestInit): Promise<Response> {
  const tauri = await getTauriFetch();

  if (tauri) {
    return tauri(input, init);
  }

  return window.fetch(input, init);
}
