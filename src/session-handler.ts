export class SessionHandler {
    private _sessionList: Session[];

    constructor() {
        this._sessionList = new Array();
    }

    public findSessionByID(sessionID: string): Session {
        return this._sessionList.find((sess) => sess.sessionID === sessionID);
    }

    public findSessionByAcc(accName: string): Session {
        return this._sessionList.find((sess) => sess.accName === accName);
    }

    public getSessionAccName(sessionID: string): string {
        var session = this.findSessionByID(sessionID);
        if (session) {
            return session.accName;
        }
        return undefined;
    }

    /** Create a new session, associating account with session ID */
    public createSession(sessionID: string, accName: string) {
        if (this.findSessionByID(sessionID) != undefined) return;
        this._sessionList.push(new Session(sessionID, accName));
    }

    /** Log session out */
    public logoutSession(sessionID: string) {
        var sess = this.findSessionByID(sessionID);
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