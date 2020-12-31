import Item from './Item.js';

export default class Collectable extends Item {
    constructor(x, y, world) {
        super(x, y, world);
        this.setAsCollectable('health', 10);
        
    }
}