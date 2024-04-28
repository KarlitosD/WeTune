import type { Playlist, Song } from "~/types/playlist"

import { createMutable, SetStoreFunction } from "solid-js/store"
import { Accessor, createContext, createSignal, from, useContext, type ParentProps } from "solid-js"
import { startWith } from "rxjs"
import { db } from "~/db"

export interface PlaylistContextData {
    playlists: Accessor<Playlist[]>,
    addPlaylist: (playlist: Playlist) => Promise<void>
    actualPlaylist: () => Playlist
    setActualPlaylist: SetStoreFunction<Playlist>
    addSong: (song: Song, playlistId?: string) => Promise<void>
    selected: {
        index: number;
        readonly song: Song;
        readonly hasNext: boolean;
        readonly hasPrevious: boolean;
        setRandom(): void;
    }
}

const PlaylistContext = createContext()

export function PlaylistProvider(props: ParentProps) {
    const playlists = from<Playlist[]>(db.playlist.find({}).$.pipe(startWith([])))

    const addPlaylist = async (playlist: Playlist) => {
        await db.playlist.insert(playlist)
    }


    const [actualPlaylistId, setActualPlaylistId] = createSignal("history")
    const actualPlaylist = () => {
        return playlists().find(playlist => playlist.id === actualPlaylistId())
    }
    const setActualPlaylist = (playlist: Playlist) => {
        setActualPlaylistId(playlist.id)
    }

    const selected = createMutable({
        index: 0,
        get song(): Song {
            return actualPlaylist()?.songs?.[this.index]
        },
        get hasNext() {
            return Boolean(actualPlaylist().songs[this.index + 1])
        },
        get hasPrevious() {
            return Boolean(actualPlaylist().songs[this.index - 1])
        },
        setRandom() {
            let randomIndex: number;
            do {
                randomIndex = Math.trunc(actualPlaylist().songs.length * Math.random())
            } while (actualPlaylist().songs.length > 1 && randomIndex === this.index)
            this.index = randomIndex
        }
    })

    const addSong = async (song: Song, playlistId?: string) => {
        //? Check if playlistId is selected to add song to that playlist
        const playlist = playlistId ? playlists().find(playlist => playlist.id === playlistId) : actualPlaylist()
        console.log({ playlistId, playlist })

        //? Check if song is already in playlist
        const songExistsInPlaylist = playlist.songs.find(songInPlaylist => songInPlaylist.youtubeId === song.youtubeId)
        if(songExistsInPlaylist) return

        await db.playlist.find({ selector: { id: playlist.id } }).update({
            $push: { songs: song }
        })

        //? If the playlist is the history playlist, increment the selected index
        if(playlist.id === "history"){
            selected.index = playlist.songs.length
        }
    }

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
