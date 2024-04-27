import { nanoid } from "nanoid"
import { createEffect } from "solid-js"
import { playlistCollection } from "~/collections/playlist"


export default function Playground(){

    createEffect(() => {
        const data = playlistCollection.find({ title: { $exists: true } }, { limit: 10 }).count()
        console.log(data)
    })

    const handleClick = async () => {
        const data = {
            songs: [],
            title: nanoid(10),
            id: crypto.randomUUID()
        }
        await playlistCollection.insert(data)
        const count = playlistCollection.find({ title: { $exists: true } }, { limit: 10 }).count()

        console.log({ data, count })
    }
    
    return (
        <>
            <button class="bg-primary text-white p-3 rounded" onClick={handleClick}>Click</button>
        </>
    )
}