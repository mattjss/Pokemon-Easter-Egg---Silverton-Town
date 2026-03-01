import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt loves smooth jazz — reminds him of driving through San Francisco with his mom.\nAlso into Eagles, Elton John, Eric Clapton, John Mayer, Bob Dylan.\nCountry too: Parker McCollum, Zac Brown Band, Tyler Childers, Jordan Davis.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
