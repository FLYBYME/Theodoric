

import EventEmitter from "../lib/EventEmitter"


export default class BaseUI extends EventEmitter {

    constructor(scene, item) {
        super();
        this.sprite = null;
        this.scene = scene;
        this.item = item;

        this.id = item.id;

        this.name = 'base';

        this.frames = {
            stop: item.tileMapID,
        };

    }
    getFollow() {
        return this.sprite;
    }
    update(item) {
        this.item = item;

        if (this.sprite == null)
            return;

        if (item.direction != 'stop') {
            this.sprite.x = item.x;
            this.sprite.y = item.y;
            this.sprite.setFrame(this.getFrame(item.direction));
        }
    }
    createSprite() {
        if (this.sprite != null)
            return;

        const item = this.item;
        this.sprite = this.scene.add.tileSprite(
            item.x,
            item.y,
            item.width,
            item.height,
            item.tileMapImageSet,
            item.tileMapID
        );
        this.sprite.setScale(item.scale);
        this.sprite.setOrigin(0, 0);

        if (item.character) {
            this.sprite.setDepth(10);
        }

        this.sprite.id = item.id;
    }
    destroy() {
        this.sprite.destroy();
    }
    /****
     * 
     */
    setFrame(direction, val) {
        this.frames[direction] = val;
    }
    getFrame(direction) {
        if (this.frames.hasOwnProperty(direction))
            return this.frames[direction];
        else
            return this.frames.stop;
    }
}


