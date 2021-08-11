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
 * Basic clock class. Encapsulates basic time functions.
 */
class Clock {
  constructor(time) {
    this._time = time;
  }
  get time() {return this._time;}
  set time(val) {this._time = val;}

  get hours() {
    return Math.floor( (this._time  / 3600000) % 24);
  }
  get minutes() {
    return Math.floor( (this._time / 60000) % 60 );
  }
  get seconds() {
    return Math.floor( (this._time / 1000) % 60 );
  }
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
  constructor(canvas, trackTemplate, playerTemplate, objectTypes, debugging=false) {
    this._debug = debugging;
    // Create Renderer
    this._renderer = new Renderer(canvas);
    // Asset lists
    this._assets = new Array();
    this._assets.loadedCount = 0;
    // State management
    this._state = GameStates.LOADING;
    this._lastState = this._state;

    this._clock = new Clock(0);
    this._gameStartTime = 0;

    this._setupEvents();
    this._setupGame(trackTemplate, playerTemplate, objectTypes);
  }

  groundSpeed(pos) {return this._track.getMapSpeed(pos);}
  friction(pos) {return this._track.getFriction(pos);}
  get gravity() {return this._track.gravity;}

  get state() {return this._state;}

  get track() {return this._track;}

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

    this._objects.push(this._player);
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
        actionUp:()=>null,
        actionDn:()=>this._player.jump()
      },
      pause: {
        up: false,
        down: false,
        actionUp:()=>null,
        actionDn:()=>null
      },
      respawn: {
        up: false,
        down: false,
        actionUp:()=>this.respawnAtLastCheckpoint(),
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
    this._keyMap.set("KeyR", "respawn");
  }

  start() {
    this._state = GameStates.PLAYING;

    this._gameStartTime = performance.now();

    this._frameCounter = 0;
    this._avgFPS = 0;
    // Start game loop
    window.requestAnimationFrame((time)=>this._loop(time));
  }

  /*
   * Asset management
   */false
  _registerAssetLoaded(id) {
    this._assets.loadedCount++;
    // Have we finished loading all our assets?
    if (this._assets.loadedCount >= this._assets.length-1) {
      this._state = GameStates.PLAYING;//GameStates.LOADED;
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

   get objectsCount() {return this._objects.length;}

  /*
   * Game logic
   */
  _checkVictory() {
    // Has the player completed all their laps
    if (this._track.currentLap >= this._track.totalLaps) {
      this._state = GameStates.FINISHED;
      return true;
    }
    return false;
  }

  respawnAtLastCheckpoint() {
    const lastCheckPoint = this._track.lastCheckPoint;
    this._player.dimensions.x = lastCheckPoint.dimensions.x;
    this._player.dimensions.y = lastCheckPoint.dimensions.y;
    this._player.direction.x = lastCheckPoint.direction.x;
    this._player.direction.y = lastCheckPoint.direction.y;
    this._player.speed = 0;
    this.addTimeToClock(5000);
  }

  /**
   * Adds a time penalty to the clock
   *  @param {number} time The time, in milliseconds, to add to the clock. If negative will subtract time
   */
  addTimeToClock(time) {
    this._gameStartTime -= time;
    const curTime = performance.now();
    // Make sure time can't go negative
    if (curTime < this._gameStartTime) {
      this._gameStartTime = curTime;
    }
  }

  /*
   * Game Loop
   */
  _sortObjects() {
    // Sorts all the objects based on distance to the camera so that when
    // they're drawn closer objects are drawn in front.
    this._objects.sort((a,b) => {
      const aD = this._renderer.camera.position.distanceTo2(a.dimensions);
      const bD = this._renderer.camera.position.distanceTo2(b.dimensions);
      if (aD > bD) return -1;
      if (aD < bD) return 1;
      return 0;
    });
  }

  _update(time) {
    // Check if playing or paused...
    if (this._state === GameStates.PLAYING) {
      const timeDelta = time / 1000;
      // Update clock
      this._clock.time = performance.now() - this._gameStartTime;

      // Sort sprites by distance to camera
      this._sortObjects();

      // Handle user input
      this._handleKeys();

      // Update object states
      this._player.update(timeDelta);

      // Align camera to player
      let cX = this._player.dimensions.x - (this._player.direction.x * 45);
      let cY = this._player.dimensions.y - (this._player.direction.y * 45);
      this._renderer.camera.setPosition(cX, cY);
      this._renderer.camera.setDirection(
        this._player.direction.x,
        this._player.direction.y
      );

      // Check goals and victory conditions
      this._checkVictory();
    }
  }

  _drawDebugInfo(time, top) {
    this._renderer.setFont(12, "sans", 'left');
    this._renderer.drawText(`FPS: ${~~(1000/(time))}`, 5, top);
    this._renderer.drawText(
      `X: ${~~this._player.dimensions.x} Y: ${~~this._player.dimensions.y}`, 5, top + 15
    );
    this._renderer.drawText(
      `Facing: ${Math.atan2(this._player.direction.y,this._player.direction.x)}`,
      5, top + 30
    );
    this._renderer.drawText(`Height: ${this._player.height}`, 5, top + 45);
  }

  _drawHUD(time) {
    const w = this._renderer.canvas.width;
    const h = this._renderer.canvas.height;
    // Draw small track image
    this._renderer.drawOverlayImage(this._track.image, {x:5,y:5}, 100, 100);
    // Plot player position
    let x = ((this._player.dimensions.x / this._track.image.width) * 100) + 5;
    let y = ((this._player.dimensions.y / this._track.image.height) * 100) + 5;
    this._renderer.drawDot(x, y, 5, "red");
    // Plot checkPoints
    const checkPoints = this._track.checkPoints;
    for (let i = 0; i < checkPoints.length; i++) {
      x = ((checkPoints[i].dimensions.x / this._track.image.width) * 100);
      y = ((checkPoints[i].dimensions.y / this._track.image.height) * 100)
      if (checkPoints[i].active) {
        x += 8;
        y += 8;
        this._renderer.drawDot(x, y, 8, "Orange");
      } else {
        x += 4;
        y += 4;
        this._renderer.drawDot(x, y, 4, "grey");
      }
    }

    // Draw Lap counter
    let lap = this._track.currentLap + 1;
    if (lap > this._track.totalLaps) lap = this._track.totalLaps;
    this._renderer.setFont(18, "'Press Start 2P'", "right");
    this._renderer.drawText(
      `Lap: ${lap} of ${this._track.totalLaps}`,
      w-5, 25, "black", true, "white"
    );
    // Draw clock
    const min = String(this._clock.minutes).padStart(2, '0');
    const sec = String(this._clock.seconds).padStart(2, '0');
    this._renderer.drawText(`${min}:${sec}`, w-5, 50, "black", true, "white");

    // Draw Messages
    if (this._state === GameStates.FINISHED) {
      this._renderer.setFont(24, "'Press Start 2P'", "center");
      this._renderer.drawText("Track complete", w/2, h/2, "black", true, "white");
    }

    if (this._debug) this._drawDebugInfo(time, h/2);
  }

  _draw(time) {
    // Draw backdrop
    this._renderer.drawSky(this._track.skyColor);
    // Draw gound plain
    if (this._track.image.loaded) this._renderer.projectFloor(this._track.image, 0xFF1C2F84);
    // Draw objects
    for (let i = 0; i < this._objects.length; i++) {
      this._objects[i].draw(this._renderer);
    }
    // Draw interface
    this._drawHUD(time);
  }

  _loop(time) {
    this._frameCounter++;
    const frameTime = this._renderer.startFrame(time);

      this._frameCounter++;
      this._update(frameTime);
      this._draw(frameTime);

    this._renderer.endFrame(time);
    this._avgFPS = (1000 / ((performance.now() - this._gameStartTime) / this._frameCounter));

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