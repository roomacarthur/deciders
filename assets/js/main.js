// Engine Core Test code

import { PixelImg, Renderer } from "./modules/rendermanager.mjs";

const floorImg = new PixelImg("./assets/img/tracks/test.png", floorLoaded);
const renderManager = new Renderer(document.getElementById('canvas'));
renderManager.camera.direction.x = Math.cos(1.57079632679);
renderManager.camera.direction.y = Math.sin(1.57079632679);

function floorLoaded() {
  let ctx = document.getElementById('canvas').getContext('2d');
  ctx.drawImage(floorImg._surface,0,0);

  renderManager.projectFloor(floorImg);
}


