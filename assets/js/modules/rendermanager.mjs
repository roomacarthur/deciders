import { Point2D, Vector2D } from "./types2d.mjs";

/**
 * @module rendermanager
 */

/**
 * Allows working with 32bit colors in a transparent manner regardless of the
 * edian-ness of the underlying hardware or the required colour format
 */
class ColorAsset {
  static channels = {
    red: 0, green: 1, blue: 2, alpha: 3
  }
  /**
   * Creates a new ColorAsset
   *  @param {number} alpha - (optional) defines the alpha channel for the color
   *  @param {number} red - (optional) defines the red channel component
   *  @param {number} green - (optional) defines the green channel component
   *  @param {number} blue - (optional) defines the blue channel component
   */
  constructor(alpha = 0, red = 0, green = 0, blue = 0) {
    this._buffer = new ArrayBuffer(4);
    this._channels = new Uint8Array(this._buffer);
    this._color = new Uint32Array(this._buffer);

    this._channels[0] = red;
    this._channels[1] = green;
    this._channels[2] = blue;
    this._channels[3] = alpha;
  }
  // Accessors
  get alpha() {return this._channels[3];}
  set alpha(val) {this._channels[3] = val;}
  get red() {return this._channels[0];}
  set alpha(val) {this._channels[0] = val;}
  get green() {return this._channels[1];}
  set alpha(val) {this._channels[1] = val;}
  get blue() {return this._channels[2];}
  set alpha(val) {this._channels[2] = val;}

  get color() {return this._color[0];}
  /**
   * Sets color from number in AARRGGBB format
   */
  set color(val) {
    // If the value is higher than 0xFFFFFF then there must be an alpha channel
    if (val > 0xFFFFFF) {
      this._channels[3] = val >> 24;
    } else {
      this._channels[3] = 0xFF;
    }
    this._channels[0] = (val >> 16) & 0xFF; // Red
    this._channels[1] = (val >> 8) & 0xFF;  // Green
    this._channels[2] = val & 0xFF;         // Blue
  }

  _hexC(ch) {
    return this._channels[ch].toString(16).padStart(2, '0');
  }

  get hexStr() {
    return ('#' + this._hexC(0) + this._hexC(1) + this._hexC(2));
  }

  get hexAStr() {
    return ('#' + this._hexC(0) + this._hexC(1) + this._hexC(2) + this._hexC(3));
  }

  get rgbStr() {
    return `rgb(${this._channels[0]},${this._channels[1]},${this._channels[2]})`;
  }

  get rgbaStr() {
    return `rgba(${this._channels[0]},${this._channels[1]},${this._channels[2]},${this._channels[3]})`;
  }

