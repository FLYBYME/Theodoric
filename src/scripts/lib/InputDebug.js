import Text from "../objects/Text";

class NumberText extends Text {
    constructor(secne, x, y) {
        super(secne, x, y);
    }
    update(index) {
        this.setText(`${index}`)
    }
}

export default class InputDebug {
    constructor(secne, item) {
        this.secne = secne;
        this.world = secne.world;
        this.item = item;
        this.last = { x: 0, y: 0 };

        this.grid = [];

    }
    destroy() {
        for (let index = 0; index < this.grid.length; index++) {
            const element = this.grid[index];
            if (element) {
                element.destroy();
                element.text.destroy();
            }
        }
    }
    loopGrid(item, offset = 3, cb) {

        let grid = this.world.grid;

        let x = item.x / grid.gridSize;
        let y = item.y / grid.gridSize;

        let lowX = x - offset;
        let lowY = y - offset;


        let highX = x + offset + 1;
        let highY = y + offset + 1;

        let MAX = grid.size / grid.gridSize

        let i = 0;
        for (let Y = lowY; Y < highY; Y++) {
            for (let X = lowX; X < highX; X++) {
                this.grid[i] = cb(X, Y, this.grid[i]);
                i++;
            }
        }

    }
    drawGrid() {
        let cb = (x, y, rectangle) => {
            if (!rectangle) {
                rectangle = this.secne.add.rectangle(x * 32, y * 32, 32, 32);
                rectangle.setStrokeStyle(1, 0xefc53f);
                rectangle.setOrigin(0, 0)
                rectangle.text = new NumberText(this.secne, x * 32, y * 32);
                //rectangle.text.setOrigin(16, 16)
            }

            rectangle.x = x * 32;
            rectangle.y = y * 32;

            rectangle.text.x = x * 32;
            rectangle.text.y = y * 32;
            const item = this.world.grid.getGridItem(x * 32, y * 32).item;
            rectangle.text.update(item.index);

            return rectangle;
        }
        this.loopGrid(this.item, 3, cb);

    }
    update(item) {
        this.item = item;
        if (item.x != this.last.x || item.y != this.last.y) {
            this.last.x = item.x;
            this.last.y = item.y;

            this.drawGrid()

        }
    }
}