import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt's not home. Probably at the driving range.\nHe grew up playing at Torrey Pines 6-7 days a week. 1.7 handicap.\nDream courses: Pebble Beach, Cypress Point, St. Andrews, Pine Valley.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
