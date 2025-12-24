import type { ComponentProps } from "solid-js";
import { Pause } from "lucide-solid";

type IconProps = ComponentProps<typeof Pause>;

export default function IconPause(props: IconProps) {
    return <Pause {...props} />
}
