import Item from '../items/Item.js'
import Character from './Character.js';


export default class Bob extends Character {

    constructor(x, y, world, type, id) {
        super(x, y, world, type, id);
    }

    update() {
        return super.update();
    }
}
