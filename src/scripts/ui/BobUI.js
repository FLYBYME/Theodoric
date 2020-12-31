import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class BobUI extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'bob'
        this.setFrame('left', 16);
        this.setFrame('right', 28);
        this.setFrame('up', 40);
        this.setFrame('down', 4);
    }
    update(item) {
        super.update(item)
    }
}