import type { ComponentProps } from "solid-js";
import { Play } from "lucide-solid";

type IconProps = ComponentProps<typeof Play>;

export default function IconPlay(props: IconProps) {
    return <Play {...props} />
}
