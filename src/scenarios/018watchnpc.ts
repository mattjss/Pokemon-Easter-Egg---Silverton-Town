import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt has a deep love for horology and watchmaking.\nFavorite craftsmen: Rexhep Rexhepi, FP Journe, Roland Murphy.\nDream watches: Rexhep Rexhepi RRCC II, Patek Philippe 5328G, Rolex Daytona Ref 6264. He wants to design a watch someday.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
