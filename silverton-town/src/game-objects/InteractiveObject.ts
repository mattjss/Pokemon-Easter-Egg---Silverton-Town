import Phaser from 'phaser';
import type { ObjectDefinition } from '../data/objects';
import { DIALOG } from '../data/dialog';

const TILE = 16;

/**
 * Signs, items, PCs, binders — triggers dialog or modal on Space/Enter.
 */
export class InteractiveObject extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private definition: ObjectDefinition;

  constructor(scene: Phaser.Scene, definition: ObjectDefinition) {
    super(scene, definition.x * TILE, definition.y * TILE);
    this.definition = definition;

    const frame = definition.frame ?? 0;
    this.sprite = scene.add.sprite(0, 0, definition.sprite, frame).setOrigin(0, 0);
    this.add(this.sprite);

    scene.physics.add.existing(this, false);
    const body = (this as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody).body as Phaser.Physics.Arcade.Body;
    body.setSize(definition.width ?? TILE, definition.height ?? TILE);
    body.setImmovable(true);
    body.setAllowGravity(false);
  }

  /** Call when player interacts (Space/Enter). Show dialog by dialogId or emit modal. */
  interact(): void {
    const dialogId = this.definition.dialogId;
    if (dialogId != null) {
      const text = DIALOG[dialogId as keyof typeof DIALOG];
      if (text !== undefined) {
        this.scene.scene.get('UI').events.emit('show-dialog', dialogId);
        return;
      }
    }
    if (this.definition.modal != null) {
      this.scene.scene.get('UI').events.emit('show-modal', this.definition.modal);
    }
  }

  getDefinition(): ObjectDefinition {
    return this.definition;
  }

  getTileX(): number {
    return this.definition.x;
  }

  getTileY(): number {
    return this.definition.y;
  }
}
