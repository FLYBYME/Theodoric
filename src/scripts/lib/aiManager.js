import EventEmitter from "./EventEmitte.js"
import Timer from "./Timer.js";


export default class AIManager extends EventEmitter {
    constructor(world) {
        super();
        this.world = world;
    }
    pickParentTarget(ai) {
        if (!ai.is('parent'))
            return;
        const parentID = ai.get('parent').id;
        const target = this.world.itemManager.getByID(parentID);
        return target;
    }
    pickRandomTarget(ai) {
        const all = this.world.itemManager.getAll((item) => item.isCharacter() && item != ai);

        if (all.length == 0)
            return;
        let index = Math.floor(Math.random() * all.length);
        return all[index];
    }
    pickRangeTarget(ai) {
        const rnage = at.get('targetRange');
    }
    pickTarget(ai) {
        const selectionType = ai.get('targetSelectionType') || 'random';

        switch (selectionType) {
            case 'parent':
                return this.pickParentTarget(ai);
            case 'random':
                return this.pickRandomTarget(ai);
            default:
                return this.pickRandomTarget(ai);
        }

    }
    targetLastPosition(ai, target) {
        let position = ai.get('targetPosition');
        if (!position) {
            position = {
                x: target.x,
                y: target.y
            };
            ai.set('targetPosition', position);
        }
        return position;
    }
    processAI(ai) {

        if (!ai.is('target')) {
            ai.set('target', this.pickTarget(ai));
        }
        const target = ai.get('target');
        if (!target)
            return ai.set('target', false);;
        const position = this.targetLastPosition(ai, target);


        if (!target.stats.isAlive())
            return ai.set('target', false);


        if (ai.is('targetTimed')) {
            let timer = ai.get('timer');
            if (!timer) ai.set('timer', timer = new Timer(1))
            if (timer.hasTicked()) {
                timer.reset()
                this.moveTarget(position, target, ai);
            }
        } else if (target.x != position.x || target.y != position.y) {
            this.moveTarget(position, target, ai);
        }

    }


    moveTarget(position, target, ai) {
        const targetingType = target.get('targetingType') || 'targetClosestPoint'

        let { x, y, direction } = this[targetingType](target, ai);

        //console.log(`x${x} y${y} direction: ${direction}`);

        ai.direction = direction;

        position.x = target.x;
        position.y = target.y;

        if (direction == 'stop') {
            return;

        }
        if (Math.floor(ai.stats.stamina) <= 1) {
            //console.log(`${ai.name} stamina to low`)
            return;
        }

        const location = this.world.grid.getGridItem(ai.x + x, ai.y + y).item;

        this.world.actionManager.takeAction(x, y, ai, location)
    }



    processTarget(target) {


        if (target.is('targetSpawn')) {
            if (!target.is('target')) {
                //find target
                const all = this.world.itemManager.getAll((item) => item.isCharacter() && item != target);

                if (all.length == 0)
                    return;
                let itemIndex = Math.floor(Math.random() * all.length);

                target.set('target', all[itemIndex]);
                target.set('timer', new Timer(1));

            }
            const parent = target.get('target');

            if (!parent)
                return target.set('target', false);

            if (!parent.stats.isAlive())
                return target.set('target', false);


            const timer = target.get('timer');
            let position = target.get('parentPosition');
            if (!position) {
                position = {
                    x: parent.x,
                    y: parent.y
                };
                target.set('parentPosition', position);
            }


            if (timer.hasTicked()) {
                timer.reset();
                this.moveTarget(position, parent, target);
            }

        }

        if (target.is('targetParent') && target.is('parent')) {
            const parentID = target.get('parent').id;
            const parent = this.world.itemManager.getByID(parentID);

            let position = target.get('parentPosition');
            if (!position) {
                position = {
                    x: parent.x,
                    y: parent.y
                };
                target.set('parentPosition', position);
            }


            if (parent.x != position.x || parent.y != position.y) {

                this.moveTarget(position, parent, target);
            }
        } else {

        }
    }

    targetParent() {

    }

    targetClosestPoint(parent, target) {

        const grid = this.world.grid;
        const points = [];

        const addPoint = (x, y, direction) => {
            const item = grid.getGridItem(target.x + x, target.y + y).item;
            points.push({
                x, y,
                distance: Phaser.Math.Distance.Between(parent.x, parent.y, target.x + x, target.y + y),
                direction: direction,
                isEmpty: parent == item ? true : item.isEmpty()
            });
        }

        addPoint(32, 0, 'right')
        addPoint(-32, 0, 'left')
        addPoint(0, 32, 'up')
        addPoint(0, -32, 'down')

        const best = points
            .filter((point) => point.isEmpty)
            .sort((a, b) => a.distance - b.distance)
            .shift();
        if (!best)
            return {
                x: 0, y: 0,
                direction: 'stop'
            }

        return best;
        //Phaser.Math.Distance.BetweenPoints
        return {
            direction: 'stop',
            x: 0, y: 0
        }
    }

    targetDirect(parent, target) {
        let x = 0;
        let y = 0;
        let direction = 'stop';
        if (parent.x > target.x) {
            x = 32;
            direction = 'right';
        } else if (parent.x < target.x) {
            x = -32
            direction = 'left';
        } else if (parent.y > target.y) {
            y = 32;
            direction = 'down';
        } else if (parent.y < target.y) {
            y = -32
            direction = 'up';
        }
        return {
            direction,
            x, y
        }
    }
}