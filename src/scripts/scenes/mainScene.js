
import SpriteManager from '../lib/SpriteManager';
import World from '../lib/World';

window.sim = null;
const worldSize = 32 * 25;
window.world = new World({
  size: worldSize
});



export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }
  preload() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...this.input.keyboard.addKeys(
        {
          w: Phaser.Input.Keyboard.KeyCodes.W,
          s: Phaser.Input.Keyboard.KeyCodes.S,
          a: Phaser.Input.Keyboard.KeyCodes.A,
          d: Phaser.Input.Keyboard.KeyCodes.D
        })
    };
  }

  create() {


    window.sim = this;

    this.cameras.main.setBounds(0, 0, this.game.config.width, this.game.config.height);
    this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);

    this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, 'tiles', 65);
    this.background.setScale(2);



    this.spriteManager = new SpriteManager({
      scene: this, world, id: 'id', mapName: 'traning-02',
      cursors: this.cursors
    });


  }

  update() {
    this.spriteManager.update();
  }

}
