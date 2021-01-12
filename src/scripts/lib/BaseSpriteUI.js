
import EventEmitter from "events"


export default class BaseSpriteUI extends EventEmitter {

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
        if (item.frames) {
            Object.keys(item.frames).forEach((key) => this.frames[key] = item.frames[key])
        }

    }

    set(key, val) {
        this.item[key] = val;
    }
    get(type) {
        return this.item[type];
    }
    getFollow() {
        return this.sprite;
    }
    update(item) {
        if (item)
            this.item = item;

        if (this.sprite == null)
            return;

        if (this.item.direction != 'stop') {
            this.sprite.x = this.item.x;
            this.sprite.y = this.item.y;
            this.sprite.setFrame(this.getFrame(this.item.direction));
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