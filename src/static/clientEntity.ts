/** Client-side entity class used for drawing   
 * Should be structured based on server-side entities' "getClientDict" function */
export class ClientEntity {
    private _posX: number;
    private _posY: number;
    private _tileID: number;
    private _hp: number;
    private _maxhp: number;

    constructor(drawX: number, drawY: number, tileID: number) {
        this._posX = drawX;
        this._posY = drawY;
        this._tileID = tileID;
    }

    // GET/SET positions
    get posX(): number { return this._posX; }
    set posX(x: number) { this._posX = x; }

    get posY(): number { return this._posY; }
    set posY(y: number) { this._posY = y; }

    // GET draw positions
    get drawX(): number { return this._posX * 32; }
    get drawY(): number { return this._posY * 32; }

    // GET/SET tile ID
    get tileID(): number { return this._tileID; }
    set tileID(tid: number) { this._tileID = tid; }

    // GET/SET hp and maxhp
    get hp(): number { return this._hp; }
    set hp(h: number) { this._hp = h; }

    get maxhp(): number { return this._maxhp; }
    set maxhp(h: number) { this._maxhp = h; }
}