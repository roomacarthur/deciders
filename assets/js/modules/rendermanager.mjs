import { Point2D, Vector2D } from "./types2d.mjs";

/**
 * @module rendermanager
 */

/**
 * Encapsulates an image that can be read to and from on a per pixel basis
 */
class ImageAsset {
  /**
   * Creates a new ImageAsset
   *  @param {String} image - The image file path for this texture
   *  @param {number} id - The resource id
   *  @param {Object} callback - (Optional) Function to call when image loading complete
   */
  constructor(image, id=-1, callback = null) {
    this._loaded = false;
    this._id = id;
    this._image = new Image();
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
      if (callback) callback(this._id);
    }
    this._image.src = image;
  }

  get loaded() {return this._loaded;}

  get pixels() {
    //if (!this._loaded) throw "Image not loaded!";
    return this._pixels;
  }

  get width() {return this._image.width;}
  get height() {return this._image.height;}
  get image() {return this._image;}
  get id() {return this._id;}
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
      5,15,1000,10
    );
    this._thisFrameTime = 0;
    this._lastFrameTime = 0;
  }

  get camera() {return this._camera;}
  get canvas() {return this._canvas;}
  get context() {return this._ctx;}

  /**
   * Starts a draw frame
   *  @param {number} time The current time in milliseconds
   */
  startFrame(time) {
    this._thisFrameTime = time - this._lastFrameTime;
    return this._thisFrameTime;
  }
  /**
   * Ends the current draw frame
   *  @param {number} time The current time in milliseconds
   */
  endFrame(time) {
    this._lastFrameTime = time;
  }

  /**
   * Performs an Affine Transformation on the given texture and projects it
   * to the floor plain.
   *  @param {Object} texture - An ImageAsset object of the texture to draw
   */
  projectFloor(texture) {
    // We need the centre point of the canvas a lot, so precaching it helps speed the loops
    const halfWidth = this._canvas.width / 2;
    const halfHeight = this._canvas.height / 2;
    // Create project plane from camera view
    const rX = this._camera.direction.y;
    const rY = -this._camera.direction.x;
    // We want to write directly to the canvas buffer so get the raw pixel data
    const screenData = this._ctx.getImageData(0,0,
      this._canvas.width, this._canvas.height);
    const screenPixels = new Uint32Array(screenData.data.buffer);

    // Loop through the floor area of the screen in scanlines
    for (let y = halfHeight + 1; y < this._canvas.height; y++) {
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
        sX = ~~(sX * this._camera.verticalOffset + this._camera.position.x);
        sY = ~~(sY * this._camera.verticalOffset + this._camera.position.y);
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
   *  @param {Object} image - The ImageAsset to draw
   *  @param {Object} position - Point2D world position of the sprite
   *  @param {number} scale - Base scale for the sprite
   *  @param {number} height - Height of this sprite above the floor plain
   */
  drawSprite(image, position, scale = 1, height=0) {
    // Precache camera direction vector values
    const rX = this._camera.direction.x;
    const rY = this._camera.direction.y;
    // Generate projection plane
    const pX = rY / 2;
    const pY = -rX / 2;
    // Calculate the sprite's position in the world relative to the camera
    const wX = position.x - this._camera.position.x;
    const wY = position.y - this._camera.position.y;
    // Generate screen/world transform
    // tX = horizontal scalar, tY = depth from screen plane
    const invDet = 1.0 / (pX * rY - rX * pY);
    const tX = invDet * (rY * wX - rX * wY);
    const tY = invDet * (-pY * wX + pX * wY);
    // Is the sprite in front of the camera?
    if (tY > 20) {
      // Calculate distance scalar
      const aspectR = image.width / image.height;
      const spriteH = Math.abs( ~~((this._canvas.height / tY) * this._camera.scale) );
      const spriteW = spriteH * aspectR;
      // Camera height offset
      const vOffset = (this._canvas.height / tY) * (this._camera.height - height);
      // Calculate the sprite screen coordinates
      const sX = ~~( (this._canvas.width / 2) * (1 + tX / tY) - spriteW / 2 );
      const sY = ~~( ((this._canvas.height - spriteH) / 2) + (spriteH / 2) + vOffset);
      // Draw the sprite to screen
      this._ctx.drawImage(image.image, sX, sY, spriteW, spriteH);
    }
  }

  /**
   * Currently draw a flat sky and floor colour background. Can be improved to
   * draw a skybox.
   */
  drawBackdrop() {
    this._ctx.fillStyle = "cyan";
    this._ctx.fillRect(0,0,canvas.width,canvas.height/2);
    this._ctx.fillStyle = "green";
    this._ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height);
  }

  /**
   * Simple image drawing
   *  @param {Object} image The image to draw
   *  @param {Object} position The x,y screen coordinates of the top left corner
   */
  drawOverlayImage(image, position, width=-1, height=-1) {
    if (width= -1) width = image.width;
    if (height= -1) height = image.height;
    this._ctx.drawImage(image.image, position.x, position.y, width, height);
  }

  drawText(text, x, y, color="#000") {
    this._ctx.fillStyle = color;
    this._ctx.fillText(text, x, y);
  }
}

/**
 * Defines a 2D camera
 */
class Camera2D {
  /**
   * Creates a new camera
   *  @param {Object} position World x,y coordinate of the camera
   *  @param {Object} direction Camera view vector in X,Y notation
   *  @param {number} scale The base scale to apply to the view
   *  @param {number} nearClip The near clipping distance
   *  @param {number} farClip The far clipping distance
   *  @param {number} height The offset height above the floor plain
   */
  constructor(position, direction, scale, nearClip=5, farClip=1000, height=5) {
    this._position = new Point2D(position.x, position.y);
    this._direction = new Vector2D(direction.x, direction.x);
    this._scale = scale;
    this.nearClip = nearClip;
    this._farClip = farClip
    this._height = height;
    // Generate
  }
  // Getters and setters
  get position() {return this._position;}
  get direction() {return this._direction;}
  get height() {return this._height;}
  set height(val) {this._height = val;}
  get scale() {return this._scale;}
  set scale(val) {this._scale = val;}
  get nearClip() {return this._nearClip;}
  set nearClip(val) {return this._nearClip;}
  get farClip() {return this._farClip;}
  set farClip(val) {return this._farClip;}
  /** Returns the height of the camera taking scale into account */
  get verticalOffset() {return (this.scale + this._height);}

  setPosition(x,y) {
    this._position.x = x;
    this._position.y = y;
  }
  setDirection(x,y) {
    this._direction.x = x;
    this._direction.y = y;
  }
  //TODO: Vision checks
}

export { ImageAsset, Renderer, Camera2D };
