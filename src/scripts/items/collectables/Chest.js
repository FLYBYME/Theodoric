import Collectable from '../Collectable.js';
import Item from '../Item.js';

class StageTest1 extends Item {
    constructor(x, y, world) {
        super(x, y, world);

        this.tileMapID = 35;
        this.name = 'openchest'

        this.setAsCollectable('gold', 10);
    }
}


export default class StageTest extends Item {
    constructor(x, y, world) {
        super(x, y, world);

        this.tileMapID = 36;
        this.name = 'closedchest'

        this.setNextStage(StageTest1);
    }
}