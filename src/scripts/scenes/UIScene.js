import PhaserLogo from '../objects/phaserLogo'
import Bob from '../characters/Bob'
import AlignGrid from '../lib/AlignGrid';


import FpsText from '../objects/fpsText'
import ScoreText from '../objects/ScoreText'


import { createCharacterAnims } from '../anims/CharacterAnims';


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
        this.client = mainScene.client
        this.player = {};
        this.second = {};




        this.client.on('player', (item) => {
            this.updateStats('player', item)
        });
        this.client.on('second', (item) => {
            this.updateStats('second', item)
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
