import { Point2D, Vector2D } from "./types2d.mjs";

/**
 * @module rendermanager
 */
/**
 * Encapsulates a simple image that can be drawn to a canvas
 */
class ImgAsset {
  constructor(image) {
    this._loaded = false;
    this._image = new Image();
    this._image.src = image;
    this._image.onload = () => this._loaded = true;
  }
  get loaded() {return this._loaded;}
  get pixels() {
    if (!this._loaded) throw "Image not loaded!";
    return this._pixels;
  }
  get width() {return this._image.width;}
  get height() {return this._image.height;}
  get image() {return this._image;}
}