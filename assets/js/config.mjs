
const TrackConfig = {
    name: "Test Track",
    image: "./assets/img/tracks/f-track.png",//test.png",
    mask: "./assets/img/tracks/f-track-mask.png",
    skyColor: "#00FFFF",
    groundColor: "#842f1c",
    // Track gravity - affects how far a player can jump
    gravity: 50,
    // Friction on the track
    tDrag: 25,
    // Friction off the track
    dDrag: 50,
    // Change to max speed when not on the track
    dSpeed: -75,
    // Player spawn point position and view direction in radians
    pSpawn: {x:345, y:200, dir: 2.8704},
    // List of checkpoints position and radii in map image pixels
    checkpoints: [
        {x:170, y:325},
        {x:265, y:800},
        {x:345, y:200}
    ],
    // List of objects (bonuses, obstacles, and scenery)
    // An object has a position and a type, which should map to object configs
    objects: [
        {x: 25, y: 25, t: "gofaster"},
        {x: 345, y: 200, t: "bananapeel"},
    ]
};

const PlayerConfig = {
    name: "player one",
    sprite: "./assets/img/sprites/testplayer.png",
    // Acceleration in pixels a second
    acceleration: 50,
    // Maximum speed in pixels a second
    maxSpeed: 150,
    // Turn speed in radians a second (there's 6.28 radians in a circle)
    tSpeed: 3.14,
    // Jump Power
    jumpPower: 15,
    // Default height above the ground
    height: 0,
    // Scale of the sprite on the screen
    scale: 1,
    // Collision detection radius in pixels
    radius: 10
};

const ObjectTypes = [
  {
    name: "checkpoint",
    sprite: "./assets/img/sprites/checkpoint.png",
    jumpable: false,
    height: 15,
    scale: 20,
    radius: 50
  },
  {
    // Name identifier
    name: "gofaster",
    // The image file holding this object's sprite
    sprite: "./assets/img/sprites/test.png",
    // Will the player still collide with this if they're jumping
    jumpable: false,
    // Default height above the floor plain
    height: 0,
    // Scale of the sprite on screen
    scale: 10,
    // Radius on the map
    radius: 25
  },
  {
    name: "bananapeel",
    sprite: "./assets/img/sprites/test.png",
    jumpable: true,
    height: 0,
    scale: 5,
    radius: 25
  }
];

// Add configs to list below:
export { TrackConfig, PlayerConfig, ObjectTypes };