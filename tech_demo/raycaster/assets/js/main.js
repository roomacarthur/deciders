
import { Tile2D, TileMap2D } from "./modules/tilemap2d.mjs";
import { RayCamera2D } from "./modules/camera2d.mjs";

Math.degreesToRadian = function (degrees) {
  return (degrees * Math.PI / 180);
};

Math.radianToDegrees = function (radians) {
  return (radians * 180 / Math.PI);
};

const testMap = {
  map: [  [2,2,2,2,2,2,2,2,2,2],
          [1,0,0,0,0,0,0,2,0,2],
          [2,2,2,0,2,2,0,2,0,2],
          [2,0,2,0,0,2,0,2,0,2],
          [2,0,2,0,2,2,0,2,0,1],
          [2,0,0,0,0,2,0,0,0,2],
          [2,0,2,0,0,0,0,2,0,2],
          [2,0,2,2,2,2,2,2,0,2],
          [2,0,0,0,0,0,0,0,0,2],
          [2,2,2,2,2,2,2,2,2,2] ],
  width: 10,
  height: 10,
};

const tiles = [
  {name: "open", blocking: false, opaque: false},
  {name: "wall", blocking: true, opaque: true}
];

const canvas = document.getElementById("gameSurface");
let ctx = canvas.getContext("2d");
let stepping = 1;
let columns = Math.trunc(canvas.width / stepping);

const camera = new RayCamera2D({x:1.5, y:1.5}, {x:1, y: 0}, columns, (canvas.width / canvas.height));
const map = new TileMap2D(testMap);

const xPos = document.getElementById("xPos");
const yPos = document.getElementById("yPos");
const direction = document.getElementById("direction");

camera.columns = columns;

function drawFrame() {
  // Clear the screen
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Set the camera position and direction
  camera.position.x = parseFloat(xPos.value);
  camera.position.y = parseFloat(yPos.value);
  camera.direction.radians = Math.degreesToRadian(parseInt(direction.value));

  // Generate scene data
  camera.rayCast(map);
  let distances = camera.scene;


  // Column draw loop
  for (let i = 0; i < columns; i++) {
    // Calcualte the height of the wall column in pixels
    let wallHeight = canvas.height / camera.scene[i].distance;
    // Calculate the colour of the wall column
    if (camera.scene[i].axis === 'y') ctx.fillStyle = "#333";
    else ctx.fillStyle = "#888"
    // Draw the wall column
    ctx.fillRect(
      i*stepping, (canvas.height - wallHeight) / 2,
      stepping, wallHeight
    );
  }
}

drawFrame();

xPos.addEventListener("change", drawFrame);
yPos.addEventListener("change", drawFrame);
direction.addEventListener("change", drawFrame);
document.getElementById("stepping").addEventListener("change", function() {
  stepping = parseInt(this.value);
  columns = Math.trunc(canvas.width / stepping);
  camera.columns = columns;
  drawFrame();
});