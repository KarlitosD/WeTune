import type { ComponentProps } from "solid-js";
import { Download } from "lucide-solid";

type IconProps = ComponentProps<typeof Download>;

export default function IconDownload(props: IconProps) {
    return <Download {...props} />
}
