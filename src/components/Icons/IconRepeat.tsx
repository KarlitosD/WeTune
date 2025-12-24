import type { ComponentProps } from "solid-js";
import { Repeat } from "lucide-solid";

type IconProps = ComponentProps<typeof Repeat>;

export default function IconRepeat(props: IconProps) {
    return <Repeat {...props} />
}
