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
}

export { GameObject, Player };