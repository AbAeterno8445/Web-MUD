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
                this._addAccToList(acc.name, acc.password, acc.characters);
            });
            this._listReady = true;
        }.bind(this));
    }

    /** Returns an account based on name */
    public getAccountByName(name: string): Account {
        return this._accountList.find((acc) => acc.name === name);
    }

    /** Adds an account object to the account list */
    private _addAccToList(name: string, password: string, characters: number[]): boolean {
        if (this.getAccountByName(name) != undefined) return false;

        var newAcc = new Account(name, password);
        newAcc.characters = characters;
        this._accountList.push(newAcc);
        return true;
    }

    /** Update JSON file to state of accounts list */
    private _updateJSON(): void {
        var accObj = {
            "accounts": this._accountList
        }
        fs.writeFile(this._listPath, JSON.stringify(accObj, null, 4), function(err: any) {
            if (err) throw err;
        });
    }

    /** Create an account (if it doesn't already exist), then add it to the JSON file
    * Returns negative if failed, 1 if waiting, 2 if successful
    * -1 if wrong data, -2 if account already exists, -3 if unknown error */
    public createAccountAsync(name: string, password: string): number {
        if (this._listReady == false) {
            var self = this;
            setTimeout(function() { self.createAccountAsync }, 150);
            return 1;
        }
        // Check if data is correct
        if (!name || !password) {
            return -1;
        }
        // Check if account exists
        if (this.getAccountByName(name)) {
            return -2;
        }
        // Attempt to create account
        if (this._addAccToList(name, password, []) == false) {
            return -3;
        }

        this._updateJSON();
        return 2;
    }

    /** Delete an account through name
    * Returns 0 if failed, 1 if waiting, 2 if successful */
    public deleteAccountAsync(name: string): number {
        if (this._listReady == false) {
            var self = this;
            setTimeout(function() { self.deleteAccountAsync }, 150);
            return 1;
        }
        var acc = this.getAccountByName(name);
        if (acc) {
            this._accountList.splice(this._accountList.indexOf(acc));
            this._updateJSON();
            return 2;
        }
        return 0;
    }

    /** Associate character ID to account */
    public associateChar(id: number, accName: string): void {
        var acc = this.getAccountByName(accName);
        if (!acc) return;

        acc.addCharacter(id);
        this._updateJSON();
    }

    /** Login with account - checks whether account matches given password */
    public loginAccount(accName: string, accPass: string): boolean {
        var acc = this.getAccountByName(accName);
        if (acc) {
            if (acc.password === accPass) return true;
        }
        return false;
    }
}