import WorldScene from "../scenes/WorldScene";
import { getTiledObjectProperty } from "../utils/object";
import { moveRandomly } from "../utils/npc";
import { openDialog } from "../utils/ui";

export default ([npc], scene: WorldScene) => {
  const name = getTiledObjectProperty("name", npc);
  scene.gridEngine.stopMovement(name);

  openDialog({
    content:
      "Matt collects cards like it's a second job.\nBaseball: Barry Bonds, Tony Gwynn, Ken Griffey Jr., Buster Posey, Logan Webb...\nHockey: Celebrini, McAvoy, Quinn Hughes, Selanne, Patrick Kane, Paul Kariya. PSA graded Pokémon too — Japanese versions only.",
    callback: () => moveRandomly(scene.gridEngine, name),
  });
};
