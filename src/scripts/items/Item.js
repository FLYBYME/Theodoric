import EventEmitter from '../lib/EventEmitter.js'

class Value {
    constructor(type, worth) {
        this.type = type;
        this.worth = worth;
    }
    hasWorth() {
        return this.worth > 0;
    }
    updateStat(stats) {
        if (!this.hasWorth()) return;
        stats[this.type] += this.worth;
        this.worth = 0;
    }
}

export default class Item extends EventEmitter {


    static uuid() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    constructor(x, y, world) {
        super();

        this.tileMapID = 38;
        this.tileMapImageSet = 'tiles'

        this.id = Item.uuid();
        //this.traversal = 0;

        this.value = null;

        this.x = x;
        this.y = y;

        this.world = world;

        this.width = 16;
        this.height = 16;
        this.scale = 2;

        this.empty = false;
        this.obstacle = false;
        this.collectable = false;
        this.bounds = false;
        this.character = false;

        this.sprite = null;

    }

    update() {


    }
    /****
     * 
     */
    toJSON() {
        let json = {};

        [
            'tileMapID',
            'tileMapImageSet',
            'id',
            'x',
            'y',
            'width',
            'height',
            'scale',
            'empty',
            'obstacle',
            'collectable',
            'bounds',
            'character',
            'name'
        ].forEach((key) => {
            json[key] = this[key];
        });

        return json;
    }
    /****
     * 
     */


    isObstacle() {
        return this.obstacle;
    }
    setAsObstacle(type, worth) {
        this.empty = false;
        this.obstacle = true;
        this.collectable = false;
        this.bounds = false;
        this.character = false;
    }

    isCollectable() {
        return this.collectable;
    }
    setAsCollectable(type, worth) {
        this.empty = false;
        this.obstacle = false;
        this.collectable = true;
        this.bounds = false;
        this.character = false;
        if (type)
            this.value = new Value(type, worth);
    }
    isEmpty() {
        return this.empty;
    }
    setAsEmpty() {
        this.empty = true;
        this.obstacle = false;
        this.collectable = false;
        this.bounds = false;
        this.character = false;
    }
    isBounds() {
        return this.bounds;
    }
    setAsBound() {
        this.empty = false;
        this.obstacle = true;
        this.collectable = false;
        this.bounds = true;
        this.character = false;
    }
    isCharacter() {
        return this.character;
    }
    setAsCharacter() {
        this.empty = false;
        this.obstacle = true;
        this.collectable = false;
        this.bounds = false;
        this.character = true;
    }
    setNextStage(stageClass) {
        this.stageClass = stageClass;
    }
    hasNextStage() {
        return !!this.stageClass
    }
    nextStage() {
        return new this.stageClass(this.x, this.y, this.world);
    }

}