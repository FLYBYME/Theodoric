import InputDebug from '../lib/InputDebug';
import spriteManager from '../lib/spriteManager';
import uuid from '../lib/uuid';
import World from '../lib/World';

window.sim = null;
const worldSize = 32 * 25;
window.world = new World(null, worldSize);



world.setCollectableCount(25);
world.setObstacleCount(40);
const print = (item, type) => false && console.log(`World: Item ${type} ${item.name} X${item.x}:Y${item.y} h:${item.stats && item.stats.health || 0} st:${item.stats && item.stats.stamina || 0} s:${item.stats && item.stats.strength || 0}`)

world.on('item:add', (item) => print(item, 'created'));
world.on('item:remove', (item) => print(item, 'remove'));
world.on('item:update', (item) => print(item, 'update'));


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

    //this.cameras.main.setSize(7 * 32, 7 * 32);
    //this.cameras.main.setPosition(32, 32);

    //this.cameras.add(7 * 32 + 32 + 32, 32, 7 * 32, 7 * 32);

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

    this.spriteManager.on('player', (sprite) => {
      if (sprite.item.stats.health <= 0 && sprite.debug) {
        sprite.debug.destroy()
        sprite.debug = null;
        return;
      }

      if (!sprite.debug)
        sprite.debug = new InputDebug(this, sprite);
      sprite.debug.update(sprite.item);
    })


    this.spriteManager.on('follow', (sprite) => this.cameras.main.startFollow(sprite.getFollow(), true))
    //this.spriteManager.on('follow-second', (sprite) => this.cameras.cameras[1].startFollow(sprite.getFollow(), true))
    //this.spriteManager.on('player', (sprite) => console.log(sprite))

    this.input.on('pointerdown', function (pointer) {
      var x = Math.floor(pointer.x / 32) * 32;
      var y = Math.floor(pointer.y / 32) * 32;
      console.log({ x, y })
      world.itemManager.create('tree', x, y)
    });


    if (typeof io == "undefined")
      this.world.itemManager.toJSON().forEach(item => {
        world.emit('item:add', item);
      });
    //process.nextTick(() => this.world.emit('input', this.getInputs()))
  }

  update() {

    if (typeof io == "undefined")
      this.world.update();

    this.spriteManager.update();
    const input = this.getInputs();
    if (input.direction != 'stop') {
      //console.log(`new input ${input.direction}`);
      this.world.emit('input', input);
    }
  }


  getInputs() {
    const cursors = this.cursors;


    if (Phaser.Input.Keyboard.JustDown(cursors.shift)) {
      return {
        id: this.id,
        direction: 'kill'
      }
    }


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
