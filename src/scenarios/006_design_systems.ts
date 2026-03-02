import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "This town was designed in Tiled and coded with Phaser. The designer who made it is big on design systems and component libraries.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
