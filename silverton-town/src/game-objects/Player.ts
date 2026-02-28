import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '../data/worldMap';

export type Facing = 'up' | 'down' | 'left' | 'right';

const MOVE_DURATION = 150;

interface TilePos {
  x: number;
  y: number;
}

export class Player extends Phaser.GameObjects.Container {
  tileX: number;
  tileY: number;
  facing: Facing = 'down';
  isMoving = false;
  private collisionMap: number[][];
  private npcList: TilePos[];
  private sprite: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    collisionMap: number[][],
    npcList: TilePos[],
    _objectList: TilePos[]
  ) {
    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;
    super(scene, px, py);

    this.tileX = tileX;
    this.tileY = tileY;
    this.collisionMap = collisionMap;
    this.npcList = npcList;

    this.sprite = scene.add.rectangle(0, 0, 16, 16, 0x4fc3f7);
    this.add(this.sprite);
  }

  getTileX(): number {
    return this.tileX;
  }

  getTileY(): number {
    return this.tileY;
  }

  getFacingTile(): { x: number; y: number } {
    switch (this.facing) {
      case 'up': return { x: this.tileX, y: this.tileY - 1 };
      case 'down': return { x: this.tileX, y: this.tileY + 1 };
      case 'left': return { x: this.tileX - 1, y: this.tileY };
      case 'right': return { x: this.tileX + 1, y: this.tileY };
    }
  }

  tryMove(dx: number, dy: number): boolean {
    if (this.isMoving) return false;
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;
    if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) return false;
    if (this.collisionMap[ny][nx] === 1) return false;
    if (this.npcList.some((n) => n.x === nx && n.y === ny)) return false;

    this.tileX = nx;
    this.tileY = ny;
    this.isMoving = true;
    const targetPx = nx * TILE_SIZE + TILE_SIZE / 2;
    const targetPy = ny * TILE_SIZE + TILE_SIZE / 2;

    if (dx > 0) this.facing = 'right';
    else if (dx < 0) this.facing = 'left';
    else if (dy > 0) this.facing = 'down';
    else if (dy < 0) this.facing = 'up';

    this.scene.tweens.add({
      targets: this,
      x: targetPx,
      y: targetPy,
      duration: MOVE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
      },
    });
    return true;
  }

  checkInteraction(worldScene: Phaser.Scene): void {
    const front = this.getFacingTile();
    const world = worldScene as unknown as { getNpcAt: (x: number, y: number) => { dialogId: string; name?: string } | undefined; getObjectAt: (x: number, y: number) => { dialogId: string } | undefined };
    const npc = world.getNpcAt?.(front.x, front.y);
    if (npc) {
      this.scene.game.events.emit('npc:interact', { dialogId: npc.dialogId, speakerName: npc.name });
      return;
    }
    const obj = world.getObjectAt?.(front.x, front.y);
    if (obj) {
      this.scene.game.events.emit('object:interact', { dialogId: obj.dialogId });
    }
  }

  update(): void {
    if (this.isMoving) return;
    const cursors = this.scene.input.keyboard?.createCursorKeys();
    const w = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const a = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const s = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const d = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    if (cursors?.up.isDown || w?.isDown) this.tryMove(0, -1);
    else if (cursors?.down.isDown || s?.isDown) this.tryMove(0, 1);
    else if (cursors?.left.isDown || a?.isDown) this.tryMove(-1, 0);
    else if (cursors?.right.isDown || d?.isDown) this.tryMove(1, 0);
  }
}
