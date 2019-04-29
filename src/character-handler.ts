import { Entity } from "./entity";

const fs = require('fs');
const path = require('path');

export class CharacterHandler {
    private _characterList: Entity[];
    private _listReady = false;
    private _listPath: string;
    private _charIDcounter: number = 0;
    private _highestID: number = 0;

    constructor() {
        this._characterList = new Array();
        this._listPath = path.join(__dirname, 'jsondata/characters.json');

        this.loadCharFile();
    }

    /** Load the characters JSON file */
    public loadCharFile(): void {
        var charObj: any;
        fs.readFile(this._listPath, 'utf8', function (err: any, data: any) {
            if (err) throw err;

            charObj = JSON.parse(data);
            charObj["characters"].forEach((char: any) => {
                var res = this._addCharToList(char._id, char._name, char._tileID);
            });
            this._listReady = true;
        }.bind(this));
    }

    /** Return a character based on ID */
    public getCharByID(id: number): Entity {
        return this._characterList.find((char) => char.id === id);
    }

    /** Return a character based on name */
    public getCharByName(name: string): Entity {
        return this._characterList.find((char) => char.name === name);
    }

    /** Add character to local list */
    private _addCharToList(id: number, name: string, spriteID: number): boolean {
        if (this.getCharByID(id) != undefined) return false;

        if (!name) return false;

        // Limit name to 16 characters
        name = name.substring(0, 16);

        var new_char = new Entity(id, name, 0, 0, spriteID);
        this._characterList.push(new_char);
        if (id > this._highestID) {
            this._highestID = id;
        }
        return true;
    }

    /** Update JSON to state of characters list */
    private _updateJSON(): void {
        var charObj = {
            "characters": this._characterList
        }
        fs.writeFile(this._listPath, JSON.stringify(charObj, null, 4), function(err: any) {
            if (err) throw err;
        });
    }

    /** Create a character (if name not taken), then add to JSON
     * Returns negative if failed, 1 if waiting, 2 if successful
     * -1 if ID error, -2 if name taken */
    public createCharAsync(name: string, spriteID: number): number {
        if (this._listReady == false) {
            var self = this;
            setTimeout(function() { self.createCharAsync }, 150);
            return 1;
        }

        if (this._charIDcounter <= this._highestID) {
            this._charIDcounter = this._highestID + 1;
        }

        if (this.getCharByID(this._charIDcounter) != undefined) return -1;
        if (this.getCharByName(name) != undefined) return -2;

        if (this._addCharToList(this._charIDcounter, name, spriteID) == false) {
            return 0;
        };

        this._charIDcounter++;
        this._updateJSON();
        return 2;
    }
}