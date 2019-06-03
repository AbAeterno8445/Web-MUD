import { Tile } from "./tile";

export class Item extends Tile {
    private _name: string;

    constructor(name: string, sprite: string) {
        super(0, 0, sprite);
        this._name = name;
    }

    // GET/SET name
    get name(): string { return this._name; }
    set name(n: string) { this._name = n; }

    /** Returns the data dictionary for client-side items    
     * Client-side items should be structured based on this data */
    public getClientDict(): any {
        var dataDict = {
            name: this.name,
            posX: this.posX,
            posY: this.posY,
            tileID: this.tileID
        }
        return dataDict;
    }
}