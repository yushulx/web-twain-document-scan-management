import { IntermediateResultExtraInfo, IntermediateResultUnit } from "dynamsoft-core";
import { NormalizedImageElement } from "./NormalizedImageElement";
export interface NormalizedImagesUnit extends IntermediateResultUnit {
    normalizedImages: Array<NormalizedImageElement>;
}
declare module "@dynamsoft/dynamsoft-capture-vision-router" {
    interface IntermediateResultReceiver {
        onNormalizedImagesReceived?: (result: NormalizedImagesUnit, info: IntermediateResultExtraInfo) => void;
    }
}
//# sourceMappingURL=NormalizedImagesUnit.d.ts.map