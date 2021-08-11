const TrackConfig = {
  name: "Test Track",
  image: "./assets/img/tracks/f-track.png", //test.png",
  mask: "./assets/img/tracks/f-track-mask.png",
  skyColor: "#00FFFF",
  groundColor: "#842F1C",
  // Track gravity - affects how far a player can jump
  gravity: 50,
  // Friction on the track
  tDrag: 25,
  // Friction off the track
  dDrag: 30,
  // Change to max speed when not on the track
  dSpeed: -100,
  // The number of laps
  laps: 5,
  // Player spawn point position and view direction in radians
  pSpawn: { x: 345, y: 200, dir: 2.8704 },
  // List of checkpoints position and radii in map image pixels
  checkpoints: [
    { x: 170, y: 325, f: 1.80 },
    { x: 175, y: 600, f: 1.60 },
    { x: 265, y: 800, f: -0.20 },
    { x: 650, y: 805, f: 0.75 },
    { x: 900, y: 675, f: -3.00 },
    { x: 625, y: 560, f: -2.00 },
    { x: 685, y: 290, f: -0.05 },
    { x: 650, y: 150, f: -3.10 },
    { x: 345, y: 200, f: -2.8704 },
  ],
  // List of objects (bonuses, obstacles, and scenery)
  // An object has a position and a type, which should map to object configs
  objects: [
    // power ups
    { x: 270, y: 805, t: "gofaster" },
    { x: 165, y: 320, t: "gofaster" },
    { x: 625, y: 560, t: "gofaster" },
    { x: 752, y: 889, t: "gofaster" },
    { x: 823, y: 126, t: "gofaster" },

    // obstacle
    { x: 145, y: 452, t: "bananapeel" },
    { x: 165, y: 372, t: "bananapeel" },
    { x: 160, y: 665, t: "bananapeel" },
    { x: 402, y: 768, t: "bananapeel" },
    { x: 628, y: 828, t: "bananapeel" },
    { x: 907, y: 828, t: "bananapeel" },
    { x: 773, y: 637, t: "bananapeel" },
    { x: 603, y: 482, t: "bananapeel" },
    { x: 669, y: 321, t: "bananapeel" },
    { x: 691, y: 112, t: "bananapeel" },
    { x: 409, y: 203, t: "bananapeel" },
    { x: 86, y: 336, t: "barrel" },
    { x: 133, y: 534, t: "barrel" },
    { x: 310, y: 795, t: "barrel" },
    { x: 863, y: 728, t: "barrel" },
    { x: 930, y: 160, t: "barrel" },
    { x: 846, y: 900, t: "barrel" },

    // scenery
    { x: 131, y: 170, t: "tree" },
    { x: 50, y: 291, t: "tree" },
    { x: 260, y: 350, t: "tree" },
    { x: 226, y: 420, t: "tree" },
    { x: 5, y: 480, t: "tree" },
    { x: 60, y: 670, t: "tree" },
    { x: 212, y: 516, t: "tree" },
    { x: 41, y: 825, t: "tree" },
    { x: 175, y: 897, t: "tree" },
    { x: 260, y: 683, t: "tree" },
    { x: 415, y: 874, t: "tree" },
    { x: 625, y: 934, t: "tree" },
    { x: 769, y: 796, t: "tree" },
    { x: 1000, y: 768, t: "tree" },
    { x: 727, y: 544, t: "tree" },
    { x: 538, y: 257, t: "tree" },
    { x: 388, y: 70, t: "tree" },
  ],
};

const PlayerConfig = {
  name: "player one",
  sprite: "./assets/img/sprites/cycle.png",
  // Acceleration in pixels a second
  acceleration: 50,
  // Maximum speed in pixels a second
  maxSpeed: 150,
  // Turn speed in radians a second (there's 6.28 radians in a circle)
  tSpeed: 3.14,
  // Jump Power
  jumpPower: 20,
  // Default height above the ground
  height: 0,
  // Scale of the sprite on the screen
  scale: 1,
  // Collision detection radius in pixels
  radius: 2,
};

const ObjectTypes = [
  {
    name: "checkpoint",
    sprite: "./assets/img/sprites/checkpoint.png",
    jumpable: false,
    height: 15,
    scale: 45,
    radius: 50,
  },
  {
    // Name identifier
    name: "gofaster",
    // The image file holding this object's sprite
    sprite: "./assets/img/objects/power-ups.png",
    // Will the player still collide with this if they're jumping
    jumpable: false,
    // Default height above the floor plain
    height: 0,
    // Scale of the sprite on screen
    scale: 1,
    // Radius on the map
    radius: 4,
  },
  {
    name: "bananapeel",
    sprite: "./assets/img/objects/banana.png",
    jumpable: true,
    height: 0,
    scale: 0.25,
    radius: 2,
  },
  {
    name: "tree",
    sprite: "./assets/img/objects/tree.png",
    jumpable: true,
    height: 0,
    scale: 50,
    radius: 4,
  },
  {
    name: "barrel",
    //sprite: "./assets/img/sprites/test2.png",
    sprite: "./assets/img/objects/barrel.png",
    jumpable: false,
    height: 0,
    scale: 4,
    radius: 6,
  },
];

// Add configs to list below:
export { TrackConfig, PlayerConfig, ObjectTypes };
