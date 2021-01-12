import EventEmitter from 'events'
import WorldMap from './WorldMap';

import maps from '../maps.js'
import TrainingWorker from './TrainingWorker';
import Worker from './file.worker.js';

export default class World extends EventEmitter {
    constructor() {
        super();
        this.maps = new Map();
        this.worker = new TrainingWorker(new Worker())

        this.on('reset-map', (name) => {
            const obj = this.maps.get(name)
            if (obj) {
                const map = obj.map;
                map.reset();
            }
        })
        this.on('input-map', (name, input) => {
            const obj = this.maps.get(name)

            if (obj) {
                const map = obj.map;
                map.onInput(input);
            }
        })
        this.on('load-map', (mapName, playerID, cb) => {
            const obj = this.maps.get(mapName)

            if (obj) {
                const map = obj.map;
                cb(map.id, map.grid.getAll().map((item) => item.toJSON()))
            } else {
                const config = maps.find((config) => config.name == mapName);
                if (!config)
                    return console.log(`no config found ${mapName}`);
                let map = world.loadMap({
                    ...config,
                    ...{ type: 'simulation' }
                });
                map.load(playerID);
                cb(map.id, map.grid.getAll().map((item) => item.toJSON()))
            }
        })
        this.on('train-map', (mapName, playerID, cb) => {
            const obj = this.maps.get(mapName)

            if (obj) {
                const map = obj.map;
                cb(map.id, map.grid.getAll().map((item) => item.toJSON()))
            } else {
                const config = maps.find((config) => config.name == mapName);
                if (!config)
                    return console.log(`no config found ${mapName}`);
                let map = world.loadMap({
                    ...config,
                    ...{ type: 'training' }
                });
                map.load(playerID);
                cb(map.id, map.grid.getAll().map((item) => item.toJSON()))
            }
        })
    }
    loadMap(config) {
        let name = config.name;

        const map = new WorldMap(config);

        this.maps.set(config.name, { map, config });

        this.attachMapEvents(map);

        map.setup();

        return map;
    }
    attachMapEvents(map) {

        const mapEmit = (event) => {
            return ({ mapID, x, y, item }) => {
                //console.log(event, mapID, x, y, item)
                this.emit(event, mapID, x, y, item.toJSON())
            }
        }

        map.on('add', mapEmit('map:add'));
        map.on('remove', mapEmit('map:remove'));
        map.on('update', ({ mapID, id, updates }) => {
            //console.log('map:update', mapID, id, updates)
            this.emit('map:update', mapID, id, updates)
        });




    }
}