import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt eats clean. Animal-based. Grass fed beef, salmon, pasture raised eggs, bone broth.\nBut ask him his favorite food and he says sushi. Or pizza. Or a burger.\nEvery time.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
