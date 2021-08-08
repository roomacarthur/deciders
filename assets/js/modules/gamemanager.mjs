/**
 * @module gamemanager
 */

import { ImageAsset, Renderer, Camera2D } from "./rendermanager.mjs";
import { Track } from "./track.mjs";
import { Player, ObjectFactory } from "./gameobjects.mjs";

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
  constructor(canvas, trackTemplate, playerTemplate, objectTypes) {
    // Create Renderer
    this._renderer = new Renderer(canvas);
    // Asset lists
    this._assets = new Array();
    this._assets.loadedCount = 0;
    // State management
    this._state = GameStates.LOADING;
    this._lastState = this._state;

    this._setupEvents();
    this._setupGame(trackTemplate, playerTemplate, objectTypes);
  }

  /**
   * Returns how much speed should be reduced per second due to friction
   * This value should be pulled from the track depending on whether the player#
   * is on the track or not.
   */
  get friction() {return 25;}
  get gravity() {return 50;}

  get state() {}

  /*
   * Setup
   */
  _setupGame(trackTemplate, playerTemplate, objectTypes) {
    // Load object templates
    this._objectTemplates = new Map();
    for (let i = 0; i < objectTypes.length; i++) {
      this._objectTemplates.set(objectTypes[i].name, {
        template: objectTypes[i],
        sprite: this.getAsset(this.addAsset(objectTypes[i].sprite, AssetTypes.IMAGE))
      });
    }

    // Create object factory
    this._objectFactory = new ObjectFactory();

    // Create empty object list
    this._objects = new Array();

    // Create Track
    this._track = new Track(
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
    this._state = GameStates.PLAYING;
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
   * Object management
   */
   /**
    * Creates a new game object from a template and adds it to the object list
    *  @param {string} type - name identifier of the object template
    *
    */
   createObject(type, position) {
     // Get the template
     const template = this._objectTemplates.get(type);
     if (template) {
       // Create the object, add it to the list and return it
       this._objects.push(
         this._objectFactory.createObject(
           this,
           template.sprite,
           position,
           template.template,
           this._objects.length
         )
       );
       return this._objects[this._objects.length-1];
     }
     return null;
   }

   getObject(id) {
     return this._objects[id];
   }

  /*
   * Game Loop
   */
  _sortObjects() {}

  _updatePlaying(time) {

    // Check if playing or paused...

    const timeDelta = time / 1000;
    // Sort sprites by distance to camera
    this._sortObjects();

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
    this._renderer.drawBackdrop(this._track.skyColor, this._track.groundColor);
    // Draw gound plain
    if (this._track.image.loaded) this._renderer.projectFloor(this._track.image);
    // Draw Player
    this._player.draw(this._renderer);
    // Draw objects
    for (let i = 0; i < this._objects.length; i++) {
      this._objects[i].draw(this._renderer);
    }
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