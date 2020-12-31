import Item from './Item.js';

export default class Bounds extends Item {
    constructor(x, y) {
        super(x, y);
        this.setAsBound();
    }
}