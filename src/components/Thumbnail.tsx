type ThumbnailProps = {
    src: string,
    title: string,
    isSmall?: boolean
}

export default function Thumbnail(props: ThumbnailProps) {
    const size = props.isSmall ? 48 : 60
    return (
        <div class={`aspect-square ${props.isSmall ? "h-12" : "h-[60px]"}`}>
            <img class="object-cover w-full h-full backdrop-blur-sm" src={props.src} width={size} height={size} alt={props.title} title={props.title} referrerpolicy="no-referrer" />
        </div>
    )
}