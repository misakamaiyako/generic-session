/// <reference types="node" />
import TypedArray = NodeJS.TypedArray;
import type { CookieSerializeOptions } from "cookie";
import { IncomingMessage, ServerResponse } from "http";
interface SettingProps extends CookieSerializeOptions {
    name?: string;
    secretSalt?: string | Buffer | TypedArray | DataView;
    singlePoint?: boolean;
    idKey?: string;
    useExpires?: boolean;
}
declare const storeName: unique symbol;
declare class sessionCenter<SessionContent = any> {
    private readonly [storeName];
    private readonly idToSession;
    private readonly config;
    private readonly encryption;
    private readonly decryption;
    constructor(props: SettingProps);
    private getSessionID;
    private genericCookie;
    removeSession(req: IncomingMessage, res: ServerResponse): void;
    getSession(req: IncomingMessage | string, res?: ServerResponse): SessionContent | false;
    setSession(sessionContent: SessionContent, req?: IncomingMessage, res?: ServerResponse): string;
    private setCookie;
}
export = sessionCenter;
//# sourceMappingURL=index.d.ts.map