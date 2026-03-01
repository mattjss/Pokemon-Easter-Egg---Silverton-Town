import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Someone from San Diego built this as a playable portfolio piece. Product designer by day, Pokémon fan by... also day.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
