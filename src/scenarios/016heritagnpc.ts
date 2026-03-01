import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt is 25% Japanese from his mother's side.\nHis grandmother came to America after WW2, raised two daughters alone in a new country.\nShe is his hero. You can see her influence in everything he designs.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
