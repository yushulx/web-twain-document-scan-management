import { IntermediateResultExtraInfo, IntermediateResultUnit, LineSegment } from "dynamsoft-core";
export interface LongLinesUnit extends IntermediateResultUnit {
    longLines: Array<LineSegment>;
}
declare module "@dynamsoft/dynamsoft-capture-vision-router" {
    interface IntermediateResultReceiver {
        onLongLinesUnitReceived?: (result: LongLinesUnit, info: IntermediateResultExtraInfo) => void;
    }
}
//# sourceMappingURL=LongLinesUnit.d.ts.map