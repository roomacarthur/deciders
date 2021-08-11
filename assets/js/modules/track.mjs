
import { Game, AssetTypes } from "./gamemanager.mjs";
import { ColorAsset, ImageAsset } from "./rendermanager.mjs";
import { CheckPoint, ObjectFactory } from "./gameobjects.mjs";

class Track {
  constructor(game, image, template) {
    this._game = game;
    this._image = image;
    this._skyColor = new ColorAsset();
    this._skyColor.fromString(template.skyColor);
    this._groundColor = new ColorAsset();
    this._groundColor.fromString(template.groundColor);
    this._template = template;
    // Load track mask
    this._mask = game.getAsset(game.addAsset(template.mask, AssetTypes.IMAGE))

    // Create Objects and checkpoints
    this._createCheckpoints(template);
    this._createObjects(template);

    // Set initial Checkpoint
    this._goalPoint = 0;
    this._checkPoints[0].activate();

    this._currentLap = 0;
  }

  /*
   * Setup
   */

  _createCheckpoints(template) {
    this._checkPoints = new Array();
    for (let i = 0; i < template.checkpoints.length; i++) {
      let checkpoint = this._game.createObject("checkpoint", template.checkpoints[i]);
      this._checkPoints.push(checkpoint);
    }
  }

  _createObjects(template) {
    for (let i = 0; i < template.objects.length; i++) {
      this._game.createObject(template.objects[i].t, template.objects[i]);
    }
  }

  /*
   * Accessors
   */

  get image() {return this._image;}
  get skyColor() {return this._skyColor;}
  get groundColor() {return this._groundColor;}
  get gravity() {return this._template.gravity;}
  get currentLap() {return this._currentLap;}
  get totalLaps() {return this._template.laps;}
  get checkPoints() {return this._checkPoints;}
  get lastCheckPoint() {
    if (this._goalPoint > 0) return this._checkPoints[this._goalPoint - 1];
    return this._checkPoints[this.checkPoints.length - 1];
  }

  get trackFriction() {return this._template.tDrag;}

  inBounds(x,y) {
    return (x > 0 && x < this._image.width && y > 0 && y < this._image.height);
  }

  getFriction(pos) {
    // Get the value of the mask at the given coordinates
    const pixel = this._mask.getPixel(~~pos.x, ~~pos.y);
    // Is the pixel black or white?
    if (pixel > 0xFF888888) {
      // Track
      return this._template.tDrag;
    } else {
      // Dirt
      return this._template.dDrag;
    }
    return this._template.dDrag;
  }

  getMapSpeed(pos) {
    // Get the value of the mask at the given coordinates
    const pixel = this._mask.getPixel(~~pos.x, ~~pos.y);
    // Is the pixel black or white?
    if (pixel < 0xFF888888) {
      return this._template.dSpeed;
    }
    return 0;
  }

  /*
   * Game Logic
   */
  GoalCheck(checkPoint) {
    if (checkPoint === this._checkPoints[this._goalPoint]) {
      checkPoint.deactivate();
      this._goalPoint++;

      if (this._goalPoint >= this._checkPoints.length) {
        // All goals complete, register lap complete
        this._goalPoint = 0;
        this._currentLap++;
      }

      this._checkPoints[this._goalPoint].activate();
    }
  }
}

export { Track };