import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class OpenChest extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'openchest'
        
    }
    update(item) {
        super.update(item)
    }
}