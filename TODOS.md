- [] Investigate song not reproduce in the start

- [] Make button for replay playlist

- [-] Integrate Media Session API

- [] Add i18n

- [] Refactor youtube logic (api) and playlist logic (move to services folder)

- [-] Playlist
    - [X] Import playlist from youtube url
    - [X] Refactor playlist data with playlistId (using InnerTube)
    - [X] Import from youtube and youtube music
    - [-] Add playlist operations (rename, delete)
    - [] Add playlist of songs downloaded
    - [] Save last song played in the playlist
    - [] Button for sync songs of a imported playlist from youtube
    - [X] Button for download all songs of a playlist
        - [] Add method to diferenciate between local playlist and imported playlist

- [] Made search section (songs/videos) collapsible

- [] Add drawer for song player in mobile

- [] Consider visual redesign of the audio player

- [] Cache thumbnails of songs (maybe use service worker)

- [] Consider preload next song of a playlist

- [-] Consider use cloudflare web analytics and turnsile
    - [X] Using cloudflare web analytics
    - [] Using turnsile

----

- [X] Use wsrv.nl for image proxy (e.g. https://wsrv.nl/?url=https://i.ytimg.com/vi/3vVSBLkpO-8/mqdefault.jpg&fit=cover&w=128&h=128)

- [X] Detect if the device is a mobile device for initial volume (navigator.userAgentData.mobile)

- [X] Add icon if a song is downloaded

- [X] Shareables link of songs
    - [X] Get info of a song with a youtubeId
    - [X] Investigate that sometimes the shared link gives an incorrect song

- [X] Video results when searching

- [X] Share not reactive

- [X] Consider remove song from cache if the song not exists in none playlist