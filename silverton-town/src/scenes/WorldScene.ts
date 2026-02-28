import Phaser from 'phaser';
import { Player } from '../game-objects/Player';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  buildTileMap,
  buildCollisionMap,
  TILE,
} from '../data/worldMap';

const CAMERA_LERP = 0.1;
const WORLD_W = MAP_WIDTH * TILE_SIZE;
const WORLD_H = MAP_HEIGHT * TILE_SIZE;

const TILE_COLORS: Record<number, number> = {
  [TILE.GRASS]: 0x5d8a3c,
  [TILE.PATH]: 0xc8a96e,
  [TILE.BUILDING_WALL]: 0x8b7355,
  [TILE.BUILDING_ROOF]: 0xc0392b,
  [TILE.WATER]: 0x5b9bd5,
  [TILE.GRASS_DARK]: 0x4a7030,
  [TILE.FLOWERS]: 0xe91e63,
};

const DARKEN = 0x111111;

interface NpcDef {
  tileX: number;
  tileY: number;
  texture: string;
  dialogId: string;
  name?: string;
}

interface ObjDef {
  tileX: number;
  tileY: number;
  texture: string;
  dialogId: string;
}

const NPCS: NpcDef[] = [
  { tileX: 20, tileY: 5, texture: 'npc_professor', dialogId: 'npc_professor', name: 'Professor' },
  { tileX: 4, tileY: 16, texture: 'npc_grandmother', dialogId: 'npc_grandmother', name: 'Grandmother' },
  { tileX: 34, tileY: 16, texture: 'npc_rival', dialogId: 'npc_rival', name: 'Rival' },
  { tileX: 20, tileY: 26, texture: 'npc_kid', dialogId: 'npc_kid', name: 'Kid' },
];

const OBJECTS: ObjDef[] = [
  { tileX: 17, tileY: 15, texture: 'obj_bookshelf', dialogId: 'BOOKSHELF_MCCULLOUGH' },
  { tileX: 22, tileY: 15, texture: 'obj_watch', dialogId: 'WATCH_RGM' },
  { tileX: 20, tileY: 15, texture: 'obj_record', dialogId: 'RECORD_PLAYER_INSPECT' },
  { tileX: 20, tileY: 25, texture: 'obj_golf', dialogId: 'GOLF_BAG' },
  { tileX: 33, tileY: 14, texture: 'obj_pc', dialogId: 'STUDIO_MAKERSPLACE' },
  { tileX: 33, tileY: 16, texture: 'obj_whiteboard', dialogId: 'STUDIO_WHITEBOARD' },
  { tileX: 20, tileY: 27, texture: 'obj_card_binder', dialogId: 'CARD_BINDER_INTRO' },
  { tileX: 20, tileY: 28, texture: 'obj_hockey_net', dialogId: 'HOCKEY_NET' },
];

