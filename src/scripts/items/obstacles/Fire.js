import Item from '../Item.js';

export default class Fire extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 60;
        this.setAsObstacle();
        this.name = 'fire';

    }
}