// Engine Core Test code

import { ImgAsset, PixelImg, Renderer } from "./modules/rendermanager.mjs";

const renderer = new Renderer(document.getElementById('canvas'));
const floorImg = new PixelImg("./assets/img/tracks/test.png", floorLoaded);
const billboardImg = new ImgAsset("./assets/img/sprites/test.png");
renderer.camera.direction.x = Math.cos(1.57079632679);
renderer.camera.direction.y = Math.sin(1.57079632679);
renderer.camera.position.x = 80;
renderer.camera.position.y = 250;

function floorLoaded() {
  renderer.drawBackdrop();
  renderer.projectFloor(floorImg);
  renderer.drawSprite(billboardImg, {x:80, y:350});
}


