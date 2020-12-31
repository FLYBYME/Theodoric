
const createCharacterAnims = (anims) => {


    anims.create({
        key: 'stop',
        frames: anims.generateFrameNumbers('characters', { frames: [4] }),
        frameRate: 1,
        repeat: -1
    });

    anims.create({
        key: 'down',
        frames: anims.generateFrameNumbers('characters', { frames: [3, 4, 5] }),
        frameRate: 8,
        repeat: -1
    });

    anims.create({
        key: 'left',
        frames: anims.generateFrameNumbers('characters', { frames: [15, 16, 17] }),
        frameRate: 8,
        repeat: -1
    });

    anims.create({
        key: 'right',
        frames: anims.generateFrameNumbers('characters', { frames: [27, 28, 29] }),
        frameRate: 8,
        repeat: -1
    });

    anims.create({
        key: 'up',
        frames: anims.generateFrameNumbers('characters', { frames: [39, 40, 41] }),
        frameRate: 8,
        repeat: -1
    });
}

export {
    createCharacterAnims
}