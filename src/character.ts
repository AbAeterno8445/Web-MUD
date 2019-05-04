import { Entity } from "./entity";

export class Character extends Entity {
    private _charID: number;

    constructor(charID: number, name: string, x: number, y: number, sprite: string) {
        super(name, x, y, sprite);
        this._charID = charID;
    }

    // GET/SET charID
    get charID(): number { return this._charID; }
    set charID(cid: number) { this._charID = cid; }
}