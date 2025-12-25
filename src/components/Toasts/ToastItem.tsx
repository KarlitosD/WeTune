import { Show } from "solid-js"
import { IconCheck, IconX, IconInfo, IconAlertTriangle } from "~/components/Icons"

type ToastType = "success" | "error" | "info" | "loading"

type ToastItemProps = {
    id: string
    type: ToastType
    title: string
    description?: string
    duration?: number
    onDismiss: (id: string) => void
}

const toastIcons = {
    success: (props: any) => <IconCheck {...props} class="text-success" />,
    error: (props: any) => <IconX {...props} class="text-error" />,
    info: (props: any) => <IconInfo {...props} class="text-info" />,
    loading: (props: any) => <IconAlertTriangle {...props} class="text-warning animate-pulse" />,
}

export default function ToastItem(props: ToastItemProps) {
    const IconComponent = toastIcons[props.type]

    return (
        <div
            class="flex items-start gap-3 p-4 bg-base-200 border border-base-300 rounded-lg shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right-10 fade-in-20"
            role="alert"
        >
            <div class="flex-shrink-0 mt-0.5">
                {<IconComponent size={20} />}
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-medium text-base-content text-sm">{props.title}</p>
                <Show when={props.description}>
                    <p class="text-base-content/70 text-xs mt-1">{props.description}</p>
                </Show>
            </div>
            <button
                type="button"
                onClick={() => props.onDismiss(props.id)}
                class="flex-shrink-0 text-base-content/50 hover:text-base-content transition-colors p-1 hover:bg-base-300 rounded"
                aria-label="Dismiss notification"
            >
                <IconX size={16} />
            </button>
        </div>
    )
}
