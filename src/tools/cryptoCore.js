"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require('crypto');
function createCrypto(salt) {
    var algorithm = "aes-256-cbc";
    var iv = crypto.randomBytes(16);
    var key;
    if (salt) {
        var hash = crypto.createHash("sha256");
        hash.update(salt);
        key = hash.digest().slice(0, 32);
    }
    else {
        key = crypto.randomBytes(32);
    }
    function encrypt(text) {
        var cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        var encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString("hex");
    }
    function decrypt(text) {
        var decipher = crypto.createDecipheriv(algorithm, key, iv);
        var decrypted = decipher.update(text, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    }
    return {
        encrypt: encrypt,
        decrypt: decrypt,
    };
}
exports.default = createCrypto;
//# sourceMappingURL=cryptoCore.js.map