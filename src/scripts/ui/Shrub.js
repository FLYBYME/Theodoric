import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class Shrub extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'shrub'
        
    }
    update(item) {
        super.update(item)
    }
}