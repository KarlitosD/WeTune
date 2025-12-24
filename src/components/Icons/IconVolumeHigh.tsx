import type { ComponentProps } from "solid-js";
import { Volume2 } from "lucide-solid";

type IconProps = ComponentProps<typeof Volume2>;

export default function IconVolumeHigh(props: IconProps) {
    return <Volume2 {...props} />
}
