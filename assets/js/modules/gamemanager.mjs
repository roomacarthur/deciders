/**
 * @module gamemanager
 */

import { ImgAsset, PixelImg, Renderer, Camera } from "./rendermanager.mjs";

const AssetTypes = {
  IMAGE: "image",
  SOUND: "sound"
};

const GameStates = {
  PAUSED: "paused",
  LOADING: "loading",
  PLAYING: "playing",
  FINISHED: "finished"
}

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
    
  /*
   * Player interaction
   */
  keyUp(event) {
    switch(event.code) {
      case "ArrowUp":     // Move Forware
        break;
      case "ArrowDown":   // Move Backwards
        break;
      case "ArrowLeft":   // Turn Left
        break;
      case "ArrowRight":  // Turn Right
        break;
      case "Space":       // Jump
        break;
      case "P":           // Pause
        break;
    }
  }

  keyDown(event) {
    switch(event.code) {
      case "ArrowUp":     // Move Forware
        break;
      case "ArrowDown":   // Move Backwards
        break;
      case "ArrowLeft":   // Turn Left
        break;
      case "ArrowRight":  // Turn Right
        break;
      case "Space":       // Jump
        break;
      case "P":           // Pause
        break;
    }
  }
}

export { Game, AssetTypes, GameStates };