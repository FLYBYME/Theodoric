import Item from '../Item.js';

export default class WallSide extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 1;
        this.setAsObstacle();
        this.name = 'wallside';
    }
}