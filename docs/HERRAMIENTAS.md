# HERRAMIENTAS — Graphify, plugins y skills

## Graphify (ahorro de tokens)
Convierte el código y los documentos del repo en un grafo de conocimiento que se puede consultar. El código lo procesa localmente (tree-sitter), sin gastar IA. Repo: https://github.com/Graphify-Labs/graphify (Apache-2.0 / MIT).

**Instalación (una vez, en la terminal de tu equipo, requiere Python 3.10+):**
```bash
uv tool install graphifyy      # o: pipx install graphifyy   (el paquete lleva doble "y")
cd ruta/al/repo/impromptu
graphify install --project     # registra la skill en .claude/skills/graphify/
graphify hook install          # reconstruye el grafo en cada commit y cambio de rama
```
**En Claude Code:**
```
/graphify .                         # construir el grafo la primera vez
/graphify . --update                # solo archivos cambiados
/graphify query "dónde se normaliza el pedal"
/graphify path "midi" "render"
/graphify explain "Take"
```
Genera `graphify-out/` con `graph.html` (navegable), `GRAPH_REPORT.md` y `graph.json`. Agrega `graphify-out/graph.html` a `.gitignore` si pesa mucho; deja el `GRAPH_REPORT.md`.

**Regla:** antes de cualquier búsqueda amplia en el repo, consulta el grafo.

## Plugins de diseño (se instalan en Claude Code, no en la terminal del sistema)
```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
/plugin marketplace add https://github.com/NutshellEngineering/apple-design-skill
/plugin install apple-design-skill@apple-design-skill-marketplace
```
- **UI UX Pro Max:** accesibilidad, estados (vacío, cargando, error) y patrones. Úsalo al diseñar o revisar pantallas.
- **Apple Design:** solo cuando lleguemos a iPhone o iPad. En Android y web manda DESIGN.md.
- **Lucide:** se instala como librería (`lucide-react`) en la fase 0.
- Si un plugin contradice `docs/DESIGN.md`, gana DESIGN.md.

## Pruebas y verificación
- **Vitest:** lógica (modelo, MIDI, cuantización, digitación).
- **Playwright:** flujos y capturas. Las capturas van al PR como evidencia.
- **Prueba humana:** Jacobo con el PSR-E343 en cada fase que toque MIDI, audio o video.

## Comandos del proyecto (`.claude/commands/`)
| Comando | Qué hace |
|---|---|
| `/inicio-sesion` | Lee bitácora, roadmap y pendientes, consulta el grafo y propone el plan de la sesión |
| `/verificar` | Recorre `VERIFICACIONES.md` y reporta qué pasó y qué no |
| `/fin-sesion` | Actualiza bitácora, grafo y pendientes; lista pedidos no atendidos |
| `/nueva-fase N` | Prepara la rama y el plan de la fase N a partir de ROADMAP |

## Para más adelante
- **Voicebox** (generación de voz): Jacobo lo tiene en la mira. Posible uso futuro: narración de tutoriales. Revisar licencia antes de usarlo.
