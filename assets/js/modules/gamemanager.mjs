/**
 * @module gamemanager
 */

import { ImgAsset, PixelImg, Renderer, Camera } from "./rendermanager.mjs";

/**
 * Game manager. Creates and manages game objects, runs the main game loop
 * and handles game state and logic.
 */
class Game {
  /**
   * Creates a new game
   *  @param {Object} canvas The canvas element to draw the game view to
   */
  constructor(canvas) {
    // Create Renderer
    this._renderer = new Renderer(canvas);
    
  }
}

export { Game };