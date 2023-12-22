export function formatSeconds(totalSeconds: number){
    if(!totalSeconds) return "0:00"
    
    const minutes = Math.trunc(totalSeconds / 60)
    const seconds = Math.ceil(totalSeconds - minutes * 60)
    const formatSeconds = seconds < 10 ?  "0" + seconds : seconds

    return `${minutes}:${formatSeconds}`
  }