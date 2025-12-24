type _RequestInfo = URL | RequestInfo | string;

type TauriFetch = typeof fetch | null;

let tauriFetch: TauriFetch | null = null;

async function getTauriFetch(): Promise<TauriFetch | null> {
  if (tauriFetch !== null) return tauriFetch;

  // Check if running in Tauri
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    try {
      const { fetch: tauriHttpFetch } = await import('@tauri-apps/plugin-http');
      tauriFetch = tauriHttpFetch;
      return tauriFetch;
    } catch {
      // Tauri HTTP plugin not available
      tauriFetch = null;
      return null;
    }
  }

  tauriFetch = null;
  return null;
}

export async function fetch(input: _RequestInfo, init?: RequestInit): Promise<Response> {
  const tauri = await getTauriFetch();

  if (tauri) {
    return tauri(input, init);
  }

  // Use native fetch
  return window.fetch(input, init);
}
