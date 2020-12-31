import Item from '../Item.js';

export default class Wall extends Item {
    constructor(x, y) {
        super(x, y);
        this.tileMapID = 2;
        this.setAsObstacle();
        this.name = 'wall';
    }
}