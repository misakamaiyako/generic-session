# Session Center

Small, fast minimalist session manager for [node](http://nodejs.org).

![NPM](https://img.shields.io/npm/l/session-center)
![npm](https://img.shields.io/npm/dw/session-center)

## Installation

this module is server side only, install it by next command:

```shell
$ npm install session-center
```

## Features

- Centralized management session
- Simple to generic or remove session
- Support TS
- Uncoupled, not require any framework

## Quick start

```js
//in js
const sessionCenter = new SessionCenter(config?)
// in ts
const sessionCenter = new SessionCenter < sessionContent?>(config?)
```

## Config

> all property are not required

| property | type | default  | description |
| :---: | :---: | :---: | --- |
| name | string | sessionId  | define the key of session in cookie |
| maxAge | number | -  | duration of one session,unit with second |
| expires | boolean | -  | set both expire date and maxAge |
| domain | string | -  | domain or a specified URI, if not specified, it will be the web URI |
| secure | boolean | true  | if set as true, cookie will only be transmitted over secure protocol as https|
| path | string | -  |  document location of the cookie |
| httpOnly | boolean  | - | weather allow js get the cookie, it can help to mitigate [xss](http://en.wikipedia.org/wiki/Cross-site_scripting) attack |
| sameSite | boolean &#166; lax &#166; strict &#166; none | lax | limits the scope of the cookie, and true is same as strict, false will not set it, more information please refer to [rfc6265](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7)|
| singlePoint | boolean | - | one user can only active in one client, if it specified as true, the idKey must also be specified|
| idKey | string | - | the union value of sessionContent's key to identify different users |
| secretSalt | string &#166; Buffer &#166; TypedArray &#166; DataView | random 32 bytes buffer | salt for generic cookie's hash

notice: If neither expires nor max-age specified, it will expire at the end of session.

## Usage

1. `sessionCenter.removeSession(req: IncomingMessage, res: ServerResponse): void;`

	remove session content of current request.

2.  `sessionCenter.getSession(req: IncomingMessage | string, res?: ServerResponse): SessionContent | false;`
	1. if typeof res === 'string': get session of current cookie, if get false, means this cookie is invalidation, you should remove it later.
	2. req and res should both be specified, it will auto remove cookie if cookie is expires
	
3. `sessionCenter.setSession(sessionContent: SessionContent, req?: IncomingMessage, res?: ServerResponse): string;`

	store session content and set cookie to response and return the cookie string. if req and res are both not specified, user should set the return cookie to response header later
