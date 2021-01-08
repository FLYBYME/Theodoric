import EventEmitter from './EventEmitter.js';
import neataptic from 'neataptic';


import Grid from './Grid.js';

import ItemManager from './ItemManager.js';
import Timer from './Timer.js';

import ActionManager from './actionManager.js';

import Items from '../items.js';
import AIManager from './aiManager.js';
import Neat from './Neat.js';
import Brain from './Brain.js';

let ids = 0;
export default class World extends EventEmitter {

    constructor(scene, size) {
        super();

        this.scene = scene;

        this.worldSize = size;
        this.grid = new Grid(this);

        this.characters = [];
        this.enemies = [];

        this.inputQue = [];

        this.itemManager = new ItemManager(this, Items);
        this.actionManager = new ActionManager(this);
        this.aiManager = new AIManager(this)
        this.neat = new Neat(49, 4, null, {
            mutation: [
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
        });

        this.brain = new Brain(this);

        this.collectableCount = 10;
        this.obstacleCount = 10;
        this.updateTimer = new Timer(0.01);
    }

    setup() {

        this.itemManager.on('add', (item) => this.emit('item:add', item.toJSON()))
        this.itemManager.on('remove', (item) => this.emit('item:remove', item.toJSON()))
        this.itemManager.on('death', (item) => this.emit('item:death', item.toJSON()))
        this.itemManager.on('update', (item) => this.emit('item:update', item.toJSON()))

        this.actionManager.on('action', (item) => this.emit('item:update', item.toJSON()))

        this.grid.generate();

        this.generateWorld();

        this.neat.createPool(this.neat.template);
        let item = this.itemManager.create('brain', 0, 0, true);
        item.id = this.brain.id;
        this.itemManager.add(item)
        let genome = this.neat.next()
        this.brain.setItem(item)
        this.brain.reset(genome)

        this.on('input', (input) => this.onInput(input))
        this.on('create', ({ type, x, y }) => this.itemManager.create(type, x, y))
        this.on('time:inc', () => this.updateTimer.setDelay(this.updateTimer.delay + 0.1))
        this.on('time:dic', () => this.updateTimer.setDelay(this.updateTimer.delay - 0.1))
    }
    loop() {

    }
    update() {

        //if (!this.updateTimer.ticked())
        //    return;
        //this.updateTimer.reset();

        if (!this.brain.item.stats.isAlive()) {
            let item = this.itemManager.create('brain', 0, 0, true);
            item.id = this.brain.id;
            this.itemManager.add(item)
            this.brain.genome.score = this.brain.item.stats.score;
            let genome = this.neat.next()
            this.brain.setItem(item)
            this.brain.reset(genome)
        }



        this.itemManager.update();
        this.actionManager.update();

        let input = this.brain.update();
        if (input)
            this.onInput(input)
    }
    onInput(input) {
        this.actionManager.onInput(input);
    }
    /*****
     * state
     */
    state() {
        const state = {
            worldSize: this.worldSize,
            collectableCount: this.collectableCount,
            obstacleCount: this.obstacleCount,
            items: this.itemManager.toJSON()
        };
        return state;
    }
    /*****
     * 
     */
    setCollectableCount(count) {
        this.collectableCount = count;
    }
    setObstacleCount(count) {
        this.obstacleCount = count;
    }
    generateWorld() {
        (() => {
            const location = this.grid.getRandomLocation();
            //this.itemManager.create('ghost-spawn', location.x, location.y);
        })();
        for (let index = 0; index < this.obstacleCount; index++) {
            const location = this.grid.getRandomLocation();
            this.generateObstacle(location);
        }
        for (let index = 0; index < this.collectableCount; index++) {
            const location = this.grid.getRandomLocation();
            this.generateCollectable(location);
        }
    }
    generateCollectable(location) {
        const type = this.randomArrayItem([
            'chest-closed', 'jar',
            'health-potion', 'stamina-potion', 'strength-potion',
        ]);
        const item = this.itemManager.create(type, location.x, location.y)
        return item;
    }
    generateObstacle(location) {
        const type = this.randomArrayItem([
            'tree', 'piller', 'shrub', 'fire', 'pine'
        ]);
        const item = this.itemManager.create(type, location.x, location.y);
        return item;
    }
    /*****
     * characters
     */
    createCharacter(x, y, _type, id) {
        console.log('createCharacter')

        const type = _type || this.randomArrayItem(['bob']);

        const character = this.itemManager.create(type, x, y);


        //this.characters.push(character);

        //this.emit('character:add', character);

        return character
    }
    randomArrayItem(array) {
        return array[Math.floor(Math.random() * array.length)]
    }
    fight(characterA, characterB) {
        const fightID = ids++;
        if (characterA.inFight() &&
            characterB.inFight() &&
            characterA.fight == characterB.fight) {

        }

    }
    /*****
     * items
     */

}