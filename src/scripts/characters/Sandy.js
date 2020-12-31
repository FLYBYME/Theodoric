import Item from '../items/Item.js'
import Character from './Character.js';


export default class Sandy extends Character {

    constructor(x, y, world, type, id) {
        super(x, y, world, type, id);
        this.name = 'sandy';
        this.tileMapID = 7;
    }

    update() {
        return super.update();
    }
}
