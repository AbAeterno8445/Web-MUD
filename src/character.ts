import {Entity} from './entity';

export class Character extends Entity {
    private _charID: number;

    constructor(id: number, name: string, spriteID: number) {
        super(name, 0, 0, spriteID);
        this._charID = id;
    }
}