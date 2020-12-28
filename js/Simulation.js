

class Simulation extends EventEmitter {
    constructor({ size = 500, network, map }) {
        super();

        this.neatInputCount = 36;
        this.neatOutputCount = 4;

        this.network = network;
        this.neat = null;

        this.worker = null;
        this.isWorker = typeof localStorage !== 'object'

        this.size = size;
        this.map = map;

        this.collectablesCount = 25;
        this.obstacleCount = 50;

        this.grid = new Grid(this.size);

        this.trainingSet = [];

        this.obstacles = [];
        this.collectables = [];

        this.players = [];


    }
    /****
     * worker
     */
    setupWorker(cb) {
        if (this.worker != null) return;



        this.worker = new TrainingWorker(new Worker('/js/SimulationWorker.js'));

    }

    /****
     * other
     */
    clearGrid() {

        while (this.obstacles.length > 0)
            this.removeObstacle(this.obstacles[0]);

        while (this.collectables.length > 0)
            this.removeCollectable(this.collectables[0]);

    }
    /****
     * players
     */
    createPlayer(sprite, genome) {
        const grid = this.grid;
        let location = sprite || grid.getRandomLocation();

        location.item = Grid.PLAYER;

        if (this.map && this.map.player) {
            location.x = this.map.player.x;
            location.y = this.map.player.y;
        }

        if (!genome) {
            genome = this.neatNextGenome();
            if (!genome) {
                this.neatEvolve();
                genome = this.neatNextGenome();
            }
        }
        genome.clear();


        const player = new Player(location, grid, genome);

        //player.sim = false;

        this.addPlayer(player)

        player.once('death', () => {
            this.removePlayer(player);
        });
        player.on('collect', (location) => {
            this.removeCollectable(location)
        })
        return player
    }
    addPlayer(player) {
        this.grid.addGridItem(player.x, player.y, Grid.PLAYER);
        this.players.push(player);
        this.emit('add-player', player);
    }
    removePlayer(player) {
        this.grid.removeGridItem(player.x, player.y);
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
        this.emit('remove-player', player);
    }

    /****
     * Obstacles
     */
    resetObstacles() {
        const grid = this.grid;

        while (this.obstacles.length > 0)
            this.removeObstacle(this.obstacles[0]);

        if (this.map && this.map.obstacles) {
            for (let index = 0; index < this.map.obstacles.length; index++) {
                const location = this.map.obstacles[index];
                this.addObstacle(location);
            }
            return;
        }

        for (var i = 0; i < this.obstacleCount; i++) {
            let location = grid.getRandomLocation();
            this.addObstacle(location);
        }

    }
    addObstacle(location) {
        location.item = Grid.TREE;
        this.obstacles.push(location);
        this.grid.addGridItem(location.x, location.y, location.item);
        this.emit('add-obstacle', location);
    }
    removeObstacle(location) {
        this.grid.removeGridItem(location.x, location.y);
        const index = this.obstacles.findIndex((c) => c.x == location.x && c.y == location.y);
        this.obstacles.splice(index, 1);
        this.emit('remove-obstacle', location);
    }

