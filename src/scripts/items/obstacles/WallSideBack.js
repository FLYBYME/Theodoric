import Item from '../Item.js';

export default class WallSideBack extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 3;
        this.setAsObstacle();
        this.name = 'wallsideback';
    }
}