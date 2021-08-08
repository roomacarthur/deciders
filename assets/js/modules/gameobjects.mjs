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
  }

  get dimensions() {return this._bounds;}
  get image() {return this._sprite;}

  draw(renderer) {
    renderer.drawSprite(this._sprite, this._bounds)
  }

  collision(object) {
    return this._bounds.collides(object._bounds);
  }
}

/**
 * Acts as the players avatar in the game
 */
class Player extends GameObject {
  constructor(game, sprite, position, template) {
    super(game, sprite, position, template);
    this._direction = new Vector2D(Math.cos(position.dir), Math.sin(position.dir));

    this._maxSpeed = template.maxSpeed;
    this._maxAcceleration = template.acceleration;
    this._turnSpeed = template.tSpeed;

    this._rotation = 0;
    this._acceleration = 0;
    this._speed = 0;
  }

  get direction() {return this._direction;}

  /* TODO:
    Jumping - Add an instantaneous vertical velocity that adds to Height each frame,
      a gravity term will reduce the vertical velocity to negative until the player
      height is 0.
    Accelerate - Adds positive or negative value to speed until at max or negative max
    IF not acclerating a friction value subtracts from speed until 0;
    Turn - If speed != 0 rotate direction vector
  */
  get acceleration() {return this._acceleration;}
  accelerate(dir) {
    this._acceleration = this._maxAcceleration * dir;
  }

  get rotation() {return this._rotation;}
  rotate(dir) {
    this._rotation = this._turnSpeed * dir;
  }

  /**
   * Updates position and rotation based on time passed
   *  @param {number} timeDelta - Time in seconds since the last update
   */
  update(timeDelta) {

    // Update speed
    this._speed += (this._acceleration - this._game.friction) * timeDelta;
    if (this._speed > this._maxSpeed) this._speed = this._maxSpeed;
    else if (this._speed < 0) this._speed = 0;

    // Update position
    this._bounds.x += (this._direction.x * this._speed) * timeDelta;
    this._bounds.y += (this._direction.y * this._speed) * timeDelta;

    // Update rotation
    const rotation = ((this._rotation) * ((this._speed / this._maxSpeed)/2));
    this._direction.rotateByRadians(rotation * timeDelta);
  }

}

export { GameObject, Player };