
export default [
    {
        "name": "tree",
        "tileMapID": 38,
        "tileMapImageSet": "tiles",
        "obstacle": true,
        "stages": []
    },
    {
        "name": "bounds",
        "tileMapID": 38,
        "tileMapImageSet": "tiles",
        "bounds": true,
        "stages": []
    },
    {
        "name": "grass",
        "tileMapID": 38,
        "tileMapImageSet": "tiles",
        "empty": true,
        "stages": []
    },
    {
        "name": "bob",
        "tileMapID": 4,
        "tileMapImageSet": "characters",
        "character": true,
        "stats": {
            "health": 100,
            "stamina": 100,
            "strength": 25
        },
        "frames": {
            "left": 16,
            "right": 28,
            "up": 40,
            "down": 4
        },
        "stages": []
    },
    {
        "name": "chest-closed",
        "tileMapID": 36,
        "tileMapImageSet": "tiles",
        "collectable": false,
        "removeOnCollect": true,
        "stages": [
            {
                "name": "chest-open"
            }
        ]
    },
    {
        "name": "chest-open",
        "tileMapID": 35,
        "tileMapImageSet": "tiles",
        "collectable": true,
        "removeOnCollect": false,
        "value": {
            "type": "gold",
            "worth": 10
        },
        "stages": []
    },
    {
        "name": "jar",
        "tileMapID": 27,
        "tileMapImageSet": "tiles",
        "collectable": false,
        "removeOnCollect": true,
        "stages": [
            {
                "name": "broken-jar"
            }
        ]
    },
    {
        "name": "broken-jar",
        "tileMapID": 28,
        "tileMapImageSet": "tiles",
        "collectable": true,
        "removeOnCollect": false,
        "empty": true,
        "value": {
            "type": "gold",
            "worth": 15
        },
        "stages": []
    },
    {
        "name": "health-potion",
        "tileMapID": 0,
        "tileMapImageSet": "potions",
        "collectable": true,
        "removeOnCollect": true,
        "value": {
            "type": "health",
            "worth": 15
        },
        "stages": []
    },
    {
        "name": "stamina-potion",
        "tileMapID": 1,
        "tileMapImageSet": "potions",
        "collectable": true,
        "removeOnCollect": true,
        "value": {
            "type": "stamina",
            "worth": 15
        },
        "stages": []
    },
    {
        "name": "strength-potion",
        "tileMapID": 2,
        "tileMapImageSet": "potions",
        "collectable": true,
        "removeOnCollect": true,
        "value": {
            "type": "strength",
            "worth": 15
        },
        "stages": []
    }
];