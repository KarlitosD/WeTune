import type { ComponentProps } from "solid-js";
import { EllipsisVertical } from "lucide-solid";

type IconProps = ComponentProps<typeof EllipsisVertical>;

export default function IconEllipsis(props: IconProps) {
    return <EllipsisVertical {...props} />
}
