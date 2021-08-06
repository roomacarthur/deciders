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
/**
 * Encapsulates an image that can be read to and from on a per pixel basis
 */
class PixelImg {
  /**
   * Creates a new Texture
   *  @param {String} image - The image file path for this texture
   */
  constructor(image) {
    this._loaded = false;
    this._image = new Image();
    this._image.src = image;
    this._image.onload = () => {
      // Create the buffer for reading the pixel data and move the image into it
      this._surface = document.createElement('canvas');
      this._context = this._surface.getContext('2d');
      this._context.drawImage(this._image, 0, 0);
      // Create a 32bit pixel buffer for the image pixel data
      this._data = this._context.getImageData(0,0,this._image.width,this._image.height);
      this._pixels = new Uint32Array(this._data.data.buffer);
    });
      this._loaded = true;
    }
  }

  get loaded() {return this._loaded;}

  get pixels() {
    if (!this._loaded) throw "Image not loaded!";
    return this._pixels;
  }

  get width() {return this._image.width;}
  get height() {return this._image.height;}
  get image() {return this._image;}
}/**
}
/**
 * Manages rendering to the screen
 */
class Renderer {
  /**
   * Creates a new RenderManager
   *  @param {Object} canvas - The HTML canvas object to draw on
   */
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    // Create the camera
    this._camera = new Camera2D({x:0,y:0},{x:0,y:1});

  }


  /**
   * Draws a given sprite to the screen
   */
  drawSprite(image) {}
}

/**
 * Defines a 2D camera
 */
class Camera2D {
  /**
   * Creates a new camera
   */
  constructor(position, direction) {
    this._position = new Point2D(position.x, position.y);
    this._direction = new Vector2D(direction.x, direction.x);
  }
}