import Phaser from 'phaser';

const TILE_SIZE = 32;
const MAP_COLS = 40;
const MAP_ROWS = 30;
const MAP_W = 1280;
const MAP_H = 960;
const CAMERA_LERP = 0.1;
const CAMERA_ZOOM = 1.8;
const MOVE_DURATION = 160;

const T = {
  GRASS: 'GRASS',
  GRASS_D: 'GRASS_DARK',
  PATH: 'PATH',
  PATH_E: 'PATH_EDGE',
  WATER: 'WATER',
  TREE_T: 'TREE_TOP',
  TREE_B: 'TREE_BOT',
  FLOWER: 'FLOWER',
  ROOF_L: 'ROOF_L',
  ROOF_M: 'ROOF_M',
  ROOF_R: 'ROOF_R',
  WALL_L: 'WALL_L',
  WALL_M: 'WALL_M',
  WALL_R: 'WALL_R',
  WINDOW: 'WINDOW',
  DOOR: 'DOOR',
  FENCE_H: 'FENCE_H',
  FENCE_V: 'FENCE_V',
  SAND: 'SAND',
  FIELD: 'FIELD_GRASS',
} as const;

type TileType = (typeof T)[keyof typeof T];

const TILE_SOURCE: Record<TileType, { sx: number; sy: number }> = {
  [T.GRASS]: { sx: 0, sy: 0 },
  [T.GRASS_D]: { sx: 32, sy: 0 },
  [T.PATH]: { sx: 64, sy: 0 },
  [T.PATH_E]: { sx: 96, sy: 0 },
  [T.WATER]: { sx: 128, sy: 0 },
  [T.TREE_T]: { sx: 0, sy: 64 },
  [T.TREE_B]: { sx: 0, sy: 96 },
  [T.FLOWER]: { sx: 32, sy: 64 },
  [T.ROOF_L]: { sx: 0, sy: 128 },
  [T.ROOF_M]: { sx: 32, sy: 128 },
  [T.ROOF_R]: { sx: 64, sy: 128 },
  [T.WALL_L]: { sx: 0, sy: 160 },
  [T.WALL_M]: { sx: 32, sy: 160 },
  [T.WALL_R]: { sx: 64, sy: 160 },
  [T.WINDOW]: { sx: 96, sy: 160 },
  [T.DOOR]: { sx: 128, sy: 160 },
  [T.FENCE_H]: { sx: 0, sy: 192 },
  [T.FENCE_V]: { sx: 32, sy: 192 },
  [T.SAND]: { sx: 64, sy: 32 },
  [T.FIELD]: { sx: 96, sy: 32 },
};

function isBlocked(t: TileType): boolean {
  return [
    T.TREE_T,
    T.TREE_B,
    T.WATER,
    T.ROOF_L,
    T.ROOF_M,
    T.ROOF_R,
    T.WALL_L,
    T.WALL_M,
    T.WALL_R,
    T.WINDOW,
    T.DOOR,
    T.FENCE_H,
    T.FENCE_V,
  ].includes(t);
}

