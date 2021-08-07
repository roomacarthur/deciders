// Engine Core Test code

import { PixelImg, Renderer } from "./modules/rendermanager.mjs";

const floorImg = new PixelImg("./assets/img/tracks/test.png", floorLoaded);
const renderer = new Renderer(document.getElementById('canvas'));
renderer.camera.direction.x = Math.cos(1.57079632679);
renderer.camera.direction.y = Math.sin(1.57079632679);

function floorLoaded() {
  renderer.drawBackdrop();
  renderer.projectFloor(floorImg);
}


