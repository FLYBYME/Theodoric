import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class Tree extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'tree'
        
    }
    update(item) {
        super.update(item)
    }
}