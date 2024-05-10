import type { JSX } from "solid-js";

export function IconLabel(props: { icon: JSX.Element; label: JSX.Element, class?: string }) { 
  return (
    <>
        {props.icon}
        <span class={props.class}>{props.label}</span>
    </>
  );
};
