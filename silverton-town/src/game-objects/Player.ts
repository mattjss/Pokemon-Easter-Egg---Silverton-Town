import Phaser from 'phaser';

const MOVE_DURATION = 160;

export type Facing = 'up' | 'down' | 'left' | 'right';

export interface NpcRef {
  tileX: number;
  tileY: number;
  dialogId: string;
  name?: string;
}

export interface ObjRef {
  tileX: number;
  tileY: number;
  dialogId: string;
}

export class Player extends Phaser.GameObjects.Container {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  tileX: number;
  tileY: number;
  facing: Facing = 'down';
  isMoving = false;
  tileSize: number = 32;
  collisionMap: number[][];
  npcs: NpcRef[];
  objects: ObjRef[];
  private mapWidth: number;
  private mapHeight: number;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  spaceKey!: Phaser.Input.Keyboard.Key;
  private spaceWasDown = false;

  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    collisionMap: number[][],
    npcs: NpcRef[],
    objects: ObjRef[],
    mapWidth: number,
    mapHeight: number
  ) {
    const px = tileX * 32 + 16;
    const py = tileY * 32 + 16;
    super(scene, px, py);

    this.scene = scene;
    this.tileX = tileX;
    this.tileY = tileY;
    this.collisionMap = collisionMap;
    this.npcs = npcs;
    this.objects = objects;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    if (this.scene.textures.exists('player')) {
      this.sprite = this.scene.add.sprite(0, 0, 'player', 0).setOrigin(0.5, 1);
      this.sprite.setDisplaySize(32, 32);
      this.createAnimations();
      (this.sprite as Phaser.GameObjects.Sprite).play('idle-down');
    } else {
      this.sprite = this.scene.add.rectangle(0, 0, 16, 24, 0x4fc3f7).setOrigin(0.5, 1);
    }
    this.add(this.sprite);

    this.scene.physics.add.existing(this, false);
    const body = (this as unknown as Phaser.Types.Physics.Arcade.GameObjectWithBody).body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 24);
    body.setOffset(-10, -24);
  }

  private createAnimations(): void {
    if (!this.scene.anims.exists('walk-down')) {
      this.scene.anims.create({
        key: 'walk-down',
        frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'idle-down',
        frames: [{ key: 'player', frame: 1 }],
        frameRate: 1,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'walk-up',
        frames: this.scene.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'idle-up',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 1,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'walk-left',
        frames: this.scene.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
        frameRate: 8,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'idle-left',
        frames: [{ key: 'player', frame: 7 }],
        frameRate: 1,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'walk-right',
        frames: this.scene.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
      this.scene.anims.create({
        key: 'idle-right',
        frames: [{ key: 'player', frame: 10 }],
        frameRate: 1,
        repeat: -1,
      });
    }
  }

  tryMove(dx: number, dy: number): void {
    if (this.isMoving) return;

    const nx = this.tileX + dx;
    const ny = this.tileY + dy;

    if (nx < 0 || nx >= this.mapWidth || ny < 0 || ny >= this.mapHeight) return;
    if (this.collisionMap[ny][nx] === 1) return;
    if (this.npcs.some((n) => n.tileX === nx && n.tileY === ny)) return;

    this.tileX = nx;
    this.tileY = ny;
    this.isMoving = true;

    if (dx > 0) this.facing = 'right';
    else if (dx < 0) this.facing = 'left';
    else if (dy > 0) this.facing = 'down';
    else if (dy < 0) this.facing = 'up';

    const targetPx = nx * this.tileSize + this.tileSize / 2;
    const targetPy = ny * this.tileSize + this.tileSize / 2;

    if (this.sprite instanceof Phaser.GameObjects.Sprite) {
      const key = `walk-${this.facing}`;
      if (this.scene.anims.exists(key)) this.sprite.play(key);
    }

    this.scene.tweens.add({
      targets: this,
      x: targetPx,
      y: targetPy,
      duration: MOVE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        if (this.sprite instanceof Phaser.GameObjects.Sprite) {
          const key = `idle-${this.facing}`;
          if (this.scene.anims.exists(key)) this.sprite.play(key);
        }
      },
    });
  }

  getFacingTile(): { x: number; y: number } {
    switch (this.facing) {
      case 'up':
        return { x: this.tileX, y: this.tileY - 1 };
      case 'down':
        return { x: this.tileX, y: this.tileY + 1 };
      case 'left':
        return { x: this.tileX - 1, y: this.tileY };
      case 'right':
        return { x: this.tileX + 1, y: this.tileY };
    }
  }

  checkInteraction(): void {
    const front = this.getFacingTile();

    const npc = this.npcs.find((n) => n.tileX === front.x && n.tileY === front.y);
    if (npc) {
      this.scene.game.events.emit('npc:interact', { dialogId: npc.dialogId, name: npc.name });
      return;
    }

    const obj = this.objects.find((o) => o.tileX === front.x && o.tileY === front.y);
    if (obj) {
      this.scene.game.events.emit('object:interact', { dialogId: obj.dialogId });
    }
  }

  update(): void {
    if (this.isMoving) return;

    if (!this.cursors) {
      this.cursors = this.scene.input.keyboard!.createCursorKeys();
      this.wasd = {
        up: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) this.tryMove(0, -1);
    else if (this.cursors.down.isDown || this.wasd.down.isDown) this.tryMove(0, 1);
    else if (this.cursors.left.isDown || this.wasd.left.isDown) this.tryMove(-1, 0);
    else if (this.cursors.right.isDown || this.wasd.right.isDown) this.tryMove(1, 0);

    const spaceDown = this.spaceKey.isDown;
    if (spaceDown && !this.spaceWasDown) {
      this.checkInteraction();
    }
    this.spaceWasDown = spaceDown;
  }
}
