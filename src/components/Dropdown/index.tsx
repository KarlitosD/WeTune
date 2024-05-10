import { JSX, ParentProps } from "solid-js";

type DropdownPosition = "top" | "bottom" | "left" | "right"

interface DropdownProps extends ParentProps {
    class?: string,
    summary: JSX.Element,
    summaryClass?: string
    position?: DropdownPosition,
    end?: boolean
}

const POSITIONS = {
    top: "dropdown-top",
    bottom: "dropdown-bottom",
    left: "dropdown-left",
    right: "dropdown-right",
}

export function Dropdown(props: DropdownProps) {
    return (
        <div class="dropdown" classList={{ [props.class]: !!props.class, [POSITIONS[props.position]]: !!props.position, "dropdown-end": !!props.end }}>
            <div tabindex="0" role="button" class="p-1 cursor-pointer" classList={{ [props.summaryClass]: !!props.summaryClass }}>{props.summary}</div>
            <ul tabindex="0" class="p-2 dropdown-content z-[1] menu shadow bg-base-200 rounded-box w-52">
                {props.children}
            </ul>
        </div>
    )
}

export function DropdownItem(props: ParentProps) {
    return (
        <li>
            <div>{props.children}</div>
        </li>
    )
}