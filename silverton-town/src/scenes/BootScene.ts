import Phaser from 'phaser';

const TITLE_BG = 0x1a1a2e;
const FADE_DURATION = 400;

const PLACEHOLDER_TEXTURES: Array<{ key: string; color: number }> = [
  { key: 'player', color: 0x4fc3f7 },
  { key: 'npc_professor', color: 0x81c784 },
  { key: 'npc_grandmother', color: 0xf48fb1 },
  { key: 'npc_rival', color: 0xff8a65 },
  { key: 'npc_kid', color: 0xffd54f },
  { key: 'tile_grass', color: 0x5d8a3c },
  { key: 'tile_grass_dark', color: 0x4a7030 },
  { key: 'tile_path', color: 0xc8a96e },
  { key: 'tile_building', color: 0x8b7355 },
  { key: 'tile_roof', color: 0xc0392b },
  { key: 'tile_water', color: 0x5b9bd5 },
  { key: 'tile_flowers', color: 0xe91e63 },
  { key: 'obj_bookshelf', color: 0x795548 },
  { key: 'obj_watch', color: 0xffd700 },
  { key: 'obj_record', color: 0x9c27b0 },
  { key: 'obj_golf', color: 0x2e7d32 },
  { key: 'obj_pc', color: 0x1565c0 },
  { key: 'obj_whiteboard', color: 0xeceff1 },
  { key: 'obj_card_binder', color: 0xe53935 },
  { key: 'obj_hockey_net', color: 0x546e7a },
];

const ASSET_BASE = '/assets';

export class BootScene extends Phaser.Scene {
  private titleContainer!: Phaser.GameObjects.Container;
  private blinkTimer = 0;

  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Tilesets — town, grass, paths, buildings; interior (Matt's Home + Studio)
    this.load.image('exterior-tileset', `${ASSET_BASE}/tilesets/exterior-tileset.png`);
    this.load.image('interior-tileset', `${ASSET_BASE}/tilesets/interior-tileset.png`);

    // Player — 4-direction walk spritesheet (32×32 per frame)
    this.load.spritesheet('player', `${ASSET_BASE}/sprites/player.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });

    // NPCs
    this.load.image('npc_professor', `${ASSET_BASE}/sprites/npc-professor.png`);
    this.load.image('npc_grandmother', `${ASSET_BASE}/sprites/npc-grandmother.png`);
    this.load.image('npc_rival', `${ASSET_BASE}/sprites/npc-rival.png`);
    this.load.image('npc_kid', `${ASSET_BASE}/sprites/npc-kid.png`);

    // UI — optional; game can draw dialog with Graphics instead
    this.load.image('dialog-box', `${ASSET_BASE}/ui/dialog-box.png`);

    this.load.on('loaderror', (_file: { key: string }) => {
      // Continue without this asset; placeholders will be used in create()
    });
  }

  create(): void {
    this.generatePlaceholderTextures();

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(TITLE_BG);

    // Decorative corner stars (small colored pixel shapes)
    const starColor = 0xffffff;
    const starAlpha = 0.6;
    const pad = 40;
    this.add.rectangle(pad, pad, 8, 8, starColor, starAlpha);
    this.add.rectangle(width - pad, pad, 8, 8, 0xffd54f, starAlpha);
    this.add.rectangle(pad, height - pad, 8, 8, 0x81c784, starAlpha);
    this.add.rectangle(width - pad, height - pad, 8, 8, 0xf48fb1, starAlpha);

    const title = this.add
      .text(width / 2, height / 2 - 40, 'SILVERTOWN', {
        fontFamily: 'Press Start 2P',
        fontSize: 28,
        color: '#FFFFFF',
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width / 2, height / 2 + 20, 'A portfolio by Matt Silverman', {
        fontFamily: 'Press Start 2P',
        fontSize: 10,
        color: '#9E9E9E',
      })
      .setOrigin(0.5);

    const pressEnter = this.add
      .text(width / 2, height / 2 + 80, 'Press ENTER to begin', {
        fontFamily: 'Press Start 2P',
        fontSize: 12,
        color: '#FFFFFF',
      })
      .setOrigin(0.5);

    this.titleContainer = this.add.container(0, 0, [title, subtitle, pressEnter]);

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
  }

  update(_time: number, delta: number): void {
    this.blinkTimer += delta;
    const visible = Math.floor(this.blinkTimer / 1000) % 2 === 0;
    const pressEnter = this.titleContainer?.list[2] as Phaser.GameObjects.Text | undefined;
    if (pressEnter) pressEnter.setVisible(visible);
  }

  private generatePlaceholderTextures(): void {
    for (const { key, color } of PLACEHOLDER_TEXTURES) {
      if (this.textures.exists(key)) continue;
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, 16, 16);
      g.generateTexture(key, 16, 16);
      g.destroy();
    }
  }

  private startGame(): void {
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-SPACE');
    this.cameras.main.fade(FADE_DURATION, 0, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) this.scene.start('World');
    });
  }
}