function buildMapData(): TileType[][] {
  const map: TileType[][] = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(T.GRASS));

  for (let c = 0; c < MAP_COLS; c++) {
    map[0][c] = T.TREE_T;
    map[1][c] = T.TREE_B;
  }

  for (let c = 0; c < MAP_COLS; c++) {
    if (c <= 1 || c >= 38) {
      map[2][c] = T.TREE_T;
      map[3][c] = T.TREE_B;
    }
  }

  for (let c = 0; c < MAP_COLS; c++) map[4][c] = T.PATH;

  for (let r = 5; r <= 7; r++) {
    map[r][0] = T.TREE_T;
    map[r][1] = r === 6 ? T.TREE_B : T.TREE_T;
    for (let c = 2; c <= 16; c++) map[r][c] = T.GRASS;
    map[r][17] = r <= 6 ? T.WATER : T.PATH;
    map[r][18] = map[r][17];
    for (let c = 19; c <= 22; c++) map[r][c] = T.PATH;
    for (let c = 23; c <= 37; c++) map[r][c] = T.GRASS;
    map[r][38] = map[r][1];
    map[r][39] = T.TREE_T;
  }

  for (let c = 0; c < MAP_COLS; c++) {
    if (c >= 2 && c <= 11) {
      map[8][c] = c === 2 ? T.ROOF_L : c === 11 ? T.ROOF_R : T.ROOF_M;
    } else if (c >= 28 && c <= 37) {
      map[8][c] = c === 28 ? T.ROOF_L : c === 37 ? T.ROOF_R : T.ROOF_M;
    } else if (c >= 18 && c <= 21) map[8][c] = T.PATH;
    else map[8][c] = T.GRASS;
  }
  for (let c = 0; c < MAP_COLS; c++) {
    if (c >= 2 && c <= 11) {
      map[9][c] = c === 2 ? T.ROOF_L : c === 11 ? T.ROOF_R : T.ROOF_M;
    } else if (c >= 28 && c <= 37) {
      map[9][c] = c === 28 ? T.ROOF_L : c === 37 ? T.ROOF_R : T.ROOF_M;
    } else if (c >= 18 && c <= 21) map[9][c] = T.PATH;
    else map[9][c] = T.GRASS;
  }

  for (let r = 10; r <= 16; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (c >= 2 && c <= 11) {
        if ((c === 3 || c === 6) && (r === 11 || r === 13)) map[r][c] = T.WINDOW;
        else if (r === 16 && (c === 6 || c === 7)) map[r][c] = T.DOOR;
        else map[r][c] = c === 2 ? T.WALL_L : c === 11 ? T.WALL_R : T.WALL_M;
      } else if (c >= 28 && c <= 37) {
        if ((c === 29 || c === 32) && (r === 11 || r === 13)) map[r][c] = T.WINDOW;
        else if (r === 16 && (c === 32 || c === 33)) map[r][c] = T.DOOR;
        else map[r][c] = c === 28 ? T.WALL_L : c === 37 ? T.WALL_R : T.WALL_M;
      } else if (c >= 18 && c <= 21) map[r][c] = T.PATH;
      else if (c >= 12 && c <= 27) map[r][c] = T.GRASS;
    }
  }

  for (let r = 17; r <= 18; r++) {
    for (let c = 14; c <= 25; c++) map[r][c] = T.PATH;
  }
  for (let c = 0; c < MAP_COLS; c++) map[19][c] = T.PATH;

  for (let r = 20; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (c === 0 || c === MAP_COLS - 1) {
        map[r][c] = T.FENCE_V;
        continue;
      }
      if (r === 20 && c >= 1 && c <= 38) {
        map[r][c] = T.FENCE_H;
        continue;
      }
      if (c >= 2 && c <= 8 && r >= 21 && r <= 24) {
        const onBorder = c === 2 || c === 8 || r === 21 || r === 24;
        if (onBorder) map[r][c] = c === 2 || c === 8 ? T.FENCE_V : T.FENCE_H;
        else map[r][c] = T.FIELD;
        continue;
      }
      const inDiamond =
        (r === 21 && c === 19) ||
        (r === 22 && c >= 18 && c <= 20) ||
        (r === 23 && c >= 17 && c <= 22) ||
        (r === 24 && c >= 18 && c <= 20) ||
        (r === 25 && c === 19);
      if (r >= 21 && inDiamond) map[r][c] = T.SAND;
      else if (r >= 21) map[r][c] = Math.random() < 0.12 ? T.FLOWER : T.FIELD;
    }
  }

  return map;
}

interface NpcDef {
  tileX: number;
  tileY: number;
  dialogId: string;
  name: string;
  color: number;
}

interface ObjDef {
  tileX: number;
  tileY: number;
  dialogId: string;
  color: number;
}

const NPCS: NpcDef[] = [
  { tileX: 20, tileY: 3, dialogId: 'NPC_PROFESSOR', name: 'Professor', color: 0x44bb44 },
  { tileX: 7, tileY: 13, dialogId: 'NPC_GRANDMOTHER', name: 'Grandma', color: 0xff88aa },
  { tileX: 29, tileY: 13, dialogId: 'NPC_RIVAL', name: 'Rival', color: 0xff8844 },
  { tileX: 20, tileY: 22, dialogId: 'NPC_KID_BASEBALL', name: 'Kid', color: 0xffdd44 },
  { tileX: 20, tileY: 23, dialogId: 'NPC_ROUTE_EXIT', name: 'Guide', color: 0x4488ff },
];

