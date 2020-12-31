

import EventEmitter from './EventEmitter'
import Grid from './Grid';
import Bob from '../characters/Bob'

import Obstacles from '../items/obstacles'
import Collectables from '../items/collectables'
import ItemManager from './ItemManager';

var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
var uuid = function () {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};
export default class WorldClient extends EventEmitter {

    constructor(scene, world) {
        super();
        this.scene = scene;
        this.queue = [];
        this.loaded = false;

        this.second = null;

        this.id = localStorage.getItem('player-id') ? localStorage.getItem('player-id') : uuid()
        localStorage.setItem('player-id', this.id);

        this.world = world;

        this.on('player', (player) => {
            const sprite = this.findSprite(player.id);
            switch (player.direction) {
                case 'right':
                    sprite.setFrame(28);
                    break;
                case 'left':
                    sprite.setFrame(16);
                    break;
                case 'up':
                    sprite.setFrame(40);
                    break;
                case 'down':
                    sprite.setFrame(4);
                    break;

                default:
                    break;
            }
        })

    }
    onEvent() {

    }


    attachWorldEvents() {


        //world.state().items.forEach((item) => this.onSpriteAdd(item));

        this.world.on('item:add', (item) => {
            const sprite = this.onSpriteAdd(item)
            if (item.id == this.id) {
                this.emit('player', item)
                this.scene.cameras.main.startFollow(sprite, true)
            }
            else if (item.name == 'bob') {
                if (this.second == null) {
                    this.second = item.id;
                    this.scene.cameras.cameras[1].startFollow(sprite, true)
                }

                if (item.id == this.second)
                    this.emit('second', item)
            }
        });
        this.world.on('item:remove', (item) => {
            if (item.id == this.id)
                this.emit('player', item);
            else if (item.id == this.second)
                this.second = null;
            this.onSpriteRemove(item)

        });
        this.world.on('item:move', (item) => {
            if (item.id == this.id)
                this.emit('player', item);
            else if (item.id == this.second)
                this.emit('second', item)
            this.onSpriteMove(item)
        });
        this.world.on('item:death', (item) => console.log('death', item));
        this.world.on('item:update', (item) => {
            if (item.id == this.id)
                this.emit('player', item)
            else if (item.id == this.second)
                this.emit('second')
        });


    }
    sendInput(input) {
        input.id = this.id;
        this.world.emit('input', input)
    }

    createPlayer() {
        //const bob = world.createCharacter(0, 0, 'bob');

        //this.id = bob.id;
    }
    findSprite(id) {
        return this.scene.sprites.find((sprite) => sprite.id == id);
    }

    onSpriteAdd(item) {

        if (this.findSprite(item.id))
            return console.log('sprite found');

        let sprite = this.scene.add.tileSprite(
            item.x,
            item.y,
            item.width,
            item.height,
            item.tileMapImageSet,
            item.tileMapID
        );
        sprite.setScale(item.scale);
        sprite.setOrigin(0, 0);

        sprite.id = item.id;



        this.scene.sprites.push(sprite);

        return sprite;
    }
    onSpriteRemove(item) {

        const index = this.scene.sprites.findIndex((sprite) => {
            if (sprite.id == item.id) {
                sprite.destroy();
                return true;
            }
            return false;
        });
        this.scene.sprites.splice(index, 1);
    }
    onSpriteMove(item) {
        const sprite = this.findSprite(item.id);
        if (!sprite)
            return;
        sprite.x = item.x;
        sprite.y = item.y;
    }

    getInputs() {
        const cursors = this.scene.cursors;

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
            direction
        }
    }
}