- [] Implement "virtual playlist" (for a correct shuffle state and implement autoplay recommendations in a future)

- [] Investigate song not reproduce in the start

- [] Refactor context of playlist to manage more easy the playlist operations

- [] Consider visual redesign of the audio player

- [-] Integrate Media Session API

- [-] Playlist
    - [X] Import playlist from youtube url
    - [X] Refactor playlist data with playlistId (using InnerTube)
    - [X] Import from youtube and youtube music
    - [-] Add playlist operations (rename, delete)
    - [X] Save last song played in the playlist
    - [X] Button for download all songs of a playlist
    - [] Add playlist of songs downloaded
    - [] Button for sync songs of a imported playlist from youtube
    - [] Add method to diferenciate between local playlist and imported playlist

- [] Add drawer for song player in mobile


- [-] Consider preload next song of a playlist

----

- [X] Consider use cloudflare web analytics and turnsile
    - [X] Using cloudflare web analytics
    - [DESCARTADO] Using turnsile

- [X] Use wsrv.nl for image proxy (e.g. https://wsrv.nl/?url=https://i.ytimg.com/vi/3vVSBLkpO-8/mqdefault.jpg&fit=cover&w=128&h=128)

- [X] Detect if the device is a mobile device for initial volume (navigator.userAgentData.mobile)

- [X] Add icon if a song is downloaded

- [X] Shareables link of songs
    - [X] Get info of a song with a youtubeId
    - [X] Investigate that sometimes the shared link gives an incorrect song

- [X] Video results when searching

- [X] Share not reactive

- [X] Consider remove song from cache if the song not exists in none playlist

- [X] Add i18n

- [X] Refactor youtube logic (api) and playlist logic (move to services folder)

- [X] Make button for replay playlist

- [X] Made search section (songs/videos) tabs

- [X] Cache thumbnails of songs (using workbox runtine caching)