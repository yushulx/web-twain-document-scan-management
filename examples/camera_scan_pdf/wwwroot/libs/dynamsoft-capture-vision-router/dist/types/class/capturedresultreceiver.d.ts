import { CapturedResult, OriginalImageResultItem } from "dynamsoft-core";
export default class CapturedResultReceiver {
    onCapturedResultReceived: (result: CapturedResult) => void;
    onOriginalImageResultReceived: (result: OriginalImageResultItem) => void;
    [key: string]: any;
}
//# sourceMappingURL=capturedresultreceiver.d.ts.map