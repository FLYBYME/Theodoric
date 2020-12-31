import Item from '../Item.js';

export default class WallBack extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 2;
        this.setAsObstacle();
        this.name = 'wallback';
    }
}