/** @module tilemap2d */

/**
 * Stores individual tile information
 */
class Tile2D {
  /**
   * Creates a new tile
   *  @param {number} type - Surface type of this tile
   *  @param {boolean} passable - Can this tile be traversed?
   *  @param {boolean} opaque - Does this tile stop ray traversal?
   */
  constructor(type, blocking, opaque) {
    this._type = type;
    this._blocking = blocking;
    this._opaque = opaque;
  }
  /** Returns tile type */
  get type() {
    return this._type;
  }
  /** Sets tile type */
  set type(val) {
    this._type = val;
  }
  /** Returns tile passability */
  get blocking() {
    return this._blocking;
  }
  /** Sets tile passability */
  set blocking(val) {
    this._blocking = val;
  }
  /** Returns whether the tile is opaque to rays */
  get opaque() {
    return this._opaque;
  }
  /** Sets whether the tile is opaque to rays */
  set opaque(val) {
    this._opaque = val;
  }
}

/**
 * Models a 2D map built of discrete tiles in a square grid.
 */
class TileMap2D {
  /**
   * Generates a new tile map from a template
   *  @param {Object} template -
   */
  constructor(template) {
    const buildTile = (type) => {
      return new Tile2D(type, (type > 0), true);
    };
    // When a position outside of the map is requested, the map just returns an
    // empty tile.
    this._emptyTile = buildTile(0);

    this._width = template.width;
    this._height = template.height;

    // Construct map data from template
    this._map = new Array(this._height);
    for (let y = 0; y < this._height; y++) {
      this._map[y] = new Array(this._width);

      for (let x = 0; x < this._width; x++) {
        this._map[y][x] = buildTile(template.map[y][x]);
      }
    }
  }
  /**
   * Returns true if the x,y value passed is inside the map
   *  @param {number} x - X coordinate of point to check
   *  @param {number} y - Y coordinate of point to check
   */
  inBounds(x, y) {
    return (x >= 0 && y >= 0 && x < this._width && y < this._height);
  }

  /**
   * Returns the map tile requested
   *  @param {number} x - X coordinate of tile to return
   *  @param {number} y - Y coordinate of tile to return
   *  @return {object} Tile object
   */
  getTile(x, y) {
    if (this.inBounds(x,y)) {
      return this._map[y][x];
    } else {
      return this._emptyTile;
    }
  }

  addEntity() {}
  removeEntity() {}
}

export { Tile2D, TileMap2D };