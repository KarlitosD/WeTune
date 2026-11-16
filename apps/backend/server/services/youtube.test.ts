import { describe, expect, it, vi } from "vitest"
import { YTNodes } from "youtubei.js"

// El servicio crea su cliente Innertube al importarse; se mockea para probar
// la paginación y el despacho de renderers sin red.
const { createMock, getPlaylistMock } = vi.hoisted(() => {
  const getPlaylistMock = vi.fn()
  return {
    getPlaylistMock,
    createMock: vi.fn(async () => ({ getPlaylist: getPlaylistMock })),
  }
})

vi.mock("youtubei.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("youtubei.js")>()
  return { ...actual, Innertube: { create: createMock } }
})

const { getPlaylist } = await import("./youtube")

function lockupItem(id: string, title: string, author: string, seconds: number) {
  return {
    is: (type: unknown) => type === YTNodes.LockupView,
    content_id: id,
    metadata: {
      title: { toString: () => title },
      metadata: {
        metadata_rows: [{ metadata_parts: [{ text: { toString: () => author } }] }],
      },
    },
    duration: { seconds },
  }
}

function playlistVideoItem(id: string, title: string, author: string, seconds: number) {
  return {
    is: (type: unknown) => type === YTNodes.PlaylistVideo,
    id,
    title: { text: title },
    duration: { seconds },
    author: { id: "UC-author", name: author },
  }
}

describe("getPlaylist", () => {
  it("mapea lockups y videos, y sigue las continuaciones", async () => {
    const secondPage = {
      info: { title: "Musica" },
      items: [lockupItem("third", "Tercera", "Artista C", 180)],
      has_continuation: false,
    }
    const firstPage = {
      info: { title: "Musica" },
      items: [
        lockupItem("first", "Primera", "Artista A", 200),
        playlistVideoItem("second", "Segunda", "Artista B", 210),
      ],
      has_continuation: true,
      getContinuation: vi.fn(async () => secondPage),
    }
    getPlaylistMock.mockResolvedValueOnce(firstPage)

    const playlist = await getPlaylist("PLaJFiDtzv8CNLH_MU_bLLIkMgDeP6Tvws")

    expect(playlist.id).toBe("PLaJFiDtzv8CNLH_MU_bLLIkMgDeP6Tvws")
    expect(playlist.title).toBe("Musica")
    expect(playlist.songs.map((song) => song.youtubeId)).toEqual(["first", "second", "third"])
    expect(playlist.songs[0].author.name).toBe("Artista A")
    expect(firstPage.getContinuation).toHaveBeenCalledOnce()
  })
})
