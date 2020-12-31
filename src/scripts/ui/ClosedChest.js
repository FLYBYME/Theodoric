import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class ClosedChest extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'closedchest'
        
    }
    update(item) {
        super.update(item)
    }
}