import { For } from "solid-js"
import ToastItem from "~/components/Toasts/ToastItem"
import { toast } from "~/hooks/createToast"

export default function Toaster() {
    const toasts = toast.useToasts()

    return (
        <div class="fixed top-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
            <For each={toasts()}>
                {(toastItem) => (
                    <div class="pointer-events-auto">
                        <ToastItem {...toastItem} onDismiss={toast.dismiss} />
                    </div>
                )}
            </For>
        </div>
    )
}
