"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
var cryptoCore_1 = __importDefault(require("./tools/cryptoCore"));
var uuidv4 = require("uuid").v4;
var cookie = require("cookie");
var storeName = Symbol("sessionCenter");
var sessionCenter = /** @class */ (function () {
    function sessionCenter(props) {
        this[_a] = new Map();
        this.idToSession = new Map();
        var _b = props || {}, _c = _b.name, name = _c === void 0 ? "sessionId" : _c, maxAge = _b.maxAge, domain = _b.domain, _d = _b.secure, secure = _d === void 0 ? true : _d, path = _b.path, useExpires = _b.useExpires, _e = _b.httpOnly, httpOnly = _e === void 0 ? true : _e, _f = _b.sameSite, sameSite = _f === void 0 ? "lax" : _f, singlePoint = _b.singlePoint;
        // if (props && props.useRedis) {
        // 	console.log("sorry, redis is not supported yet");
        // }
        try {
            var cryptoModule = cryptoCore_1.default(props.secretSalt);
            this.encryption = cryptoModule.encrypt;
            this.decryption = cryptoModule.decrypt;
        }
        catch (e) {
            throw new Error("salt:" + props.secretSalt + " is not a correct salt");
        }
        if (secure) {
            name = "__Secure-" + name;
        }
        if (!props.idKey && props.singlePoint) {
            console.warn("The single sign-on function can only be used when idKey is provided.");
            singlePoint = false;
        }
        this.config = {
            name: name,
            maxAge: maxAge,
            domain: domain,
            secure: secure,
            path: path,
            get expires() {
                if (useExpires && maxAge) {
                    return new Date(Date.now() + maxAge * 1000);
                }
                else {
                    return undefined;
                }
            },
            httpOnly: httpOnly,
            sameSite: sameSite,
            secretSalt: props.secretSalt,
            singlePoint: singlePoint,
            idKey: props.idKey,
        };
    }
    sessionCenter.prototype.getSessionID = function (cookies) {
        var encrypted = cookie.parse(cookies)[this.config.name];
        if (encrypted) {
            return this.decryption(encrypted);
        }
        else {
            return "";
        }
    };
    sessionCenter.prototype.genericCookie = function (sessionContent) {
        if (this.config.singlePoint) {
            // @ts-ignore
            var id = sessionContent[this.config.idKey];
            var sessionID = this.idToSession.get(id);
            if (sessionID) {
                // this.removeSession(sessionID);
            }
            this.idToSession.delete(id);
        }
        var uuid = uuidv4();
        this[storeName].set(uuid, sessionContent);
        if (this.config.singlePoint) {
            // @ts-ignore
            this.idToSession.set(sessionContent[this.config.idKey], uuid);
        }
        return cookie.serialize(this.config.name, this.encryption(uuid), this.config);
    };
    sessionCenter.prototype.removeSession = function (req, res) {
        var cookieContent = cookie.parse(req.headers.cookie)[this.config.name];
        if (cookieContent) {
            var newCookie = cookie.serialize(this.config.name, cookieContent, { expires: new Date(0) });
            this.setCookie(res, newCookie);
        }
    };
    sessionCenter.prototype.getSession = function (req, res) {
        var _b;
        var sessionId;
        if (typeof req === "string") {
            sessionId = this.getSessionID(req);
        }
        else {
            sessionId = this.getSessionID((_b = req.headers.cookie) !== null && _b !== void 0 ? _b : "");
        }
        if (sessionId) {
            var sessionInstance = this[storeName].get(sessionId);
            if (!sessionInstance) {
                if (typeof req !== "string" && res) {
                    this.removeSession(req, res);
                }
                return false;
            }
            else {
                return sessionInstance;
            }
        }
        return false;
    };
    sessionCenter.prototype.setSession = function (sessionContent, req, res) {
        if (req && res) {
            if (this.getSession(req, res)) {
                this.removeSession(req, res);
            }
        }
        var cookieId = this.genericCookie(sessionContent);
        if (req && res) {
            this.setCookie(res, cookieId);
        }
        return cookieId;
    };
    sessionCenter.prototype.setCookie = function (res, cookie) {
        var headers = res.getHeaders();
        if (headers["Set-Cookie"]) {
            if (Array.isArray(headers["Set-Cookie"])) {
                headers["Set-Cookie"].push(cookie);
            }
            else {
                headers["Set-Cookie"] = [headers["Set-Cookie"].toString(), cookie];
            }
        }
        else {
            res.setHeader("Set-Cookie", [cookie]);
        }
    };
    return sessionCenter;
}());
_a = storeName;
module.exports = sessionCenter;
//# sourceMappingURL=index.js.map