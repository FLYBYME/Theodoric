import Item from './Item.js';

export default class Door extends Item {
    constructor(x, y) {
        super(x, y);
        this.setAsEmpty();
        this.tileMapID = 48;
        this.traversal = 48;
        this.name = 'door';
    }
}