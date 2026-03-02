import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "I worked with Matt at The Action Network.\nHe designed BetSync. Changed how we think about sports betting UX entirely.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
