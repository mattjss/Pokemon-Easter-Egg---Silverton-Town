import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt grew up playing baseball, soccer, golf, hockey — competitive sports his whole life.\nFavorite Giants: Barry Bonds, Buster Posey, Tony Gwynn, Logan Webb.\n49ers: Brock Purdy, CMC, George Kittle. Warriors: Steph Curry, Klay Thompson.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
