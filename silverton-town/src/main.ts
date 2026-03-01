import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { UIScene } from './scenes/UIScene';

function getGameSize(): { width: number; height: number } {
  const w = window.innerWidth || 800;
  const h = window.innerHeight || 600;
  return { width: Math.max(320, w), height: Math.max(240, h) };
}

function initGame(): void {
  const { width, height } = getGameSize();
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width,
    height,
    backgroundColor: '#000000',
    parent: 'game',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, WorldScene, UIScene],
  };

  const game = new Phaser.Game(config);
  window.game = game;

  window.addEventListener('resize', () => {
    const { width: w, height: h } = getGameSize();
    game.scale.resize(w, h);
  });
}

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
