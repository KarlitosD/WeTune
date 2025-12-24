import type { ComponentProps } from "solid-js";
import { Search } from "lucide-solid";

type IconProps = ComponentProps<typeof Search>;

export default function IconMagnifyingGlass(props: IconProps) {
    return <Search {...props} />
}
