import EventEmitter from "./EventEmitter.js";


export default class ActionManager extends EventEmitter {
    constructor(world) {
        super();
        this.world = world;
        this.inputQue = [];
    }
    update() {
        while (this.inputQue.length > 0) {
            this.processInput(this.inputQue.shift());
        }
    }
    onInput(input) {
        const index = this.inputQue.findIndex((i) => input.id == i.id)
        if (index >= 0) {
            this.inputQue.splice(index, 1);
        }
        this.inputQue.push(input);
    }
    processInput(input) {
        let target = this.world.itemManager.getByID(input.id);
        if (target == false) {
            const { x, y } = this.world.grid.getRandomLocation()
            target = this.world.itemManager.create('bob', x, y, true)
            target.id = input.id;
            this.world.itemManager.add(target);
        }

        target.setDirection(input.direction);

        let { x, y } = this.directionToXY(input.direction);

        let location = this.world.grid.getGridItem(target.x + x, target.y + y).item;
        this.takeAction(x, y, target, location);
    }
    takeAction(x, y, target, location) {

        if (location.isCollectable() && location.value.hasWorth()) {
            //collect
            this.collect(x, y, target, location);
            if (location.removeOnCollect())
                this.world.itemManager.remove(location);
        }
        if (!location.isCharacter() && location.hasNextStage()) {
            const stage = this.stage(x, y, target, location);
            process.nextTick(() => this.takeAction(x, y, target, stage))
        }

        if (location.isCollectable() && location.removeOnCollect() && !location.hasNextStage()) {
            this.takeStep(x, y, target, location);
            setTimeout(() => {
                const newLocation = this.world.grid.getRandomLocation();
                this.world.itemManager.create(location.name, newLocation.x, newLocation.y);
            }, 1000);
        } else if (location.isEmpty()) {
            this.takeStep(x, y, target, location);
        } else {
            target.stats.stepBlocked(x, y);
        }
    }
    stage(x, y, target, location) {
        const config = location.getNextStage();
        this.world.itemManager.remove(location);
        const stage = this.world.itemManager.create(config.name, target.x + x, target.y + y);

        Object.keys(config).forEach((key) => {
            if (key == 'name' || key == 'delay')
                return;
            stage.set(key, config[key]);
        });

        return stage;
    }
    collect(x, y, target, location) {
        if (location.isCollectable())
            location.value.updateStat(target.stats);
    }
    takeStep(x, y, target, location) {
        const backStep = this.updateXY(x, y, target, location);
        if (backStep) target.stats.stepBack(target.x, target.y, location.traversal);
        else target.stats.step(target.x, target.y, location.traversal);

        this.emit('action', target)
    }
    isBackStep(x, y, target, location) {
        return target.x + x == target.lastX && target.y + y == target.lastY;
    }
    setLastStep(x, y, target, location) {
        target.lastX = target.x;
        target.lastY = target.y;
    }

    updateXY(x, y, target, location) {

        const backStep = this.isBackStep(x, y, target);

        this.setLastStep(x, y, target, location);

        this.world.grid.removeGridItem(target.x, target.y);
        target.x += x;
        target.y += y;
        this.world.grid.addGridItem(target);

        return backStep;
    }
    takeSktep(x, y, target, location) {
        target.setXY(target.x + x, target.y + y);
        this.emit('action', target)
    }
    directionToXY(direction) {
        let x = 0;
        let y = 0;
        switch (direction) {
            case 'left':
                x -= 32;
                break;
            case 'right':
                x += 32;
                break;
            case 'up':
                y -= 32;
                break;
            case 'down':
                y += 32;
                break;
            default:
                break;
        }
        return { x, y };
    }
}