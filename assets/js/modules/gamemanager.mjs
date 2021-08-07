/**
 * @module gamemanager
 */

import { ImageAsset, Renderer, Camera2D } from "./rendermanager.mjs";
import { Track } from "./track.mjs";
import { Player } from "./gameobjects.mjs";

const AssetTypes = {
  IMAGE: "image",
  SOUND: "sound"
};

const GameStates = {
  LOADING: "loading",
  LOADED: "loaded",
  PLAYING: "playing",
  PAUSED: "paused",
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
    // Asset lists
    this._assets = new Array();
    this._assets.loadedCount = 0;
    // State management
    this._state = GameStates.LOADING;
    this._lastState = this._state;
  }

  /*
   * Asset management
   */
  _registerAssetLoaded(id) {
    this._assets.loadedCount++;
    // Have we finished loading all our assets?
    if (this._assets.loadedCount >= this._assets.length-1) {
      this._state = GameStates.LOADED;
    } else {
      this._state = GameStates.LOADING;
    }
  }

  addAsset(file, type) {
    switch(type) {
      case AssetTypes.IMAGE:
        // Creates a new image asset and adds it to the assets list
        this._assets.push(
          new ImgAsset(
            file,
            this._assets.length,
            (id)=>this._registerAssetLoaded(id)
          )
        );
        break;
      case AssetTypes.SOUND:
        break;
    }
  }

  getAsset(id) {
    return this._assets[id];
  }

  /*
   * Setup
   */
  _setupGame() {

  }

  _setupEvents() {
    document.addEventListener("keydown", (event)=>this.keyDown(event));
    document.addEventListener("keyup", (event)=>this.keyUp(event));
  }

  _start() {
    // Start game loop
    window.requestAnimationFrame((time)=>this._loop(time));
  }

  /*
   * Game Loop
   */
  _updateLoading(time) {}
  _drawLoading(time) {}

  _updatePlaying(time) {
    // Sort sprites by distance to player
    // Handle player input
    // Check goals
  }

  _drawPlaying(time) {
    // Draw backdrop
    // Draw gound plain
    // Draw objects
    // Draw interface
  }

  _loop(time) {
    switch(this._state) {
      GameStates.LOADING:
      GameStates.LOADED:
        this._updateLoading(time);
        this._drawLoading(time);
        break;
      GameStates.PLAYING:
        this._updatePlaying(time);
        this._drawPlaying(time);
        break;
    }
  }

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