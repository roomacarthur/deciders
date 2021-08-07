/**
 * @module entities2d
 *
 *  Defines interactive objects that exist within a 2D space
 */
import { Point2D, Vector2D } from "./types2d.mjs";

class Object2D {
  constructor() {
    this._position = new Point2D(0,0);
  }
}
