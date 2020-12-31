import Item from '../Item.js';

export default class Piller extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 19;
        this.setAsObstacle();
        this.name = 'piller';

    }
}