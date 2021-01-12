import EventEmitter from 'events';
import Brain from './Brain';

export default class BrainTrain extends EventEmitter {
    constructor(worldMap, config) {
        super();
        this.worldMap = worldMap;
        this.config = config;
        this.direction = 'stop'
    }
    waitOutput(item, input) {


        const onUpdate = (updates) => {
            let xy = updates.find((update) => update.key == 'xy')
            let direction = updates.find((update) => update.key == 'direction')
            if (direction) {
                this.direction = direction.val;
            }
            if (xy) {
                item.off('update', onUpdate)
                this.waitOutput(item, this.worldMap.grid.surroundings(item).map((item) => item.index));
                let output = Brain.mapInputOut(this.direction)
                console.log(input, output)
            }
        }

        item.on('update', onUpdate)
    }
    watchItem(item) {
        const grid = this.worldMap.grid;

        //const { x, y } = grid.randomLocation();

        // item.setXY(x, y);
        this.waitOutput(item, this.worldMap.grid.surroundings(item).map((item) => item.index))

    }
}