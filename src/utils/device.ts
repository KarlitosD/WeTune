export function isMobile(){
    if("userAgentData" in navigator){
        return (navigator.userAgentData["mobile"]) as boolean
    }

    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
        /Mobi/i
    ];

    const hasTouchEvent = 'ontouchstart' in document.documentElement
    const hasMaxTouchPoints = window.navigator.maxTouchPoints > 1
    const hasLowWidth = window.innerWidth < 768

    const userAgentIsMobile = toMatch.some(toMatch => navigator.userAgent.match(toMatch))

    return hasTouchEvent && hasMaxTouchPoints && userAgentIsMobile && hasLowWidth
}