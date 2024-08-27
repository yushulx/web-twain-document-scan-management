import { Edge, IntermediateResultExtraInfo, IntermediateResultUnit } from "dynamsoft-core";
export interface CandidateQuadEdgesUnit extends IntermediateResultUnit {
    candidateQuadEdges: Array<Edge>;
}
declare module "@dynamsoft/dynamsoft-capture-vision-router" {
    interface IntermediateResultReceiver {
        onCandidateQuadEdgesUnitReceived?: (result: CandidateQuadEdgesUnit, info: IntermediateResultExtraInfo) => void;
    }
}
//# sourceMappingURL=CandidateQuadEdgesUnit.d.ts.map