/**
 * @module gameobjects
 */

import { Game } from "./gamemanager.mjs";
import { Point2D, Vector2D, BoundingCircle, BoundingBox } from "./types2d.mjs";

/**
 * Base class for an object on the map
 */
class GameObject {
  /**
   * Creates a new game object
   *  @param {Object} game - The gamemanager object
   *  @param {Object} sprite - This object's image asset
   *  @param {Object} position - Initial X, Y and facing angle for the object
   *  @param {Object} template - Initial values for object properties
   */
  constructor(game, sprite, position, template) {
    this._game = game;
    this._sprite = sprite;
    this._bounds = new BoundingCircle(position.x, position.y, template.radius);
    this._scale = template.scale;
    this._height = template.height;
    this._active = false;
  }

  get dimensions() {return this._bounds;}
  get image() {return this._sprite;}
  get height() {return this._height;}

  get active() {return this._active;}

  draw(renderer) {
    if (this._active) renderer.drawSprite(this._sprite, this._bounds, this._scale, this._height);
  }

  collision(object) {
    if (this._active && object._active) return this._bounds.collides(object._bounds);
    else return false;
  }

  playerCollision(player) {}
}

/**
 * Acts as the players avatar in the game
 */
class Player extends GameObject {
  /**
   * Creates a new player object
   *  @param {Object} game - The gamemanager object
   *  @param {Object} sprite - The image asset storing this players on screen character
   *  @param {Object} position - Initial X, Y and facing angle for the player
   *  @param {Object} template - Initial values for player object properties
   */
  constructor(game, sprite, position, template) {
    super(game, sprite, position, template);
    this._direction = new Vector2D(Math.cos(position.dir), Math.sin(position.dir));
    this._active = true;

    this._maxSpeed = template.maxSpeed;
    this._maxAcceleration = template.acceleration;
    this._turnSpeed = template.tSpeed;
    this._jumpPower = template.jumpPower;

    this._rotation = 0;
    this._acceleration = 0;
    this._speed = 0;
    this._vAcceleration = 0;
    this._jumping = false;
    this._skidding = 0;

    // Bonuses
    this._speedBonus = 0;
    this._speedCount = 0;
    this._accelBonus = 0;
    this._accelCount = 0;
    this._jumpBonus = 0;
    this._jumpCount = 0;
    this._offRoad = 0;
  }

  /** Returns the current player direction vector */
  get direction() {return this._direction;}

  /** Gives the player an initial upward acceleration */
  jump() {
    if (this._height === 0) {
      this._vAcceleration = (this._speed / this._maxSpeed) * (this._jumpPower + this._jumpBonus);
    }
  }
  get jumping() {return this._jumping;}

  get speed() {return this._speed;}
  set speed(val) {this._speed = val;}

  /** Returns the players current acceleration */
  get acceleration() {return this._acceleration;}
  /** Sets the players acceleration */
  accelerate(dir) {
    this._acceleration = this._maxAcceleration * dir;
  }

  /** Returns the current rotation offset */
  get rotation() {return this._rotation;}
  /** Sets the player's rotation */
  rotate(dir) {
    this._rotation = this._turnSpeed * dir;
  }

  /*
   * Object interaction
   */
  get skidding() {return this._skidding > 0;}
  set skidding(val) {this._skidding = val;}
  setSkidding(counter) {
    this._skidding = counter * (this._speed / this._maxSpeed);
  }

  get speedBonus() {return this._speedBonus;}
  get speedCount() {return this._speedCount;}
  setSpeedBonus(value, time) {
    this._speedBonus = value;
    this._speedCount += time;
  }

  get accelBonus() {return this._accelBonus;}
  get accelCount() {return this._accelCount;}
  setAccelBonus(value, time) {
    this._accelBonus = value;
    this._accelCount += time;
  }

  get jumpBonus() {return this._jumpBonus;}
  get jumpCount() {return this._jumpCount;}
  getJumpBonus(value, time) {
    this._jumpBonus = value;
    this._jumpCount += time;
  }

  get offRoadBonus() {return this._offRoad;}
  set offRoadBonus(val) {this._offRoad = val;}

  _checkCollisions() {
    // Run through every object and test for collision
    for (let i = 0; i < this._game.objectsCount; i++) {
      let object = this._game.getObject(i);
      if (this != object && this.collision(object)) {
        // Trigger the object's collision event
        object.playerCollision(this);
      }
    }
  }

