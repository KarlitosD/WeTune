import { db } from "~/db";
import { Playlist, Song } from "~/db/schema";

export function findAll(){
    return db.playlist.find({})
}

export function findPlaylistById(playlistId: string){
    return db.playlist.findOne({ id: playlistId })
}

export function findPlaylistBySongId(songId: string){
    return db.playlist.find({ songs: { $elemMatch: { youtubeId: songId } } })
}

export function addPlaylist(playlist: Playlist){
    return db.playlist.insert(playlist)
}

export function addSongToPlaylist(playlistId: string, song: Song){
    const res = db.playlist.updateOne({ id: playlistId }, {
        $push: { songs: song }
    })

    return res
}

export function setSongsInPlaylist(playlistId: string, songs: Song[]){
    const res =  db.playlist.updateOne({ id: playlistId }, {
        $set: { songs }
    })

    return res
}

export function removeSongFromPlaylist(playlistId: string, songId: string){
    const res = db.playlist.updateOne({ id: playlistId }, {
        $pull: { songs: { youtubeId: songId } }
    })
    
    return res
}

export function removePlaylist(playlistId: string){
    return db.playlist.removeOne({ id: playlistId })
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