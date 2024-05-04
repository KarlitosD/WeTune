import type { Playlist, Song } from "~/types/playlist"

import { createMutable, SetStoreFunction } from "solid-js/store"
import { Accessor, createContext, createEffect, createSignal, from, useContext, type ParentProps } from "solid-js"
import { startWith } from "rxjs"
import { db } from "~/db"
import { createPersistedSignal } from "~/hooks/createPersistedSignal"

export interface PlaylistContextData {
    playlists: Accessor<Playlist[]>,
    addPlaylist: (playlist: Playlist) => Promise<void>
    actualPlaylist: () => Playlist
    setActualPlaylist: SetStoreFunction<Playlist>
    addSong: (song: Song, playlistId?: string) => Promise<void>,
    removeSong: (song: Song, playlistId: string) => Promise<void>,
    playSong: (song: Song, playlistId?: string) => Promise<void>
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


    const [actualPlaylistId, setActualPlaylistId] = createPersistedSignal("actualPlaylistId", "history")
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

        //? Check if song is already in playlist
        const songExistsInPlaylist = playlist.songs.find(songInPlaylist => songInPlaylist.youtubeId === song.youtubeId)
        if(songExistsInPlaylist) return

        await db.playlist.find({ selector: { id: playlist.id } }).update({
            $push: { songs: song }
        })
    }


    const playSong = async (song: Song, playlistId = "history") => {
        //? Add song to history playlist
        await addSong(song, "history")
        let songs = structuredClone(playlists().find(playlist => playlist.id === "history").songs)

        songs = songs.filter(songInPLaylist => songInPLaylist.youtubeId !== song.youtubeId)
        songs.unshift(song)

        await db.playlist.find({ selector: { id: "history" } }).update({ $set: { songs } })



        setActualPlaylistId(playlistId)
        const playlist = actualPlaylist()
    
        const songIndexInPlaylist = playlist.songs.findIndex(songInPlaylist => songInPlaylist.youtubeId === song.youtubeId)

        if(songIndexInPlaylist !== -1){
            selected.index = songIndexInPlaylist
        }
    }

    const removeSong = async (song: Song, playlistId: string) => {
        let songs = structuredClone(playlists().find(playlist => playlist.id === playlistId).songs)
        songs = songs.filter(songInPLaylist => songInPLaylist.youtubeId !== song.youtubeId)

        await db.playlist.find({ selector: { id: playlistId } }).update({
            $set: { songs: songs }
        })
    }

    return (
        <PlaylistContext.Provider value={{ 
                playlists, addPlaylist,    
                actualPlaylist, setActualPlaylist, 
                addSong, removeSong, playSong, selected,
            } as PlaylistContextData}>
            {props.children}
        </PlaylistContext.Provider>
    )
}

export const usePlaylist = () => useContext(PlaylistContext) as PlaylistContextData
