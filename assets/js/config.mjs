
const TestTrackConfig = {
    name: "Test Track",
    image: "./assets/img/tracks/test.png",
    // Track gravity - affects how far a player can jump
    gravity: 50,
    // Friction on the track
    tDrag: 25,
    // Friction off the track
    dDrag: 50,
    // Player spawn point position and view direction in radians
    pSpawn: {x:920, y:585, dir: 4.71239},
    // List of checkpoints position and radii in map image pixels
    checkpoints: [
        {x:15, y:15, r:50},
        {x:15, y:35, r:50}
    ],
    // List of objects (bonuses, obstacles, and scenery)
    // An object has a position and a type, which should map to object configs
    objects: [
        {x: 25, y: 25, t: "gofaster"},
        {x: 50, y: 25, t: "bannanpeel"}
    ]
};

const TestPlayerConfig = {
    name: "player one",
    sprite: "./assets/img/sprites/testplayer.png",
    // Acceleration in pixels a second
    acceleration: 50,
    // Maximum speed in pixels a second
    maxSpeed: 150,
    // Turn speed in radians a second (there's 6.28 radians in a circle)
    tSpeed: 2.0,
    // Jump Power
    jumpPower: 15,
    // Collision detection radius in pixels
    radius: 10
};

const ObjectTypes = [
  {
    name: "checkpoint"
    scale: 50,
    radius: 50
  }
  {
    // Name identifier
    name: "gofaster",
     // Scale of the sprite on screen
    scale: 25,
     // Radius on the map
    radius: 25
  },
  {
    name: "bannanpeel",
    scale: 25,
    radius: 25
  }
];

// Add configs to list below:
export { TestTrackConfig, TestPlayerConfig, ObjectTypes, };