import Item from '../../objects/Item.js';

export default class Tree extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 38;
        this.setAsObstacle();
        this.name = 'tree';

    }
}