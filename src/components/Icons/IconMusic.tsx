import type { ComponentProps } from "solid-js";
import { Music } from "lucide-solid";

type IconProps = ComponentProps<typeof Music>;

export default function IconMusic(props: IconProps) {
    return <Music {...props} />
}
