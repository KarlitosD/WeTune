import type { ComponentProps } from "solid-js";
import { SkipBack } from "lucide-solid";

type IconProps = ComponentProps<typeof SkipBack>;

export default function IconBackwardStep(props: IconProps) {
    return <SkipBack {...props} />
}