export class WorldScene extends Phaser.Scene {
  private tileMap!: number[][];
  private collisionMap!: number[][];
  private player!: Player;
  private npcSprites: Phaser.GameObjects.Rectangle[] = [];
  private objectSprites: Phaser.GameObjects.Rectangle[] = [];
  private npcData: NpcDef[] = NPCS;
  private objectData: ObjDef[] = OBJECTS;
  private tileLayer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'World' });
  }

  create(): void {
    this.scene.launch('UI');
    this.tileMap = buildTileMap();
    this.collisionMap = buildCollisionMap(this.tileMap);

    this.tileLayer = this.add.container(0, 0);
    this.renderTiles();

    this.addZoneLabels();

    this.player = new Player(
      this,
      20,
      14,
      this.collisionMap,
      this.npcData.map((n) => ({ x: n.tileX, y: n.tileY })),
      this.objectData.map((o) => ({ x: o.tileX, y: o.tileY }))
    );
    this.add.existing(this.player as unknown as Phaser.GameObjects.GameObject);

    this.spawnNPCs();
    this.spawnObjects();

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);

    this.setupInteract();
  }

  private renderTiles(): void {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        let tileType = this.tileMap[y][x];
        if (tileType === TILE.GRASS && Math.random() < 0.2) tileType = TILE.GRASS_DARK;
        const color = TILE_COLORS[tileType] ?? TILE_COLORS[TILE.GRASS];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const rect = this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE - 1, TILE_SIZE - 1, color);
        const border = this.add.rectangle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        border.setStrokeStyle(1, (color - DARKEN) >>> 0);
        border.setFillStyle(0, 0);
        this.tileLayer.add([rect, border]);
        if ((tileType === TILE.GRASS || tileType === TILE.GRASS_DARK) && Math.random() < 0.15) {
          const detail = this.add.rectangle(
            px + 6 + Math.random() * 8,
            py + 6 + Math.random() * 8,
            4,
            4,
            (color - 0x0a0a0a) >>> 0
          );
          this.tileLayer.add(detail);
        }
      }
    }
  }

  private addZoneLabels(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Press Start 2P',
      fontSize: 8,
      color: '#ffffff',
    };
    const labels: Array<[number, number, string]> = [
      [20 * TILE_SIZE + TILE_SIZE / 2, 6 * TILE_SIZE + TILE_SIZE / 2, "Town Square"],
      [5 * TILE_SIZE + TILE_SIZE / 2, 15 * TILE_SIZE + TILE_SIZE / 2, "Matt's Home"],
      [34 * TILE_SIZE + TILE_SIZE / 2, 15 * TILE_SIZE + TILE_SIZE / 2, "Matt Design"],
      [20 * TILE_SIZE + TILE_SIZE / 2, 26 * TILE_SIZE + TILE_SIZE / 2, "The Field"],
    ];
    for (const [px, py, text] of labels) {
      const t = this.add.text(px, py, text, style).setOrigin(0.5).setAlpha(0.5);
      this.tileLayer.add(t);
    }
  }

  private spawnNPCs(): void {
    for (const n of this.npcData) {
      const px = n.tileX * TILE_SIZE + TILE_SIZE / 2;
      const py = n.tileY * TILE_SIZE + TILE_SIZE / 2;
      const rect = this.add.rectangle(px, py, TILE_SIZE - 2, TILE_SIZE - 2, 0xffffff, 0);
      rect.setStrokeStyle(2, 0xffffff);
      const sprite = this.add.image(px, py, n.texture).setDisplaySize(TILE_SIZE - 4, TILE_SIZE - 4);
      this.npcSprites.push(rect);
      this.add.existing(rect);
      this.add.existing(sprite);
    }
  }

  private spawnObjects(): void {
    for (const o of this.objectData) {
      const px = o.tileX * TILE_SIZE + TILE_SIZE / 2;
      const py = o.tileY * TILE_SIZE + TILE_SIZE / 2;
      const rect = this.add.rectangle(px, py, TILE_SIZE - 2, TILE_SIZE - 2);
      rect.setStrokeStyle(1, 0xffd700);
      rect.setFillStyle(0, 0);
      const img = this.add.image(px, py, o.texture).setDisplaySize(TILE_SIZE - 4, TILE_SIZE - 4);
      this.objectSprites.push(rect);
      this.add.existing(rect);
      this.add.existing(img);
    }
  }

  private setupInteract(): void {
    this.input.keyboard?.on('keydown-SPACE', () => this.player.checkInteraction(this));
    this.input.keyboard?.on('keydown-ENTER', () => this.player.checkInteraction(this));
  }

  update(): void {
    this.player.update();
  }

  getCollisionMap(): number[][] {
    return this.collisionMap;
  }

  getNpcAt(tileX: number, tileY: number): NpcDef | undefined {
    return this.npcData.find((n) => n.tileX === tileX && n.tileY === tileY);
  }

  getObjectAt(tileX: number, tileY: number): ObjDef | undefined {
    return this.objectData.find((o) => o.tileX === tileX && o.tileY === tileY);
  }
}
