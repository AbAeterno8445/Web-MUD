export class Tile {
    /**
     * General tile class used to render map tiles as well as entities.
     */
    private _posX: number;
    private _posY: number;
    private _tileID: number;

    constructor(x: number, y:number, id: number) {
        this.posX = x;
        this.posY = y;
        this.tileID = id;
    }

    // GET/SET posX
    get posX(): number { return this._posX; }
    set posX(x: number) { this._posX = x; }

    // GET/SET posY
    get posY(): number { return this._posY; }
    set posY(y: number) { this._posY = y; }

    // GET/SET tileID
    get tileID(): number { return this._tileID; }
    set tileID(id: number) { this._tileID = id; }
}