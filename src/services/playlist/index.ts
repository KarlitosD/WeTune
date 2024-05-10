import { db } from "~/db";
import { Playlist, Song } from "~/db/schema";

export function findAll(){
    return db.playlist.find({})
}

export function findPlaylistById(playlistId: string){
    return db.playlist.find({ selector: { id: playlistId } })
}

export function findPlaylistBySongId(songId: string){
    return db.playlist.find({ selector: { songs: { $elemMatch: { youtubeId: songId } } } })
}

export function addPlaylist(playlist: Playlist){
    return db.playlist.insert(playlist)
}

export function addSongToPlaylist(playlistId: string, song: Song){
    return db.playlist.find({ selector: { id: playlistId } }).update({
        $push: { songs: song }
    })
}

export function setSongsInPlaylist(playlistId: string, songs: Song[]){
    return db.playlist.find({ selector: { id: playlistId } }).update({
        $set: { songs }
    })
}

export function removeSongFromPlaylist(playlistId: string, songId: string){
    return db.playlist.find({ selector: { id: playlistId } }).update({
        $pull: { songs: { youtubeId: songId } }
    })
}

export function removePlaylist(playlistId: string){
    return db.playlist.find({ selector: { id: playlistId } }).remove()
}

const METHODS = {
    findAll,
    findPlaylistById,
    findPlaylistBySongId,
    addPlaylist,
    addSongToPlaylist,
    setSongsInPlaylist,
    removeSongFromPlaylist,
    removePlaylist
}

export default METHODS