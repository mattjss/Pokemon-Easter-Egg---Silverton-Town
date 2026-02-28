import Phaser from 'phaser';

/**
 * Reusable interior scene for entering buildings.
 * Can be launched with data: { tilemapKey, layerName, playerStartX, playerStartY }.
 */
export class InteriorScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'Interior' });
  }

  init(data: { tilemapKey?: string; layerName?: string; playerStartX?: number; playerStartY?: number }): void {
    (this as unknown as Record<string, unknown>).sceneData = data;
  }

  create(): void {
    const data = (this as unknown as Record<string, unknown>).sceneData as {
      tilemapKey?: string;
      layerName?: string;
      playerStartX?: number;
      playerStartY?: number;
    };
    const tilemapKey = data?.tilemapKey ?? 'interior1';
    const layerName = data?.layerName ?? 'Ground';
    const startX = data?.playerStartX ?? 80;
    const startY = data?.playerStartY ?? 64;

    this.player = this.add.sprite(startX, startY, 'player', 0).setOrigin(0, 0);
    this.physics.add.existing(this.player, false);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setCollideWorldBounds(true);

    if (this.cache.tilemap.exists(tilemapKey)) {
      const map = this.make.tilemap({ key: tilemapKey });
      const tileset = map.addTilesetImage('interior', 'tiles_interior');
      if (tileset) {
        map.createLayer(layerName, tileset, 0, 0);
        const collisionLayer = map.createLayer('Collision', tileset, 0, 0);
        if (collisionLayer) {
          collisionLayer.setCollisionByProperty({ collides: true });
          this.physics.add.collider(this.player, collisionLayer);
        }
      }
    }

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update(): void {
    // Optional: add interior-specific input or exit zone checks
  }
}
