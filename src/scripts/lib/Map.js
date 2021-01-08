import EventEmitter from './EventEmitter.js'
import Grid from './Grid.js';

import Items from '../items.js'


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
            if (ItemMap[`${element}`]) {

                let config = Items.find((config) => config.tileMapID == element);
                if (!config) {
                    config = Items.find((config) => config.name == 'grass');
                }
               // const item = this.world.itemManager.create(config.name)
                this.items.push({
                    x: x * 32,
                    y: y * 32,
                    config: config
                });
            }
        }
    }
}


