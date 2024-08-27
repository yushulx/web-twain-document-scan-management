import { CapturedResult, DSImageData, Point } from "dynamsoft-core";
export declare enum EnumIntermediateResultUnitType {
    IRUT_NULL = 0,
    IRUT_COLOUR_IMAGE = 1,
    IRUT_SCALED_DOWN_COLOUR_IMAGE = 2,
    IRUT_GRAYSCALE_IMAGE = 4,
    IRUT_TRANSOFORMED_GRAYSCALE_IMAGE = 8,
    IRUT_ENHANCED_GRAYSCALE_IMAGE = 16,
    IRUT_PREDETECTED_REGIONS = 32,
    IRUT_BINARY_IMAGE = 64,
    IRUT_TEXTURE_DETECTION_RESULT = 128,
    IRUT_TEXTURE_REMOVED_GRAYSCALE_IMAGE = 256,
    IRUT_TEXTURE_REMOVED_BINARY_IMAGE = 512,
    IRUT_CONTOURS = 1024,
    IRUT_LINE_SEGMENTS = 2048,
    IRUT_TEXT_ZONES = 4096,
    IRUT_TEXT_REMOVED_BINARY_IMAGE = 8192,
    IRUT_CANDIDATE_BARCODE_ZONES = 16384,
    IRUT_LOCALIZED_BARCODES = 32768,
    IRUT_SCALED_UP_BARCODE_IMAGE = 65536,
    IRUT_DEFORMATION_RESISTED_BARCODE_IMAGE = 131072,
    IRUT_COMPLEMENTED_BARCODE_IMAGE = 262144,
    IRUT_DECODED_BARCODES = 524288,
    IRUT_LONG_LINES = 1048576,
    IRUT_CORNERS = 2097152,
    IRUT_CANDIDATE_QUAD_EDGES = 4194304,
    IRUT_DETECTED_QUADS = 8388608,
    IRUT_LOCALIZED_TEXT_LINES = 16777216,
    IRUT_RECOGNIZED_TEXT_LINES = 33554432,
    IRUT_NORMALIZED_IMAGES = 67108864,
    IRUT_ALL = 134217727
}
export declare enum EnumCapturedResultItemType {
    CRIT_ORIGINAL_IMAGE = 1,
    CRIT_BARCODE = 2,
    CRIT_TEXT_LINE = 4,
    CRIT_DETECTED_QUAD = 8,
    CRIT_NORMALIZED_IMAGE = 16,
    CRIT_PARSED_RESULT = 32
}
export declare enum EnumImagePixelFormat {
    IPF_BINARY = 0,
    IPF_BINARYINVERTED = 1,
    IPF_GRAYSCALED = 2,
    IPF_NV21 = 3,
    IPF_RGB_565 = 4,
    IPF_RGB_555 = 5,
    IPF_RGB_888 = 6,
    IPF_ARGB_8888 = 7,
    IPF_RGB_161616 = 8,
    IPF_ARGB_16161616 = 9,
    IPF_ABGR_8888 = 10,
    IPF_ABGR_16161616 = 11,
    IPF_BGR_888 = 12,
    IPF_BINARY_8 = 13,
    IPF_NV12 = 14
}
export declare function isDSImageData(value: any): boolean;
export declare function checkIsLink(str: string): boolean;
export declare function requestResource(url: string, type: "text" | "blob" | "arraybuffer"): Promise<any>;
type point = Point;
export declare function isPointInQuadrilateral(points: [point, point, point, point], point: point): boolean;
export declare function handleResultForDraw(results: CapturedResult): any;
export declare function getNorImageData(dsImageData: DSImageData): ImageData;
export declare function handleNormalizedImageResultItem(_item: any, retImageData: ImageData): void;
declare const bSupportBigInt: boolean;
export { bSupportBigInt };
//# sourceMappingURL=index.d.ts.map