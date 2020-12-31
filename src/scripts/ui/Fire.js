import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class Fire extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'fire'

    }
    update(item) {
        super.update(item)
    }
}