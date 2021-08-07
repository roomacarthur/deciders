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
    // Game Objects
    this._setupEvents();

    this.test = 0;
  }

  /*
   * Setup
   */
  setupGame(trackTemplate, playerTemplate) {
    // Create Track
    this.track = new Track(
      this.getAsset(this.addAsset(trackTemplate.image, AssetTypes.IMAGE)),
      trackTemplate
    );
    // Create Player
    this._player = new Player(
      this,
      this.getAsset(this.addAsset(playerTemplate.sprite, AssetTypes.IMAGE)),
      trackTemplate.pSpawn,
      playerTemplate
    );
  }

  _setupEvents() {
    document.addEventListener("keydown", (event)=>this.keyDown(event));
    document.addEventListener("keyup", (event)=>this.keyUp(event));
  }

  start() {
    // Start game loop
    window.requestAnimationFrame((time)=>this._loop(time));
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
          new ImageAsset(
            file,
            this._assets.length,
            (id)=>this._registerAssetLoaded(id)
          )
        );
        break;
      case AssetTypes.SOUND:
        break;
    }
    return this._assets.length - 1;
  }

  getAsset(id) {
    return this._assets[id];
  }

  /*
   * Game Loop
   */
  _updateLoading(time) {}
  _drawLoading(time) {}

  _updatePlaying(time) {
    // Sort sprites by distance to player

    // Handle player input

    // Align camera to player
    let cX = this._player.dimensions.x - (this._player.direction.x * 35);
    let cY = this._player.dimensions.y - (this._player.direction.y * 35);
    this._renderer.camera.setPosition(cX, cY);
    this._renderer.camera.setDirection(
      this._player.direction.x,
      this._player.direction.y
    );
    // Check goals
  }

  _drawPlaying(time) {
    // Draw backdrop
    this._renderer.drawBackdrop();
    // Draw gound plain
    this._renderer.projectFloor(this.track.image);
    // Draw Player
    this._player.draw(this._renderer);
    // Draw objects
    // Draw interface
  }

  _loop(time) {
    this._updatePlaying(time);
    this._drawPlaying(time);

    window.requestAnimationFrame((time)=>this._loop(time));
  }

  /*
   * Player interaction
   */
  keyUp(event) {
    switch(event.code) {
      case "ArrowUp":     // Move Forware
        this._player.accelerate(0);
        break;
      case "ArrowDown":   // Move Backwards
        this._player.accelerate(0);
        break;
      case "ArrowLeft":   // Turn Left
        this._player.rotate(0);
        break;
      case "ArrowRight":  // Turn Right
        this._player.rotate(0);
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
        this._player.accelerate(1);
        break;
      case "ArrowDown":   // Move Backwards
        this._player.accelerate(-1);
        break;
      case "ArrowLeft":   // Turn Left
        this._player.rotate(1);
        break;
      case "ArrowRight":  // Turn Right
        this._player.rotate(-1);
        break;
      case "Space":       // Jump
        break;
      case "P":           // Pause
        break;
    }
  }
}

export { Game, AssetTypes, GameStates };