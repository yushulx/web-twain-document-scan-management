export * from "./TypeCheck";
export declare function requestResource(url: string, type: "text" | "blob" | "arraybuffer"): Promise<any>;
export declare function checkIsLink(str: string): boolean;
export declare const compareVersion: (strV1: string, strV2: string) => number;
declare const bSupportBigInt: boolean;
export { bSupportBigInt };
//# sourceMappingURL=index.d.ts.map