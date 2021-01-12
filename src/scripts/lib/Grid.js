import EventEmitter from 'events'

import items from '../items.js'
import Item from './Item.js'

const BoundsConfig = items.find((config) => config.name == 'bounds');
const GrassConfig = items.find((config) => config.name == 'grass');



export default class Grid extends EventEmitter {
    constructor({ width, height }) {
        super();
        this.width = width;
        this.height = height;
        this.gridSize = 32;
        this.grids = Math.floor(this.size / this.gridSize);
        this.map = new Map();

    }

    index(index) {
        let y = Math.floor(index / this.width);
        let x = index - (y * this.width)
        return { x: x * this.gridSize, y: y * this.gridSize }
    }
    outOfBounds(x, y) {
        return x < 0 || y < 0 || x >= this.width * this.gridSize || y >= this.height * this.gridSize;
    }

    add(setItem) {
        const { x, y } = setItem;

        if (this.outOfBounds(x, y))
            return false;

        const key = `${x}${y}`;

        let item = this.map.get(key);

        if (item) {
            return false;
        }

        this.map.set(key, setItem);

        setItem.on('update', (updates) => this.emit('update', setItem.id, updates));
        setItem.once('remove', () => {
            // console.log('remove')
            setImmediate(() => {
                this.remove(setItem.x, setItem.y);
            });
        });

        this.emit('add', x, y, setItem);

        return true;
    }
    remove(x, y) {
        if (this.outOfBounds(x, y))
            return false;

        const key = `${x}${y}`;

        let item = this.map.get(key);

        if (!item)
            return false;

        this.map.delete(key);
        this.emit('remove', x, y, item);

        this.restoreTree(key);

        return true;
    }
    restoreTree(key) {
        let sourceTree = this.map.get(`${key}:tree`);

        if (Array.isArray(sourceTree)) {
            const swapItem = sourceTree.shift();
            if (!swapItem)
                return;
            this.map.set(key, swapItem);
            if (sourceTree.length == 0)
                this.map.delete(`${key}:tree`);
        }
    }
    swap(source, target) {
        const sourceKey = `${source.x}${source.y}`;
        const targetKey = `${target.x}${target.y}`;

        if (source.name == 'grass') {
            this.map.set(sourceKey, target);
            this.map.delete(targetKey);
            this.restoreTree(targetKey);
            return;
        }

        if (this.map.get(sourceKey) && this.map.get(targetKey)) {
            let sourceTree = this.map.get(`${sourceKey}:tree`);
            if (!sourceTree) {
                sourceTree = [];
                this.map.set(`${sourceKey}:tree`, sourceTree);
            }
            if (sourceTree.findIndex((s) => s.id == source.id) == -1) {
                sourceTree.push(source)
            }
            this.map.set(sourceKey, target);
            this.map.delete(targetKey);
            this.restoreTree(targetKey);

        }


    }
    clear() {
        this.getAll().forEach((item) => this.remove(item.x, item.y));
    }
    get(x, y) {
        const key = `${x}${y}`;

        let item = this.map.get(key);

        if (!item) {
            if (this.outOfBounds(x, y)) {
                item = new Item(x, y, BoundsConfig);
            } else {
                item = new Item(x, y, GrassConfig);
            }
        }

        return item;
    }

    getByID(id) {
        return this.getAll().find((item) => item.id == id);
    }
    getAll(filter) {
        const all = [...this.map.entries()].map(([key, item]) => item);

        if (filter)
            return all.filter(filter);

        return all;
    }

    randomLocation(i = 0) {
        if (i > 10)
            return new Item(x, y, BoundsConfig);

        const x = Math.floor(Math.random() * this.grids)
        const y = Math.floor(Math.random() * this.grids)

        const item = this.get(x, y);

        if (!item)
            return this.randomLocation(i++);
        else
            return item;
    }
    move(id, direction) {
        let item = this.getByID(id);

        if (!item)
            return;

        const { x, y } = item.directionToXY(direction);

        const location = this.get(item.x + x, item.y + y);

        if (location.is('bounds'))
            return item.stepBlocked();

        if (location.is('collectable') && location.value.hasWorth()) {
            item.collect(x, y, location)
            if (location.is('removeOnCollect')) {
                this.remove(location.x, location.y);
            }
            return;
        }

        if (location.is('empty')) {
            this.swap(location, item);
            item.takeStep(x, y, location);
            item.setDirection(direction);
            return;
        }

        const stage = location.get('stages') || [];
        if (stage.length > 0) {
            const stage = location.stage(x, y);
            if (stage) {
                this.remove(location.x, location.y);
                this.add(stage);
                return;
            }
        }
        item.stepBlocked(x, y);


    }
    surroundings(item, offset = 3) {

        let grid = this;
        let x = item.x / grid.gridSize;
        let y = item.y / grid.gridSize;

        let lowX = x - offset;
        let lowY = y - offset;


        let highX = x + offset + 1;
        let highY = y + offset + 1;

        let MAX = grid.size / grid.gridSize
        const surroundings = [];
        for (let Y = lowY; Y < highY; Y++) {
            for (let X = lowX; X < highX; X++) {
                let gridLocation = grid.get(X * 32, Y * 32);
                surroundings.push(gridLocation);

            }
        }

        return surroundings;
    }
}