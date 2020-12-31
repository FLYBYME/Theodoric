import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class BrokenJar extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'brokenjar'
        
    }
    update(item) {
        super.update(item)
    }
}