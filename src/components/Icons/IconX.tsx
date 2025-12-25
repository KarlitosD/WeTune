import type { ComponentProps } from "solid-js";
import { X } from "lucide-solid";

type IconProps = ComponentProps<typeof X>;

export default function IconX(props: IconProps) {
    return <X {...props} />
}
