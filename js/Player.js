





class Player extends EventEmitter {
    constructor(sprite, grid, genome) {
        super();
        this.sprite = sprite;
        this.grid = grid;
        this.genome = genome;
        this.genome.score = 0;

        this.corpseSprite = 1;

        this.alive = true;
        this.failed = false;

        this.level = 1;

        this.gold = 0;
        this.health = 100;
        this.vitality = 100;
        this.strength = 25;
        this.speed = 125;
        this.moves = 0;
        this.moveBacks = 0;
        this.moveBlocked = 0;
        this.collectables = 0;

        this.start = Date.now();

        this.moveCoolDown = Date.now() + 100 - this.speed;

        this.lastX = this.x;
        this.lastY = this.y;

        this.sim = true;

    }
    get x() {
        return this.sprite.x;
    }
    get y() {
        return this.sprite.y;
    }
    set x(_) {
        return this.sprite.x = _;
    }
    set y(_) {
        return this.sprite.y = _;
    }

    isAlive() {
        return this.alive;
    }

    surroundings() {

        let x = this.x / this.grid.gridSize;
        let y = this.y / this.grid.gridSize;
        let grid = this.grid;

        let offset = 3;

        let lowX = x - offset;
        let lowY = y - offset;


        let highX = x + offset;
        let highY = y + offset;

        let MAX = grid.size / this.grid.gridSize

        let surroundings = [];

        for (let X = lowX; X < highX; X++) {
            for (let Y = lowY; Y < highY; Y++) {
                if (X < 0 || Y < 0 || X > MAX || Y > MAX) {
                    surroundings.push(Grid.BOUNDS);
                } else {
                    let gridLocation = grid.getGridItem(X * 32, Y * 32);
                    surroundings.push(gridLocation.item == Grid.GRASS ? Grid.GRASS : gridLocation.item);
                }
            }
        }

        return surroundings;
    }


    moveSprite(xDelta, yDelta) {

        if (this.x + xDelta == this.lastX && this.y + yDelta == this.lastY) {
            this.health -= 5;
            this.moveBacks++;
        } else {
            this.moves++;
        }

        this.lastX = this.x;
        this.lastY = this.y;
        this.grid.removeGridItem(this.x, this.y);
        this.x += xDelta;
        this.y += yDelta;
        this.grid.addGridItem(this.x, this.y, Grid.PLAYER);

        if (this.sim)
            this.moveCoolDown = Date.now() + (1000 - this.speed) / 5;

        //if (this.sim) console.log(`x: ${this.x} y: ${this.y}`)
        this.health--;

    }

    genomeActivate() {
        const inputs = this.surroundings().map((i) => i / Grid.MAX);
        let outputs = this.genome.activate(inputs)
        //console.log({ inputs, outputs })
        let bestIndex;
        let highest = 0;
        for (let index = 0; index < outputs.length; index++) {
            const conf = outputs[index];
            if (conf > highest) {
                bestIndex = index;
                highest = conf;
            }
        }
        if (bestIndex == 0) {
            return [32, 0];
        } else if (bestIndex == 1) {
            return [-32, 0];
        } else if (bestIndex == 2) {
            return [0, -32];
        } else if (bestIndex == 3) {
            return [0, 32];
        }
        return [0, 0]
    }

    score() {
        let time = (Date.now() - this.start) / 1000

        if (!this.sim)
            time = this.moves + this.moveBacks + this.moveBlocked + time;

        this.genome.score =
            //time +
            //this.gold +
            // this.vitality +
           //his.strength +
            this.moves;// +
           // -(this.moveBacks / 2) +
           // -(this.moveBlocked * 2) +
           // (this.collectables * 10);

        if (this.failed) this.genome.score = -1;
        if (this.sim)
            console.log(`player score: ${this.genome.score.toFixed(2)} t:${time.toFixed(2)}s m:${this.moves} mb:${this.moveBacks} mbl:${this.moveBlocked} C:${this.collectables} G:${this.gold}`)
    }

    death() {
        if (this.failed) {
            console.log(`genome failed`)
            const inputs = this.surroundings().map((i) => i / Grid.MAX);
            let outputs = this.genome.activate(inputs)
            console.log(inputs, outputs)
            this.gold = 0;
            this.health = 0;
            this.vitality = 0;
            this.strength = 0;
            this.speed = 0;
        }

        this.alive = false;

        this.grid.removeGridItem(this.x, this.y);
        this.score();
        this.emit('death');
        this.sprite.alive = false;
        this.sprite.destroy && this.sprite.destroy();
    }
    move(xDelta, yDelta) {


        if (!this.alive) {
            return false;
        }

        if (this.sim && Date.now() < this.moveCoolDown) return true;


        if (xDelta == undefined) {
            [xDelta, yDelta] = this.genomeActivate();
            if (xDelta == 0 && yDelta == 0) {
                this.failed = true;
                return this.death();
            }
        }

        let location = this.grid.getGridItem(this.x + xDelta, this.y + yDelta);


        switch (location.item) {
            case Grid.PLAYER:
            case Grid.GRASS:
                this.moveSprite(xDelta, yDelta);
                break;
            case Grid.GOLD:
                //
                this.gold += 10
                this.collectables++;
                this.emit('collect', location);
                this.moveSprite(xDelta, yDelta);
                break;
            case Grid.HEALTHPOTION:
                //
                this.health += 25;
                this.collectables++;
                this.emit('collect', location);
                this.moveSprite(xDelta, yDelta);
                break;
            case Grid.SPEEDPOTION:
                //
                this.speed += 10;
                this.collectables++;
                this.emit('collect', location);
                this.moveSprite(xDelta, yDelta);
                break;
            case Grid.STRENGTHPOTION:
                //
                this.strength += 10;
                this.collectables++;
                this.emit('collect', location);
                this.moveSprite(xDelta, yDelta);
                break;
            case Grid.VITALITYPOTION:
                this.vitality += 10;
                this.collectables++;
                this.emit('collect', location);
                this.moveSprite(xDelta, yDelta);
                break;
            case Grid.BOUNDS:
            case Grid.TREE:
                this.health = -10;
            //if (this.sim) console.log(`player hit health: ${this.health}`)
            default:
                this.moveBlocked++;
                //console.log('cant move')
                break;
        }
        //if (this.sim) console.log(`health: ${this.health} strength: ${this.strength} speed: ${this.speed} vitality: ${this.vitality} moves: ${this.moves} moveBacks: ${this.moveBacks} moveBlocked: ${this.moveBlocked}`)
        if (this.health < 0) {
            this.death();
        }
    }

}