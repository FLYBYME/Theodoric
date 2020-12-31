import EventEmitter from './EventEmitter.js'
import Grid from './Grid.js';

import Items from '../items/index.js'

const ItemMap = {
    '38': Items.Obstacles.Tree,
    '39': Items.Obstacles.Piller,
    '20': Items.Obstacles.Shrub,
    '60': Items.Obstacles.Fire,
    //
    '2': Items.Obstacles.Wall,
    '1': Items.Obstacles.WallSide,
    '3': Items.Obstacles.WallSideBack,
//
    '47': Items.Door,
}

export default class Map extends EventEmitter {

    constructor(data) {
        super();
        this.data = data;

        this.grid = new Grid(17 * 32);
        this.items = [];

    }

    converMapData() {
        const devider = 17;
        for (let index = 0; index < this.data.length; index++) {
            const element = this.data[index];
            let x = Math.floor(index / devider);
            let y = index - x * devider;
            console.log(element, !!ItemMap[`${element}`])
            if (ItemMap[`${element}`])
                this.items.push({
                    x: x * 32,
                    y: y * 32,
                    item: ItemMap[`${element}`]
                });
        }
    }
}


