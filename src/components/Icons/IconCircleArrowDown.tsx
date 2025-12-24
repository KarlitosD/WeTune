import type { ComponentProps } from "solid-js";
import { CircleArrowDown } from "lucide-solid";

type IconProps = ComponentProps<typeof CircleArrowDown>;

export default function IconCircleArrowDown(props: IconProps) {
    return <CircleArrowDown {...props} />
}
