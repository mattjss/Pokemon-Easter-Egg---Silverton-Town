import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "I heard someone around here is obsessed with Japanese design and baseball cards. Sounds like a cool dude.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
