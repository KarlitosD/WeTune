import { describe, expect, it } from "vitest"
import type { YT, YTNodes } from "youtubei.js"
import {
  parseAndValidateSong,
  parseFromPlaylistVideo,
  parseFromVideoInfo,
  parseSongFromYTNodeLike,
} from "./youtube"

// Los objetos de youtubei.js son clases con decenas de campos; en los tests
// basta con la forma que consume cada parser.
const asVideoInfo = (value: unknown) => value as YT.VideoInfo
const asNode = (value: unknown) => value as YTNodes.MusicResponsiveListItem
const asPlaylistVideo = (value: unknown) => value as YTNodes.PlaylistVideo

describe("parseFromPlaylistVideo", () => {
  it("mapea id, título, duración y autor", () => {
    const song = parseFromPlaylistVideo(
      asPlaylistVideo({
        id: "w7GgAvVy6-M",
        title: { text: "Tema" },
        duration: { seconds: 200 },
        author: { id: "UC123", name: "Artista" },
      }),
    )

    expect(song).toEqual({
      youtubeId: "w7GgAvVy6-M",
      title: "Tema",
      thumbnailUrl: "https://i.ytimg.com/vi/w7GgAvVy6-M/mqdefault.jpg",
      duration: 200,
      type: "video",
      author: { id: "UC123", name: "Artista" },
    })
  })

  it("usa valores por defecto cuando faltan duración y autor", () => {
    const song = parseFromPlaylistVideo(
      asPlaylistVideo({ id: "w7GgAvVy6-M", title: { text: "Tema" } }),
    )

    expect(song.duration).toBe(1)
    expect(song.author).toEqual({ id: "", name: "" })
  })
})

describe("parseFromVideoInfo", () => {
  it("detecta música por categoría y canal Topic, y toma el álbum de la descripción", () => {
    const song = parseFromVideoInfo(
      asVideoInfo({
        basic_info: {
          id: "abc12345678",
          title: "Canción",
          duration: 180,
          category: "Music",
          channel: { name: "Artista - Topic", id: "UCxxx" },
          short_description: "linea 1\nlinea 2\nÁlbum X\nlinea 4",
        },
      }),
    )

    expect(song).toEqual({
      youtubeId: "abc12345678",
      title: "Canción",
      thumbnailUrl: "https://i.ytimg.com/vi/abc12345678/mqdefault.jpg",
      duration: 180,
      type: "song",
      author: { name: "Artista", id: "UCxxx" },
      album: { id: "", name: "Álbum X" },
    })
  })

  it("trata como video lo que no es música y toma el autor de secondary_info", () => {
    const song = parseFromVideoInfo(
      asVideoInfo({
        basic_info: {
          id: "xyz12345678",
          title: "Clip",
          duration: 90,
          category: "Gaming",
          channel: { name: "Canal", id: "UCyyy" },
        },
        secondary_info: { owner: { author: { name: "Owner", id: "UCzzz" } } },
      }),
    )

    expect(song.type).toBe("video")
    expect(song.author).toEqual({ name: "Owner", id: "UCzzz" })
    expect(song.album).toBeUndefined()
  })

  it("cae a strings vacíos cuando basic_info viene incompleto", () => {
    const song = parseFromVideoInfo(asVideoInfo({}))

    expect(song.youtubeId).toBe("")
    expect(song.title).toBe("")
    expect(song.duration).toBe(0)
  })
})

describe("parseAndValidateSong", () => {
  it("rechaza basic_info incompleto para forzar el fallback de cliente", () => {
    expect(parseAndValidateSong(asVideoInfo({}))).toBeNull()
    expect(
      parseAndValidateSong(
        asVideoInfo({ basic_info: { id: "abc12345678", title: "", duration: 0 } }),
      ),
    ).toBeNull()
  })

  it("acepta un video con id y título", () => {
    expect(
      parseAndValidateSong(
        asVideoInfo({
          basic_info: {
            id: "abc12345678",
            title: "Canción",
            duration: 180,
            category: "Music",
            channel: { name: "Artista - Topic", id: "UCxxx" },
          },
        }),
      ),
    ).toMatchObject({ youtubeId: "abc12345678", title: "Canción" })
  })
})

describe("parseSongFromYTNodeLike", () => {
  it("mapea un nodo de tipo song con álbum y artistas", () => {
    const song = parseSongFromYTNodeLike(
      asNode({
        id: "w7GgAvVy6-M",
        title: "Tema",
        duration: { seconds: 210 },
        item_type: "song",
        album: { name: "Álbum", id: "alb1" },
        artists: [{ name: "Artista", channel_id: "UCa" }],
      }),
    )

    expect(song).toEqual({
      youtubeId: "w7GgAvVy6-M",
      title: "Tema",
      duration: 210,
      thumbnailUrl: "https://i.ytimg.com/vi/w7GgAvVy6-M/mqdefault.jpg",
      type: "song",
      album: { name: "Álbum", id: "alb1" },
      author: { name: "Artista", id: "UCa" },
    })
  })

  it("mapea un nodo de tipo video con el primer autor", () => {
    const song = parseSongFromYTNodeLike(
      asNode({
        id: "w7GgAvVy6-M",
        title: "Tema",
        duration: { seconds: 210 },
        item_type: "video",
        authors: [{ name: "Canal", channel_id: "UCb" }],
      }),
    )

    expect(song?.type).toBe("video")
    expect(song?.author).toEqual({ name: "Canal", id: "UCb" })
  })

  it("devuelve null cuando no hay id", () => {
    expect(parseSongFromYTNodeLike(asNode({ item_type: "song" }))).toBeNull()
  })

  it("devuelve null para tipos no soportados", () => {
    expect(parseSongFromYTNodeLike(asNode({ id: "w7GgAvVy6-M", item_type: "album" }))).toBeNull()
  })
})
