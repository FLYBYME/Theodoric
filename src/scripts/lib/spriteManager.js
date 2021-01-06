
import EventEmitter from './EventEmitter.js'
import BaseUI from '../ui/BaseUI.js'

export default class spriteManager extends EventEmitter {

    constructor(scene, world, id) {
        super();
        this.id = id;
        this.scene = scene;
        this.world = world;
        this.sprites = new Map();
        this.attachEvents();
    }

    attachEvents() {
        this.world.on('item:add', (item) => {
            this.process(item);
        });
        this.world.on('item:remove', (item) => {
            this.remove(item);
            //let sprite = this.getByID(item.id);

        });
        this.world.on('item:move', (item) => {
            this.process(item);
        });
        this.world.on('item:update', (item) => {
            //console.log(this,item)
            this.process(item);
        });
    }

    update() {
        for (const [name, items] of this.sprites.entries()) {
            for (let index = 0; index < items.length; index++) {
                const item = items[index];

            }
        }
    }
    get(item) {
        const sprites = this.sprites.get(item.name);
        if (sprites) {
            return sprites.find((s) => item.id == s.id)
        }
    }
    getByID(id) {
        for (const [name, sprites] of this.sprites.entries()) {
            for (let index = 0; index < sprites.length; index++) {
                const sprite = sprites[index];
                if (sprite.id == id)
                    return sprite;
            }
        }
        return false
    }

    createSprite(item) {

        let sprite = new BaseUI(this.scene, item);

        sprite.createSprite()

       // console.log(`creating new sprite ${item.name} ${sprite.name}`)

        return sprite
    }
    processPlayer(sprite, item, isNew = false) {
        sprite.item = item;
        if (isNew)
            this.emit('follow', sprite);
        this.emit('player', sprite);

    }
    process(item) {

        let sprite = this.getByID(item.id);
        let isNew = false;
        if (!sprite) {
            isNew = true;
            sprite = this.createSprite(item);
            let sprites = this.sprites.get(item.name);
            if (!sprites) { // not locked
                sprites = [];
                this.sprites.set(item.name, sprites);
            }
            sprites.push(sprite);
        }

        sprite.update(item);

        if (sprite.id == this.id)
            this.processPlayer(sprite, item, isNew);
        else if (item.name == 'bob' && isNew)
            this.emit('follow-second', sprite);
        return sprite;
    }
    remove(item) {


        const sprites = this.sprites.get(item.name);
        if (!sprites)
            return;

        const index = sprites.findIndex((i) => item.id == i.id);
        if (index == -1) return;
        const sprite = sprites[index]
        sprites.splice(index, 1);

        if (sprites.length == 0)
            this.sprites.delete(item.name);
        sprite.destroy();
        if (sprite.id == this.id)
            this.processPlayer(sprite, item, false);
    }

}