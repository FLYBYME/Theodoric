
class Grid {
    constructor(size) {
        this.size = size;
        this.gridSize = 32;
        this.grids = Math.floor(this.size / this.gridSize);
        this.map = [];
    }

    static BOUNDS = 0;
    static GRASS = 1;
    static TREE = 2;
    static PLAYER = 3;
    static GOLD = 4;
    static HEALTHPOTION = 5;
    static VITALITYPOTION = 6;
    static SPEEDPOTION = 7;
    static STRENGTHPOTION = 8;
    static MAX = 9;

    generate() {
        let gridSize = this.gridSize;
        let grids = this.grids;
        for (var x = 0; x < grids; x++) {
            for (var y = 0; y < grids; y++) {
                var gridX = x * gridSize;
                var gridY = y * gridSize;
                this.map.push({ x: gridX, y: gridY, item: Grid.GRASS });
            }
        }
    }

    addGridItem(x, y, itemCode) {
        let item = this.getGridItem(x, y).item;
        if (item == Grid.BOUNDS || item !== Grid.GRASS)
            return false;
        let index = this.getGridIndex(x, y);
        this.map[index].item = itemCode;
        return true;
    }
    removeGridItem(x, y) {
        let item = this.getGridItem(x, y).item
        if (item == Grid.BOUNDS || item == Grid.GRASS)
            return false;
        let index = this.getGridIndex(x, y);
        this.map[index].item = Grid.GRASS
        return true;
    }

    getGridIndex(x, y) {
        let X = Math.floor(x / this.gridSize);
        let Y = Math.floor(y / this.gridSize);

        return X * this.grids + Y;
    }
    getGridItem(x, y) {

        if (x < 0 || y < 0 || x >= this.size || y >= this.size)
            return { x, y, item: Grid.BOUNDS };

        let item = this.map[this.getGridIndex(x, y)];
        if (!item) {
            return { x, y, item: Grid.BOUNDS }
        }
        return item;
    }
    getRandomLocation() {


        let empty = this.map.filter((t) => t.item == Grid.GRASS);
        let gridIndex = Math.floor(Math.random() * empty.length);
        let found = empty[gridIndex]
        if (!found)
            console.log(this.map, empty, gridIndex, found)

        return { x: found.x, y: found.y };
    }
}