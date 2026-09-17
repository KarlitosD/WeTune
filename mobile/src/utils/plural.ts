// "{songs:number} Song{{s}}" -> "1 Song" / "3 Songs"
// "{songs:number} Cancion{{es}}" -> "1 Cancion" / "3 Canciones"
export function formatCount(n: number, template: string) {
  const plural = n === 1 ? "" : template.includes("{{es}}") ? "es" : "s";
  return template.replace("{songs:number}", String(n)).replace(/\{\{[^}]*\}\}/, plural);
}
