import Item from "../items/Item";
import EventEmitter from "./EventEmitter"


export default class ItemLoader extends EventEmitter {
    constructor() {
        super(config);
        this.config = config;
        this.items = {};
    }

    load() {
        for (let index = 0; index < this.config.length; index++) {
            const itemConfig = this.config[index];

            this.items[itemConfig.name] = (x, y) => {
                const item = new Item(x, y);

                item.name = itemConfig.name;
                item.tileMapID = itemConfig.tileMapID;
                item.tileMapImageSet = itemConfig.tileMapImageSet;

                if (itemConfig.obstacle) {
                    item.setAsObstacle();
                } else if (itemConfig.empty) {
                    item.setAsEmpty();
                } else if (itemConfig.collectable) {
                    if (itemConfig.value)
                        item.setAsCollectable(itemConfig.value.type, itemConfig.value.worth);
                    else
                        item.setAsCollectable();
                } else if (itemConfig.character) {
                    item.setAsCharacter();


                    
                }

                return item;
            }

        }
    }
}