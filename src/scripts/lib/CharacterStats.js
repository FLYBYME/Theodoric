import Timer from "./Timer.js";

export default class CharacterStats {
    constructor(stats) {
        this.start = Date.now();
        this.end = Date.now();
        this.health = 100;
        this.stamina = 100;
        this.strength = 25;
        this.gold = 25;

        this.values = stats

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