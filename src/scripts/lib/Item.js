import EventEmitter from "events";
import items from "../items";
import CharacterStats from "./CharacterStats";
import uuid from "./uuid";

const names = {};
function hashCode(s) {
    for (var i = 0, h = ''; i < s.length; i++)
        h += s.charCodeAt(i);
    return h;
}

class ItemValue {
    constructor(type, worth) {
        this.type = type;
        this.worth = worth;
    }
    toJSON() {
        return {
            type: this.type,
            worth: this.worth
        }
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
    constructor(x, y, config) {
        super();
        this.config = config;
        this.name = config.name;

        this.x = x;
        this.y = y;

        this.id = uuid();
        this.direction = 'stop';

        this.updateEvents = [];
        this.updateCallerTimer = 0;

        if (!names[config.name]) {
            const index = items.findIndex((config) => config.name == this.name)
            names[config.name] = (index == -1 ? 0 : index) / items.length;
        }

        this.index = names[config.name];

        if (this.is('character') && this.is('stats')) {
            this.stats = new CharacterStats(this.get('stats'))
            this.stats.once('death', () => {
                // console.log('death');
                this.emit('remove');
            })
        }
        if (this.is('collectable') && this.is('value'))
            this.value = new ItemValue(config.value.type, config.value.worth);
    }

    updated(key, val) {

        this.updateEvents.push({ key, val })
        clearImmediate(this.updateCallerTimer)
        this.updateCallerTimer = setImmediate(() => {
            this.emit('update', [...this.updateEvents])
            this.updateEvents = [];
        })
    }

    set(key, val) {
        this.config[key] = val;
        this.updated('config', { key, val });
    }
    get(type) {
        return this.config[type];
    }
    is(type) {
        return !!this.config[type];
    }
    setDirection(direction) {
        if (this.direction != direction)
            this.updated('direction', direction);
        this.direction = direction;
    }

    setXY(x, y) {
        this.x = x;
        this.y = y;
        this.updated('xy', { x, y });
    }

    toJSON() {
        return Object.assign({}, this.config, {
            id: this.id,
            x: this.x,
            y: this.y,
            direction: this.direction,
            width: 16,
            height: 16,
            scale: 2,
            index: this.index,
            stats: this.stats ? this.stats.toJSON() : {}
        })
    }
    directionToXY(direction) {
        let x = 0;
        let y = 0;
        switch (direction) {
            case 'left':
                x -= 32;
                break;
            case 'right':
                x += 32;
                break;
            case 'up':
                y -= 32;
                break;
            case 'down':
                y += 32;
                break;
            default:
                break;
        }
        return { x, y };
    }

    stepBlocked() {
        return this.stats.stepBlocked()
    }


    takeStep(x, y, location) {

        const backStep = this.isBackStep(x, y);
        this.setLastStep();


        this.setXY(location.x, location.y);

        if (backStep)
            this.stats.stepBack(this.x, this.y, location.traversal);
        else
            this.stats.step(this.x, this.y, location.traversal);

        this.updated('stats', this.stats.toJSON());
    }
    isBackStep(x, y) {
        return this.x + x == this.lastX && this.y + y == this.lastY;
    }
    setLastStep() {
        this.lastX = this.x;
        this.lastY = this.y;
    }

    collect(x, y, location) {
        location.value.updateStat(this.stats);
        this.updated('stats', this.stats.toJSON());
    }
    stage(x, y) {
        const stageConfig = (this.get('stages') || [])[0];
        if (!stageConfig)
            return null;
        const config = items.find((config) => config.name == stageConfig.name);
        if (!config)
            return null;

        const stage = new Item(this.x, this.y, config);

        Object.keys(stageConfig).forEach((key) => {
            if (key == 'name' || key == 'delay')
                return;
            stage.set(key, stageConfig[key]);
        });

        return stage;
    }
    start() {
        if (this.is('obstacle')) {

        } else if (this.is('collectable')) {

        } else if (this.is('character')) {

        }
    }
}