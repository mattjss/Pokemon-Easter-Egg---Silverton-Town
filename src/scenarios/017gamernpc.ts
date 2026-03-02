import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt grew up on original Xbox. Halo 1, 2, 3 are his all-time favorites.\nNow he plays Valorant and Overwatch on PC, Nintendo Switch for Pokémon, Zelda, Mario Kart.\nMegaman Battle Network Legacy Collection is his current obsession.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
