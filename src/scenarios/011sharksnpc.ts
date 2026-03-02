import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt got me into the San Jose Sharks.\nNow I know Macklin Celebrini, Will Smith, Quinn Hughes, Charlie McAvoy, Jack Hughes, Trevor Zegras, Cole Caufield, Beckett Sennecke...\nI could go on. He goes on. A lot.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
