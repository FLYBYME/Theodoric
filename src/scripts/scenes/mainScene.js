import InputDebug from '../lib/InputDebug';
import spriteManager from '../lib/spriteManager';
import uuid from '../lib/uuid';
import World from '../lib/World';

window.sim = null;
const worldSize = 32 * 25;
window.world = new World(null, worldSize);



export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }
  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {


    window.sim = this;

    this.cameras.main.setBounds(0, 0, this.worldSize, this.worldSize);
    this.physics.world.setBounds(0, 0, this.worldSize, this.worldSize);

    this.background = this.add.tileSprite(0, 0, this.worldSize, this.worldSize, 'tiles', 65);
    this.background.setScale(2);

  }

  update() {

  }

}
