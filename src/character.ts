import {Entity} from './entity';

export class Character extends Entity {
    private _charID: number;

    constructor(id: number, name: string, spriteID: number) {
        super(name, 0, 0, spriteID);
        this._charID = id;
    }

    // GET character ID
    get charID(): number { return this._charID; }

    /** Returns the data dictionary for client-side characters */
    public getClientDict(): any {
        var dataDict = {
            id: this.charID,
            drawX: this.drawX,
            drawY: this.drawY,
            tileID: this.tileID,
            hp: this.hp,
            maxhp: this.maxhp
        }
        return dataDict;
    }
}