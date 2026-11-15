import { z } from "zod"

// Contrato de la API compartido por apps/mobile y apps/backend.
// Cualquier cambio de forma viaja en un solo lugar y ambos lados lo consumen.

export const songSchema = z.object({
    title: z.string(),
    youtubeId: z.string(),
    album: z.object({
        name: z.string(),
        id: z.string()
    }).optional(),
    thumbnailUrl: z.string(),
    type: z.string(),
    author: z.object({
        name: z.string(),
        id: z.string()
    }),
    duration: z.number()
})

export const playlistSchema = z.object({
    id: z.string(),
    title: z.string(),
    songs: z.array(songSchema),
    // Campos locales (SQLite). El backend no los devuelve; son opcionales
    // para que la validación de /api/playlist siga funcionando.
    favorite: z.boolean().optional(),
    lastPlayedAt: z.number().optional(),
})

export type Song = z.infer<typeof songSchema>
export type Playlist = z.infer<typeof playlistSchema>
