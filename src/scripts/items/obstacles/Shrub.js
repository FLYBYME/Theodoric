import Item from '../Item.js';

export default class Shrub extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 20;
        this.setAsObstacle();
        this.name = 'shrub';

    }
}