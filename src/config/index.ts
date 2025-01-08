const BASE_URL = import.meta.env.VITE_API_URL ?? ""

export function getApiUrl(path: string){
    return `${BASE_URL}/api/${path}`.replace("//api", "/api")
}