const OBJECTS: ObjDef[] = [
  { tileX: 3, tileY: 12, dialogId: 'BOOKSHELF', color: 0x795548 },
  { tileX: 7, tileY: 12, dialogId: 'WATCH_CASE', color: 0xffd700 },
  { tileX: 5, tileY: 14, dialogId: 'RECORD_PLAYER', color: 0x9c27b0 },
  { tileX: 5, tileY: 11, dialogId: 'KITCHEN_FRIDGE', color: 0xddeeff },
  { tileX: 22, tileY: 22, dialogId: 'GOLF_BAG', color: 0x2e7d32 },
  { tileX: 29, tileY: 11, dialogId: 'STUDIO_PC', color: 0x1565c0 },
  { tileX: 34, tileY: 13, dialogId: 'WHITEBOARD', color: 0xeeeeee },
  { tileX: 23, tileY: 22, dialogId: 'CARD_BINDER', color: 0xe53935 },
  { tileX: 3, tileY: 22, dialogId: 'HOCKEY_NET', color: 0x546e7a },
];

export class WorldScene extends Phaser.Scene {
  private mapData!: TileType[][];
  private collisionMap: number[][] = [];
  private mapTexture!: Phaser.GameObjects.RenderTexture;
  private playerRect!: Phaser.GameObjects.Rectangle;
  private playerTileX = 20;
  private playerTileY = 6;
  private playerFacing: 'up' | 'down' | 'left' | 'right' = 'down';
  private playerMoving = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private spaceWasDown = false;
  private enterWasDown = false;

