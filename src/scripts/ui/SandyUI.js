import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class SandyUI extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'sandy';
        this.setFrame('left', 19);
        this.setFrame('right', 31);
        this.setFrame('up', 43);
        this.setFrame('down', 7);
    }
    update(item) {
        super.update(item)
    }
}