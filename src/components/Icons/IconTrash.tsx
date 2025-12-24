import type { ComponentProps } from "solid-js";
import { Trash } from "lucide-solid";

type IconProps = ComponentProps<typeof Trash>;

export default function IconTrash(props: IconProps) {
    return <Trash {...props} />
}
