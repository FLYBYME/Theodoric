import EventEmitter from './EventEmitter.js'
import Grid from './Grid.js';
import Bob from '../characters/Bob.js'

import Obstacles from '../objects/obstacles/index.js'
import Collectables from '../objects/collectables/index.js'
import ItemManager from './ItemManager.js';
import Timer from './Timer.js';

let ids = 0;
export default class World extends EventEmitter {

    constructor(scene, size) {
        super();

        this.scene = scene;

        this.worldSize = size;
        this.grid = new Grid(size)


        this.characters = [];
        this.enemies = [];

        this.inputQue = [];

        this.itemManager = new ItemManager(this);

        this.collectableCount = 10;
        this.obstacleCount = 10;
        this.updateTimer = new Timer(0.1);
    }

    setup() {

        this.itemManager.on('add', (item) => this.emit('item:add', item.toJSON()))
        this.itemManager.on('remove', (item) => this.emit('item:remove', item.toJSON()))
        this.itemManager.on('death', (item) => this.emit('item:death', item.toJSON()))
        this.itemManager.on('update', (item) => this.emit('item:update', item.toJSON()))

        this.grid.generate();

        this.generateWorld();

        this.on('input', (input) => this.onInput(input))

    }
    update() {

        if (!this.updateTimer.ticked())
            return;

        this.updateTimer.reset();

        //this.updateCharacters();

        this.itemManager.update();


        //const bob = this.characters[0];
        //if (!bob)
        //    return;
        const bobs = this.itemManager.items.get('bob') || [];

        while (this.inputQue.length) {
            const input = this.inputQue.shift();
            let bob = bobs.find((bob) => bob.id == input.id)
            if (!bob) {
                const location = this.grid.getRandomLocation();
                bob = this.createCharacter(location.x, location.y, 'bob', input.id);

            }
            if (bob.move(input.direction)) {
                //console.log(bob, input)
                setTimeout(() => this.emit('item:move', bob.toJSON()), 10)
            }
        }


    }
    onInput(input) {
        const index = this.inputQue.findIndex((i) => input.id == i.id)
        if (index >= 0) {
            this.inputQue.splice(index, 1);
        }
        this.inputQue.push(input);
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

        for (let index = 0; index < this.obstacleCount; index++) {
            const location = this.grid.getRandomLocation();
            const item = new Obstacles.Tree(location.x, location.y, this);
            this.itemManager.add(item);
        }
        for (let index = 0; index < this.collectableCount; index++) {
            const location = this.grid.getRandomLocation();
            const item = new Collectables.Chest(location.x, location.y, this);
            this.itemManager.add(item);
        }


    }
    /*****
     * characters
     */
    createCharacter(x, y, type, id) {

        const character = new Bob(x, y, this, type, id);

        this.itemManager.add(character)

        this.characters.push(character);

        //this.emit('character:add', character);

        return character
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