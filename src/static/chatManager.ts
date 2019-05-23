const messageBox = document.getElementById('messages');

// Prefix css classes: key is glyph, value is class name
const prefGlyphs: any = {
    "$": "pref_gold"
}

export class ChatManager {
    private _messageLog: Message[] = new Array();

    /** Add a message to the chat message box       
     *  Color format is in hex characters, eg. 'ffff00' */
    public addMessage(msg: string, color: string, pref: string): void {
        this._messageLog.push(new Message(msg, color, pref));

        if (messageBox.childElementCount >= 6) {
            var msgBoxChildren = messageBox.childNodes;
            messageBox.removeChild(msgBoxChildren[0]);
        }
        // Message div
        var newMsg = document.createElement('div');
        newMsg.className = 'game_message';

        // Prefix
        if (pref in prefGlyphs) {
            var prefSpan = document.createElement('span');
            prefSpan.className = prefGlyphs[pref];
            newMsg.appendChild(prefSpan);
        }

        // Message
        var msgSpan = document.createElement('span');
        msgSpan.style.color = "#" + color;
        msgSpan.innerHTML = msg;
        newMsg.appendChild(msgSpan);

        messageBox.appendChild(newMsg);
    }
}


class Message {
    private _msg: string;
    private _color: string;
    private _prefix: string = "";

    constructor(msg: string, col: string, pref: string) {
        this._msg = msg;
        this._color = col;
        this._prefix = pref;
    }

    //GET/SET color
    get color(): string { return this._color; }
    set color(c: string) { this._color = c; }

    //GET msg
    get msg(): string { return this._msg; }

    //GET prefix
    get prefix(): string { return this._prefix; }
}