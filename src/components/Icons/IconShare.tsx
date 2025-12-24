import type { ComponentProps } from "solid-js";
import { Share } from "lucide-solid";

type IconProps = ComponentProps<typeof Share>;

export default function IconShare(props: IconProps) {
    return <Share {...props} />
}
