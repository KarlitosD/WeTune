import type { ComponentProps } from "solid-js";
import { CircleArrowDown } from "lucide-solid";

type IconProps = ComponentProps<typeof CircleArrowDown>;

export default function IconOutlineArrowDownCircle(props: IconProps) {
    return <CircleArrowDown {...props} />
}
