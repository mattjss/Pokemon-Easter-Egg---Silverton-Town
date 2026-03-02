import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "See that studio? That's Matt Design.\nHe's done 0-to-1 product design for MakersPlace, Olympus Finance, Odyssey DAO, The Action Network and more.\nAt MakersPlace alone he increased session conversion by 77% and grew marketshare by 381%.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
