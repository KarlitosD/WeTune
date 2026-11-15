export function formatSeconds(totalSeconds: number){
    if(!totalSeconds) return "0:00"
    
    const minutes = Math.trunc(totalSeconds / 60)
    const seconds = Math.ceil(totalSeconds - minutes * 60)
    const formatSeconds = seconds < 10 ?  "0" + seconds : seconds

    return `${minutes}:${formatSeconds}`
  }

// Duración total de una playlist o álbum. A diferencia de formatSeconds,
// usa unidades legibles ("1 h 42 min") y devuelve "" cuando no hay datos.
export function formatTotalDuration(totalSeconds: number){
    if(!totalSeconds || totalSeconds <= 0) return ""
    if(totalSeconds < 60) return `${Math.round(totalSeconds)} s`

    const totalMinutes = Math.round(totalSeconds / 60)
    const hours = Math.trunc(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if(hours > 0) return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`
    return `${Math.min(totalMinutes, 59)} min`
  }