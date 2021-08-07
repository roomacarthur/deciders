import { Point2D, Vector2D } from "./types2d.mjs";

/**
 * @module rendermanager
 */
/**
 * Encapsulates a simple image that can be drawn to a canvas
 */
class ImgAsset {
  /**
   * Creates a new ImgAsset
   *  @param {String} image - The image file path for this texture
   *  @param {Object} callback - (Optional) Function to call when image loading complete
   */
  constructor(image, callback = null) {
    this._loaded = false;
    this._image = new Image();
    this._image.src = image;
    this._image.onload = () => {
      this._loaded = true;
      if (callback) callback();
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
}
/**
 * Encapsulates an image that can be read to and from on a per pixel basis
 */
class PixelImg {
  /**
   * Creates a new PixelImg
   *  @param {String} image - The image file path for this texture
   *  @param {Object} callback - (Optional) Function to call when image loading complete
   */
  constructor(image, callback = null) {
    this._loaded = false;
    this._image = new Image();
    this._image.src = image;
    this._image.onload = () => {
      // Create the buffer for reading the pixel data and move the image into it
      this._surface = document.createElement('canvas');
      this._surface.width = this._image.width;
      this._surface.height = this._image.height;
      this._context = this._surface.getContext('2d');
      this._context.drawImage(this._image, 0, 0);
      // Create a 32bit pixel buffer for the image pixel data
      this._data = this._context.getImageData(0,0,this._image.width,this._image.height);
      this._pixels = new Uint32Array(this._data.data.buffer);
      this._loaded = true;
      if (callback) callback();
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
    this._camera = new Camera2D(
      {x:0,y:0},
      {x:0,y:0},
      15
    );

  }

  get camera() {return this._camera;}

  /**
   * Performs an Affine Transformation on the given texture and projects it
   * to the floor plain.
   *  @param {Object} texture - A PixelImg object of the texture to draw
   */
  projectFloor(texture) {
    // We need the centre point of the canvas a lot, so precaching it helps speed the loops
    const halfWidth = this._canvas.width / 2;
    const halfHeight = this._canvas.height / 2;
    // Precache camera data
    const rX = this._camera.direction.y;
    const rY = -this._camera.direction.x;
    // We want to write directly to the canvas buffer so get the raw pixel data
    const screenData = this._ctx.getImageData(0,0,
      this._canvas.width, this._canvas.height);
    const screenPixels = new Uint32Array(screenData.data.buffer);

    // Loop through the floor area of the of the screen in scanlines
    for (let y = halfHeight+1; y < this._canvas.height; y++) {
      // Calculate this scanline's z depth
      let pZ = y - (halfHeight);
      for (let x = 0; x < this._canvas.width; x++) {
        let pX = x-(halfWidth);       // Shifts the origin to middle of the screen
        let pY = this._canvas.height; // Sets the floor plane at the bottom of the canvas
        // Project screen coordinates to floor coordinates
        let wX = (pX / pZ);
        let wY = (pY / pZ);
        // Add camera rotation (basic vector rotation)
        let sX = wX * rX - wY * rY;
        let sY = wX * rY + wY * rX;
        // Offset for camera height and move to camera x/y position
        sX = ~~(sX * this._camera.height + this._camera.position.x);
        sY = ~~(sY * this._camera.height + this._camera.position.y);
        // Is the pixel in the buffer?
        if (sX > 0 && sX < texture.width && sY > 0 && sY < texture.height) {
          // Convert screen and image coordinates to buffer offsets
          let soff = sY * texture.width + sX;
          let doff = y * screenData.width + x;
          // Copy pixel data
          screenPixels[doff] = texture.pixels[soff];
        }
      }
    }
    // Copy the buffer data back to the screen
    this._ctx.putImageData(screenData,0,0);
  }

  /**
   * Draws a given sprite to the screen
   *  @param {Object} image - The ImgAsset to draw
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
  constructor(position, direction, height) {
    this._position = new Point2D(position.x, position.y);
    this._direction = new Vector2D(direction.x, direction.x);
    this._height = height;
  }
  get position() {return this._position;}
  get direction() {return this._direction;}
  get height() {return this._height;}
  set height(val) {this._height = val;}
}

export { ImgAsset, PixelImg, Renderer, Camera2D };