import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import Bob from '../characters/Bob'
import Tree from '../items/obstacles/Tree'


import { createCharacterAnims } from '../anims/CharacterAnims'
import Grid from '../lib/Grid'
import World from '../lib/World'
import StageTest from '../items/collectables/Chest'
import WorldClient from '../lib/WorldClient'

window.sim = null;

window.world = new World(null, 32 * 25);



world.setCollectableCount(20);
world.setObstacleCount(50);



world.setup();
//window.bob = world.createCharacter(0, 0, 'bob');

export default class MainScene extends Phaser.Scene {
  fpsText

  constructor() {
    super({ key: 'MainScene' })
  }
  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {


    window.sim = this;
    this.worldSize = 32 * 25;

    this.cameras.main.setBounds(0, 0, this.worldSize, this.worldSize);
    this.physics.world.setBounds(0, 0, this.worldSize, this.worldSize);

    this.cameras.main.setSize(7 * 32, 7 * 32);
    this.cameras.main.setPosition(32, 32);

    this.cameras.add(7 * 32 + 32 + 32, 32, 7 * 32, 7 * 32);

    // /this.cameras.main.setZoom(4)
    this.background = this.add.tileSprite(0, 0, this.worldSize, this.worldSize, 'tiles', 65);
    this.background.setScale(2);

    createCharacterAnims(this.anims);

    this.sprites = [];


    //this.io = io('http://192.168.2.29:3000');

    this.client = new WorldClient(this, world);
    this.client.attachWorldEvents();
    this.scene.run('UIScene', this)
    setTimeout(() => {

      world.state().items.forEach((item) => this.client.onSpriteAdd(item));
      console.log(world)
      const input = this.getInputs();
      this.client.sendInput(input)

    }, 1000)
  }

  update() {


    world.update();
    const input = this.getInputs();
    input.id = this.client.id;
    if (input.direction != 'stop')
      this.client.sendInput(input)
    return;
    const cursors = this.cursors;
    let { x, y } = this.player;

  }


  getInputs() {
    const cursors = this.cursors;

    const directions = ['left', 'right', 'up', 'down'];
    let direction = 'stop';
    for (let index = 0; index < directions.length; index++) {
      const dir = directions[index];
      if (Phaser.Input.Keyboard.JustDown(cursors[dir])) {
        console.log(dir)
        direction = dir;
        break
      }
    }
    return {
      id: this.id,
      direction
    }
  }
}
