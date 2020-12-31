import Bounds from '../objects/Bounds.js';
import Grass from '../objects/Grass.js';
import Item from '../objects/Item.js';

export default class Grid {
    constructor(size) {
        this.size = size;
        this.gridSize = 32;
        this.grids = Math.floor(this.size / this.gridSize);
        this.map = [];

    }

    generate() {
        let gridSize = this.gridSize;
        let grids = this.grids;
        for (var x = 0; x < grids; x++) {
            for (var y = 0; y < grids; y++) {
                var gridX = x * gridSize;
                var gridY = y * gridSize;

                this.map.push({ x: gridX, y: gridY, item: new Grass(gridX, gridY) });
            }
        }
    }

    addGridItem(setItem) {
        const { x, y } = setItem;
        let item = this.getGridItem(x, y).item;

        if (item.isBounds() || !item.isEmpty())
            return false;
        let index = this.getGridIndex(x, y);
        this.map[index].item = setItem;
        
        return true;
    }
    removeGridItem(x, y) {
        let item = this.getGridItem(x, y).item
        if (item.isBounds() || item.isEmpty())
            return false;
        let index = this.getGridIndex(x, y);
        //if (x == 0 && y == 0)console.trace()
        this.map[index].item = new Grass(x, y);
        return true;
    }

    getGridIndex(x, y) {
        let X = Math.floor(x / this.gridSize);
        let Y = Math.floor(y / this.gridSize);

        return X * this.grids + Y;
    }
    getGridItem(x, y) {

        if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
            return { x, y, item: new Bounds(x, y) };
        }

        let item = this.map[this.getGridIndex(x, y)];
        if (!item) {
            return { x, y, item: new Bounds(x, y) }
        }
        return item;
    }
    getRandomLocation() {
        let empty = this.map.filter((t) => t.item.isEmpty());
        let gridIndex = Math.floor(Math.random() * empty.length);
        let found = empty[gridIndex]
        if (!found)
            console.log(this.map, empty, gridIndex, found)

        return { x: found.x, y: found.y, item: found.item };
    }
}