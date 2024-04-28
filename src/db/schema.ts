import { Type } from "@sinclair/typebox"

export const songSchema = Object.assign({ version: 0, primaryKey: "youtubeId", key: "song" }, Type.Object({
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
}))


export const playlistSchema = Object.assign({ version: 0, primaryKey: "id", key: "playlist" }, Type.Object({
    id: Type.String(),
    title: Type.String(),
    songs: Type.Array(songSchema)
}))
