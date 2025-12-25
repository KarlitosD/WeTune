import type { ComponentProps } from "solid-js";
import { AlertTriangle } from "lucide-solid";

type IconProps = ComponentProps<typeof AlertTriangle>;

export default function IconAlertTriangle(props: IconProps) {
    return <AlertTriangle {...props} />
}