  /**
   * Updates position and rotation based on time elasped since last update
   *  @param {number} timeDelta - Time in seconds since the last update
   */
  update(timeDelta) {
    const updateCounter = (counter) => counter - (20 * timeDelta);
    // If jumping or skidding the player has no control
    if (!this._jumping && this._skidding <= 0) {
      // Update speed
      let friction = 0;
      if (this._offRoad > 0) friction = this._game.trackFriction();
      else friction = this._game.friction(this._bounds);
      const mapSpeed = this._game.groundSpeed(this._bounds);

      // Don't add acceleration if we're traveling faster than the current max
      if (this._speed < (this._maxSpeed + mapSpeed + this._speedBonus)) {
        this._speed += (this._acceleration + this._accelBonus - friction) * timeDelta;
      } else {
        this._speed -= friction;
      }
      if (this._speed < 0) this._speed = 0;


      // Update rotation
      const rotation = ((this._rotation) * ((this._speed / this._maxSpeed)/2));
      if(this._speed > 0) this._direction.rotateByRadians(rotation * timeDelta);
    }

    // Update modifiers
    if (this._skidding > 0) this._skidding = updateCounter(this._skidding);
    else this._skidding = 0;

    if (this._speedCount > 0) this._speedCount = updateCounter(this._speedCount);
    else {
      this._speedCount = 0;
      this._speedBonus = 0;
    }

    if (this._accelCount > 0) this._accelCount = updateCounter(this._accelCount);
    else {
      this._accelCount = 0;
      this._accelBonus = 0;
    }

    if (this._jumpCount > 0) this._accelCount = updateCounter(this._jumpCount);
    else {
      this._jumpCount = 0;
      this._jumpBonus = 0;
    }

    if (this._offRoad > 0) this._offRoad = updateCounter(this._offRoad);
    else this._offRoad = 0;

    // Update position
    this._bounds.x += (this._direction.x * this._speed) * timeDelta;
    this._bounds.y += (this._direction.y * this._speed) * timeDelta;

    // Update vertical position
    this._height += this._vAcceleration * timeDelta;
    if (this._height <= 0) {
      this._height = 0;
      this._vAcceleration = 0;
      this._jumping = false;
    } else if (this._height > 0) this._jumping = true;
    this._vAcceleration -= this._game.gravity * timeDelta;
    this._checkCollisions();

    if (!this._game.track.inBounds(this._bounds.x, this._bounds.y))
      this._game.respawnAtLastCheckpoint();
  }

  // Simpler update for testing
  // update(timeDelta) {
  //   // Update rotation
  //   const rotation = this._rotation;
  //   this._direction.rotateByRadians(rotation * timeDelta);
  //
  //   // Update position
  //   this._bounds.x += (this._direction.x * this._acceleration * 2) * timeDelta;
  //   this._bounds.y += (this._direction.y * this._acceleration * 2) * timeDelta;
  //
  //   this._height=0;
  //
  //   this._checkCollisions();
  // }

}

/**
 * Defines a track checkpoint
 */
class CheckPoint extends GameObject {
  /**
   * Creates a new CheckPoint
   *  @param {Object} game - The gamemanager object
   *  @param {Object} sprite - This object's image asset
   *  @param {Object} position - Initial X, Y and facing angle for the object
   *  @param {Object} template - Initial values for object properties
   */
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template);
    // All checkpoints default to inactive. Only the next check point is active.
    this._active = false;
    // This checkpoint's Goal id
    this._id = id;
    // Player facing if they respawn at this checkpoint
    this._spawnDir = new Vector2D(
      Math.cos(position.f),
      Math.sin(position.f)
    );
  }

  get active() {return this._active;}
  get direction() {return this._spawnDir;}
  activate() {this._active = true;}
  deactivate() {this._active = false;}

  /**
   * Checks whether this checkpoint has just been passed
   */
  playerCollision(Player) {
    this._game.track.GoalCheck(this);
  }
}

/**
 * Base class for an object that the player can pickup. Obstacle or Power up
 */
class Pickup extends GameObject {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template);
    this._active = true;
    this._id = id;
    this._jumpable = template.jumpable;
  }
  doAction(player, func) {
    if (!this._jumpable || (this._jumpable && !player.jumping)) func(player);
  }
}

/**
 * Defines a peice of map scenery the player can collide with
 */
class Scenery extends GameObject {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template);
    this._active = true;
    this._id = id;
  }
}

/*
 * Custom objects here
 */
//////////////////////////////////////////////////////////// Bonuses
class GoFaster extends Pickup {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template, id);
  }
  playerCollision(player) {
    super.doAction(player, (player) => {
      player.setSpeedBonus(75, 100);
      this._active = false;
    });
  }
}

//////////////////////////////////////////////////////////// Obstacles
class BananaPeel extends Pickup {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template, id);
  }
  playerCollision(player) {
    // Hitting a banana makes the player skid for couple of seconds
    super.doAction(player, (player) => {
      player.setSkidding(40);
      this._active = false;
    });
  }
}

class Barrel extends Pickup {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template, id);
  }
  playerCollision(player) {
    super.doAction(player, (player) => {
      player.speed = 0;
      this._active = false;
    });
  }
}

//////////////////////////////////////////////////////////// Scenery
class Tree extends Scenery {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template, id);
  }
}

/**
 * Creates Game Objects on demand based on templates
 */
class ObjectFactory {

  constructor() {
    this._factories = new Map();
    this._factories.set("checkpoint", {
      create: (game, sprite, position, template, id) =>
        new CheckPoint(game, sprite, position, template, id)
    });
    this._factories.set("gofaster", {
      create: (game, sprite, position, template, id) =>
        new GoFaster(game, sprite, position, template, id)
    });
    this._factories.set("bananapeel", {
      create: (game, sprite, position, template, id) =>
        new BananaPeel(game, sprite, position, template, id)
    });
    this._factories.set("tree", {
      create: (game, sprite, position, template, id) =>
        new Tree(game, sprite, position, template, id)
    });
    this._factories.set("barrel", {
      create: (game, sprite, position, template, id) =>
        new Barrel(game, sprite, position, template, id)
    });
    // Add new game objects here
  }

  createObject(game, sprite, position, template, id) {
    const factory = this._factories.get(template.name);
    if (factory) return factory.create(game, sprite, position, template, id);
    return null;
  }

}

export { GameObject, Player, CheckPoint, Pickup, Scenery, ObjectFactory };