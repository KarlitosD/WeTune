export type Song = {
    youtubeId: string
    title: string
    artists: {
        name: string
        id: string
    }
    album: string
    thumbnailUrl: string
    duration: {
        label: string
        totalSeconds: number
    }
    thumbnailFallback: string
}


export type Playlist = {
    id: string
    title: string
    songs: Song[]
}