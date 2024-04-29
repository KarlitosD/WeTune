import { Static, Type } from "@sinclair/typebox"

const songRawChema = Type.Object({
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

export const songSchema = Object.assign({ version: 0, primaryKey: "youtubeId", key: "song" }, songRawChema)


const playlistRawChema = Type.Object({
    id: Type.String(),
    title: Type.String(),
    songs: Type.Array(songSchema)
})

export const playlistSchema = Object.assign({ version: 0, primaryKey: "id", key: "playlist" }, playlistRawChema)


export type Song = Static<typeof songRawChema>
export type Playlist = Static<typeof playlistRawChema>