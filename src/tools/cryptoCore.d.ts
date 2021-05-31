/// <reference types="node" />
import TypedArray = NodeJS.TypedArray;
declare function createCrypto(salt?: string | Buffer | TypedArray | DataView): {
    encrypt: (text: string) => string;
    decrypt: (text: string) => string;
};
export default createCrypto;
//# sourceMappingURL=cryptoCore.d.ts.map