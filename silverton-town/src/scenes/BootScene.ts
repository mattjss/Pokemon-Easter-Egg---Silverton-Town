import Phaser from 'phaser';

const TITLE_BG = 0x000000;
const FADE_DURATION = 400;
const HOLD_AFTER_LOAD_MS = 500;

export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;
  private barWidth = 200;
  private barHeight = 8;

  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor(TITLE_BG);

    this.add
      .text(width / 2, height / 2 - 60, 'SILVERTOWN', {
        fontFamily: 'Press Start 2P',
        fontSize: 32,
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 20, 'A portfolio by Matt Silverman', {
        fontFamily: 'Press Start 2P',
        fontSize: 10,
        color: '#9E9E9E',
      })
      .setOrigin(0.5);

    const barX = width / 2 - this.barWidth / 2;
    const barY = height - 60;
    this.progressBar = this.add.graphics();
    this.progressBar.fillStyle(0x333333, 1);
    this.progressBar.fillRect(barX, barY, this.barWidth, this.barHeight);
    this.progressBar.fillStyle(0xffffff, 1);

    this.progressText = this.add
      .text(width / 2, barY + this.barHeight + 12, '0%', {
        fontFamily: 'Press Start 2P',
        fontSize: 10,
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x333333, 1);
      this.progressBar.fillRect(barX, barY, this.barWidth, this.barHeight);
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(barX, barY, this.barWidth * value, this.barHeight);
      this.progressText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x333333, 1);
      this.progressBar.fillRect(barX, barY, this.barWidth, this.barHeight);
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(barX, barY, this.barWidth, this.barHeight);
      this.progressText.setText('100%');
    });

    this.load.on('loaderror', () => {
      // Continue; WorldScene will use fallbacks
    });

    this.load.image('serene', '/assets/tilesets/serene-village.png');
    this.load.spritesheet('player', '/assets/sprites/character-spritesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('characters', '/assets/sprites/Characters_V3_Colour.png');
    this.load.audio('town-bgm', '/assets/audio/town-bgm.mp3');
  }

  create(): void {
    this.time.delayedCall(HOLD_AFTER_LOAD_MS, () => {
      this.cameras.main.fade(FADE_DURATION, 0, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress === 1) this.scene.start('World');
      });
    });
  }
}
