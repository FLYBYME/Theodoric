import Item from '../objects/Item.js';

export default class Bounds extends Item {
    constructor(x, y) {
        super(x, y);
        this.setAsBound();
    }
}