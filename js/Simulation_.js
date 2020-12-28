
const inputCount = 18;
const popsize = 30;
let neat = new neataptic.Neat(
    inputCount, 8, () => 0,
    {
        mutation: neataptic.Methods.Mutation.ALL,
        popsize: popsize,
        //mutationRate: 0,
        elitism: 5,
        network: new neataptic.Architect.LSTM(
            inputCount,
            1,
            8
        )
    }
);
let str = localStorage.getItem('_network')
if (str) {
    neat.import(JSON.parse(str))

}
var sim = null;
class Simulation {
    constructor(gane) {
        this.game;      //  a reference to the currently running game (Phaser.Game)
        this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
        this.camera;    //  a reference to the game camera (Phaser.Camera)
        this.cache;     //  the game cache (Phaser.Cache)
        this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
        this.load;      //  for preloading assets (Phaser.Loader)
        this.math;      //  lots of useful common math operations (Phaser.Math)
        this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
        this.stage;     //  the game stage (Phaser.Stage)
        this.time;      //  the clock (Phaser.Time)
        this.tweens;    //  the tween manager (Phaser.TweenManager)
        this.state;     //  the state manager (Phaser.StateManager)
        this.world;     //  the game world (Phaser.World)
        this.particles; //  the particle manager (Phaser.Particles)
        this.physics;   //  the physics manager (Phaser.Physics)
        this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
        sim = this;
    }
    create() {

        this.nextFollow = Date.now() + 1000;

        this.worldSize = 32 * 30;

        this.game.world.setBounds(0, 0, this.worldSize, this.worldSize);

        this.background = this.game.add.tileSprite(0, 0, this.game.world.width / 2, this.game.world.height / 2, 'tiles', 65);
        this.background.scale.setTo(2);

        this.generateGrid();

        this.generateObstacles();

        this.generateCollectables();

        this.generatePlayers(1);

        this.showLabels();

        this.corpses = this.game.add.group();

        this.game.camera.follow(this.players.getFirst());
    }
    render() {
        this.game.debug.body(this.players.getFirst());
    }
    update(time, delta) {

        let player = this.players.getFirst();




        this.collisionHandler(player);

        let moved = false;

        if (this.game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)) {
            player.x -= 32;
            moved = true;
        }
        else if (this.game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)) {
            player.x += 32;
            moved = true;
        }

        if (this.game.input.keyboard.justPressed(Phaser.Keyboard.UP)) {
            player.y -= 32;
            moved = true;
        }
        else if (this.game.input.keyboard.justPressed(Phaser.Keyboard.DOWN)) {
            player.y += 32;
            moved = true;
        }
        if (moved) {
            let inputs = [];
            let obstacles = this.getClosted(player, this.obstacles);
            let collectables = this.getClosted(player, this.collectables)

            inputs.push(...obstacles.splice(0, 3).map((obstacle) => {
                return [obstacle[0]/2000, obstacle[1]]
            }), ...collectables.splice(0, 3).map((obstacle) => {
                return [obstacle[0]/2000, obstacle[1]]
            }))

            console.log(inputs.flat())
        }
        this.ticksLabel.text = `${player.ticks} Ticks`
        this.ticksMaxLabel.text = `${player.ticksMax} Max`
        //console.log(`x: ${player.x} y: ${player.y}`)
        return;
        this.players.forEachAlive((player) => this.updatePlayer(player))

        if (this.players.getAll().length == 0) {
            this.game.time.events.add(1000, this.gameOver, this);
        } else if (Date.now() > this.nextFollow) {
            this.nextFollow = Date.now() + 100;
            let follower = { ticksMax: -100 };

            this.players.forEachAlive((player) => player.ticksMax > follower.ticksMax ? follower = player : null);


            if (follower.x) {
                //console.log(follower.name, follower.ticks, follower.ticksMax, follower.traveled)
                this.game.camera.follow(follower);
                this.ticksLabel.text = `${follower.ticks} Ticks`
                this.ticksMaxLabel.text = `${follower.ticksMax} Max`
                for (let index = 0; index < this.outputLabels.length; index++) {
                    this.outputLabels[index].text = follower._outputs[index].toFixed(3)
                }
                //console.log(follower._inputs.map((n) => n.toFixed(2)), follower._outputs.map((n) => n.toFixed(2)))
            }
        }
    }
    updatePlayer(player) {

        if (!player.alive)
            return;

        if (player.ticks++ > player.ticksMax) return this.killPlayer(player);

        this.collisionHandler(player);

        this.calculateDistance(player)

        let inputs = [
            (this.worldSize - player.x) / this.worldSize,
            (this.worldSize - player.y) / this.worldSize,
            ...this.generateInputs(player, this.players),
            ...this.generateInputs(player, this.obstacles)
        ].map((item) => this.game.math.clamp(item, 0, 1));

        let outputs = player.genome.activate(inputs);

        player._inputs = inputs;
        player._outputs = outputs;

        this.movePlayer(player, outputs)
    }
    getClosted(player, group) {

        let distances = [];

        for (var i = 0; i < group.children.length; i++) {
            var child = group.children[i];

            if (child.exists) {
                let tempDistance = Math.abs(Phaser.Point.distance(player, child));
                let tempAngle = this.math.radToDeg(this.physics.arcade.angleBetween(player, child)) + 180

                if (tempAngle - 45 < 0) tempAngle += 45
                else tempAngle -= 45

                distances.push([tempDistance, Math.floor(tempAngle / 90), child]);
            }
        }
        return distances.sort((a, b) => a[0] - b[0])
    }
    calculateDistance(player, death = false) {

        if (death || Date.now() > player.nextDistanceTime) {
            player.nextDistanceTime = Date.now() + 100;
            let traveled = this.game.math.distance(
                player.lastX,
                player.lastY,
                player.x,
                player.y
            );
            if (traveled > 300) {
                //console.log(traveled)
                //player.traveled += traveled / 100;
            }
        }
    }
    killPlayer(target) {
        var corpse = this.corpses.create(target.x, target.y, 'dead')
        corpse.scale.setTo(2);
        corpse.animations.add('idle', [target.corpseSprite], 0, true);
        corpse.animations.play('idle');
        corpse.lifespan = 3000;
        this.calculateDistance(target, true);
        target.genome.score = target.ticksMax + target.traveled;
        //console.log(`${target.name} score: ${target.genome.score}`)
        target.destroy();
    }
    movePlayer(player, outputs) {



        let bestIndex;
        let secondBestIndex
        let highest = 0;
        let second = 0;
        for (let index = 0; index < outputs.length; index++) {
            const conf = outputs[index];
            if (conf > highest) {
                bestIndex = index;
                highest = conf;
            }
        }
        //console.log(`best:${bestIndex}:${highest}`, outputs)
        if (bestIndex == 0) {
            player.body.velocity.x = -player.speed;
            player.body.velocity.y = -player.speed;
            player.animations.play('left');

            // Up-Right
        } else if (bestIndex == 1) {
            player.body.velocity.x = player.speed;
            player.body.velocity.y = -player.speed;
            player.animations.play('right');

            // Down-Left
        } else if (bestIndex == 2) {
            player.body.velocity.x = -player.speed;
            player.body.velocity.y = player.speed;
            player.animations.play('left');

            // Down-Right
        } else if (bestIndex == 3) {
            player.body.velocity.x = player.speed;
            player.body.velocity.y = player.speed;
            player.animations.play('right');

            // Up
        } else if (bestIndex == 4) {
            player.body.velocity.x = 0;
            player.body.velocity.y = -player.speed;
            player.animations.play('up');

            // Down
        } else if (bestIndex == 5) {
            player.body.velocity.x = 0;
            player.body.velocity.y = player.speed;
            player.animations.play('down');

            // Left
        } else if (bestIndex == 6) {
            player.body.velocity.x = -player.speed;
            player.body.velocity.y = 0;
            player.animations.play('left');

            // Right
        } else if (bestIndex == 7) {
            player.body.velocity.x = player.speed;
            player.body.velocity.y = 0;
            player.animations.play('right');

            // Still
        } else {
            player.animations.stop();
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            this.tickMax -= 5;
        }
    }
    generateInputs(player, group) {
        let dir = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];


        group.forEachAlive((target) => {
            if (target.name == player.name) return;
            let index = Math.floor(this.game.math.mapLinear(
                this.game.physics.arcade.angleBetween(player, target) + 3
                , 0, 6, 0, 8
            )) - 1;
            let distance = this.game.physics.arcade.distanceBetween(player, target);
            // console.log(player.name, index, dir[index], distance)

            if (dir[index] > distance) {
                dir[index] = distance;
            }
        })
        return dir.map((item) => (1000 - item) / 1000);
    }
    collisionHandler(player) {
        this.game.physics.arcade.overlap(this.players, player, () => {
            //console.log('overlap')
            player.ticksMax -= 1;
        }, null, this);
        this.game.physics.arcade.collide(this.obstacles, player, (a, b) => {

            player.ticksMax -= 10;
        }, null, this);

        this.game.physics.arcade.overlap(this.collectables, player, this.collect, null, this);
        this.game.physics.arcade.collide(this.world, player, () => {
            console.log('Hit world')
        }, null, this)

        //1168 

        if (player.x == 0 || player.x == 1168 ||
            player.y == 0 || player.y == 1168) {
            player.ticksMax -= 50;
        }
    }
    collect(player, collectable) {

        if (!collectable.collected) {
            collectable.collected = true;
            var gain;
            if (collectable.name === 'gold') {

                collectable.destroy();
            } else if (collectable.name === 'chest') {
                collectable.animations.play('open');
                player.ticksMax += 100
                collectable.lifespan = 1;
            }
        }
    }
    generatePlayers(amount) {
        this.players = this.game.add.group();

        // Enable physics in them
        this.players.enableBody = true;
        this.players.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < amount; i++) {
            this.generatePlayer(i);
        }

    }
    generatePlayer(i) {
        // console.log(i)
        let point = this.getRandomLocation();
        let player = this.players.create(point.x, point.y, 'characters');

        // Loop through frames 3, 4, and 5 at 10 frames a second while the animation is playing
        player.animations.add('down', [3, 4, 5], 10, true);
        player.animations.add('left', [15, 16, 17], 10, true);
        player.animations.add('right', [27, 28, 29], 10, true);
        player.animations.add('up', [39, 40, 41], 10, true);
        player.animations.play('down');
        player.scale.setTo(2);

        // Enable player physics;
        this.game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true
        player.alive = true;

        player.genome = neat.population[i];
        player.genome.score = 0;

        player.name = `Theodoric${i}`;
        player.level = 1;

        player.health = 100;
        player.vitality = 100;
        player.strength = 25;
        player.speed = 125;

        player.invincibilityFrames = 500;
        player.invincibilityTime = 0;

        player.corpseSprite = 1;

        player.ticks = 0;
        player.ticksMax = 200;

        player.nextDistanceTime = Date.now() + 100;
        player.lastX = player.x;
        player.lastY = player.y;
        player.traveled = 0;

        return player;
    }
    generateGrid() {

        this.grid = [];
        var gridSize = 32;
        var grids = Math.floor(this.worldSize / gridSize);
        for (var x = 0; x < grids; x++) {
            for (var y = 0; y < grids; y++) {
                var gridX = x * gridSize;
                var gridY = y * gridSize;
                this.grid.push({ x: gridX, y: gridY });
            }
        }
        this.shuffle(this.grid);
    }
    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
    angleToPoint(x1, y1, x2, y2) {
        let d = this.distance(x1, y1, x2, y2);
        let dx = (x2 - x1) / d;
        let dy = (y2 - y1) / d;

        let a = Math.acos(dx);
        a = dy < 0 ? 2 * Math.PI - a : a;
        return a;
    }
    distance(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);
    }
    gameOver() {
        this.background.destroy();
        this.corpses.destroy();
        this.collectables.destroy();
        this.players.destroy();
        this.endEvaluation();
        this.game.state.start('MainMenu', true, false, 0);
    }

    endEvaluation() {
        if (neat.getAverage() == 0) return;
        console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

        for (let index = 0; index < neat.population.length; index++) {
            const genome = neat.population[index];
            if (genome.score == undefined) genome.score = 0;
        }

        localStorage.setItem('_network', JSON.stringify(neat.export()))

        return neat.evolve();

        neat.sort();

        localStorage.setItem('_network', JSON.stringify(neat.export()))
        if (i++ > 100) location.reload();
        var newPopulation = [];

        // Elitism
        for (var i = 0; i < neat.elitism; i++) {
            newPopulation.push(neat.population[i]);
        }

        // Breed the next individuals
        for (var i = 0; i < neat.popsize - neat.elitism; i++) {
            newPopulation.push(neat.getOffspring());
        }

        // Replace the old population with the new population
        neat.population = newPopulation;
        neat.mutate();

        neat.generation++;

    }
    generateObstacles() {

        this.obstacles = this.game.add.group();
        this.obstacles.enableBody = true;

        var amount = 10;
        for (var i = 0; i < amount; i++) {
            var point = this.getRandomLocation();
            var spriteIndex = Math.floor(Math.random() * 10);
            this.generateObstacle(point, spriteIndex);
        }
    }

    generateObstacle(location, spriteIndex) {

        let obstacle = this.obstacles.create(location.x, location.y, 'tiles');

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

    generateCollectables() {

        this.collectables = this.game.add.group();
        this.collectables.enableBody = true;
        this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

        var amount = 5;
        for (var i = 0; i < amount; i++) {
            var point = this.getRandomLocation();
            this.generateChest(point);
        }
    }

    generateChest(location) {

        var collectable = this.collectables.create(location.x, location.y, 'things');
        collectable.scale.setTo(2);
        collectable.animations.add('idle', [6], 0, true);
        collectable.animations.add('open', [18, 30, 42], 10, false);
        collectable.animations.play('idle');
        collectable.name = 'chest'
        collectable.value = 1;//Math.floor(Math.random() * 150);

        return collectable;
    }

    getRandomLocation() {

        var gridIndex = 0;
        var x = this.grid[gridIndex].x;
        var y = this.grid[gridIndex].y;
        this.grid.splice(gridIndex, 1);
        gridIndex++;
        if (gridIndex === this.grid.length) {
            this.shuffle(this.grid);
            gridIndex = 0;
        }
        return { x, y };
    }

    showLabels() {

        var text = '0';
        let style = { font: '12px Arial', fill: '#fff', align: 'center' };

        let step = 25;
        let i = 0;

        this.ticksLabel = this.game.add.text(this.game.width - 75, this.game.height - (++i * step), text, style);
        this.ticksLabel.fixedToCamera = true;

        this.ticksMaxLabel = this.game.add.text(this.game.width - 75, this.game.height - (++i * step), text, style);
        this.ticksMaxLabel.fixedToCamera = true;
        this.outputLabels = Array(8);
        for (let index = 0; index < this.outputLabels.length; index++) {
            this.outputLabels[index] = this.game.add.text(((index + 1) * 75), 75, text, style);
            this.outputLabels[index].fixedToCamera = true;

        }
    }
}
Theodoric.Simulation = Simulation;