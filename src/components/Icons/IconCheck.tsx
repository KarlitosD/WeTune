import type { ComponentProps } from "solid-js";
import { Check } from "lucide-solid";

type IconProps = ComponentProps<typeof Check>;

export default function IconCheck(props: IconProps) {
    return <Check {...props} />
}
