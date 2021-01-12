
import EventEmitter from 'events';
import Neat from './Neat';


export default class Brain extends EventEmitter {

    static mapInputOut(direction) {
        let output = [0, 0, 0, 0]
        switch (direction) {
            case 'left':
                output[0] = 1;
                break;
            case 'right':
                output[1] = 1;
                break;
            case 'up':
                output[2] = 1;
                break;
            case 'down':
                output[3] = 1;
                break;

            default:
                break;
        }
        return output
    }
    static mapOutputInput(id, best) {
        let result = {
            id,
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
        return result
    }

    constructor(worldMap, config) {
        super();
        this.item = null;

        this.neat = null;

        this.worldMap = worldMap;
        this.config = config;

        this.best = {
            win: false,
            score: -Infinity,
            brain: null
        }

        this.timeout = 10;
        this.runningBest = false;
        this.runningSimulation = true;

        this.setupNeat()
    }

    stop() {
        this.runningSimulation = false;
    }
    start() {
        if (!this.runningSimulation) {
            this.runningSimulation = true;
            this.reset();
        }
    }

    setupNeat() {
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
                neataptic.methods.mutation.SUB_BACK_CONN,
                ...neataptic.methods.mutation.FFW
            ],
            popsize: 500,
            elitism: Math.round(0.1 * 500)
        });



        this.neat.createPool(this.neat.template);

        this.neat.population[this.neat.population.length - 1].train(JSON.parse(localStorage.getItem('training')), { error: 0.01 })
    }

    getOutput(brain, item) {
        const input = this.worldMap.grid.surroundings(item).map((item) => item.index);

        const output = brain
            .activate(input)
            .map((probability, index) => {
                return { probability, index }
            }).sort((a, b) => b.probability - a.probability);

        return output
    }
    mapInputOut(direction) {
        return Brain.mapInputOut(direction);
    }
    mapOutputInput(id, best) {
        return Brain.mapOutputInput(id, best);
    }

    setBrainScore(brainConfig, brain, item) {
        const score = brainConfig.score(item.stats);
        if (!this.runningBest)
            brain.score = score;
        if (score > this.best.score) {
            this.best.brain = brain;
            this.best.score = score;
            console.log(`new high score ${score}`)
        }
    }

    runStep(brainConfig, brain, item) {

        if (!this.runningSimulation)
            return;
        const win = item.stats[brainConfig.key] == brainConfig.val;
        if (!item.stats.isAlive()) {

            this.setBrainScore(brainConfig, brain, item);
            this.worldMap.reset();
            return
        } else if (win) {

            this.setBrainScore(brainConfig, brain, item);
            this.best.win = true;

            this.worldMap.reset();
            console.log('WIN!', this.best)
            return;
        }
        const output = this.getOutput(brain, item);
        const best = output[0];

        const result = this.mapOutputInput(item.id, best);
        this.worldMap.onInput({ id: result.id, direction: result.direction })

        setTimeout(() => this.runStep(brainConfig, brain, item), this.timeout)
    }
    watchItem(item) {

        if (!this.runningSimulation)
            return;

        //if (this.best.win)
        //    return;
        const brainConfig = this.config.brain;


        if (this.neat.readyToEvolve() && !this.runningBest) {
            this.timeout = 500;
            this.runningBest = true;
            return setImmediate(() => this.runStep(brainConfig, this.neat.getFittest(), item))
        }
        this.timeout = 10;
        this.runningBest = false;
        const brain = this.neat.next();

        setImmediate(() => this.runStep(brainConfig, brain, item))

    }
}