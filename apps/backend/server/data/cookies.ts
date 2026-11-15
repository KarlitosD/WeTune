// La cookie de sesión de YouTube vive en .env (YOUTUBE_COOKIE), nunca en el
// repo. Cualquier valor que haya estado versionado debe rotarse: sigue en el
// historial de git.
export const cookie = process.env.YOUTUBE_COOKIE ?? "";

if (!cookie) {
  console.warn("[config] YOUTUBE_COOKIE no está definido; se usa acceso anónimo");
}

// Parse cookies into the new format expected by ytdl-core
export function specificParseCookiesYT(cookieString: string): Array<{ name: string; value: string; domain: string; path: string }> {
  return cookieString.split(';').map(cookie => {
    const parts = cookie.trim().split('=');
    const name = parts[0];
    const value = parts.slice(1).join('=') || '';
    return {
      name: name.trim(),
      value: value.trim(),
      domain: '.youtube.com',
      path: '/',
    };
  });
}
