
let sim;


class SimulationState {
    constructor(config) {

    }
    create() {
        sim = this;
        this.worldSize = 32 * 7;

        this.trainingEnabled = false;
        this.aiEnabled = true;

        this.evolveEnabled = false;

        this.genomes = [];
        this.genomeIndex = 0;

        this.game.world.setBounds(0, 0, this.worldSize, this.worldSize);

        this.background = this.game.add.tileSprite(0, 0, this.worldSize, this.worldSize, 'tiles', 65);
        this.background.scale.setTo(2);

        this.obstacles = this.add.group();
        this.obstacles.enableBody = true;


        this.collectables = this.game.add.group();
        this.collectables.enableBody = true;
        this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

        this.mainPlayer = null


        this.corpses = this.game.add.group();

        this.players = this.add.group();
        this.players.enableBody = true;
        this.players.physicsBodyType = Phaser.Physics.ARCADE;

        this.maps = maps.slice(0);

        this.simulation = new Simulation({
            size: 32 * 7,
            map: this.maps[2]
        });

        this.setupSimulation();

        setTimeout(() => {
            this.createPlayer();
            //this.enableEvolution();
        }, 1000)

    }
    update(time, delta) {


        if (this.mainPlayer == null)
            return;

        let inputs = this.trackInputs();

        if (this.aiEnabled) {
            this.mainPlayer.move();
        } else if (inputs.moved) {

            if (this.trainingEnabled) {

                this.captureTrainingData(inputs);
            }
            this.mainPlayer.move(inputs.x * 32, inputs.y * 32);

        }


    }
    render() {

    }
    /****
     * simulation
     */
    setupSimulation() {

        this.simulation.setupWorker()


        this.simulation.on('add-player', (location) => this.addPlayer(location));
        this.simulation.on('remove-player', (location) => this.removePlayer(location));
        this.simulation.on('move-player', (oldLocation, newLocation) => this.movePlayer(oldLocation, newLocation));


        this.simulation.on('add-obstacle', (location) => this.addObstacle(location));
        this.simulation.on('remove-obstacle', (location) => this.removeObstacle(location));

        this.simulation.on('add-collectable', (location) => this.addCollectable(location));
        this.simulation.on('remove-collectable', (location) => this.removeCollectable(location));

        this.simulation.grid.generate();
        this.simulation.resetNeat();
        this.simulation.resetObstacles();
        this.simulation.resetCollectables();
        if (localStorage.getItem('train')) {
            this.simulation.setTraingingData(JSON.parse(localStorage.getItem('train')));
            this.simulation.worker.call('train:addSet', this.simulation.trainingSet)
        }

    }
    /****
     * training stuff
     */
    enableEvolution() {
        if (this.evolveEnabled) return;
        this.evolveEnabled = true;
        this.loopEvolve()
    }
    disableEvolution() {
        this.evolveEnabled = false;
    }

    loopEvolve() {
        if (!this.evolveEnabled) return;
        this.simulation.worker.call('sim:evolve', {}).then(({ genomes, map }) => {
            localStorage.setItem('best', JSON.stringify(genomes))

            this.genomes = genomes.map((g) => {
                const genome = neataptic.Network.fromJSON(g);
                genome.score = 0;
                return genome;
            });

            this.simulation.neat.population = this.genomes;

            this.simulation.resetNeatIndex();

            this.mainPlayer.genome = this.genomes[0];

            console.log(`new genome with score: ${this.mainPlayer.genome.score} resetting map ${map}`);

            this.reset(maps[map]);

            this.loopEvolve()
        })
    }
    /*****
     * loop stuff
     */
    reset(map) {
        if (this.mainPlayer !== null) this.mainPlayer.death();
        console.log('reset')

        if (!map) {
            map = this.maps.shift();
            this.maps.push(map);
        }

        this.simulation.map = map;
        this.simulation.clearGrid();
        this.simulation.resetObstacles();
        this.simulation.resetCollectables();
    }
    captureTrainingData(inputs) {
        const player = this.mainPlayer;
        const surroundings = player.surroundings().map((i) => i / Grid.MAX)
        const grid = this.simulation.grid;

        const getlocationOK = (x, y) => {
            const item = grid.getGridItem(x, y).item;

            if (item == Grid.BOUNDS || item == Grid.TREE)
                return 0;
            if (item == Grid.GRASS)
                return 0.5
            return 0.9;
        }

        let right = getlocationOK(player.x + 32, player.y)
        let left = getlocationOK(player.x - 32, player.y)
        let down = getlocationOK(player.x, player.y + 32)
        let up = getlocationOK(player.x, player.y - 32)


        let item = {
            input: surroundings,
            output: [
                inputs.x > 0 ? 1 : right,
                inputs.x < 0 ? 1 : left,
                inputs.y > 0 ? 1 : down,
                inputs.y < 0 ? 1 : up
            ]
        }
        this.simulation.worker.call('train:appendSet', item)
        this.simulation.trainingSet.push(item);

        console.log(inputs, item.output)
    }
    trackInputs() {

        let [x, y] = [0, 0];
        let moved = false

        if (this.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)) {
            this.aiEnabled = !this.aiEnabled;
            console.log(`${!this.aiEnabled ? 'stopping' : 'starting'} AI BOB`)
        }
        if (this.input.keyboard.justPressed(Phaser.Keyboard.T)) {
            this.trainingEnabled = !this.trainingEnabled;
            console.log(`${!this.trainingEnabled ? 'stopping' : 'starting'} training`)
            if (!this.trainingEnabled) {
                localStorage.setItem('train', JSON.stringify(this.simulation.trainingSet))
            }
        }
        if (this.input.keyboard.justPressed(Phaser.Keyboard.R)) {
            console.log('restart')
            this.reset();
        }


