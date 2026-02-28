import Phaser from 'phaser';
import type { NPCDefinition } from '../data/npcs';
import { DIALOG } from '../data/dialog';

const TILE = 16;

/**
 * Stationary or patrolling NPC. Faces player on interact, triggers dialog by dialogId.
 */
export class NPC extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private definition: NPCDefinition;
  private facing: 'up' | 'down' | 'left' | 'right';

  constructor(scene: Phaser.Scene, definition: NPCDefinition) {
    super(scene, definition.x * TILE, definition.y * TILE);
    this.definition = definition;
    this.facing = definition.facing ?? 'down';

    this.sprite = scene.add.sprite(0, 0, definition.sprite, 0).setOrigin(0, 0);
    this.add(this.sprite);

    scene.physics.add.existing(this, false);
    const body = (this as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody).body as Phaser.Physics.Arcade.Body;
    body.setSize(TILE, TILE);
    body.setImmovable(true);
    body.setAllowGravity(false);

    this.setFacingSprite(this.facing);
  }

  private setFacingSprite(dir: 'up' | 'down' | 'left' | 'right'): void {
    const frameMap = { down: 0, up: 1, left: 2, right: 3 };
    this.sprite.setFrame(frameMap[dir]);
  }

  /** Call when player interacts (Space/Enter). Face player and show dialog. */
  interact(playerTileX: number, playerTileY: number): void {
    const nx = this.definition.x;
    const ny = this.definition.y;
    let face: 'up' | 'down' | 'left' | 'right' = this.facing;
    if (playerTileY < ny) face = 'down';
    else if (playerTileY > ny) face = 'up';
    else if (playerTileX < nx) face = 'right';
    else if (playerTileX > nx) face = 'left';
    this.facing = face;
    this.setFacingSprite(face);

    const dialogId = this.definition.dialogId;
    const text = DIALOG[dialogId as keyof typeof DIALOG];
    if (text !== undefined) {
      this.scene.scene.get('UI').events.emit('show-dialog', dialogId);
    }
  }

  getDefinition(): NPCDefinition {
    return this.definition;
  }

  getTileX(): number {
    return this.definition.x;
  }

  getTileY(): number {
    return this.definition.y;
  }
}
