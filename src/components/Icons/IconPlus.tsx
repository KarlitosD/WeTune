import type { ComponentProps } from "solid-js";
import { Plus } from "lucide-solid";

type IconProps = ComponentProps<typeof Plus>;

export default function IconPlus(props: IconProps) {
    return <Plus {...props} />
}
