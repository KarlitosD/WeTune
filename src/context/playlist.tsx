import type { Playlist, Song } from "~/types/playlist"

import { createMutable, SetStoreFunction } from "solid-js/store"
import { Accessor, createContext, from, useContext, type ParentProps } from "solid-js"
import { startWith } from "rxjs"
import { createPersistedSignal } from "~/hooks/createPersistedSignal"
import { removeAudioFromCache } from "~/services/cache"
import playlistsService from "~/services/playlist"

export interface PlaylistContextData {
    playlists: Accessor<Playlist[]>,
    addPlaylist: (playlist: Playlist) => Promise<void>
    removePlaylist: (playlistId: string) => Promise<never>
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
    const playlists = from<Playlist[]>(
        playlistsService.findAll().$.pipe(startWith([]))
    )

    const addPlaylist = playlist => playlistsService.addPlaylist(playlist)


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

    const addSong = async (song: Song, playlistId: string) => {
        if(!playlistId || !song) throw new Error("PlaylistId and song are required")

        const playlist = playlists().find(playlist => playlist.id === playlistId)

        //? Check if song is already in playlist
        const songExistsInPlaylist = playlist.songs.find(songInPlaylist => songInPlaylist.youtubeId === song.youtubeId)
        if(songExistsInPlaylist) return

        await playlistsService.addSongToPlaylist(playlistId, song)
    }


    const playSong = async (song: Song, playlistId = "history") => {
        //? Add song to history playlist
        await addSong(song, "history")
        let songs = structuredClone(playlists().find(playlist => playlist.id === "history").songs)

        songs = songs.filter(songInPLaylist => songInPLaylist.youtubeId !== song.youtubeId)
        songs.unshift(song)

        await playlistsService.setSongsInPlaylist("history", songs)


        setActualPlaylistId(playlistId)
        const playlist = actualPlaylist()
    
        const songIndexInPlaylist = playlist.songs.findIndex(songInPlaylist => songInPlaylist.youtubeId === song.youtubeId)

        if(songIndexInPlaylist !== -1){
            selected.index = songIndexInPlaylist
        }
    }

    const removeSong = async (song: Song, playlistId: string) => {
        await playlistsService.removeSongFromPlaylist(playlistId, song.youtubeId)

        playlistsService.findPlaylistBySongId(song.youtubeId)
            .exec().then(playlist => {
                if(playlist.length === 0) removeAudioFromCache(song.youtubeId)
            })
    }


    const removePlaylist = async (playlistId: string) => {
        const playlist = playlists().find(playlist => playlist.id === playlistId)

        for(const song of playlist.songs) {
            await removeSong(song, playlistId)
        }
        await playlistsService.removePlaylist(playlistId)

    }

    return (
        <PlaylistContext.Provider value={{ 
                playlists, addPlaylist, removePlaylist,
                actualPlaylist, setActualPlaylist, 
                addSong, removeSong, playSong, selected,
            } as PlaylistContextData}>
            {props.children}
        </PlaylistContext.Provider>
    )
}

export const usePlaylist = () => useContext(PlaylistContext) as PlaylistContextData
