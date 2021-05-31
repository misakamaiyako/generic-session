import { Hash } from "crypto";

const crypto = require('crypto')
import TypedArray = NodeJS.TypedArray;

function createCrypto(salt?:string | Buffer | TypedArray | DataView): { encrypt: (text: string) => string; decrypt: (text: string) => string } {
	const algorithm = "aes-256-cbc";
	const iv = crypto.randomBytes(16);
	let key: Buffer
	if (salt){
		const hash:Hash = crypto.createHash("sha256");
		hash.update(salt);
		key = hash.digest().slice(0, 32);
	} else {
		key = crypto.randomBytes(32);
	}
	function encrypt(text: string) {
		const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return encrypted.toString("hex");
	}

	function decrypt(text: string) {
		const decipher = crypto.createDecipheriv(algorithm, key, iv);
		let decrypted = decipher.update(text, "hex", "utf-8");
		decrypted += decipher.final("utf-8");
		return decrypted;
	}

	return {
		encrypt,
		decrypt,
	};

}
export default createCrypto
