import Collectable from '../Collectable.js';
import Item from '../Item.js';

class BroeknJar extends Item {
    constructor(x, y, world) {
        super(x, y, world);

        this.tileMapID = 28;
        this.name = 'brokenjar'

        this.setAsCollectable('gold', 25);
    }
}


export default class Jar extends Item {
    constructor(x, y, world) {
        super(x, y, world);

        this.tileMapID = 27;
        this.name = 'jar'

        this.setNextStage(BroeknJar);
    }
}