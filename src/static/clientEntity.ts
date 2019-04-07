/** Client-side entity class used for drawing   
 * Should be structured based on server-side entities' "getClientDict" function */
export class ClientEntity {
    private _drawX: number;
    private _drawY: number;
    private _tileID: number;
    private _hp: number;
    private _maxhp: number;

    constructor(drawX: number, drawY: number, tileID: number) {
        this._drawX = drawX;
        this._drawY = drawY;
        this._tileID = tileID;
    }

    // GET/SET draw positions
    get drawX(): number { return this._drawX; }
    set drawX(x: number) { this._drawX = x; }

    get drawY(): number { return this._drawY; }
    set drawY(y: number) { this._drawY = y; }

    // GET/SET tile ID
    get tileID(): number { return this._tileID; }
    set tileID(tid: number) { this._tileID = tid; }

    // GET/SET hp and maxhp
    get hp(): number { return this._hp; }
    set hp(h: number) { this._hp = h; }

    get maxhp(): number { return this._maxhp; }
    set maxhp(h: number) { this._maxhp = h; }
}