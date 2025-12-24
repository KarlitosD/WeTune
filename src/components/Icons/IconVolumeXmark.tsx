import type { ComponentProps } from "solid-js";
import { VolumeX } from "lucide-solid";

type IconProps = ComponentProps<typeof VolumeX>;

export default function IconVolumeXmark(props: IconProps) {
    return <VolumeX {...props} />
}