        if (this.input.keyboard.justPressed(Phaser.Keyboard.LEFT)) {
            x -= 1;
            moved = true;
        } else if (this.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)) {
            x += 1;
            moved = true;
        }

        if (this.input.keyboard.justPressed(Phaser.Keyboard.UP)) {
            y -= 1;
            moved = true;
        } else if (this.input.keyboard.justPressed(Phaser.Keyboard.DOWN)) {
            y += 1;
            moved = true;
        }
        return {
            x, y,
            moved
        }
    }
    /***
     * Player
     */
    createPlayer() {
        let { x, y } = this.simulation.grid.getRandomLocation();


        let sprite = this.players.create(x, y, 'characters');

        // Loop through frames 3, 4, and 5 at 10 frames a second while the animation is playing
        sprite.animations.add('down', [3, 4, 5], 10, true);
        sprite.animations.add('left', [15, 16, 17], 10, true);
        sprite.animations.add('right', [27, 28, 29], 10, true);
        sprite.animations.add('up', [39, 40, 41], 10, true);
        sprite.animations.play('down');
        sprite.scale.setTo(2);

        // Enable player physics;
        this.game.physics.arcade.enable(sprite);
        sprite.body.collideWorldBounds = true
        sprite.alive = true;

        const player = this.simulation.createPlayer(sprite);

        //console.log(`creating player ${player.x}:${player.y}`)

        if (this.mainPlayer == null || !this.mainPlayer.isAlive()) {
            this.mainPlayer = player;
            this.game.camera.follow(sprite);
            player.once('death', () => setTimeout(() => {
                this.simulation.resetCollectables();
                this.createPlayer();
            }, 1500))
        }


        return player;
    }
    addPlayer(location) {

    }
    removePlayer(location) {
        this.players.remove(location.sprite)
        var corpse = this.corpses.create(location.x, location.y, 'dead')
        corpse.scale.setTo(2);
        corpse.animations.add('idle', [1], 0, true);
        corpse.animations.play('idle');
        corpse.lifespan = 3000;
    }
    movePlayer(oldLocation, newLocation) {

    }

    /***
     * Collectable
     */
    addCollectable(location) {
        if (location.item == Grid.GOLD) {
            this.generateChest(location);
        } else if (location.item == Grid.HEALTHPOTION) {
            this.generateHealthPotion(location);
        } else if (location.item == Grid.VITALITYPOTION) {
            this.generateVitalityPotion(location);
        } else if (location.item == Grid.STRENGTHPOTION) {
            this.generateStrengthPotion(location);
        } else if (location.item == Grid.SPEEDPOTION) {
            this.generateSpeedPotion(location);
        }
    }
    removeCollectable(location) {
        let collectable = this.collectables.getAll().find((collectable) => collectable.x == location.x && collectable.y == location.y);
        if (collectable) collectable.destroy();
    }

    generateChest(location) {

        var collectable = this.collectables.create(location.x, location.y, 'things');
        collectable.scale.setTo(2);
        collectable.animations.add('idle', [6], 0, true);
        collectable.animations.add('open', [18, 30, 42], 10, false);
        collectable.animations.play('idle');
        collectable.name = Grid.GOLD
        collectable.value = 1;//Math.floor(Math.random() * 150);

        return collectable;
    }
    generateHealthPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [0], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.HEALTHPOTION;
        collectable.scale.setTo(2);
        return collectable;
    }

    generateVitalityPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [2], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.VITALITYPOTION;
        collectable.scale.setTo(2);
        return collectable;
    }

    generateStrengthPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [3], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.STRENGTHPOTION;
        collectable.scale.setTo(2);
        return collectable;
    }

    generateSpeedPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [4], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.SPEEDPOTION;
        collectable.scale.setTo(2);
        return collectable;
    }
    /***
     * Obstacle
     */
    addObstacle(location) {
        let spriteIndex = Math.floor(Math.random() * 10);
        this.generateObstacle(location, spriteIndex);
    }
    removeObstacle(location) {
        let obstacle = this.obstacles.getAll().find((obstacle) => obstacle.x == location.x && obstacle.y == location.y);
        if (obstacle) obstacle.destroy();
    }

    generateObstacle({ x, y }, spriteIndex) {

        let obstacle = this.obstacles.create(x, y, 'tiles');

        if (spriteIndex === 0) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 1) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 2) {
            obstacle.animations.add('shrub', [20], 0, true);
            obstacle.animations.play('shrub');
        } else if (spriteIndex === 3) {
            obstacle.animations.add('pine', [30], 0, true);
            obstacle.animations.play('pine');
        } else if (spriteIndex === 4) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 5) {
            obstacle.animations.add('column', [39], 0, true);
            obstacle.animations.play('column');
        } else if (spriteIndex === 6) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 7) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 8) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 9) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        }
        obstacle.scale.setTo(2);
        obstacle.body.setSize(8, 8, 4, -2);
        obstacle.body.moves = false;

        return obstacle;
    }
}
class SimulationStateA {
    constructor(config) {

    }
    create() {
        sim = this;
        this.worldSize = 32 * 16;

        this.collectablesCount = 25;
        this.obstacleCount = 50;

        this.ai = false;
        this.trainingSet = [];
        this.trainingEnabled = false;
        if (localStorage.getItem('train')) {
            this.trainingSet = JSON.parse(localStorage.getItem('train'))
        }

        this.grid = new Grid(this.worldSize);
        this.gridMap = new Map();

        this.replayGenomes = neat.population.slice(0, 1);

        this.game.world.setBounds(0, 0, this.worldSize, this.worldSize);

        this.background = this.game.add.tileSprite(0, 0, this.game.world.width / 2, this.game.world.height / 2, 'tiles', 65);
        this.background.scale.setTo(2);

        this.obstacles = this.add.group();
        this.obstacles.enableBody = true;


        this.collectables = this.game.add.group();
        this.collectables.enableBody = true;
        this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

        this.players = this.add.group();

        // Enable physics in them
        this.players.enableBody = true;
        this.players.physicsBodyType = Phaser.Physics.ARCADE;
        //grid
        this.grid.generate();
        //obstacles
        this.generateObstacles();
        //
        this.generateCollectables();
        //
        this.corpses = this.game.add.group();
        //players
        sim.player = this.createPlayer();


        this.game.camera.follow(this.players.getFirst());

    }
    update(time, delta) {
        if (this.players.getFirst()) {
            const player = this.players.getFirst().player;
            let moved = false;

            let x = 0;
            let y = 0;



            if (this.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)) {

                this.ai = !this.ai;
                console.log(`${!this.ia ? 'stopping' : 'starting'} AI BOB`)
            }
            if (this.input.keyboard.justPressed(Phaser.Keyboard.T)) {
                this.trainingEnabled = !this.trainingEnabled;
                console.log(`${!this.trainingEnabled ? 'stopping' : 'starting'} training`)
                if (!this.trainingEnabled) {
                    localStorage.setItem('train', JSON.stringify(this.trainingSet))
                }
            }
            if (this.input.keyboard.justPressed(Phaser.Keyboard.R)) {
                console.log('restart')
                return player.death();
            }


            if (this.ai)
                return player.move();

            if (this.input.keyboard.justPressed(Phaser.Keyboard.LEFT)) {
                x -= 1;
                moved = true;
            } else if (this.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)) {
                x += 1;
                moved = true;
            }

