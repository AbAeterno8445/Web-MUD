export class ClientTile {
    private _posX: number;
    private _posY: number;
    private _tileID: string;
    private _flags: string[];
    private _visible: boolean = false;
    private _explored: boolean = false;

    constructor(x: number, y:number, id: string) {
        this._posX = x;
        this._posY = y;
        this._tileID = id;
        this._flags = new Array();
    }

    // GET/SET posX
    get posX(): number { return this._posX; }
    set posX(x: number) { this._posX = x; }

    // GET/SET posY
    get posY(): number { return this._posY; }
    set posY(y: number) { this._posY = y; }

    // GET/SET tileID
    get tileID(): string { return this._tileID; }
    set tileID(id: string) { this._tileID = id; }

    // GET/SET flags
    get flags(): string[] { return this._flags; }
    set flags(f: string[]) { this._flags = f; }

    // GET/SET visibility
    get visible(): boolean { return this._visible; }
    set visible(v: boolean) { this._visible = v; }

    // GET/SET explored
    get explored(): boolean { return this._explored; }
    set explored(e: boolean) { this._explored = e; }

    /** Returns whether the tile has the given flag */
    public hasFlag(f: string): boolean {
        if (this._flags.find((flag) => flag === f)) return true;
        return false;
    }
}