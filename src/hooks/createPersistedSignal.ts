import { type Accessor, type Setter, createEffect, createSignal } from "solid-js" 

const storage = localStorage

const getValueFromStorage = <T>(key: string) => {
    return JSON.parse(storage.getItem(key) ?? "null") as (T | null)
}

export function createPersistedSignal<T>(key: string, initialValue: T): [Accessor<T>, Setter<T>, () => void] {
    const [value, setValue] = createSignal(getValueFromStorage<T>(key) ?? initialValue)
    const persist = () => {
        storage.setItem(key, JSON.stringify(value()))
    }
    createEffect(() => {
        persist()
    })


    return [value, setValue, persist]
}