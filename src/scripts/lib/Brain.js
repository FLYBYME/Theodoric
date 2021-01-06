
import EventEmitter from './EventEmitter.js';
import neataptic from 'neataptic';
import uuid from './uuid.js';


export default class Brain extends EventEmitter {
    constructor(world) {
        super();
        this.world = world;
        this.genome = null;
        this.item = null;
        this.complete = false;
        this.grid = [];
        this.id = uuid();
    }

    reset(genome, item) {
        this.complete = false;
        this.grid = [];
        this.genome = genome;
    }
    setItem(item) {
        this.item = item;
    }
    update() {
        if (this.complete || !this.item)
            return;

        let input = [];
        this.loopGrid(this.item, 3, (x, y, location) => {
            input.push(location.index)
        });
        let output = this.genome.activate(input).map((probability, index) => {
            return { probability, index }
        }).sort((a, b) => a.probability - b.probability).shift();


        let result = {
            id: this.id,
            direction: 'stop'
        }
        switch (output.index) {
            case 0:
                result.direction = 'left';
                break;
            case 1:
                result.direction = 'right';
                break;
            case 2:
                result.direction = 'up';
                break;
            case 3:
                result.direction = 'down';
                break;

            default:
                break;
        }

        //console.log(input, output, result)



        return result;
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

        for (let Y = lowY; Y < highY; Y++) {
            for (let X = lowX; X < highX; X++) {
                cb(X, Y, this.world.grid.getGridItem(X, Y).item);
            }
        }

    }

}
