"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index"));
var sessionCenter = new index_1.default({
    name: "sss",
    maxAge: 2000,
    secure: false,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    singlePoint: false,
    secretSalt: "undefined",
});
var http = require("http");
var server = http.createServer(function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("X-Foo", "bar");
    res.setHeader("Set-Cookie", ["language=javascript"]);
    var session = sessionCenter.getSession(req, res);
    if (session) {
        if (session.count++ > 10) {
            sessionCenter.removeSession(req, res);
        }
    }
    else {
        sessionCenter.setSession({ id: "d", count: 0 }, req, res);
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('content');
});
server.listen(9090);
//# sourceMappingURL=test.js.map