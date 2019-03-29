import {Account} from "./account"

const fs = require('fs');
const path = require('path');

export class AccountHandler {
    private _accountList: Account[];
    private _listReady: boolean;
    private _listPath: string;

    constructor() {
        this._accountList = new Array();
        this._listReady = false;
        this._listPath = path.join(__dirname, "jsondata/accounts.json");

        this.loadAccountsFile();
    }

    /** Load the JSON accounts file */
    public loadAccountsFile(): void {
        var accObj: any;
        fs.readFile(this._listPath, 'utf8', function (err: any, data: any) {
            if (err) throw err;

            accObj = JSON.parse(data);
            accObj["accounts"].forEach((acc: any) => {
                this._addAccToList(acc.id, acc.characters);
            });
            this._listReady = true;
        }.bind(this));
    }

    /** Returns an account based on ID. */
    public getAccountByID(id: string): Account {
        return this._accountList.find((acc) => acc.id === id);
    }

    /** Adds an account object to the account list */
    private _addAccToList(id: string, characters: number[]): boolean {
        if (this.getAccountByID(id) != undefined) return false;

        var newAcc = new Account();
        newAcc.id = id;
        newAcc.characters = characters;
        this._accountList.push(newAcc);
        return true;
    }

    /** Update JSON file to state of accounts list */
    private _updateJSON(): void {
        var accObj = {
            "accounts": this._accountList
        }
        fs.writeFile(this._listPath, JSON.stringify(accObj), function(err: any) {
            if (err) throw err;
        });
    }

    /** Create an account (if it doesn't already exist), then add it to the JSON file
    * Returns 0 if failed, 1 if waiting, 2 if successful */
    public createAccountAsync(id: string): number {
        if (this._listReady == false) {
            var self = this;
            setTimeout(function() { self.createAccountAsync }, 150);
            return 1;
        }
        if (this._addAccToList(id, []) == false) {
            return 0;
        }

        this._updateJSON();
        return 2;
    }

    /** Delete an account through id
    * Returns 0 if failed, 1 if waiting, 2 if successful */
    public deleteAccountAsync(id: string): number {
        if (this._listReady == false) {
            var self = this;
            setTimeout(function() { self.deleteAccountAsync }, 150);
            return 1;
        }
        var acc = this.getAccountByID(id);
        if (acc) {
            this._accountList.splice(this._accountList.indexOf(acc));
            this._updateJSON();
            return 2;
        }
        return 0;
    }

    /** Associate character ID to account */
    public associateChar(charID: number, accID: string): void {
        var acc = this.getAccountByID(accID);
        if (acc) {
            acc.characters.push(charID);
        }
        this._updateJSON();
    }
}