import Phaser from 'phaser';
import { DialogManager } from '../utils/DialogManager';

const BOX_WIDTH_OFFSET = 80;
const BOX_HEIGHT = 130;
const BOX_Y_OFFSET = 150;
const OPEN_DURATION = 180;
const CLOSE_DURATION = 150;
const ARROW_BOUNCE_MS = 450;
const BORDER_OUTER = 0x1a1a1a;
const BORDER_INNER = 0xaaaaaa;
const SHADOW = 0x333333;

export class UIScene extends Phaser.Scene {
  private dialogManager!: DialogManager;
  private boxContainer!: Phaser.GameObjects.Container;
  private boxBg!: Phaser.GameObjects.Graphics;
  private text!: Phaser.GameObjects.Text;
  private nameTag!: Phaser.GameObjects.Container;
  private nameTagBg!: Phaser.GameObjects.Graphics;
  private nameTagText!: Phaser.GameObjects.Text;
  private arrow!: Phaser.GameObjects.Text;
  private arrowTween: Phaser.Tweens.Tween | null = null;
  private returnToPortfolioText!: Phaser.GameObjects.Text;
  private boxBaseY = 0;

  constructor() {
    super({ key: 'UI' });
  }

  create(): void {
    this.dialogManager = new DialogManager();
    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;
    this.boxBaseY = h - BOX_Y_OFFSET;
    const boxWidth = w - BOX_WIDTH_OFFSET;

    this.boxBg = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.drawBox(this.boxBg, boxWidth, this.boxBaseY);

    this.text = this.add
      .text(w / 2 - boxWidth / 2 + 16, this.boxBaseY + 12, '', {
        fontFamily: 'Press Start 2P',
        fontSize: 11,
        color: '#1a1a1a',
        lineSpacing: 4,
        wordWrap: { width: boxWidth - 40 },
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.nameTagBg = this.add.graphics().setScrollFactor(0).setDepth(1002);
    this.nameTagText = this.add
      .text(w / 2 - boxWidth / 2 + 16 + 4, this.boxBaseY - 24 + 4, '', {
        fontFamily: 'Press Start 2P',
        fontSize: 7,
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(1003);
    this.nameTag = this.add.container(0, 0, [this.nameTagBg, this.nameTagText]).setScrollFactor(0).setDepth(1002);

    this.arrow = this.add
      .text(w / 2 + boxWidth / 2 - 12, this.boxBaseY + BOX_HEIGHT - 12, '▼', {
        fontFamily: 'Press Start 2P',
        fontSize: 10,
        color: '#1a1a1a',
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(1001);

    this.boxContainer = this.add.container(0, 20, [this.boxBg, this.text, this.nameTag, this.arrow]);
    this.boxContainer.setAlpha(0);
    this.boxContainer.setVisible(false);

    this.returnToPortfolioText = this.add
      .text(w / 2, h / 2, 'Return to Portfolio? Press ESC again', {
        fontFamily: 'Press Start 2P',
        fontSize: 10,
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false);

    this.dialogManager.setOnPageText((str: string) => this.text.setText(str));
    this.dialogManager.setOnVisibility((visible: boolean) => {
      this.boxContainer.setVisible(visible);
      this.registry.set('dialogVisible', visible);
    });
    this.dialogManager.setOnSpeaker((name) => {
      if (name) {
        this.nameTagText.setText(name);
        this.nameTagText.setVisible(true);
        const tw = this.nameTagText.width + 20;
        const th = 18;
        this.nameTagBg.clear();
        this.nameTagBg.fillStyle(BORDER_OUTER, 1);
        this.nameTagBg.fillRoundedRect(this.text.x - 4, this.boxBaseY - 24, tw, th, 4);
        this.nameTagBg.setVisible(true);
      } else {
        this.nameTagText.setVisible(false);
        this.nameTagBg.setVisible(false);
      }
    });
    this.dialogManager.setOnClosed(() => {
      this.tweens.add({
        targets: this.boxContainer,
        alpha: 0,
        y: 20,
        duration: CLOSE_DURATION,
        ease: 'Power2',
        onComplete: () => this.game.events.emit('dialog:closed'),
      });
    });

    this.registry.set('dialogVisible', false);

    this.game.events.on('npc:interact', (data: { dialogId: string; speakerName?: string; name?: string }) => {
      this.openBox(() => this.dialogManager.show(data.dialogId, data.speakerName ?? data.name));
    });
    this.game.events.on('object:interact', (data: { dialogId: string }) => {
      this.openBox(() => this.dialogManager.show(data.dialogId));
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.dialogManager.setSkipTypewriter(true);
      this.dialogManager.advance();
    });
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.dialogManager.setSkipTypewriter(true);
      this.dialogManager.advance();
    });

    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.on('down', () => this.onEsc());
  }

  private onEsc(): void {
    if (this.dialogManager.isVisible()) {
      this.dialogManager.close();
      this.boxContainer.setVisible(false);
      this.registry.set('dialogVisible', false);
      return;
    }
    if (this.returnToPortfolioText.visible) {
      this.game.events.emit('game:exit');
      return;
    }
    try {
      if (this.scene.get('World').scene.isActive()) {
        this.scene.pause('World');
        this.returnToPortfolioText.setVisible(true);
      }
    } catch {
      this.game.events.emit('game:exit');
    }
  }

  private openBox(onReady: () => void): void {
    const cam = this.cameras.main;
    const w = cam.width;
    const boxWidth = w - BOX_WIDTH_OFFSET;
    this.boxBaseY = cam.height - BOX_Y_OFFSET;

    this.boxBg.clear();
    this.drawBox(this.boxBg, boxWidth, this.boxBaseY);
    this.text.setPosition(w / 2 - boxWidth / 2 + 16, this.boxBaseY + 12);
    this.nameTagText.setPosition(w / 2 - boxWidth / 2 + 20, this.boxBaseY - 24 + 4);
    this.arrow.setPosition(w / 2 + boxWidth / 2 - 12, this.boxBaseY + BOX_HEIGHT - 12);

    this.boxContainer.setPosition(0, 20);
    this.boxContainer.setAlpha(0);
    this.boxContainer.setVisible(true);
    this.arrow.setVisible(false);

    this.tweens.add({
      targets: this.boxContainer,
      alpha: 1,
      y: 0,
      duration: OPEN_DURATION,
      ease: 'Power2.Out',
      onComplete: () => {
        this.dialogManager.setSkipTypewriter(false);
        onReady();
      },
    });
  }

  private drawBox(g: Phaser.GameObjects.Graphics, boxWidth: number, boxY: number): void {
    const x = (this.cameras.main.width - boxWidth) / 2;
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x, boxY, boxWidth, BOX_HEIGHT, 6);
    g.lineStyle(3, BORDER_OUTER, 1);
    g.strokeRoundedRect(x, boxY, boxWidth, BOX_HEIGHT, 6);
    g.lineStyle(1, BORDER_INNER, 1);
    g.strokeRoundedRect(x + 2, boxY + 2, boxWidth - 4, BOX_HEIGHT - 4, 4);
    g.fillStyle(SHADOW, 1);
    g.fillRect(x, boxY + BOX_HEIGHT, boxWidth, 4);
  }

  update(_time: number, delta: number): void {
    this.dialogManager.update(delta);
    this.dialogManager.setSkipTypewriter(false);

    if (this.dialogManager.isVisible() && this.dialogManager.isCurrentPageComplete()) {
      this.arrow.setVisible(true);
      if (!this.arrowTween?.isPlaying()) {
        const baseY = this.arrow.y;
        this.arrowTween = this.tweens.add({
          targets: this.arrow,
          y: baseY - 4,
          duration: ARROW_BOUNCE_MS / 2,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      this.arrow.setVisible(false);
      this.arrowTween?.remove();
      this.arrowTween = null;
    }
  }
}
