import 'phaser'
import '@babel/polyfill'

import MainScene from './scenes/mainScene'
import UIScene from './scenes/UIScene'
import PreloadScene from './scenes/preloadScene'

const DEFAULT_WIDTH = 32 * 17
const DEFAULT_HEIGHT = 32 * 17

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, MainScene, UIScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      //gravity: { y: 400 }
    }
  }
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
