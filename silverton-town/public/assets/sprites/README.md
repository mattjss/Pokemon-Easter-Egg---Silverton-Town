# Sprites

Place character and NPC sprites here (pixel art).

| File | Description | Load key | Notes |
|------|-------------|----------|--------|
| **player.png** | 4-direction walk spritesheet | `player` | Spritesheet: 32×32 per frame. Layout: 4 frames per direction (down, up, left, right) — e.g. 4 columns × 4 rows = 16 frames. Used with `frameWidth: 32`, `frameHeight: 32`. |
| **npc-professor.png** | Professor NPC | `npc_professor` | Single frame or sheet; displayed at 32×32. |
| **npc-grandmother.png** | Grandmother NPC | `npc_grandmother` | Single frame or sheet; displayed at 32×32. |
| **npc-rival.png** | Rival NPC | `npc_rival` | Single frame or sheet; displayed at 32×32. |
| **npc-kid.png** | Kid NPC | `npc_kid` | Single frame or sheet; displayed at 32×32. |

If a file is missing, the game uses a colored placeholder for that key.
