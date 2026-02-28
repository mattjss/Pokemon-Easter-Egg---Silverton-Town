import Phaser from 'phaser';
import { Player } from '../game-objects/Player';
import {
  PROC_MAP_WIDTH,
  PROC_MAP_HEIGHT,
  TILE_PX,
  buildProceduralMap,
  buildProceduralCollision,
  TILE_COLORS,
  T,
} from '../data/proceduralMap';

const CAMERA_LERP = 0.08;
const CAMERA_ZOOM = 2.0;
const WORLD_W = PROC_MAP_WIDTH * TILE_PX;
const WORLD_H = PROC_MAP_HEIGHT * TILE_PX;

interface NpcDef {
  tileX: number;
  tileY: number;
  dialogId: string;
  name?: string;
  tint?: number;
  face: 'up' | 'down' | 'left' | 'right';
}

interface ObjDef {
  tileX: number;
  tileY: number;
  dialogId: string;
  color: number;
}

const NPCS: NpcDef[] = [
  { tileX: 25, tileY: 2, dialogId: 'NPC_PROFESSOR', name: 'Professor', tint: 0x81c784, face: 'down' },
  { tileX: 6, tileY: 14, dialogId: 'NPC_GRANDMOTHER', name: 'Grandmother', tint: 0xf48fb1, face: 'right' },
  { tileX: 43, tileY: 14, dialogId: 'NPC_RIVAL', name: 'Rival', tint: 0xff8a65, face: 'left' },
  { tileX: 24, tileY: 30, dialogId: 'NPC_KID_BASEBALL', name: 'Kid', tint: 0xffd54f, face: 'up' },
  { tileX: 25, tileY: 38, dialogId: 'NPC_ROUTE_EXIT', name: 'Traveler', tint: 0x5b9bd5, face: 'up' },
];

