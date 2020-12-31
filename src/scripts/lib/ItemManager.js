
import EventEmitter from './EventEmitter.js'
import Grid from './Grid.js';
import Bob from '../characters/Bob.js'

import Obstacles from '../items/obstacles/index.js'

export default class ItemManager extends EventEmitter {

    constructor(world) {
        super();
        this.world = world;
        this.grid = world.grid;
        this.items = new Map();

    }

    update() {
        for (const [name, items] of this.items.entries()) {
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                let wasUpdated = item.update();
                if (item.isCharacter()) {
                    if (wasUpdated) {
                        this.emit('update', item);
                    }
                    if (!item.isAlive()) {
                        this.remove(item);
                        this.emit('death', item);
                    }
                }
            }
        }
    }
    toJSON() {
        const items = [];
        for (const [name, array] of this.items.entries()) {
            for (let index = 0; index < array.length; index++) {
                const item = array[index];
                const json = item.toJSON();
                items.push(json)
            }
        }
        return items;
    }
    add(item) {
        this.grid.addGridItem(item);

        let items = this.items.get(item.name);
        if (!items) { // not locked
            items = [];
            this.items.set(item.name, items);
        }

        items.push(item);

        this.emit('add', item);
    }
    remove(item) {
        this.grid.removeGridItem(item.x, item.y);
        this.emit('remove', item);

        const items = this.items.get(item.name);
        if (!items)
            return;
        const index = items.indexOf(item);
        items.splice(index, 1);

        if (items.length == 0)
            this.items.delete(item.name);

    }

    collect(x, y, character, item) {
        this.remove(item);
        if (item.isCollectable()) {
            if (item.value.hasWorth()) {
                item.value.updateStat(character.stats);
            }
        }
    }
    stage(x, y, character, item) {
        this.remove(item);
        if (item.hasNextStage()) {
            const nextItem = new item.stageClass(item.x, item.y, this.world);
            this.add(nextItem);
            return nextItem;
        }
        return false;
    }
    processStage(item) {
        if (item.hasNextStage()) {
            const nextItem = new item.stageClass(item.x, item.y, this.world);
            this.add(nextItem);
        }
    }
}