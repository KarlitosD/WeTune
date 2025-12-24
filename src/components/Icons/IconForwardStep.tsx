import type { ComponentProps } from "solid-js";
import { SkipForward } from "lucide-solid";

type IconProps = ComponentProps<typeof SkipForward>;

export default function IconForwardStep(props: IconProps) {
    return <SkipForward {...props} />
}
