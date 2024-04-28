import { Static, Type } from "@sinclair/typebox"

const songRawChema = Type.Object({
    title: Type.String(),
    isDownloaded: Type.String(),
    youtubeId: Type.String(),
    album: Type.String(),
    thumbnailUrl: Type.String(),
    thumbnailFallback: Type.String(),
    artists: Type.Object({
        name: Type.String(),
        id: Type.String()
    }),
    duration: Type.Object({
        label: Type.String(),
        totalSeconds: Type.Number()
    })
})

export const songSchema = Object.assign({ version: 0, primaryKey: "youtubeId", key: "song" }, songRawChema)


const playlistRawChema = Type.Object({
    id: Type.String(),
    title: Type.String(),
    songs: Type.Array(songSchema)
})

export const playlistSchema = Object.assign({ version: 0, primaryKey: "id", key: "playlist" }, playlistRawChema)


export type Song = Static<typeof songRawChema>
export type Playlist = Static<typeof playlistRawChema>