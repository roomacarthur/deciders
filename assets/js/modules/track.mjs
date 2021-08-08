
import { CheckPoint } from "./gameobjects.mjs";

class Track {
  constructor(game, image, template) {
    this._image = image;
    // Create Objects and checkpoints
    this._checkPoints = new Array();

  }

  get image() {return this._image;}
}

export { Track };