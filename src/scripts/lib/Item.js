import CharacterStats from "./CharacterStats.js";
import EventEmitter from "./EventEmitter.js";
import uuid from "./uuid.js";

class ItemValue {
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
    constructor(config) {
        super();
        this.config = config;

        this.created = Date.now();

        this.x = 0;
        this.y = 0;
        this.direction = 'stop';

        this.id = uuid();

        if (config.value)
            this.value = new ItemValue(config.value.type, config.value.worth);
        if (config.stats)
            this.stats = new CharacterStats(config.stats);
    }
    get name() {
        return this.config.name;
    }
    set(key, val) {
        this.config[key] = val;
    }
    is(type) {
        return !!this.config[type];
    }
    isEmpty() {
        return this.is('empty');
    }
    isObstacle() {
        return this.is('obstacle');
    }
    isCollectable() {
        return this.is('collectable');
    }
    isCharacter() {
        return this.is('character');
    }
    isBounds() {
        return this.is('bounds');
    }
    hasNextStage() {
        return this.config.stages.length > 0
    }
    getNextStage() {
        return Object.assign({}, this.config.stages[0])
    }
    stageDelay() {
        if (this.hasNextStage()) {
            const stage = this.config.stages[0];
            return Date.now() > this.created + stage.delay
        } else {
            return false;
        }
    }

    removeOnCollect() {
        return this.is('removeOnCollect');
    }

    setDirection(direction) {
        this.direction = direction;
    }

    setXY(x, y) {
        this.x = x;
        this.y = y;
    }

    toJSON() {
        return Object.assign({
            id: this.id,
            x: this.x,
            y: this.y,
            direction: this.direction,
            width: 16,
            height: 16,
            scale: 2,
        }, this.config)
    }
}