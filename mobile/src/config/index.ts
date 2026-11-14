// URL del backend desde una variable pública de Expo.
// Definir en mobile/.env: EXPO_PUBLIC_API_URL=https://tu-backend
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export function getApiUrl(path: string) {
  return `${BASE_URL}/api/${path}`.replace("//api", "/api");
}
