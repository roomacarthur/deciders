/**
 * @module gameobjects
 */

import { Game } from "./gamemanager.mjs";
import { Point2D, Vector2D, BoundingCircle, BoundingBox } from "./types2d.mjs";

/**
 * Base class for an object on the map
 */
class GameObject {
  constructor(game, sprite, position, template) {
    this._game = game;
    this._sprite = sprite;
    this._bounds = new BoundingCircle(position.x, position.y, template.radius);
    this._height = 0;
  }

  get dimensions() {return this._bounds;}
  get image() {return this._sprite;}
  get height() {return this._height;}

  draw(renderer) {
    renderer.drawSprite(this._sprite, this._bounds, this._height);
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
    if (this._height === 0)
      this._vAcceleration = (this._speed / this._maxSpeed) * this._jumpPower;
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
      this._speed += (this._acceleration - this._game.friction) * timeDelta;
      if (this._speed > this._maxSpeed) this._speed = this._maxSpeed;
      else if (this._speed < 0) this._speed = 0;

      // Update rotation
      const rotation = ((this._rotation) * ((this._speed / this._maxSpeed)/2));
      this._direction.rotateByRadians(rotation * timeDelta);
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

}







export { GameObject, Player };