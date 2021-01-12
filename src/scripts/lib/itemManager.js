import EventEmitter from 'events'

import Item from './Item.js';

export default class ItemManager extends EventEmitter {

    constructor(world, configs) {
        super();
        this.world = world;
        this.items = new Map();
        this.configs = configs;
    }

    getByID(id) {
        for (const [name, items] of this.items.entries()) {
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                if (item.id == id)
                    return item;
            }
        }
        return false
    }
    getAll(filter) {
        const all = [];
        for (const [name, items] of this.items.entries()) {
            all.push(...items);
        }
        if (filter)
            return all.filter(filter);
        return all;
    }
    update() {
        for (const [name, items] of this.items.entries()) {
            for (let index = 0; index < items.length; index++) {
                const item = items[index];

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

    create(name, x, y, noAdd = false) {
        const config = this.configs.find((c) => c.name == name);

        if (!config)
            return null;

        const item = new Item(JSON.parse(JSON.stringify(config)));

        item.setXY(x, y)

        if (!noAdd)
            this.add(item);

        return item;
    }

    add(item) {
        this.world.grid.addGridItem(item);

        let items = this.items.get(item.name);
        if (!items) { // not locked
            items = [];
            this.items.set(item.name, items);
        }

        items.push(item);

        this.emit('add', item);
    }
    remove(item) {
        this.world.grid.removeGridItem(item.x, item.y);
        this.emit('remove', item);

        const items = this.items.get(item.name);
        if (!items)
            return;

        const index = items.indexOf(item);
        items.splice(index, 1);

        if (items.length == 0)
            this.items.delete(item.name);

    }

}