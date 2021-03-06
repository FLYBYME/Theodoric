import AlignGrid from '../lib/AlignGrid';

import ScoreText from '../objects/ScoreText'


export default class UIScene extends Phaser.Scene {


    constructor() {
        super({ key: 'UIScene' })
        this.offset = 9 * 32;
    }
    preload() {

    }

    updateStats(playerKey, item) {
        ['score', 'health', 'stamina', 'gold'].forEach((key, i) => {
            this[playerKey][key].update((item.stats[key] || 0).toFixed(2));
        });
        this[playerKey].steps.update(item.stats.steps.count);
        this[playerKey].loc.update(`X${item.x}:Y${item.y}`);
    }

    create(mainScene) {
        this.mainScene = mainScene;
        this.spriteManager = mainScene.spriteManager
        this.player = {};
        this.second = {};




        this.spriteManager.on('player', (sprite) => {
            this.updateStats('player', sprite.item)
        });
        this.spriteManager.on('second', (sprite) => {
            this.updateStats('second', sprite.item)
        });

        this.aGrid = new AlignGrid({
            scene: this,
            rows: 20,
            cols: 10
        });

        //this.aGrid.showNumbers();


        ['score', 'health', 'stamina', 'gold', 'steps', 'loc'].forEach((key, i) => {
            this.player[key] = new ScoreText(this, key);
            this.aGrid.placeAtIndex(100 + (i * 10), this.player[key]);
        });
        ['score', 'health', 'stamina', 'gold', 'steps', 'loc'].forEach((key, i) => {
            this.second[key] = new ScoreText(this, key);
            this.aGrid.placeAtIndex(105 + (i * 10), this.second[key]);
        });

    }

    update() {

    }
}
