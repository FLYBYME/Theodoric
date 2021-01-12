import EventEmitter from 'events'
import items from '../items';
import Brain from './Brain';
import BrainTrain from './BrainTrain';
import Grid from './Grid';
import Item from './Item';
import Neat from './Neat';
import uuid from './uuid';



const GrassConfig = items.find((config) => config.name == 'grass');

export default class WorldMap extends EventEmitter {
    constructor(config) {
        super();
        this.id = uuid();
        this.playerID = null;
        this.config = config;
        this.resetConfigs = [];

        this.traningSet = [];

        this.grid = new Grid({
            width: config.width,
            height: config.height
        });

        if (this.config.type == 'simulation')
            this.brain = new Brain(this, config)
        else if (this.config.type == 'training')
            this.brain = new BrainTrain(this, config)

    }

    setupTraning() {
        this.neat = new Neat(49, 4, null, {
            mutation_: [
                neataptic.methods.mutation.ADD_NODE,
                neataptic.methods.mutation.SUB_NODE,
                neataptic.methods.mutation.ADD_CONN,
                neataptic.methods.mutation.SUB_CONN,
                neataptic.methods.mutation.MOD_WEIGHT,
                neataptic.methods.mutation.MOD_BIAS,
                neataptic.methods.mutation.MOD_ACTIVATION,
                neataptic.methods.mutation.ADD_GATE,
                neataptic.methods.mutation.SUB_GATE,
                neataptic.methods.mutation.ADD_SELF_CONN,
                neataptic.methods.mutation.SUB_SELF_CONN,
                neataptic.methods.mutation.ADD_BACK_CONN,
                neataptic.methods.mutation.SUB_BACK_CONN
            ],
            popsize: 500,
            elitism: Math.round(0.1 * 500)
        })
        this.neat.createPool(this.neat.template);

        const nextBrain = () => {
            if (!this.config.win.brain) {
                this.config.win.brain = this.neat.next();
                this.config.win.brain.timmer = 0;
            }
            clearInterval(this.config.win.brain.timmer);

            this.config.win.brain = this.neat.next();
            this.config.win.brain.timmer = setInterval(() => {
                if (this.config.win.item) {
                    if (!this.config.win.item.stats.isAlive()) {
                        nextBrain()
                        this.reset();
                        return;
                    }
                    const input = this.grid.surroundings(this.config.win.item).map((item) => item.index);

                    const output = this.config.win.brain.activate(input).map((probability, index) => {
                        return { probability, index }
                    }).sort((a, b) => b.probability - a.probability);
                    const best = output[0];

                    if (output.find((a) => a.probability > 1 || a.probability < 0)) {

                        this.config.win.brain.score = -1
                        this.grid.remove(this.config.win.item.x, this.config.win.item.y);
                        nextBrain()
                        this.reset();
                        return// console.log('bad output', output)
                    }
                    //console.log(output)

                    let result = {
                        id: this.playerID,
                        direction: 'stop'
                    }
                    switch (best.index) {
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
                    this.onInput({ id: result.id, direction: result.direction })
                } else {
                    nextBrain()
                    this.reset();
                    return;
                }
                //this.onInput({ id, direction })
            }, 10)
        }

        this.on('score', (score, item) => {
            //console.log('score', score);
            nextBrain()
            this.reset();
        })
        nextBrain();
    }

    watchTraining(item) {

        const winConfig = this.config.win;
        winConfig.item = item;
        let removeCalled = false;
        const callRemove = () => {
            if (removeCalled)
                return;
            removeCalled = true;
            this.grid.remove(item.x, item.y);
            const score = winConfig.score(item.stats);
            if (winConfig.brain)
                winConfig.brain.score = score;
            this.emit('score', score, item);
            item.off('update', onUpdate)
            item.off('remove', onRemove)
        }

        const onUpdate = (updates) => {
            if (item.stats[winConfig.key] == winConfig.val) {
                callRemove();
            } else {

            }
        };
        const onRemove = () => {
            callRemove();
        };


        item.on('update', onUpdate)
        item.once('remove', onRemove)
    }

    load(playerID) {
        if (playerID)
            this.playerID = playerID;
        const layers = this.config.layers;
        let tileOffset = 1;

        let setPlayer = this.playerID == null;
        for (let index = 0; index < layers.length; index++) {
            if (index > 0)
                tileOffset += layers[index - 1].tilecount;
            const layer = layers[index];
            for (let i = 0; i < layer.data.length; i++) {
                const tileMapID = layer.data[i] - tileOffset;
                //if (tileMapID > 0)
                //    console.log(tileMapID, layer.name)
                const config = items.find((config) => config.tileMapID == tileMapID && config.tileMapImageSet == layer.name);

                if (config) {
                    const { x, y } = this.grid.index(i);
                    if (!config.obstacle) {
                        this.resetConfigs.push({ x, y, config })
                    }
                    setPlayer = this.addItemFromConfig(x, y, config, setPlayer)
                }
            }
        }
    }
    addItemFromConfig(x, y, config, setPlayer) {
        let item = new Item(x, y, config);
        if (!setPlayer && item.is('character')) {
            item.id = this.playerID;
            setPlayer = true;
            if (this.brain) {
                this.brain.watchItem(item);
            }
        }
        this.grid.add(item);
        return setPlayer;
    }
    setup() {
        this.attachGridEvents();



        this.emit('ready')
    }

    attachGridEvents() {
        const mapID = this.id;
        this.grid.on('add', (x, y, item) => {
            this.emit('add', { mapID, x, y, item });
        });
        this.grid.on('remove', (x, y, item) => {
            this.emit('remove', { mapID, x, y, item });
        });
        this.grid.on('update', (id, updates) => {
            this.emit('update', { mapID, id, updates });
        });
    }

    reset() {
        this.grid
            .getAll((item) => item.obstacle)
            .forEach((item) => this.grid.remove(item.x, item.y));

        let setPlayer = this.playerID == null;
        this.resetConfigs.forEach(({ x, y, config }) => setPlayer = this.addItemFromConfig(x, y, config, setPlayer))

    }

    onInput({ id, direction }) {
        let item = this.grid.getByID(id);
        if (false && item) {
            const input = this.grid.surroundings(item).map((item) => item.index);
            const output = this.brain.mapInputOut(direction);

            this.traningSet.push({
                input, output
            })
        }
        if (!item) {
            this.playerID = id;
            const props = this.resetConfigs.find((prop) => prop.config.name == 'bob');
            this.addItemFromConfig(props.x, props.y, props.config, false)
        }

        this.grid.move(id, direction);

    }
}