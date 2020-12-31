import Item from './Item.js';

export default class Grass extends Item {
    constructor(x, y) {
        super(x, y);
        this.setAsEmpty();
        this.traversal = 1;
        this.name = 'grass';
    }
}