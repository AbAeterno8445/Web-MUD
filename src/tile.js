"use strict";
exports.__esModule = true;
var Tile = /** @class */ (function () {
    function Tile(x, y, id) {
        this._posX = x;
        this._posY = y;
        this._tileID = id;
        this._flags = new Array();
    }
    Object.defineProperty(Tile.prototype, "posX", {
        // GET/SET posX
        get: function () { return this._posX; },
        set: function (x) { this._posX = x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "posY", {
        // GET/SET posY
        get: function () { return this._posY; },
        set: function (y) { this._posY = y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "tileID", {
        // GET/SET tileID
        get: function () { return this._tileID; },
        set: function (id) { this._tileID = id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "flags", {
        // GET flags
        get: function () { return this._flags; },
        enumerable: true,
        configurable: true
    });
    /** Add a flag to the tile */
    Tile.prototype.addFlag = function (f) {
        this._flags.push(f);
    };
    /** Remove a flag from the tile */
    Tile.prototype.removeFlag = function (f) {
        this._flags.splice(this._flags.indexOf(f));
    };
    /** Clears the tile flags */
    Tile.prototype.clearFlags = function () {
        this._flags = new Array();
    };
    return Tile;
}());
exports.Tile = Tile;
