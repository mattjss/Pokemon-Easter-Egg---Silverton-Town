import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Have you seen Matt? He said he'd be back after the BU Terriers game.\nHe follows Maine Black Bears, USNTDP, Youngstown Phantoms and USA Hockey too.\nHe never misses a game.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
