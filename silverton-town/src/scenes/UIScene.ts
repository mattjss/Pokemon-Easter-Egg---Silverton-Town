import Phaser from 'phaser';
import { DialogManager } from '../utils/DialogManager';

const BOX_MARGIN_SIDE = 48;
const BOX_HEIGHT = 128;
const BOX_PADDING_X = 20;
const BOX_PADDING_Y = 16;
const FONT_SIZE = 10;
const SPEAKER_FONT_SIZE = 8;
const WORD_WRAP_WIDTH_OFFSET = 40;
const SLIDE_DURATION = 200;
const ARROW_BOUNCE_DURATION = 500;
const BORDER_COLOR = 0x2c2c2c;

export class UIScene extends Phaser.Scene {
  private dialogManager!: DialogManager;
  private box!: Phaser.GameObjects.Container;
  private boxBg!: Phaser.GameObjects.Graphics;
  private text!: Phaser.GameObjects.Text;
  private speakerTag!: Phaser.GameObjects.Container;
  private arrow!: Phaser.GameObjects.Text;
  private arrowBounceTween: Phaser.Tweens.Tween | null = null;
  private boxSlideTween: Phaser.Tweens.Tween | null = null;

  constructor() {
    super({ key: 'UI' });
  }

  create(): void {
    this.dialogManager = new DialogManager();
    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;

    const boxWidth = w - BOX_MARGIN_SIDE * 2;
    const boxY = h - BOX_HEIGHT - 24;

    this.boxBg = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.drawBox(this.boxBg, boxWidth, boxY);

    this.text = this.add
      .text(BOX_MARGIN_SIDE + BOX_PADDING_X, boxY + BOX_PADDING_Y, '', {
        fontFamily: 'Press Start 2P',
        fontSize: FONT_SIZE,
        color: '#1a1a1a',
        lineSpacing: 8,
        wordWrap: { width: boxWidth - WORD_WRAP_WIDTH_OFFSET },
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.speakerTag = this.add.container(BOX_MARGIN_SIDE + BOX_PADDING_X, boxY - 8).setScrollFactor(0).setDepth(1002);
    const tagBg = this.add.graphics();
    const tagText = this.add.text(6, 4, '', {
      fontFamily: 'Press Start 2P',
      fontSize: SPEAKER_FONT_SIZE,
      color: '#ffffff',
    });
    this.speakerTag.add([tagBg, tagText]);
    (this.speakerTag as unknown as { tagBg: Phaser.GameObjects.Graphics; tagText: Phaser.GameObjects.Text }).tagBg = tagBg;
    (this.speakerTag as unknown as { tagBg: Phaser.GameObjects.Graphics; tagText: Phaser.GameObjects.Text }).tagText = tagText;

    this.arrow = this.add
      .text(w - BOX_MARGIN_SIDE - 24, boxY + BOX_HEIGHT - 28, '▼', {
        fontFamily: 'Press Start 2P',
        fontSize: 10,
        color: '#2C2C2C',
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.box = this.add.container(0, 0, [this.boxBg, this.text, this.speakerTag, this.arrow]);
    this.box.setVisible(false);

    this.dialogManager.setOnTypewriterTick((str: string) => this.text.setText(str));
    this.dialogManager.setOnVisibility((visible: boolean) => {
      this.box.setVisible(visible);
      this.registry.set('dialogVisible', visible);
    });
    this.dialogManager.setOnSpeaker((name) => {
      const st = this.speakerTag as unknown as { tagBg: Phaser.GameObjects.Graphics; tagText: Phaser.GameObjects.Text };
      if (name) {
        st.tagText.setText(name);
        st.tagText.setVisible(true);
        const tw = st.tagText.width + 12;
        st.tagBg.clear();
        st.tagBg.fillStyle(BORDER_COLOR, 1);
        st.tagBg.fillRoundedRect(0, 0, tw, 20, 10);
        st.tagBg.setVisible(true);
      } else {
        st.tagText.setVisible(false);
        st.tagBg.setVisible(false);
      }
    });
    this.dialogManager.setOnClosed(() => {
      this.tweens.add({
        targets: this.box,
        y: 24,
        duration: 150,
        ease: 'Power2',
        onComplete: () => this.game.events.emit('dialog:closed'),
      });
    });

    this.registry.set('dialogVisible', false);

    this.game.events.on('npc:interact', (data: { dialogId: string; speakerName?: string }) => {
      this.openBox(() => this.dialogManager.show(data.dialogId, data.speakerName));
    });
    this.game.events.on('object:interact', (data: { dialogId: string }) => {
      this.openBox(() => this.dialogManager.show(data.dialogId));
    });

    this.input.keyboard?.on('keydown-SPACE', () => this.dialogManager.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.dialogManager.advance());
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.on('down', () => {
      if (this.dialogManager.isVisible()) this.dialogManager.close();
      else this.game.events.emit('game:exit');
    });
  }

  private drawBox(g: Phaser.GameObjects.Graphics, boxWidth: number, boxY: number): void {
    const x = BOX_MARGIN_SIDE;
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x, boxY, boxWidth, BOX_HEIGHT, 8);
    g.lineStyle(3, BORDER_COLOR, 1);
    g.strokeRoundedRect(x, boxY, boxWidth, BOX_HEIGHT, 8);
    g.fillStyle(BORDER_COLOR, 1);
    g.fillRect(x, boxY + BOX_HEIGHT - 2, boxWidth, 2);
  }

  private openBox(onComplete: () => void): void {
    const cam = this.cameras.main;
    const h = cam.height;
    const boxY = h - BOX_HEIGHT - 24;
    this.box.y = 20;
    this.boxBg.clear();
    this.drawBox(this.boxBg, cam.width - BOX_MARGIN_SIDE * 2, boxY);
    this.text.setPosition(BOX_MARGIN_SIDE + BOX_PADDING_X, boxY + BOX_PADDING_Y);
    this.speakerTag.setPosition(BOX_MARGIN_SIDE + BOX_PADDING_X, boxY - 8);
    this.arrow.setPosition(cam.width - BOX_MARGIN_SIDE - 24, boxY + BOX_HEIGHT - 28);
    this.box.setVisible(true);
    this.boxSlideTween?.remove();
    this.boxSlideTween = this.tweens.add({
      targets: this.box,
      y: 0,
      duration: SLIDE_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.boxSlideTween = null;
        onComplete();
      },
    });
  }

  update(_time: number, delta: number): void {
    this.dialogManager.update(delta);

    if (this.dialogManager.isVisible() && this.dialogManager.isCurrentLineComplete()) {
      this.arrow.setVisible(true);
      if (!this.arrowBounceTween?.isPlaying()) {
        this.arrowBounceTween = this.tweens.add({
          targets: this.arrow,
          y: this.arrow.y + 4,
          duration: ARROW_BOUNCE_DURATION / 2,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      this.arrow.setVisible(false);
      this.arrowBounceTween?.remove();
      this.arrowBounceTween = null;
    }
  }
}
