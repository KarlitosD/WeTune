import { createMutable, createStore, SetStoreFunction, StoreSetter } from "solid-js/store"
import { createContext, createEffect, useContext } from "solid-js"
import type { Playlist, Song } from "~/types/playlist"

const PlaylistContext = createContext()

export interface PlaylistContextData {
    playlist: Playlist
    setPlaylist: (songs: Song[]) => void
    addSong: (song: Song) => void
    selected: {
        index: number;
        readonly song: Song;
        readonly hasNext: boolean;
        readonly hasPrevious: boolean;
        setRandom(): void;
    }
}

export function PlaylistProvider(props) {
    const lastSongString = window?.localStorage.getItem("last")
    const [playlist, setPlaylist] = createStore<Playlist>({
        id: "history",
        title: "Recents",
        songs: lastSongString && lastSongString !== "undefined" ? [JSON.parse(lastSongString)] : []
    })

    const selected = createMutable({
        index: 0,
        get song(): Song {
            return playlist.songs[this.index]
        },
        get hasNext() {
            return Boolean(playlist.songs[this.index + 1])
        },
        get hasPrevious() {
            return Boolean(playlist.songs[this.index - 1])
        },
        setRandom() {
            let randomIndex: number;
            do {
                randomIndex = Math.trunc(playlist.songs.length * Math.random())
            } while (playlist.songs.length > 1 && randomIndex === this.index)
            this.index = randomIndex
        }
    })

    const addSong = (song: Song) => {
        const songsFiltered = playlist.songs.filter(songInPlaylist => songInPlaylist.youtubeId !== song.youtubeId)
        
        setPlaylist(playlist => ({ 
            ...playlist, 
            songs: [...songsFiltered, song] 
        }))
        
        selected.index = songsFiltered.length
    }

    createEffect(() => {
        localStorage.setItem("last", JSON.stringify(selected.song))
    })

    return (
        <PlaylistContext.Provider value={{ playlist, setPlaylist, addSong, selected } as PlaylistContextData}>
            {props.children}
        </PlaylistContext.Provider>
    )
}

export const usePlaylist = () => useContext(PlaylistContext) as PlaylistContextData
