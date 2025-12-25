import type { ComponentProps } from "solid-js";
import { Info } from "lucide-solid";

type IconProps = ComponentProps<typeof Info>;

export default function IconInfo(props: IconProps) {
    return <Info {...props} />
}
