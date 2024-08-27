import { CapturedResult, ImageTag } from "dynamsoft-core";
import { NormalizedImageResultItem } from "./NormalizedImageResultItem";
export interface NormalizedImagesResult extends CapturedResult {
    readonly originalImageHashId: string;
    readonly originalImageTag: ImageTag;
    normalizedImageResultItems: Array<NormalizedImageResultItem>;
}
declare module "@dynamsoft/dynamsoft-capture-vision-router" {
    interface CapturedResultReceiver {
        onNormalizedImagesReceived?: (result: NormalizedImagesResult) => void;
    }
    interface CapturedResultFilter {
        onNormalizedImagesReceived?: (result: NormalizedImagesResult) => void;
    }
}
//# sourceMappingURL=NormalizedImagesResult.d.ts.map