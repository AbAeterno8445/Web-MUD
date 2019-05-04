/** Client-side entity class used for drawing   
 * Should be structured based on server-side entities' "getClientDict" function */
export class ClientEntity {
    private _posX: number = 0;
    private _posY: number = 0;
    private _tileID: string = "UNSEEN_MONSTER";
    private _hp: number = 0;
    private _maxhp: number = 0;
    private _sightRange: number = 0;

    // GET/SET positions
    get posX(): number { return this._posX; }
    set posX(x: number) { this._posX = x; }

    get posY(): number { return this._posY; }
    set posY(y: number) { this._posY = y; }

    // GET draw positions
    get drawX(): number { return this._posX * 32; }
    get drawY(): number { return this._posY * 32; }

    // GET/SET tile ID
    get tileID(): string { return this._tileID; }
    set tileID(tid: string) { this._tileID = tid; }

    // GET/SET hp and maxhp
    get hp(): number { return this._hp; }
    set hp(h: number) { this._hp = h; }

    get maxhp(): number { return this._maxhp; }
    set maxhp(h: number) { this._maxhp = h; }

    // GET/SET sight range
    get sightRange(): number { return this._sightRange; }
    set sightRange(sr: number) { this._sightRange = sr; }

    /** Sets the entity's data from a given dictionary  
     *  Dictionary format is based on server entity's getClientDict() function */
    public setData(dataDict: any) {
        this._posX = dataDict.posX;
        this._posY = dataDict.posY;
        this._tileID = dataDict.tileID;
        this._hp = dataDict.hp;
        this._maxhp = dataDict.maxhp;
        this._sightRange = dataDict.sightRange;
    }

    /** Moves the entity to the given position */
    public moveTo(x: number, y: number) {
        this._posX = x;
        this._posY = y;
    }
}