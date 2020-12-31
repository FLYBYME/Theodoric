import World from '../src/scripts/lib/World.js'

import HTTP from 'http'
import * as io from 'socket.io'

var http = HTTP.createServer();
console.log(io)
var _io = new io.Server({
    cors: {
        origin: "*",
        methods: ["*"]
    }
});

_io.listen(3000, () => {
    console.log('listening on *:3000');
});

const world = new World(null, 32 * 25);

function attachWorldEvents() {


    world.on('item:add', (item) => {
        console.log('add')
        _io.emit('item:add', item)
    });
    world.on('item:remove', (item) => {
        console.log('remove')
        _io.emit('item:remove', item);
    });
    world.on('item:move', (item) => {
        console.log('move')
        _io.emit('item:move', item)
    });
    world.on('item:death', (item) => {
        console.log('death')
        _io.emit('item:death', item)
    });
    world.on('item:update', (item) => {
        _io.emit('item:update', item)
    })

}

world.setCollectableCount(20);
world.setObstacleCount(50);



world.setup();


attachWorldEvents()

_io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('input', (input) => {
        world.onInput(input)
        console.log(input)
    })

    world.state().items.forEach((item) => socket.emit('item:add', item));
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

function loop() {
    world.update();
    setTimeout(loop, 10)
}
loop()

