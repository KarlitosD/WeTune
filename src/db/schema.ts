import { Static, Type } from "@sinclair/typebox"

const songSchema = Type.Object({
    title: Type.String(),
    youtubeId: Type.String(),
    album: Type.Optional(Type.Object({
        name: Type.String(),
        id: Type.String()
    })),
    thumbnailUrl: Type.String(),
    type: Type.String(),
    author: Type.Object({
        name: Type.String(),
        id: Type.String()
    }),
    duration: Type.Number()
})

const playlistSchema = Type.Object({
    id: Type.String(),
    title: Type.String(),
    songs: Type.Array(songSchema)
})

export type Song = Static<typeof songSchema>
export type Playlist = Static<typeof playlistSchema>