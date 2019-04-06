export class SessionHandler {
    private _sessionList: Session[];

    constructor() {
        this._sessionList = new Array();
    }

    public findSession(sessionID: string): Session {
        return this._sessionList.find((sess) => sess.sessionID === sessionID);
    }

    public getSessionAccName(sessionID: string): string {
        var session = this.findSession(sessionID);
        if (session) {
            return session.accName;
        }
        return undefined;
    }

    public createSession(sessionID: string, accName: string) {
        if (this.findSession(sessionID) != undefined) return;
        this._sessionList.push(new Session(sessionID, accName));
    }

    public logoutSession(sessionID: string) {
        var sess = this.findSession(sessionID);
        if (sess) {
            this._sessionList.splice(this._sessionList.indexOf(sess));
        }
    }
}

class Session {
    public sessionID: string;
    public accName: string;
    public selectedChar: number;
    
    constructor(sessionID: string, accName: string) {
        this.sessionID = sessionID;
        this.accName = accName;
    }

    public setSelectedChar(charID: number) {
        this.selectedChar = charID;
    }
}