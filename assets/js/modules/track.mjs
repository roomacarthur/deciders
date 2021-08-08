
import { Game, AssetTypes } from "./gamemanager.mjs";
import { CheckPoint, ObjectFactory } from "./gameobjects.mjs";

class Track {
  constructor(game, image, template) {
    this._game = game;
    this._image = image;
    this._template = template;
    // Load track mask
    this._mask = game.getAsset(game.addAsset(template.mask, AssetTypes.IMAGE))

    // Create Objects and checkpoints
    this._createCheckpoints(template);
  }

  _createCheckpoints(template) {
    this._checkPoints = new Array();

  }

  get image() {return this._image;}

  get skyColor() {return this._template.skyColor;}
  get groundColor() {return this._template.groundColor;}
}

export { Track };