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
  }

  /**
   * Returns how much speed should be reduced per second due to friction
   * This value should be pulled from the track depending on whether the player#
   * is on the track or not.
   */
  get friction() {return 25;}
  get gravity() {return 50;}

  /*
   * Setup
   */
  setupGame(trackTemplate, playerTemplate) {
    // Create Track
    this.track = new Track(
      this,
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
    // Create Objects
  }

  _setupEvents() {
    document.addEventListener("keydown", (event)=>this.keyDown(event));
    document.addEventListener("keyup", (event)=>this.keyUp(event));
    // Maps events to actions
    this._actionMap = {
      forwards: {
        up: false,
        down: false,
        actionUp:()=>this._player.accelerate(0),
        actionDn:()=>this._player.accelerate(1)
      },
      backwards: {
        up: false,
        down: false,
        actionUp:()=>this._player.accelerate(0),
        actionDn:()=>this._player.accelerate(-2)
      },
      left: {
        up: false,
        down: false,
        actionUp:()=>this._player.rotate(0),
        actionDn:()=>this._player.rotate(1)
      },
      right: {
        up: false,
        down: false,
        actionUp:()=>this._player.rotate(0),
        actionDn:()=>this._player.rotate(-1)
      },
      jump: {
        up: false,
        down: false,
        actionUp:()=>this._player.jump(),
        actionDn:()=>null
      },
      pause: {
        up: false,
        down: false,
        actionUp:()=>null,
        actionDn:()=>null
      }
    }
    // Maps keys to events
    this._keyMap = new Map();
    this._keyMap.set("ArrowUp", "forwards");
    this._keyMap.set("ArrowDown", "backwards");
    this._keyMap.set("ArrowLeft", "left");
    this._keyMap.set("ArrowRight", "right");
    this._keyMap.set("Space", "jump");
    this._keyMap.set("KeyP", "pause");
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

  _sortSprites() {}

  _updatePlaying(time) {
    const timeDelta = time / 1000;
    // Sort sprites by distance to player

    // Handle user input
    this._handleKeys();

    // Update object states
    this._player.update(timeDelta);

    // Align camera to player
    let cX = this._player.dimensions.x - (this._player.direction.x * 35);
    let cY = this._player.dimensions.y - (this._player.direction.y * 35);
    this._renderer.camera.setPosition(cX, cY);
    this._renderer.camera.setDirection(
      this._player.direction.x,
      this._player.direction.y
    );

    // Check goals and victory conditions
  }

  _drawDebugInfo(time) {
    this._renderer.drawText(`FPS: ${~~(1000/(time))}`, 5, 15);
    this._renderer.drawText(
      `X: ${~~this._player.dimensions.x} Y: ${~~this._player.dimensions.y}`, 5, 30
    );
    this._renderer.drawText(
      `Facing: ${Math.atan2(this._player.direction.y,this._player.direction.x)}`,
      5, 50
    );
  }

  _drawPlaying(time) {
    // Draw backdrop
    this._renderer.drawBackdrop();
    // Draw gound plain
    if (this.track.image.loaded) this._renderer.projectFloor(this.track.image);
    // Draw Player
    this._player.draw(this._renderer);
    // Draw objects
    // Draw interface
    this._drawDebugInfo(time);
  }

  _loop(time) {
    const frameTime = this._renderer.startFrame(time);
    this._updatePlaying(frameTime);
    this._drawPlaying(frameTime);

    this._renderer.endFrame(time);
    window.requestAnimationFrame((time)=>this._loop(time));
  }

  /*
   * Player interaction
   */
  _handleKeys() {
    for (let [key, action] of Object.entries(this._actionMap)) {
      if (action.down) action.actionDn();
      if (action.up) {
        action.actionUp();
        action.up = false;
      }
    }
  }

  keyDown(event) {
    const key = this._keyMap.get(event.code);
    if (key) {
      this._actionMap[key].down = true;
      this._actionMap[key].up = false;
    }
  }

  keyUp(event) {
    const key = this._keyMap.get(event.code);
    if (key) {
      this._actionMap[key].down = false;
      this._actionMap[key].up = true;
    }
  }
}

export { Game, AssetTypes, GameStates };