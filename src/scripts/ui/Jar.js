import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class Jar extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'jar'
        
    }
    update(item) {
        super.update(item)
    }
}