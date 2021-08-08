
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
    tSpeed: 3.14,
    // Jump Power
    jumpPower: 15,
    // Collision detection radius in pixels
    radius: 10
};

const ObjectTypes = [
  {
    name: "checkpoint",
    sprite: "./assets/img/sprites/checkpoint.png",
    scale: 2,
    radius: 50
  },
  {
    // Name identifier
    name: "gofaster",
    // The image file holding this object's sprite
    sprite: "./assets/img/sprites/test.png",
    // Scale of the sprite on screen
    scale: 1.5,
    // Radius on the map
    radius: 25
  },
  {
    name: "bannanpeel",
    sprite: "./assets/img/sprites/test.png",
    scale: 1.5,
    radius: 25
  }
];

// Add configs to list below:
export { TestTrackConfig, TestPlayerConfig, ObjectTypes, };