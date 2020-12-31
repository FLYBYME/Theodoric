import Timer from '../lib/Timer.js';
import Item from '../items/Item.js'


class CharacterStats {
    constructor() {
        this.start = Date.now();
        this.end = Date.now();
        this.health = 100;
        this.stamina = 100;
        this.strength = 25;
        this.gold = 25;


        this.steps = {
            count: 0,
            back: 0,
            blocked: 0,
            history: []
        };
        this.staminaTimer = new Timer(1.5);
    }
    get score() {
        let time = (Date.now() - this.start) / 1000

        //if (!this.sim)
        // time = this.steps.count + this.steps.back + this.steps.blocked + time;

        let score =
            time +
            this.gold +
            this.stamina +
            this.strength +
            this.steps.count +
            -(this.steps.back / 2) +
            -(this.steps.blocked * 2);
        return score;
    }
    toJSON() {
        return {
            health: this.health,
            stamina: this.stamina,
            strength: this.strength,
            gold: this.gold,
            score: this.score,
            steps: this.steps
        }
    }
    update() {
        if (this.health == 0)
            return false;
        if (this.stamina < this.health && this.staminaTimer.ticked()) {

            this.effectStamina(1);
            this.staminaTimer.reset();
            return true;
        }
        return false;
    }

    effectStamina(val) {
        this.stamina += val
        if (this.stamina < 0) {
            this.effectHealth(this.stamina)
            this.stamina = 0;
        }
    }
    effectHealth(val) {
        this.health += val
        if (this.health < 0)
            this.health = 0;
    }

    stepStamina(traversal) {
        this.stamina--;
        if (this.stamina < 0) {
            this.stamina = 0;
            this.effectHealth(-1);
        }
    }

    addHistory(x, y) {
        this.steps.history.push(`${x}:${y}`)
    }
    step(x, y, traversal = 3) {
        this.addHistory(x, y);
        this.steps.count++;
        this.effectStamina(-traversal);
    }
    stepBlocked(x, y, traversal = 12) {
        this.addHistory(x, y);
        this.steps.blocked++;
        this.effectStamina(-traversal);
    }
    stepBack(x, y, traversal = 6) {
        this.addHistory(x, y);
        this.steps.back++;
        this.effectStamina(-traversal);
    }

    isAlive() {
        return this.health > 0;
    }
}


export default class Character extends Item {

    constructor(x, y, world, type, id) {
        super(x, y, world, type, id);
        super.setAsCharacter();

        this.name = type;

        if (id) this.id = id;

        this.lastX = this.x;
        this.lastY = this.y;

        this._direction = 'down'

        this.tileMapID = 4;
        this.tileMapImageSet = 'characters';

        this.stats = new CharacterStats();

        this.fight = null;

        this.timers = {
            move: new Timer(0.2)
        };

    }

    get direction() {
        return this._direction
    }
    set direction(v) {
        this._direction = v;
    }

    toJSON() {
        let json = super.toJSON();

        [
            'lastX',
            'lastY',
            'direction'
        ].forEach((key) => {
            json[key] = this[key];
        });
        json.stats = this.stats.toJSON();
        return json;
    }
    update() {
        return this.stats.update();
    }
    isAlive() {
        return this.stats.isAlive();
    }
    move(direction) {
        let x = 0;
        let y = 0;
        switch (direction) {
            case 'left':
                x -= 32;
                this.direction = direction;
                break;
            case 'right':
                x += 32;
                this.direction = direction;
                break;
            case 'up':
                y -= 32;
                this.direction = direction;
                break;
            case 'down':
                y += 32;
                this.direction = direction;
                break;

            default:
                return false;
        }

        let item = this.world.grid.getGridItem(this.x + x, this.y + y).item;

        if (item.isEmpty()) {
            this.takeStep(x, y, item);
            return true;
        }

        if (item.isCollectable() && item.value.hasWorth()) {
            //collect
            this.world.itemManager.collect(x, y, this, item);
            console.log('collect')
            if (!item.hasNextStage()) {
                this.takeStep(x, y, item);
                return true;
            }
        }
        if (item.hasNextStage()) {
            //fight
            console.log('stage')
            let nextItem = this.world.itemManager.stage(x, y, this, item);
            if (nextItem !== false)
                return !nextItem.hasNextStage() ||
                    !nextItem.isCollectable() ||
                    !nextItem.isObstacle();
        }
        if (item.isCharacter()) {
            //fight
            this.world.fight(this, item);
        } else {
            this.stats.stepBlocked(this.x + x, this.y + y, item.traversal);
        }

        return false;
    }

    takeStep(x, y, item) {
        const backStep = this.updateXY(x, y);
        if (backStep) this.stats.stepBack(this.x, this.y, item.traversal);
        else this.stats.step(this.x, this.y, item.traversal);
    }
    isBackStep(xDelta, yDelta) {
        return this.x + xDelta == this.lastX && this.y + yDelta == this.lastY;
    }
    setLastStep() {
        this.lastX = this.x;
        this.lastY = this.y;
    }

    updateXY(xDelta, yDelta) {

        const backStep = this.isBackStep(xDelta, yDelta);

        this.setLastStep();

        this.world.grid.removeGridItem(this.x, this.y);
        this.x += xDelta;
        this.y += yDelta;
        this.world.grid.addGridItem(this);

        return backStep;
    }

    inFight() {
        return this.fight !== null
    }
    setFight(fightID) {
        this.fight = fightID;
    }
}