    /****
     * Collectables
     */
    resetCollectables() {

        const grid = this.grid;

        while (this.collectables.length > 0)
            this.removeCollectable(this.collectables[0]);

        if (this.map && this.map.collectables) {
            for (let index = 0; index < this.map.collectables.length; index++) {
                const location = this.map.collectables[index];
                this.collectables.push(location);
                grid.addGridItem(location.x, location.y, location.item);
                this.emit('add-collectable', location);
            }
            return;
        }


        for (var i = 0; i < 25; i++) {
            let location = grid.getRandomLocation();
            this.collectables.push(location);
            let rnd = Math.random();
            location.item = Grid.GOLD;
            if (rnd >= 0 && rnd < .1) {
                location.item = Grid.GOLD;
            } else if (rnd >= 0.1 && rnd < .7) {
                location.item = Grid.HEALTHPOTION;
            } else if (rnd >= .7 && rnd < .8) {
                location.item = Grid.SPEEDPOTION;
            } else if (rnd >= .8 && rnd < .9) {
                location.item = Grid.STRENGTHPOTION;
            } else if (rnd >= .9 && rnd < 1) {
                location.item = Grid.VITALITYPOTION;
            }

            grid.addGridItem(location.x, location.y, location.item);
            this.emit('add-collectable', location);
        }
    }
    removeCollectable(location) {
        this.grid.removeGridItem(location.x, location.y);
        const index = this.collectables.findIndex((c) => c.x == location.x && c.y == location.y);
        this.collectables.splice(index, 1);
        this.emit('remove-collectable', location);

    }
    /****
     * training
     */
    setTraingingData(trainingSet) {
        this.trainingSet = trainingSet;
    }
    mutate(gnome) {
        let mutationMethod = this.neat.mutation[Math.floor(Math.random() * this.neat.mutation.length)];
        gnome.mutate(mutationMethod)
    }
    train(genome) {
        if (this.trainingSet.length == 0) return;
        return genome.train(this.trainingSet, {
            log: 1,
            clear: true,
            error: 0.0000003,
            iterations: 100,
            mutationRate: 0.5
        });
    }
    evolve() {
        if (this.trainingSet.length == 0) return;
        return this.neat.evolve(this.trainingSet, {
            log: 1,
            error: 0.0000003,
            iterations: 100,
            mutationRate: 0.5
        });
    }

    /*****
     * neat
     */
    resetNeat() {


        this.neat = null;


        let genomes = [];
        if (!this.network) {
            if (!this.isWorker && localStorage.getItem('best')) {
                genomes = JSON.parse(localStorage.getItem('best')).map((g) => neataptic.Network.fromJSON(g))

                this.network = genomes[0]
                this.worker.call('best:set', JSON.parse(localStorage.getItem('best')))
            } else
                this.network = new neataptic.architect.LSTM(this.neatInputCount, this.neatOutputCount, this.neatOutputCount);
        }


        this.neat = new neataptic.Neat(
            this.neatInputCount, this.neatOutputCount, () => -1,
            {
                mutation: neataptic.methods.mutation.ALL,
                popsize: this.isWorker ? 1000 : 15,
                mutationRate: 0.3,
                elitism: this.isWorker ? 25 : 4,
                provenance: this.isWorker ? 25 : 4,
                network: this.network
            }
        );
        if (genomes.length > 0) this.neat.population = genomes;
        this.resetNeatIndex()
    }
    resetNeatIndex() {
        this.neat._i = 0;
    }
    neatEvolve() {

        const neat = this.neat;

        let network = this.network;

        neat.sort();

        this.emit('neat-best', neat.population.slice(0, 5));

        const best = neat.population[0];
        for (let index = 0; index < neat.population.length; index++) {
            if (neat.population[index].score == -1) {
                neat.population[index] = neataptic.Network.fromJSON(best.toJSON());
                neat.population[index].score = -1
            } else if (!neat.population[index].score) neat.population[index].score = 0;
        }
        console.log('Generation:', neat.generation, '- average score:', neat.getAverage().toFixed(3), '- best:', neat.population.slice(0, 4).map((a) => a.score.toFixed(2)).join(', '));
        neat.evolve();
        this.resetNeatIndex()
    }
    neatNextGenome() {
        return this.neat.population[this.neat._i++];
    }
    /****
     * sim run
     */
    runRounds(genome, rounds) {


        let score = 0;
        const run = () => {
            this.resetCollectables();
            let player = this.createPlayer(undefined, genome);
            player.sim = !this.isWorker;
            while (player.isAlive()) {
                player.move();
            }
            score += genome.score;
        }
        for (let index = 0; index < rounds; index++) {
            run();
        }

        return score / rounds;
    }
    process() {

        if (!this.canRun) return;

        let genome = this.neatNextGenome();
        if (!genome) this.neatEvolve();
        genome = this.neatNextGenome();

        let player = this.createPlayer(undefined, genome);

    }
}
