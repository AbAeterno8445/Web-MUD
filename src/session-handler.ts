export class SessionHandler {
    private _sessionList: Session[];

    constructor() {
        this._sessionList = new Array();
    }

    public findSession(sessionID: string): Session {
        return this._sessionList.find((sess) => sess.sessionID === sessionID);
    }

    public createSession(sessionID: string, accID: string) {
        if (this.findSession(sessionID) != undefined) return;
        this._sessionList.push(new Session(sessionID, accID));
    }
}

class Session {
    public sessionID: string;
    public accID: string;
    public selectedChar: number;
    
    constructor(sessionID: string, accID: string) {
        this.sessionID = sessionID;
        this.accID = accID;
    }

    public setSelectedChar(charID: number) {
        this.selectedChar = charID;
    }
}