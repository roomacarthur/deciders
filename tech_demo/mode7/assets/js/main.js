

Math.degreesToRadian = function (degrees) {
  return (degrees * Math.PI / 180);
};

Math.radianToDegrees = function (radians) {
  return (radians * 180 / Math.PI);
};

debugger;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const miniCanvas = document.getElementById('minimap');
const minictx = miniCanvas.getContext('2d');

const imgCanvas = document.createElement('canvas');
const imgCtx = imgCanvas.getContext('2d');

const testImg = new Image;
const sprite = new Image;

const viewHeight = 15;

let mapX = 80;
let mapY = 250;
let facing = 1.57079632679;

let rotate = 0;
let move = 0;

testImg.src = "assets/img/track.png";
sprite.src = "assets/img/rider.png";

testImg.onload = () => {
  debugger;
  imgCanvas.width = testImg.width;
  imgCanvas.height = testImg.height;
  imgCtx.drawImage(testImg, 0,0);
  window.requestAnimationFrame(loop);
}

function drawMap() {
  let x = (mapX / testImg.width) * miniCanvas.width;
  let y = (mapY / testImg.height) * miniCanvas.height;
  let vX = Math.cos(facing);
  let vY = Math.sin(facing);

  minictx.clearRect(0,0,miniCanvas.width,miniCanvas.height);
  minictx.drawImage(testImg,0,0,testImg.width,testImg.height,0,0,miniCanvas.width,miniCanvas.height);
  minictx.fillStyle = "red";
  minictx.beginPath();
  minictx.arc(x, y, 2.5, 0, 2*Math.PI);
  minictx.fill();

  minictx.strokeStyle = "red";
  minictx.beginPath();
  minictx.moveTo(x,y);
  minictx.lineTo(x+(vX*15),y+(vY*15));
  minictx.stroke();
}

function drawBackground() {
  // Clear the canvas and draw sky and background
  ctx.fillStyle = "cyan";
  ctx.fillRect(0,0,canvas.width,canvas.height/2);
  ctx.fillStyle = "green";
  ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height);
}

function projectFloor(height) {
  // Precache the view angle in x,y vector notation
  const rX = Math.sin(facing);
  const rY = -Math.cos(facing);
  // Get the raw pixel data for the image and canvas
  const imgData = imgCtx.getImageData(0,0,testImg.width,testImg.height);
  const iD = new Uint32Array(imgData.data.buffer);
  const screenData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const sD = new Uint32Array(screenData.data.buffer);

  // We need the centre point of the canvas a lot, so precaching it helps speed the loops
  const halfWidth = canvas.width / 2;
  const halfHeight = canvas.height / 2;

  // Loop through the floor area of the screen in scanlines
  for (let y = halfHeight; y < canvas.height; y++) {
    // Calculate this scanline's z depth
    let pz = y - (halfHeight);

    for (let x = 0; x < canvas.width; x++) {
      let px = x-(halfWidth); // Shifts the origin to middle of the screen
      let py = canvas.height; // Sets the floor plane at the bottom of the canvas

      // Project screen coordinates to floor coordinates
      let wx = (px / pz);
      let wy = (py / pz);
      // Add camera rotation (basic vector rotation)
      let sx = wx * rX - wy * rY;
      let sy = wx * rY + wy * rX;
      // Offset for camera height and move to camera x/y position
      sx = ~~(sx * height + mapX);
      sy = ~~(sy * height + mapY);

      if (sx > 0 && sx < imgData.width && sy > 0 && sy < imgData.height){
        // Generate image and screen buffer offsets
        let soff = sy * imgData.width + sx;
        let doff = y * screenData.width + x;

        // Copy pixel data
        sD[doff] = iD[soff];
      }
    }
  }
  // Copy the buffer data back to the screen
  ctx.putImageData(screenData,0,0);
}

function drawSprite() {
  let x = (canvas.width/2)-(sprite.width*2);
  let y = canvas.height - (sprite.height*4) - 2;
  ctx.drawImage(sprite, x, y, sprite.width * 4, sprite.height * 4);
}

function moveView(dir) {
  let vX = Math.cos(facing);
  let vY = Math.sin(facing);
  mapX += (vX * 2) * dir;
  mapY += (vY * 2) * dir;
}

function rotateView(dir) {
  const circle = 2*Math.PI;
  facing += Math.degreesToRadian(dir);
  if (facing < 0) facing = circle + facing;
  if (facing > circle) facing -= circle;
}

document.addEventListener('keydown', function(e) {
    if (e.code === "ArrowLeft") rotate = 1;
    if (e.code === "ArrowRight") rotate = -1;
    if (e.code === "ArrowUp") move = 1;
    if (e.code === "ArrowDown") move = -1;
});

document.addEventListener('keyup', function(e) {
    if (e.code === "ArrowLeft") rotate = 0;
    if (e.code === "ArrowRight") rotate = 0;
    if (e.code === "ArrowUp") move = 0;
    if (e.code === "ArrowDown") move = 0;
});

let lastTime = performance.now();
function loop(time) {
  // Update state
  rotateView(rotate);
  moveView(move);
  // Draw Frame
  drawBackground();
  projectFloor(viewHeight);
  drawMap();
  drawSprite();
  // Draw overlays
  ctx.fillStyle = "black";
  ctx.fillText(`FPS: ${Math.floor(1000/(time - lastTime))}`, 5, 15);
  ctx.fillText(`X: ${~~mapX} Y: ${~~mapY} View Angle: ${~~Math.radianToDegrees(facing)}`, 5, 30);


  lastTime = time;
  window.requestAnimationFrame(loop);
}

