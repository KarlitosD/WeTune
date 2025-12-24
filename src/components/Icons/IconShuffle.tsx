import type { ComponentProps } from "solid-js";
import { Shuffle } from "lucide-solid";

type IconProps = ComponentProps<typeof Shuffle>;

export default function IconShuffle(props: IconProps) {
    return <Shuffle {...props} />
}
