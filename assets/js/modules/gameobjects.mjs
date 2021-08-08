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
  }

  get dimensions() {return this._bounds;}
  get image() {return this._sprite;}
  get height() {return this._height;}

  draw(renderer) {
    renderer.drawSprite(this._sprite, this._bounds, this._scale, this._height);
  }

  collision(object) {
    return this._bounds.collides(object._bounds);
  }
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

    this._maxSpeed = template.maxSpeed;
    this._maxAcceleration = template.acceleration;
    this._turnSpeed = template.tSpeed;
    this._jumpPower = template.jumpPower;

    this._rotation = 0;
    this._acceleration = 0;
    this._speed = 0;
    this._vAcceleration = 0;
    this._jumping = false;
  }

  /** Returns the current player direction vector */
  get direction() {return this._direction;}

  /** Gives the player an initial upward acceleration */
  jump() {
    if (this._height === 0) {
      this._vAcceleration = (this._speed / this._maxSpeed) * this._jumpPower;
    }
  }

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

  /**
   * Updates position and rotation based on time elasped since last update
   *  @param {number} timeDelta - Time in seconds since the last update
   */
  update(timeDelta) {
    if (!this._jumping) {
      // Update speed
      const friction = this._game.friction(this._bounds);
      const mapSpeed = this._game.groundSpeed(this._bounds);
      
      // Don't add acceleration if we're traveling faster than the current max
      if (this._speed < (this._maxSpeed + mapSpeed)) {
        this._speed += (this._acceleration - friction) * timeDelta;
      } else {
        this._speed -= friction;
      }
      if (this._speed < 0) this._speed = 0;


      // Update rotation
      const rotation = ((this._rotation) * ((this._speed / this._maxSpeed)/2));
      if(this._speed > 0) this._direction.rotateByRadians(rotation * timeDelta);
    }

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
  }

  // update(timeDelta) {
  //   // Update rotation
  //   const rotation = this._rotation;
  //   this._direction.rotateByRadians(rotation * timeDelta);
  //
  //   // Update position
  //   this._bounds.x += (this._direction.x * this._acceleration) * timeDelta;
  //   this._bounds.y += (this._direction.y * this._acceleration) * timeDelta;
  //
  //   this._height=0;
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
  }

  get active() {return this._active;}
  activate() {this._active = true;}
  deactivate() {this._active = false;}

  /**
   * Checks whether this checkpoint has just been passed
   */
  playerCollision(Player) {
    // If this checkpoint is the next goal and the player has collided with it:
    if (this._active && super._bounds.collides(Player._bounds)) {
      // Deactivate this checkpoint.

    }
  }
}

/**
 * Base class for an object that the player can pickup. Obstacle or Power up
 */
class Pickup extends GameObject {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template);
    this._active = false;
    this._id = id;
  }
}

/**
 * Defines a peice of map scenery the player can collide with
 */
class Scenery extends GameObject {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template);
    this._active = false;
    this._id = id;
  }
}

class GoFaster extends Pickup {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template, id);
  }
  pickup(player) {
    // Do power up action code here
  }
}

class BananaPeel extends Pickup {
  constructor(game, sprite, position, template, id) {
    super(game, sprite, position, template, id);
  }
  pickup(player) {
    // Do power up action code here
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
    // Add new game objects here
  }

  createObject(game, sprite, position, template, id) {
    const factory = this._factories.get(template.name);
    if (factory) return factory.create(game, sprite, position, template, id);
    return null;
  }

}

export { GameObject, Player, CheckPoint, Pickup, Scenery, ObjectFactory };