import { createMutable, createStore, SetStoreFunction, StoreSetter } from "solid-js/store"
import { Accessor, createContext, createEffect, createSignal, useContext } from "solid-js"
import type { Playlist, Song } from "~/types/playlist"

const PlaylistContext = createContext()

export interface PlaylistContextData {
    playlists: Accessor<Playlist[]>,
    addPlaylist: (playlist: Playlist) => void,
    actualPlaylist: Playlist
    setActualPlaylist: SetStoreFunction<Playlist>
    addSong: (song: Song, playlistId?: string) => void
    selected: {
        index: number;
        readonly song: Song;
        readonly hasNext: boolean;
        readonly hasPrevious: boolean;
        setRandom(): void;
    }
}

export function recoveredPlaylistHistory(){
    const lastSongString = window?.localStorage.getItem("last")
    return {
        id: "history",
        title: "Recents",
        songs: lastSongString && lastSongString !== "undefined" ? [JSON.parse(lastSongString)] : []
    } as Playlist
}

export function PlaylistProvider(props) {
    const [playlists, setPlaylists] = createSignal<Playlist[]>([])
    
    const playlistsSaved = localStorage.getItem("playlists")
    if (playlistsSaved) setPlaylists(JSON.parse(playlistsSaved) as Playlist[])

    createEffect(() => {
        localStorage.setItem("playlists", JSON.stringify(playlists()))
    })

    const addPlaylist = (playlist: Playlist) => {
        setPlaylists(playlists => [...playlists, playlist])
    }

    const [actualPlaylist, setActualPlaylist] = createStore<Playlist>(recoveredPlaylistHistory())

    const selected = createMutable({
        index: 0,
        get song(): Song {
            return actualPlaylist.songs[this.index]
        },
        get hasNext() {
            return Boolean(actualPlaylist.songs[this.index + 1])
        },
        get hasPrevious() {
            return Boolean(actualPlaylist.songs[this.index - 1])
        },
        setRandom() {
            let randomIndex: number;
            do {
                randomIndex = Math.trunc(actualPlaylist.songs.length * Math.random())
            } while (actualPlaylist.songs.length > 1 && randomIndex === this.index)
            this.index = randomIndex
        }
    })

    const addSong = (song: Song, playlistId?: string) => {
        const playlist = playlistId ? playlists().find(playlist => playlist.id === playlistId) : actualPlaylist
        const songsFiltered = playlist.songs.filter(songInPlaylist => songInPlaylist.youtubeId !== song.youtubeId)
        console.log(playlist.title)

        if(playlistId) {
            setPlaylists(playlists => {
                return playlists.map(playlist => playlist.id === playlistId ? { ...playlist, songs: [...songsFiltered, song] } : playlist)
            })
        } else {
            setActualPlaylist(playlist => ({ 
                ...playlist, 
                songs: [...songsFiltered, song] 
            }))
            
            selected.index = songsFiltered.length
        }
    }

    createEffect(() => {
        localStorage.setItem("last", JSON.stringify(selected.song))
    })

    return (
        <PlaylistContext.Provider value={{ 
                playlists, addPlaylist,    
                actualPlaylist, setActualPlaylist, 
                addSong, selected,
            } as PlaylistContextData}>
            {props.children}
        </PlaylistContext.Provider>
    )
}

export const usePlaylist = () => useContext(PlaylistContext) as PlaylistContextData