const OBJECTS: ObjDef[] = [
  { tileX: 5, tileY: 15, dialogId: 'BOOKSHELF', color: 0x795548 },
  { tileX: 7, tileY: 15, dialogId: 'WATCH_CASE', color: 0xffd700 },
  { tileX: 6, tileY: 16, dialogId: 'RECORD_PLAYER', color: 0x9c27b0 },
  { tileX: 6, tileY: 13, dialogId: 'KITCHEN_FRIDGE', color: 0xeceff1 },
  { tileX: 22, tileY: 28, dialogId: 'GOLF_BAG', color: 0x2e7d32 },
  { tileX: 42, tileY: 13, dialogId: 'STUDIO_PC', color: 0x1565c0 },
  { tileX: 44, tileY: 15, dialogId: 'WHITEBOARD', color: 0xeceff1 },
  { tileX: 26, tileY: 30, dialogId: 'CARD_BINDER', color: 0xe53935 },
  { tileX: 18, tileY: 26, dialogId: 'HOCKEY_NET', color: 0x546e7a },
];

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private proceduralCollision: number[][] = [];
  private useTilemap = false;
  private tileLayerContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'World' });
  }

  create(): void {
    this.scene.launch('UI');

    let mapWidth = PROC_MAP_WIDTH;
    let mapHeight = PROC_MAP_HEIGHT;
    let collisionMap: number[][] = [];

    if (this.cache.tilemap.exists('world')) {
      try {
        const map = this.make.tilemap({ key: 'world' });
        const tileset = map.addTilesetImage('overworld', 'overworld');
        if (tileset) {
          const ground = map.createLayer('Ground', tileset, 0, 0);
          const collision = map.createLayer('Collision', tileset, 0, 0);
          if (ground) {
            this.useTilemap = true;
            mapWidth = map.width;
            mapHeight = map.height;
            collisionMap = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(0));
            if (collision) {
              this.collisionLayer = collision;
              this.collisionLayer.setCollisionByExclusion([-1]);
              for (let y = 0; y < mapHeight; y++)
                for (let x = 0; x < mapWidth; x++)
                  if (this.collisionLayer.getTileAt(x, y)) collisionMap[y][x] = 1;
            }
          }
        }
      } catch {
        this.useTilemap = false;
      }
    }

    if (!this.useTilemap) {
      const procMap = buildProceduralMap();
      this.proceduralCollision = buildProceduralCollision(procMap);
      collisionMap = this.proceduralCollision;
      this.tileLayerContainer = this.add.container(0, 0);
      this.renderProceduralTiles(procMap);
    }

    const npcRefs = NPCS.map((n) => ({ tileX: n.tileX, tileY: n.tileY, dialogId: n.dialogId, name: n.name }));
    const objRefs = OBJECTS.map((o) => ({ tileX: o.tileX, tileY: o.tileY, dialogId: o.dialogId }));

    this.player = new Player(this, 25, 5, collisionMap, npcRefs, objRefs, mapWidth, mapHeight);
    this.add.existing(this.player as unknown as Phaser.GameObjects.GameObject);

    if (this.collisionLayer) {
      this.physics.add.collider(this.player as unknown as Phaser.Types.Physics.Arcade.ArcadeColliderType, this.collisionLayer);
    }

    this.spawnNPCs();
    this.spawnObjects();
    this.addZoneSigns();

    const tileW = this.useTilemap && this.cache.tilemap.get('world') ? (this.cache.tilemap.get('world') as Phaser.Tilemaps.Tilemap).tileWidth : TILE_PX;
    const tileH = this.useTilemap && this.cache.tilemap.get('world') ? (this.cache.tilemap.get('world') as Phaser.Tilemaps.Tilemap).tileHeight : TILE_PX;
    this.cameras.main.setBounds(0, 0, this.useTilemap ? mapWidth * tileW : WORLD_W, this.useTilemap ? mapHeight * tileH : WORLD_H);
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
    this.cameras.main.setZoom(CAMERA_ZOOM);

    if (this.sound.get('town-bgm')) {
      this.sound.play('town-bgm', { loop: true, volume: 0.4 });
    }
  }

  private renderProceduralTiles(map: number[][]): void {
    const DARK = 0x0a0a0a;
    for (let y = 0; y < PROC_MAP_HEIGHT; y++) {
      for (let x = 0; x < PROC_MAP_WIDTH; x++) {
        let t = map[y][x];
        if (t === T.GRASS && Math.random() < 0.3) t = T.GRASS_DARK;
        const color = TILE_COLORS[t] ?? 0x78c850;
        const px = x * TILE_PX + TILE_PX / 2;
        const py = y * TILE_PX + TILE_PX / 2;
        const rect = this.add.rectangle(px, py, TILE_PX - 1, TILE_PX - 1, color);
        const border = this.add.rectangle(px, py, TILE_PX, TILE_PX).setStrokeStyle(1, (color - DARK) >>> 0).setFillStyle(0, 0);
        this.tileLayerContainer.add([rect, border]);
        if ((t === T.GRASS || t === T.GRASS_DARK) && Math.random() < 0.12) {
          const dot = this.add.rectangle(px - 6 + Math.random() * 12, py - 6 + Math.random() * 12, 2, 2, 0xf85888);
          this.tileLayerContainer.add(dot);
        }
      }
    }
  }

  private spawnNPCs(): void {
    const hasChars = this.textures.exists('characters');
    for (const n of NPCS) {
      const px = n.tileX * TILE_PX + TILE_PX / 2;
      const py = n.tileY * TILE_PX + TILE_PX / 2;
      if (hasChars) {
        const img = this.add.image(px, py, 'characters', 0).setDisplaySize(24, 32).setTint(n.tint ?? 0xffffff);
        this.add.existing(img);
      } else {
        const rect = this.add.rectangle(px, py, 16, 24, n.tint ?? 0xffffff);
        rect.setStrokeStyle(2, 0xffffff);
        this.add.existing(rect);
      }
    }
  }

  private spawnObjects(): void {
    for (const o of OBJECTS) {
      const px = o.tileX * TILE_PX + TILE_PX / 2;
      const py = o.tileY * TILE_PX + TILE_PX / 2;
      const rect = this.add.rectangle(px, py, 16, 16, o.color);
      rect.setStrokeStyle(2, 0xffd700);
      rect.setDepth(5);
      this.add.existing(rect);
    }
  }

  private addZoneSigns(): void {
    const signs: Array<[number, number, string]> = [
      [25 * TILE_PX + TILE_PX / 2, 4 * TILE_PX + TILE_PX / 2, 'Silvertown'],
      [6 * TILE_PX + TILE_PX / 2, 13 * TILE_PX + TILE_PX / 2, "Matt's Home"],
      [42 * TILE_PX + TILE_PX / 2, 13 * TILE_PX + TILE_PX / 2, 'Matt Design'],
      [25 * TILE_PX + TILE_PX / 2, 23 * TILE_PX + TILE_PX / 2, 'The Field'],
    ];
    for (const [px, py, text] of signs) {
      const bg = this.add.graphics();
      const t = this.add.text(px, py, text, {
        fontFamily: 'Press Start 2P',
        fontSize: 7,
        color: '#ffffff',
      }).setOrigin(0.5);
      const pad = 6;
      bg.fillStyle(0x1a1a1a, 0.9);
      bg.fillRoundedRect(px - t.width / 2 - pad, py - 6, t.width + pad * 2, 14, 4);
      bg.setDepth(10);
      t.setDepth(11);
      this.add.existing(bg);
      this.add.existing(t);
    }
  }

  update(): void {
    this.player.update();
  }
}
