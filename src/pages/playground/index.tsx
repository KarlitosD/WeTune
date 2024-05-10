import { createEffect, createMemo } from "solid-js"
import { items } from "./db"

export default function Playground(){
    const count = createMemo(() => items.find({}).fetch())

    createEffect(() => {
        console.log(count())
    })

    const addItem = () => {
        items.insert({
            text: "Dodo",
            cosas: [{ id: "1" }],
            cosasCount: 1
        })
    }

    const addCosa = () => {
        items.updateOne({ id: "cedf6a29b97a9" }, {
            $push: { cosas: { id: crypto.randomUUID() } },
            // $inc: { cosasCount: 1 }
        })

        items.updateOne({ id: "93596bd14b33c8"    }, {
            // $inc: { cosasCount: 1 }
            $set: { cosasCount: Math.random() }
        })
    }

    return (
        <>
            {/* <p>{count()}</p> */}
            <button onClick={addItem} class="bg-primary text-white p-3 rounded">Agregar item</button>
            <button onClick={addCosa} class="bg-primary text-white p-3 rounded">Agregar cosa</button>
        </>
    )
}