  constructor() {
    super({ key: 'World' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x000000);
    this.scene.launch('UI');

    const tilesetKey = this.textures.exists('serene') ? 'serene' : 'serene48';
    this.mapData = buildMapData();

    this.collisionMap = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(0));
    for (let y = 0; y < MAP_ROWS; y++) {
      for (let x = 0; x < MAP_COLS; x++) {
        if (x === 0 || x === MAP_COLS - 1 || y === 0 || y === MAP_ROWS - 1) {
          this.collisionMap[y][x] = 1;
        } else {
          this.collisionMap[y][x] = isBlocked(this.mapData[y][x]) ? 1 : 0;
        }
      }
    }

    this.mapTexture = this.add.renderTexture(0, 0, MAP_W, MAP_H);
    this.mapTexture.setOrigin(0, 0);
    this.mapTexture.setDepth(0);

    const stamp = this.add.image(0, 0, tilesetKey).setOrigin(0, 0).setVisible(false);
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const t = this.mapData[row][col];
        const src = TILE_SOURCE[t];
        if (!src) continue;
        stamp.setCrop(src.sx, src.sy, TILE_SIZE, TILE_SIZE);
        this.mapTexture.draw(stamp, col * TILE_SIZE, row * TILE_SIZE);
      }
    }
    stamp.destroy();

    this.addZoneLabels();

    const playerPx = this.playerTileX * TILE_SIZE + TILE_SIZE / 2;
    const playerPy = this.playerTileY * TILE_SIZE + TILE_SIZE / 2;
    this.playerRect = this.add.rectangle(playerPx, playerPy, 28, 36, 0x4488ff);
    this.playerRect.setStrokeStyle(2, 0xffffff);
    this.playerRect.setDepth(20);

    this.spawnNPCs();
    this.spawnObjects();

    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.startFollow(this.playerRect, true, CAMERA_LERP, CAMERA_LERP);
    this.cameras.main.setZoom(CAMERA_ZOOM);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    try {
      const music = this.sound.add('town-bgm', { loop: true, volume: 0.35 });
      music.play();
    } catch {
      // silent fail
    }
  }

  private spawnNPCs(): void {
    for (const n of NPCS) {
      const px = n.tileX * TILE_SIZE + TILE_SIZE / 2;
      const py = n.tileY * TILE_SIZE + TILE_SIZE / 2;
      const rect = this.add.rectangle(px, py, 24, 32, n.color);
      rect.setStrokeStyle(2, 0xffffff);
      rect.setDepth(18);
    }
  }

  private spawnObjects(): void {
    for (const o of OBJECTS) {
      const px = o.tileX * TILE_SIZE + TILE_SIZE / 2;
      const py = o.tileY * TILE_SIZE + TILE_SIZE / 2;
      const rect = this.add.rectangle(px, py, 20, 20, o.color);
      rect.setStrokeStyle(2, 0xffd700);
      rect.setDepth(18);
    }
  }

  private addZoneLabels(): void {
    const style = { fontFamily: 'Press Start 2P', color: '#ffffff' };
    this.add.text(640, 48, 'Silvertown', { ...style, fontSize: 10 }).setOrigin(0.5).setAlpha(0.8).setDepth(15);
    this.add.text(240, 432, "Matt's Home", { ...style, fontSize: 7 }).setOrigin(0.5).setAlpha(0.6).setDepth(15);
    this.add.text(1040, 432, 'Matt Design', { ...style, fontSize: 7 }).setOrigin(0.5).setAlpha(0.6).setDepth(15);
    this.add.text(640, 912, 'The Field', { ...style, fontSize: 7 }).setOrigin(0.5).setAlpha(0.6).setDepth(15);
  }

  private tryMove(dx: number, dy: number): void {
    if (this.playerMoving) return;
    const nx = this.playerTileX + dx;
    const ny = this.playerTileY + dy;
    if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) return;
    if (this.collisionMap[ny][nx] === 1) return;
    if (NPCS.some((n) => n.tileX === nx && n.tileY === ny)) return;

    this.playerTileX = nx;
    this.playerTileY = ny;
    this.playerMoving = true;
    if (dx > 0) this.playerFacing = 'right';
    else if (dx < 0) this.playerFacing = 'left';
    else if (dy > 0) this.playerFacing = 'down';
    else if (dy < 0) this.playerFacing = 'up';

    const targetPx = nx * TILE_SIZE + TILE_SIZE / 2;
    const targetPy = ny * TILE_SIZE + TILE_SIZE / 2;
    this.tweens.add({
      targets: this.playerRect,
      x: targetPx,
      y: targetPy,
      duration: MOVE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.playerMoving = false;
      },
    });
  }

  private getFacingTile(): { x: number; y: number } {
    switch (this.playerFacing) {
      case 'up':
        return { x: this.playerTileX, y: this.playerTileY - 1 };
      case 'down':
        return { x: this.playerTileX, y: this.playerTileY + 1 };
      case 'left':
        return { x: this.playerTileX - 1, y: this.playerTileY };
      case 'right':
        return { x: this.playerTileX + 1, y: this.playerTileY };
    }
  }

  private checkInteraction(): void {
    const front = this.getFacingTile();
    const npc = NPCS.find((n) => n.tileX === front.x && n.tileY === front.y);
    if (npc) {
      this.game.events.emit('npc:interact', { dialogId: npc.dialogId, name: npc.name });
      return;
    }
    const obj = OBJECTS.find((o) => o.tileX === front.x && o.tileY === front.y);
    if (obj) {
      this.game.events.emit('object:interact', { dialogId: obj.dialogId });
    }
  }

  update(): void {
    if (this.playerMoving) return;

    if (this.cursors.up.isDown || this.wasd.up.isDown) this.tryMove(0, -1);
    else if (this.cursors.down.isDown || this.wasd.down.isDown) this.tryMove(0, 1);
    else if (this.cursors.left.isDown || this.wasd.left.isDown) this.tryMove(-1, 0);
    else if (this.cursors.right.isDown || this.wasd.right.isDown) this.tryMove(1, 0);

    const spaceDown = this.spaceKey.isDown;
    const enterDown = this.enterKey.isDown;
    if ((spaceDown && !this.spaceWasDown) || (enterDown && !this.enterWasDown)) {
      this.checkInteraction();
    }
    this.spaceWasDown = spaceDown;
    this.enterWasDown = enterDown;
  }
}