            if (this.input.keyboard.justPressed(Phaser.Keyboard.UP)) {
                y -= 1;
                moved = true;
            } else if (this.input.keyboard.justPressed(Phaser.Keyboard.DOWN)) {
                y += 1;
                moved = true;
            }




            if (moved) {

                if (this.trainingEnabled) {
                    this.trainingSet.push({
                        input: player.surroundings().map((i) => i / Grid.MAX),
                        output: [
                            x > 0 ? 1 : 0,
                            x < 0 ? 1 : 0,
                            y > 0 ? 1 : 0,
                            y < 0 ? 1 : 0
                        ]
                    })
                }

                let didMove = player.move(x * 32, y * 32)
            }
        }
    }
    render() {

    }

    restart() {




        this.collectables.getAll().forEach((c) => {
            this.grid.removeGridItem(c.x, c.y)
            c.destroy()
        });
        this.generateCollectables()

        this.player = this.createPlayer();

        this.game.camera.follow(this.player.sprite);

    }
    /***
     * train
     */
    train() {
        this.webWorker.postMessage(JSON.stringify({
            cmd: 'train',
            trainingSet: this.trainingSet
        }));
    }
    /****
     * sim run
     */
    onWorkerScores(scores) {
        for (let index = 0; index < neat.population.length; index++) {
            neat.population[index].score = scores[index];
        }
    }
    workerStartNetwork() {

        this.webWorker.postMessage(JSON.stringify({
            cmd: 'start'
        }));
    }
    worker() {

        this.webWorker = new Worker('/js/SimulationWorker.js');

        this.webWorker.addEventListener('message', (e) => {
            let data = JSON.parse(e.data);
            switch (data.cmd) {
                case 'beset':

                    this.replayGenomes = data.population;
                    break;
                case 'train-result':
                    console.log(data)
                    break;
                default:
            };
        }, false);
        this.webWorker.addEventListener('error', () => {

        }, false);
        // this.workerStartNetwork()
    }

    simulate(genome) {

        let self = this;


        const grid = new Grid(this.worldSize);
        grid.generate();

        let { x, y } = this.grid.getRandomLocation();
        const player = new Player({
            x, y,
            destroy: () => {

            }
        }, grid, genome)

        grid.addGridItem(x, y, Grid.PLAYER);


        for (var i = 0; i < this.obstacleCount; i++) {
            let location = grid.getRandomLocation();
            grid.addGridItem(location.x, location.y, Grid.TREE)
        }

        for (var i = 0; i < this.obstacleCount; i++) {
            let location = grid.getRandomLocation();
            let rnd = Math.random();
            if (rnd >= 0 && rnd < .1) {
                grid.addGridItem(location.x, location.y, Grid.GOLD)
            } else if (rnd >= 0.1 && rnd < .7) {
                grid.addGridItem(location.x, location.y, Grid.HEALTHPOTION)
            } else if (rnd >= .7 && rnd < .8) {
                grid.addGridItem(location.x, location.y, Grid.SPEEDPOTION)
            } else if (rnd >= .8 && rnd < .9) {
                grid.addGridItem(location.x, location.y, Grid.STRENGTHPOTION)
            } else if (rnd >= .9 && rnd < 1) {
                grid.addGridItem(location.x, location.y, Grid.VITALITYPOTION)
            }
        }

        player.once('death', () => {
            console.log('death')
            //setTimeout(() => this.simulate(genome), 1000)
        });

        player.on('collect', (x, y) => {
            console.log('collect', x, y)
        });

        while (player.isAlive()) {
            player.move();
        }

    }

    /****
     * Players
     */
    createPlayer() {
        // let { x = 64, y = 256 } = {}
        let { x, y } = this.grid.getRandomLocation();
        if (!this.grid.addGridItem(x, y, Grid.PLAYER))
            return false;

        //console.log(`creating player ${x}:${y}`)
        let sprite = this.players.create(x, y, 'characters');

        // Loop through frames 3, 4, and 5 at 10 frames a second while the animation is playing
        sprite.animations.add('down', [3, 4, 5], 10, true);
        sprite.animations.add('left', [15, 16, 17], 10, true);
        sprite.animations.add('right', [27, 28, 29], 10, true);
        sprite.animations.add('up', [39, 40, 41], 10, true);
        sprite.animations.play('down');
        sprite.scale.setTo(2);

        // Enable player physics;
        this.game.physics.arcade.enable(sprite);
        sprite.body.collideWorldBounds = true
        sprite.alive = true;

        let genome = this.replayGenomes.shift();
        this.replayGenomes.push(genome)

        sprite.player = new Player(sprite, this.grid, genome);

        sprite.player.once('death', () => this.deathHandler(sprite.player))
        sprite.player.on('collect', (x, y) => this.removeCollectable(x, y))

        return sprite.player
    }

    deathHandler(player) {
        //console.log(`creating corpse ${player.x}:${player.y}`)
        var corpse = this.corpses.create(player.x, player.y, 'dead')
        corpse.scale.setTo(2);
        corpse.animations.add('idle', [player.corpseSprite], 0, true);
        corpse.animations.play('idle');
        corpse.lifespan = 100;

        setTimeout(() => this.restart(), 10)
    }

    /*****
     * Obstacles
     */

    generateObstacles() {
        for (var i = 0; i < this.obstacleCount; i++) {
            var point = this.grid.getRandomLocation();
            var spriteIndex = Math.floor(Math.random() * 10);
            this.generateObstacle(point, spriteIndex);
        }
    }

    generateObstacle({ x, y }, spriteIndex) {
        if (!this.grid.addGridItem(x, y, Grid.TREE))
            return false;
        let obstacle = this.obstacles.create(x, y, 'tiles');

        if (spriteIndex === 0) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 1) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 2) {
            obstacle.animations.add('shrub', [20], 0, true);
            obstacle.animations.play('shrub');
        } else if (spriteIndex === 3) {
            obstacle.animations.add('pine', [30], 0, true);
            obstacle.animations.play('pine');
        } else if (spriteIndex === 4) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 5) {
            obstacle.animations.add('column', [39], 0, true);
            obstacle.animations.play('column');
        } else if (spriteIndex === 6) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 7) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 8) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        } else if (spriteIndex === 9) {
            obstacle.animations.add('tree', [38], 0, true);
            obstacle.animations.play('tree');
        }
        obstacle.scale.setTo(2);
        obstacle.body.setSize(8, 8, 4, -2);
        obstacle.body.moves = false;

        return obstacle;
    }
    /****
     * collectables
     * 
     */
    generateCollectables() {
        for (var i = 0; i < this.collectablesCount; i++) {
            var point = this.grid.getRandomLocation();
            this.generatePotion(point);
        }
    }
    generateChest(location) {

        var collectable = this.collectables.create(location.x, location.y, 'things');
        collectable.scale.setTo(2);
        collectable.animations.add('idle', [6], 0, true);
        collectable.animations.add('open', [18, 30, 42], 10, false);
        collectable.animations.play('idle');
        collectable.name = Grid.GOLD
        collectable.value = 1;//Math.floor(Math.random() * 150);

        return collectable;
    }

    generatePotion(location) {
        var rnd = Math.random();
        let collectable;
        if (rnd >= 0 && rnd < .1) {
            collectable = this.generateChest(location);
        } else if (rnd >= 0.1 && rnd < .7) {
            collectable = this.generateHealthPotion(location);
        } else if (rnd >= .7 && rnd < .8) {
            collectable = this.generateVitalityPotion(location);
        } else if (rnd >= .8 && rnd < .9) {
            collectable = this.generateStrengthPotion(location);
        } else if (rnd >= .9 && rnd < 1) {
            collectable = this.generateSpeedPotion(location);
        }
        this.grid.addGridItem(location.x, location.y, collectable.name)
    }

    generateHealthPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [0], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.HEALTHPOTION;
        return collectable;
    }

    generateVitalityPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [2], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.VITALITYPOTION;
        return collectable;
    }

    generateStrengthPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [3], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.STRENGTHPOTION;
        return collectable;
    }

    generateSpeedPotion(location) {

        var collectable = this.collectables.create(location.x, location.y, 'potions');
        collectable.animations.add('idle', [4], 0, true);
        collectable.animations.play('idle');
        collectable.name = Grid.SPEEDPOTION;
        return collectable;
    }

    removeCollectable(x, y) {
        const collectable = this.collectables.getAll().find((c) => c.x == x && c.y == y);
        if (!collectable) return console.log('collectable not found');
        this.grid.removeGridItem(x, y);
        if (collectable.name == Grid.GOLD) {
            collectable.animations.play('open');
            collectable.lifespan = 1;
        } else {
            collectable.destroy();
        }
        console.log(`collectable(${collectable.name}) found.`)

        //console.log(this.player)
    }
    /****
     * utils
     */

}