  /**
   * Sets the value of this color from a hex string
   */
  fromString(str) {
    // If there's a leading # remove it.
    if (str[0] === '#') str = str.substring(1);
    this.color = parseInt(str, 16);
  }
}

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
      // Create a 32bit pixel buffer for the image pixel data in system memory
      this._data = this._context.getImageData(0,0,this._image.width,this._image.height-1);
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

  getPixel(x,y) {
    if (this._loaded) {
      const pos = y * this._image.width + x;
      return this._pixels[pos];
    }
    return 0;
  }
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
    this._ctx.imageSmoothingEnabled = false;
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

  get frameTime() {return this._thisFrameTime;}

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
   *  @param {Object} image - An ImageAsset object of the texture to draw
   *  @param {Object} color - Default colour to draw if no pixel data
   */
  projectFloor(image, color = 0) {
    /* Setup: JS object accessors seem to be glacially slow, so precaching as
       much as possible offers an order of magnitude speed increase here.
       20ms > 2ms */
    // Screen data
    const width = this._canvas.width;
    const height = this._canvas.height;
    const halfWidth = width >> 1;
    const halfHeight = height >> 1;
    // Screen buffer
    const screenData = new ImageData(this._canvas.width, halfHeight);
    const screenPixels = new Uint32Array(screenData.data.buffer);
    // Source image data
    const imagePixels = image.pixels;
    const imageW = image.width;
    const imageH = image.height;
    // Camera properties
    const cVOff = this._camera.verticalOffset;
    const cX = this._camera.position.x;
    const cY = this._camera.position.y;
    // Create projection plane from camera view
    const rX = this._camera.direction.y;
    const rY = -this._camera.direction.x;
    let pixel = color;

    // Loop through the floor area of the screen in scanlines
    for (let y = 0; y < halfHeight; y++) {
      for (let x = 0; x < width; x++) {
        // Project screen coordinates to floor coordinates
        const wX = (x - halfWidth) / y;
        const wY = height / y;
        // Add camera rotation (basic vector rotation)
        let sX = wX * rX - wY * rY;
        let sY = wX * rY + wY * rX;
        // Offset for camera height and move to camera x/y position
        sX = ~~(sX * cVOff + cX);
        sY = ~~(sY * cVOff + cY);
        pixel = color;
        // Is the pixel in the buffer?
        if (sX > 0 && sX < imageW && sY > 0 && sY < imageH-1) {
          pixel = imagePixels[sY * imageW + sX];
        }
        screenPixels[y * width + x] = pixel;
      }
    }
    // Copy the buffer data to the screen
    this._ctx.putImageData(screenData, 0, halfHeight + 1);
  }

  /**
   * Draws a given sprite to the screen
   *  @param {Object} image - The ImageAsset to draw
   *  @param {Object} position - Point2D world position of the sprite
   *  @param {number} scale - Base scale for the sprite
   *  @param {number} height - Height of this sprite above the floor plain
   */
   drawSprite(image, position, scale = 1, height=0) {
     const screenW = this._canvas.width;
     const screenH = this._canvas.height;
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
     if (tY > this._camera.nearClip) {
       // Calculate distance scalar
       scale = this._camera.scale + scale;
       const aR = image.width / image.height;   // Aspect Ratio of source image
       const sH = Math.abs( ~~((screenH / tY) * scale) );
       const sW = sH * aR;
       // Camera height offset
       height = this._camera.verticalOffset - height;
       const vOffset = (screenH / tY) * height;
       // Calculate screen coordinates
       const sX = ~~( (screenW / 2) * (1 + tX / tY) - sW / 2 );
       const sY = ~~( ((screenH) / 2) - sH + vOffset);

       this._ctx.drawImage(image.image, sX, sY, sW, sH);
     }
   }

  /**
   * Currently draw a flat sky. Can be improved to
   * draw a skybox.
   */
  drawSky(sky="cyan") {
    this._ctx.fillStyle = sky;
    this._ctx.fillRect(0,0,canvas.width,(canvas.height/2)+1);
  }

  /**
   * Draws a dot on screen
   */
  drawDot(x, y, radius, color="#FFF") {
    this._ctx.fillStyle = color;
    this._ctx.beginPath();
    this._ctx.arc(x, y, radius, 0, 2*Math.PI);
    this._ctx.fill();
  }

  /**
   * Simple image drawing
   *  @param {Object} image The image to draw
   *  @param {Object} position The x,y screen coordinates of the top left corner
   */
  drawOverlayImage(image, position, width, height) {
    this._ctx.drawImage(image.image, position.x, position.y, width, height);
  }

  drawText(text, x, y, color="#000", outline=false, oColor = "#FFF") {
    this._ctx.fillStyle = color;
    this._ctx.fillText(text, x, y);
    if (outline) {
      this._ctx.strokeStyle = oColor;
      this._ctx.strokeText(text, x, y);
    }
  }

  setFont(size, font, align) {
    this._ctx.font = `${size}px ${font}`;
    this._ctx.textAlign = align;
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
    this._scale = 10;//scale;
    this._nearClip = nearClip;
    this._farClip = farClip
    this._height = height;
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

export { ColorAsset, ImageAsset, Renderer, Camera2D };
