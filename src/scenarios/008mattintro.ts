import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Oh, you're looking for Matt?\nHe was born in San Francisco. Moved to Del Mar when he was 6 or 7.\nNever left San Diego after that. Bay Area fan forever though.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
