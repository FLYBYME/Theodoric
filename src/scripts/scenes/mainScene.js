import spriteManager from '../lib/spriteManager';
import uuid from '../lib/uuid';
import World from '../lib/World';

window.sim = null;
const worldSize = 32 * 25;
window.world = new World(null, worldSize);



world.setCollectableCount(20);
world.setObstacleCount(20);

world.on('item:add', (item) => console.log(`World: Item created ${item.name} X${item.x}:Y${item.y}`));
world.on('item:remove', (item) => console.log(`World: Item removed ${item.name} X${item.x}:Y${item.y}`));
world.on('item:update', (item) => console.log(`World: Item update ${item.name} X${item.x}:Y${item.y}`));


world.setup();
//window.bob = world.createCharacter(0, 0, 'bob');

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }
  preload() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {


    window.sim = this;
    this.worldSize = worldSize;

    this.cameras.main.setBounds(0, 0, this.worldSize, this.worldSize);
    this.physics.world.setBounds(0, 0, this.worldSize, this.worldSize);

    this.cameras.main.setSize(7 * 32, 7 * 32);
    this.cameras.main.setPosition(32, 32);

    this.cameras.add(7 * 32 + 32 + 32, 32, 7 * 32, 7 * 32);

    // /this.cameras.main.setZoom(4)
    this.background = this.add.tileSprite(0, 0, this.worldSize, this.worldSize, 'tiles', 65);
    this.background.setScale(2);

    this.id = uuid();
    if (localStorage.getItem('id')) {
      this.id = localStorage.getItem('id');
    } else {
      localStorage.setItem('id', this.id);
    }


    if (typeof io == "undefined") {
      this.world = world;
    } else {
      this.world = io();
    }

    this.spriteManager = new spriteManager(this, this.world, this.id);

    this.spriteManager.on('follow', (sprite) => this.cameras.main.startFollow(sprite.getFollow(), true))
    this.spriteManager.on('follow-second', (sprite) => this.cameras.cameras[1].startFollow(sprite.getFollow(), true))
    this.spriteManager.on('player', (sprite) => console.log(sprite))


    if (typeof io == "undefined")
      this.world.itemManager.toJSON().forEach(item => {
        world.emit('item:add', item);
      });
    process.nextTick(() => this.world.emit('input', this.getInputs()))
  }

  update() {

    if (typeof io == "undefined")
      this.world.update();

    this.spriteManager.update();
    const input = this.getInputs();
    if (input.direction != 'stop') {
      console.log(`new input ${input.direction}`);
      this.world.emit('input', input);
    }
  }


  getInputs() {
    const cursors = this.cursors;

    const directions = ['left', 'right', 'up', 'down'];
    let direction = 'stop';
    for (let index = 0; index < directions.length; index++) {
      const dir = directions[index];
      if (Phaser.Input.Keyboard.JustDown(cursors[dir])) {
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
