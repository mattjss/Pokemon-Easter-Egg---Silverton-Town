import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "A legendary designer once passed through here. They say he builds apps in San Diego by day and collects hockey cards by night.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
