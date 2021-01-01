import CharacterStats from "./CharacterStats";
import EventEmitter from "./EventEmitter";
import uuid from "./uuid";

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
        this.config = conffig;

        this.id = uuid();

        if (config.value)
            this.value = new ItemValue(config.value.type, config.value.worth);
        if (config.stats)
            this.stats = new CharacterStats(config.stats);
    }

    is(type) {
        return !!this.config[type]
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
}