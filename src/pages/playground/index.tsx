import { createMemo } from "solid-js"
import { items } from "./db"

export default function Playground(){
    const count = () => createMemo(() => items.find({}).count())

    const handleClick = () => {
        items.insert({
            text: "Dodo"
        })
    }

    return (
        <>
            <p>{count()}</p>
            <button onClick={handleClick} class="bg-primary text-white p-3 rounded">Click</button>
        </>
    )
}