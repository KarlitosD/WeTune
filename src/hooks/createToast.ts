import { createSignal } from "solid-js"
import { toastEvent, type ToastEventData } from "~/utils/events"

export type ToastType = "success" | "error" | "info" | "loading"

export type Toast = {
    id: string
    type: ToastType
    title: string
    description?: string
    duration?: number
}

let toasts: Toast[] = []
let listeners: Array<(toasts: readonly Toast[]) => void> = []

function notify() {
    listeners.forEach(listener => listener([...toasts]))
}

function addToast(data: ToastEventData) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const toastItem = { ...data, id }
    const duration = data.duration ?? 4000

    toasts.push(toastItem)
    notify()

    if (duration > 0) {
        setTimeout(() => {
            dismissToast(id)
        }, duration)
    }

    return id
}

function dismissToast(id: string) {
    toasts = toasts.filter(t => t.id !== id)
    notify()
}

toastEvent.on("add", (data: ToastEventData) => {
    addToast(data)
})

toastEvent.on("dismiss", (id: string) => {
    dismissToast(id)
})

export function toast(data: ToastEventData): string {
    return addToast(data)
}

toast.success = (title: string, description?: string, duration?: number) => {
    return toast({ type: "success", title, description, duration })
}

toast.error = (title: string, description?: string, duration?: number) => {
    return toast({ type: "error", title, description, duration })
}

toast.info = (title: string, description?: string, duration?: number) => {
    return toast({ type: "info", title, description, duration })
}

toast.loading = (title: string, description?: string) => {
    return toast({ type: "loading", title, description, duration: 0 })
}

toast.dismiss = (id: string) => {
    toastEvent.emit("dismiss", id)
}

toast.useToasts = () => {
    const [toastsSignal] = createSignal<readonly Toast[]>([])
    listeners.push(toastsSignal[1])
    notify()
    return toastsSignal
}
