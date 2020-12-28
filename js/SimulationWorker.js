importScripts('./Grid.js')
importScripts('./Maps.js')
importScripts('./EventEmitter.js')
importScripts('./Player.js')
importScripts('./Simulation.js')
importScripts('./Worker.js')
importScripts('./neataptic.min.js')



const simulation = new Simulation({
    size: 32 * 7,
    map: maps[2]
});

simulation.grid.generate();
simulation.resetNeat();
simulation.resetObstacles();
simulation.resetCollectables();

const worker = new TrainingWorker(self);

let mapIndex = 0;

worker.method('sim:evolve', async (payload) => {


    simulation.map = maps[mapIndex++];
    if (!simulation.map) {
        mapIndex = 0;
        simulation.map = maps[mapIndex++];
    }
    simulation.clearGrid();
    simulation.resetObstacles();

    const processTime = 60 * 1000;
    const start = Date.now();
    const times = [];
    let generations = 0;

    while (start + processTime > Date.now()) {

        for (let index = 0; index < simulation.neat.population.length; index++) {
            const genome = simulation.neat.population[index];
            genome.score = simulation.runRounds(genome, 1);
        }
        simulation.neatEvolve();

        generations++

        simulation.resetObstacles();

        times.push(Date.now() - start);
    }

    simulation.resetObstacles();
    for (let index = 0; index < simulation.neat.population.length; index++) {
        const genome = simulation.neat.population[index];
        genome.score = simulation.runRounds(genome, 1);
    }
    simulation.neat.sort();
    const topGenome = simulation.neat.population.slice(0, 15);
    console.log(`${generations} generations with an average score:`, simulation.neat.getAverage().toFixed(3), '- best:', topGenome.map((a) => a.score.toFixed(2)).join(', '));


    return {
        genomes: topGenome.map((g) => g.toJSON()),
        map: mapIndex,
        times
    };
})


worker.method('best:set', async (payload) => {

    let genomes = payload.map((g) => neataptic.Network.fromJSON(g))

    simulation.network = genomes[0];
    simulation.resetNeat();

    for (let index = 0; index < genomes.length; index++) {
        const genome = genomes[index];
        simulation.neat.population.shift();
        simulation.neat.population.push(genome);
    }
})


worker.method('train:addSet', async (payload) => {
    simulation.setTraingingData(payload);
})
worker.method('train:appendSet', async (payload) => {
    simulation.trainingSet.push(payload);
})
worker.method('train', async (payload) => {
    console.log(payload);

    const genome = payload.input ? neataptic.Network.fromJSON(payload) : simulation.neat.population[payload];

    simulation.train(genome);

    return genome.toJSON();
})