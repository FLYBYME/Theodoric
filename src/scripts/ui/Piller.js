import EventEmitter from "../lib/EventEmitter"
import BaseUI from "./BaseUI";


export default class Piller extends BaseUI {
    constructor(scene, item) {
        super(scene, item)
        this.name = 'piller'

    }
    update(item) {
        super.update(item)
    }
}