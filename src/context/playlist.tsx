import type { Playlist, Song } from "~/types/playlist"

import { createMutable, SetStoreFunction } from "solid-js/store"
import { Accessor, createContext, createMemo, useContext, type ParentProps } from "solid-js"
import { createPersistedSignal } from "~/hooks/createPersistedSignal"
import { removeAudioFromCache } from "~/services/cache"
import playlistsService from "~/services/playlist"
import { PLAYLISTS } from "~/consts"

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
        readonly nextSong: Song;
        readonly hasNext: boolean;
        readonly hasPrevious: boolean;
        setRandom(): void;
    }
}

const PlaylistContext = createContext()

export function PlaylistProvider(props: ParentProps) {
    const playlists = createMemo(() => playlistsService.findAll().fetch())

    const addPlaylist = playlist => playlistsService.addPlaylist(playlist)


    const [actualPlaylistId, setActualPlaylistId] = createPersistedSignal("actualPlaylistId", PLAYLISTS.HISTORY)
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
        get nextSong(): Song {
            return this.hasNext ? actualPlaylist()?.songs?.[this.index + 1] : undefined
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


    const playSong = async (song: Song, playlistId = PLAYLISTS.HISTORY) => {
        //? Add song to history playlist
        await addSong(song, PLAYLISTS.HISTORY)
        let songs = structuredClone(playlists().find(playlist => playlist.id === PLAYLISTS.HISTORY).songs)

        songs = songs.filter(songInPLaylist => songInPLaylist.youtubeId !== song.youtubeId)
        songs.unshift(song)

        await playlistsService.setSongsInPlaylist(PLAYLISTS.HISTORY, songs)


        setActualPlaylistId(playlistId)
        const playlist = await playlistsService.findPlaylistById(playlistId)
    
        const songIndexInPlaylist = playlist.songs.findIndex(songInPlaylist => songInPlaylist.youtubeId === song.youtubeId)

        if(songIndexInPlaylist !== -1){
            selected.index = songIndexInPlaylist
        }
    }

    const removeSong = async (song: Song, playlistId: string) => {
        await playlistsService.removeSongFromPlaylist(playlistId, song.youtubeId)

        const playlist = playlistsService.findPlaylistBySongId(song.youtubeId).fetch()
        if(playlist.length === 0) removeAudioFromCache(song.youtubeId)
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
