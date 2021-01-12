import EventEmitter from 'events'
import BaseSpriteUI from './BaseSpriteUI.js'

export default class SpriteManager extends EventEmitter {

    constructor({ scene, world, id, mapName, cursors }) {
        super();
        this.id = id;
        this.mapName = mapName;
        this.mapID = null;

        this.cursors = cursors;
        this.scene = scene;
        this.world = world;

        this.sprites = new Map();

        this.attachEvents();
        this.attachKeys();
    }
    attachKeys() {
        this.scene.input.keyboard.on(`keydown-R`, () => {
            this.world.emit('reset-map', this.mapName);
        });
        const onDirectionKey = (direction) => {

            this.scene.input.keyboard.on(`keydown-${direction.toLocaleUpperCase()}`, () => {
                this.world.emit('input-map', this.mapName, {
                    id: this.id,
                    direction
                });
            });
        }
        onDirectionKey('up')
        onDirectionKey('down')
        onDirectionKey('left')
        onDirectionKey('right')
    }
    attachEvents() {
        this.world.on('map:add', (mapID, x, y, item) => {
            if (this.mapID == mapID)
                this.process(item);
        });
        this.world.on('map:remove', (mapID, x, y, item) => {
            if (this.mapID == mapID)
                this.remove(item);
            //let sprite = this.getByID(item.id);

        });
        this.world.on('map:move', (mapID, x, y, item) => {
            if (this.mapID == mapID)
                this.process(item);
        });
        this.world.on('map:update', (mapID, id, updates) => {
            if (this.mapID == mapID)
                this.updateSprite(id, updates)
            // console.log(this, updates)
            //this.process(item);
        });






        this.loadMap(this.mapName);
    }
    loadMap(mapName, event = 'load-map') {

        this.mapID = null;
        this.clear();

        this.world.emit(event, mapName, this.id, (mapID, items) => {

            this.mapID = mapID;
            this.mapName = mapName;
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                this.process(item);
            }
        })
    }
    clear() {
        this.getAll().forEach((sprite) => this.remove(sprite.item))
    }
    update() {
        //const input = this.getInputs();
        //if (input.direction != 'stop') {
        //console.log(`new input ${input.direction}`);
        // this.world.emit('input-map', this.mapName, input);
        //}

        if (Phaser.Input.Keyboard.JustDown(this.cursors['w'])) {
            this.loadMap('traning-01', 'train-map');
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors['w'])) {
            this.loadMap('traning-01', 'train-map');
        }

    }
    get(item) {
        const sprites = this.sprites.get(item.name);
        if (sprites) {
            return sprites.find((s) => item.id == s.id)
        }
    }

    getAll(filter) {
        const all = [...this.sprites.entries()].map(([key, sprite]) => sprite).flat();

        if (filter)
            return all.filter(filter);

        return all;
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

        let sprite = new BaseSpriteUI(this.scene, item);

        sprite.createSprite()

        //console.log(`creating new sprite ${item.name} ${sprite.name}`)

        return sprite
    }
    processPlayer(sprite, item, isNew = false) {
        sprite.item = item;
        if (isNew)
            this.emit('follow', sprite);
        this.emit('player', sprite);

    }
    updateSprite(id, updates) {
        let sprite = this.getByID(id);
        if (!sprite)
            return;

        for (let index = 0; index < updates.length; index++) {
            const update = updates[index];
            switch (update.key) {
                case 'xy':
                    sprite.set('x', update.val.x);
                    sprite.set('y', update.val.y);
                    break;
                case 'direction':
                    sprite.set('direction', update.val);
                    break;
                case 'stats':
                    sprite.set('stats', update.val);
                    break;
                default:
                    break;
            }
        }
        sprite.update()

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