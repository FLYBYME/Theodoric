export default class Timer {

    constructor(delay) {
        this.delay = delay;
        this.nextTick = Date.now();
        this.sim = false;
        this.ticks = 0;
    }
    setDelay(delay) {
        this.delay = delay
    }

    setAsSimulation() {
        this.sim = true;
    }
    hasTicked() {
        return this.ticked();
    }
    ticked() {

        if (this.sim)
            return this.ticks++ > this.delay;
        else
            return Date.now() > this.nextTick;
    }
    reset() {
        if (this.sim)
            this.ticks = 0;
        else
            this.nextTick = Date.now() + this.delay * 1000
    }
}