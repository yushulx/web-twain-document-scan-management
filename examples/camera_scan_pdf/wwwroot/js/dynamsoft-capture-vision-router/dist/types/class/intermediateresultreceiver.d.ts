import { BinaryImageUnit, ColourImageUnit, ContoursUnit, EnhancedGrayscaleImageUnit, GrayscaleImageUnit, IntermediateResult, IntermediateResultExtraInfo, LineSegmentsUnit, PredetectedRegionsUnit, ScaledDownColourImageUnit, TextRemovedBinaryImageUnit, TextZonesUnit, TextureDetectionResultUnit, TextureRemovedBinaryImageUnit, TextureRemovedGrayscaleImageUnit, TransformedGrayscaleImageUnit } from "dynamsoft-core";
export default class IntermediateResultReceiver {
    onTaskResultsReceived?: (result: IntermediateResult, info: IntermediateResultExtraInfo) => void;
    onPredetectedRegionsReceived?: (result: PredetectedRegionsUnit, info: IntermediateResultExtraInfo) => void;
    onColourImageUnitReceived?: (result: ColourImageUnit, info: IntermediateResultExtraInfo) => void;
    onScaledDownColourImageUnitReceived?: (result: ScaledDownColourImageUnit, info: IntermediateResultExtraInfo) => void;
    onGrayscaleImageUnitReceived?: (result: GrayscaleImageUnit, info: IntermediateResultExtraInfo) => void;
    onTransformedGrayscaleImageUnitReceived?: (result: TransformedGrayscaleImageUnit, info: IntermediateResultExtraInfo) => void;
    onEnhancedGrayscaleImageUnitReceived?: (result: EnhancedGrayscaleImageUnit, info: IntermediateResultExtraInfo) => void;
    onBinaryImageUnitReceived?: (result: BinaryImageUnit, info: IntermediateResultExtraInfo) => void;
    onTextureDetectionResultUnitReceived?: (result: TextureDetectionResultUnit, info: IntermediateResultExtraInfo) => void;
    onTextureRemovedGrayscaleImageUnitReceived?: (result: TextureRemovedGrayscaleImageUnit, info: IntermediateResultExtraInfo) => void;
    onTextureRemovedBinaryImageUnitReceived?: (result: TextureRemovedBinaryImageUnit, info: IntermediateResultExtraInfo) => void;
    onContoursUnitReceived?: (result: ContoursUnit, info: IntermediateResultExtraInfo) => void;
    onLineSegmentsUnitReceived?: (result: LineSegmentsUnit, info: IntermediateResultExtraInfo) => void;
    onTextZonesUnitReceived?: (result: TextZonesUnit, info: IntermediateResultExtraInfo) => void;
    onTextRemovedBinaryImageUnitReceived?: (result: TextRemovedBinaryImageUnit, info: IntermediateResultExtraInfo) => void;
}
//# sourceMappingURL=intermediateresultreceiver.d.ts.map