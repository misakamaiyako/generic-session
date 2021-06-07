import TypedArray = NodeJS.TypedArray;
import type { CookieSerializeOptions } from "cookie";
import createCrypto from "./tools/cryptoCore";
import { IncomingMessage, ServerResponse } from "http";

const uuidv4 = require("uuid").v4;
const cookie = require("cookie");

interface SettingProps extends CookieSerializeOptions {
	//useRedis?: boolean
	name?: string;
	secretSalt?: string | Buffer | TypedArray | DataView
	singlePoint?: boolean
	idKey?: string
	useExpires?: boolean
}

const storeName: unique symbol = Symbol("sessionCenter");

class sessionCenter<SessionContent = any> {
	private readonly [storeName] = new Map<string, SessionContent>();
	private readonly idToSession = new Map<any, string>();
	private readonly config: SettingProps & { name: string, secure: boolean, expires?: Date };
	private readonly encryption: (key: string) => string;
	private readonly decryption: (text: string) => string;

	constructor(props: SettingProps={}) {
		let {
			name = "sessionId",
			maxAge,
			domain,
			secure = true,
			path,
			useExpires,
			httpOnly = true,
			sameSite = "lax",
			singlePoint,
		} = props;
		// if (props && props.useRedis) {
		// 	console.log("sorry, redis is not supported yet");
		// }
		try {
			const cryptoModule = createCrypto(props.secretSalt);
			this.encryption = cryptoModule.encrypt;
			this.decryption = cryptoModule.decrypt;
		} catch (e) {
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
			name,
			maxAge,
			domain,
			secure,
			path,
			get expires() {
				if (useExpires && maxAge) {
					return new Date(Date.now() + maxAge * 1000);
				} else {
					return undefined;
				}
			},
			httpOnly,
			sameSite,
			secretSalt: props.secretSalt,
			singlePoint,
			idKey: props.idKey,
		};
	}

	private getSessionID(cookies: string) {
		const encrypted = cookie.parse(cookies)[this.config.name];
		if (encrypted) {
			try{
				return this.decryption(encrypted);
			} catch (e) {
				return ""
			}
		} else {
			return "";
		}
	}

	private genericCookie(sessionContent: SessionContent): string {
		if (this.config.singlePoint) {
			// @ts-ignore
			const id = sessionContent[this.config.idKey as string];
			const sessionID = this.idToSession.get(id);
			if (sessionID) {
				// this.removeSession(sessionID);
			}
			this.idToSession.delete(id);
		}
		const uuid = uuidv4();
		this[storeName].set(uuid, sessionContent);
		if (this.config.singlePoint) {
			// @ts-ignore
			this.idToSession.set(sessionContent[this.config.idKey], uuid);
		}
		return cookie.serialize(this.config.name, this.encryption(uuid), this.config);
	}

	removeSession(req: IncomingMessage, res: ServerResponse) {
		const cookieContent = cookie.parse(req.headers.cookie)[this.config.name];
		if (cookieContent) {
			const newCookie = cookie.serialize(this.config.name, cookieContent, { expires: new Date(0) });
			this.setCookie(res, newCookie);
		}
	}

	getSession(req: IncomingMessage | string, res?: ServerResponse): SessionContent | false {
		let sessionId;
		if (typeof req === "string") {
			sessionId = this.getSessionID(req);
		} else {
			sessionId = this.getSessionID(req.headers.cookie ?? "");
		}
		if (sessionId) {
			const sessionInstance = this[storeName].get(sessionId);
			if (!sessionInstance) {
				if (typeof req !== "string" && res) {
					this.removeSession(req, res);
				}
				return false;
			} else {
				return sessionInstance;
			}
		}
		return false;
	}

	setSession(sessionContent: SessionContent, req?: IncomingMessage, res?: ServerResponse) {
		if (req && res) {
			if (this.getSession(req, res)) {
				this.removeSession(req, res);
			}
		}
		const cookieId = this.genericCookie(sessionContent);
		if (req && res) {
			this.setCookie(res, cookieId);
		}
		return cookieId;
	}

	remove(filter?: ((SessionContent: SessionContent) => boolean)) {
		if (filter) {
			const store = this[storeName];
			const entries = store.entries();
			let next: IteratorResult<[string, SessionContent]>;
			while (!(next = entries.next()).done) {
				if (filter(next.value[1])) {
					store.delete(next.value[0]);
				}
			}
		} else {
			this[storeName].clear();
		}
	}

	find(filter: (SessionContent: SessionContent) => boolean):SessionContent[] {
		const values = this[storeName].values()
		const result:SessionContent[] = []
		let next: IteratorResult<SessionContent>
		while (!(next=values.next()).done){
			if (filter(next.value)){
				result.push(next.value)
			}
		}
		return result
	}

	private setCookie(res: ServerResponse, cookie: string) {
		const headers = res.getHeaders();
		if (headers["Set-Cookie"]) {
			if (Array.isArray(headers["Set-Cookie"])) {
				headers["Set-Cookie"].push(cookie);
			} else {
				headers["Set-Cookie"] = [headers["Set-Cookie"].toString(), cookie];
			}
		} else {
			res.setHeader("Set-Cookie", [cookie]);
		}
	}
}

export = sessionCenter;
