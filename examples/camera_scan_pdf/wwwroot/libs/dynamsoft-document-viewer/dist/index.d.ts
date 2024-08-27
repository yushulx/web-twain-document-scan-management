declare class AnnotationManager {
	#private;
	constructor();
	createAnnotation<K extends keyof AnnotationsTypeMapOuter>(pageUid: string, type: K, annotationOptions?: AnnotationsTypeMapOuter[K]["options"]): AnnotationsTypeMapOuter[K]["return"];
	deleteAnnotations(annotationUids: string[]): boolean;
	getAnnotationsByUids(annotationUids: string[]): (OuterAnnotation | Incomplete | Unknown)[];
	getAnnotationsByPage(pageUid: string): (OuterAnnotation | Incomplete | Unknown)[];
	getAnnotationsByDoc(docUid: string): (OuterAnnotation | Incomplete | Unknown)[];
	bringAnnotationForward(annotationUid: string): boolean;
	sendAnnotationBackward(annotationUid: string): boolean;
	bringAnnotationToFront(annotationUid: string): boolean;
	sendAnnotationToBack(annotationUid: string): boolean;
	on<K extends keyof AnnotationManagerEventMap>(eventName: K, listener: (event: AnnotationManagerEventMap[K]) => any): void;
	off<K extends keyof AnnotationManagerEventMap>(eventName: K, listener?: (event: AnnotationManagerEventMap[K]) => any): void;
}
declare class BaseAnnotation<T> {
	#private;
	uid: string;
	creationDate: string;
	modificationDate: string;
	constructor(options: T);
	get type(): string;
	get pageUid(): string;
	getOptions(): T;
	updateOptions(options: T): boolean;
}
declare class BaseBrowseViewer implements IBrowseViewer {
	#private;
	v: any;
	vCommon: ViewerCommon;
	uid: string;
	groupUid: string;
	postfix: string;
	errorPrefix: string;
	constructor(options?: BrowseViewerConstructorOptions, prefix?: string);
	get isVisible(): boolean;
	get isBoundContainer(): boolean;
	set multiselectMode(val: boolean);
	get multiselectMode(): boolean;
	show(): void;
	hide(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	getStyle(name: "canvasStyle"): CanvasStyle;
	getStyle(name: "pageStyle"): BaseStyle;
	getStyle(name: "selectedPageStyle"): BaseStyle;
	getStyle(name: "hoveredPageStyle"): BaseStyle;
	getStyle(name: "pageNumberStyle"): PageNumberStyle;
	getStyle(name: "checkboxStyle"): CheckboxStyle;
	getStyle(name: "currentPageStyle"): BaseStyle;
	getStyle(name: "placeholderStyle"): BaseStyle;
	updateStyle(name: "canvasStyle", style: CanvasStyle): boolean;
	updateStyle(name: "pageStyle", style: BaseStyle): boolean;
	updateStyle(name: "selectedPageStyle", style: BaseStyle): boolean;
	updateStyle(name: "hoveredPageStyle", style: BaseStyle): boolean;
	updateStyle(name: "pageNumberStyle", style: PageNumberStyle): boolean;
	updateStyle(name: "checkboxStyle", style: CheckboxStyle): boolean;
	updateStyle(name: "currentPageStyle", style: BaseStyle): boolean;
	getSelectedPageIndices(): number[];
	selectAllPages(): string[];
	selectPages(indices: number[]): string[];
	setRowAndColumn(row: number, column: number): boolean;
	on<K extends keyof BrowseViewerEventMap>(eventName: K, listener: (event: BrowseViewerEventMap[K]) => any): void;
	off<K extends keyof BrowseViewerEventMap>(eventName: K, listener?: (event: BrowseViewerEventMap[K]) => any): void;
}
declare class BaseEvent implements IDomainEvent {
	constructor(type: string);
}
declare class CameraChangedEvent extends BaseEvent {
	readonly oldDeviceId: string;
	readonly newDeviceId: string;
	static create(oldDeviceId: string, newDeviceId: string): CameraChangedEvent;
	constructor(oldDeviceId: string, newDeviceId: string);
}
declare class CapturedEvent extends BaseEvent {
	readonly pageUid: string;
	static create(pageUid: string): CapturedEvent;
	constructor(pageUid: string);
}
declare class Core {
	#private;
	get versionInfo(): DDVVersionInfo;
	set engineResourcePath(path: string);
	get engineResourcePath(): string;
	set license(license: string);
	get license(): string;
	set deviceFriendlyName(name: string);
	get deviceFriendlyName(): string;
	loadWasm(): Promise<void>;
	init(): Promise<ConfigResult>;
}
declare class CropRectDeletedEvent extends BaseEvent {
	readonly rect: Rect;
	static create(rect: Rect): CropRectDeletedEvent;
	constructor(rect: Rect);
}
declare class CropRectDrawnEvent extends BaseEvent {
	readonly rect: Rect;
	static create(rect: Rect): CropRectDrawnEvent;
	constructor(rect: Rect);
}
declare class CropRectModifiedEvent extends BaseEvent {
	readonly oldRect: Rect;
	readonly newRect: Rect;
	static create(oldRect: Rect, newRect: Rect): CropRectModifiedEvent;
	constructor(oldRect: Rect, newRect: Rect);
}
declare class CurrentIndexChangedEvent extends BaseEvent {
	readonly oldIndex: number;
	readonly newIndex: number;
	static create(oldIndex: number, newIndex: number): CurrentIndexChangedEvent;
	constructor(oldIndex: number, newIndex: number);
}
declare class CurrentPageChangedEvent extends BaseEvent {
	readonly oldPageUid: string;
	readonly newPageUid: string;
	static create(oldPageUid: string, newPageUid: string): CurrentPageChangedEvent;
	constructor(oldPageUid: string, newPageUid: string);
}
declare class DisplayModeChangedEvent extends BaseEvent {
	readonly oldDisplayMode: DisplayModeEnum;
	readonly newDisplayMode: DisplayModeEnum;
	static create(oldDisplayMode: DisplayModeEnum, newDisplayMode: DisplayModeEnum): DisplayModeChangedEvent;
	constructor(oldDisplayMode: DisplayModeEnum, newDisplayMode: DisplayModeEnum);
}
declare class Disposable implements IDisposable {
	private store;
	dispose(): void;
	register<T extends IDisposable>(disposable: T): T;
}
declare class DocumentDetect implements IDocumentDetect {
	#private;
	private detector;
	private succeedDetect;
	private failedDetect;
	private autoCaptureStartTime;
	constructor();
	destroy(): void;
	clear(): void;
	detect(image: VImageData, config?: DocumentDetectConfig): Promise<DocumentDetectResult>;
	getStatusMsg(status: EnumDocumentDetectionStatus): string;
	processDetectResult(detectResult: DetectResult): DocumentDetectResult;
	calculateConfidence(location: Quad, width: number, height: number): DocumentDetectConfidence;
	calculateTotalConfidence(conf: DocumentDetectConfidence): number;
	reset(): void;
}
declare class DocumentEvent extends BaseEvent {
	readonly docUid: string;
	readonly docName: string;
	static create(docUid: string, docName: string): DocumentEvent;
	constructor(docUid: string, docName: string);
}
declare class DocumentManager extends Disposable {
	#private;
	constructor();
	/**
	 * Create an empty document.
	 * @param options - The configuration used to create a document.
	 * @returns An empty document object.
	 */
	createDocument(options?: CreateDocumentOptions): IDocument;
	/**
	 * Get the document with the document uid.
	 * @param docUid - The uid of the target document.
	 * @returns The target document object.
	 */
	getDocument(docUid: string): IDocument;
	getAllDocuments(): IDocument[];
	/**
	 * Remove the documents specified by the document uids.
	 * @param documentUids - The uids of the documents to be deleted.
	 * @returns A boolean value represent whether the documents are successfully removed.
	 */
	deleteDocuments(docUids: string[]): boolean;
	deleteAllDocuments(): boolean;
	copyPagesToDocument(sourceDocUid: string, targetDocUid: string, transferOptions?: TransferOptions): boolean;
	movePagesToDocument(sourceDocUid: string, targetDocUid: string, transferOptions?: TransferOptions): boolean;
	mergeDocuments(docUids: string[], options?: MergeDocumentsOptions): IDocument;
	on<K extends keyof DocumentManagerEventMap>(eventName: K, listener: (event: DocumentManagerEventMap[K]) => any): void;
	off<K extends keyof DocumentManagerEventMap>(eventName: K, listener?: (event: DocumentManagerEventMap[K]) => any): void;
}
declare class Elements {
	static getTooltip(): Tooltip;
	static setTooltip(tooltip: Tooltip): boolean;
	static getDisplayTextConfig(): DisplayTextConfig;
	static setDisplayTextConfig(displayTextConfig: DisplayTextConfig): boolean;
	static get Layout(): string;
	static get Button(): string;
	static get Capture(): string;
	static get Flashlight(): string;
	static get CameraConvert(): string;
	static get CameraResolution(): string;
	static get AutoDetect(): string;
	static get AutoCapture(): string;
	static get ImagePreview(): string;
	static get Rotate(): string;
	static get RotateLeft(): string;
	static get RotateRight(): string;
	static get Delete(): string;
	static get DeleteCurrent(): string;
	static get DeleteAll(): string;
	static get Zoom(): string;
	static get ZoomIn(): string;
	static get ZoomOut(): string;
	static get ZoomByPercentage(): string;
	static get Crop(): string;
	static get CropCurrent(): string;
	static get CropAll(): string;
	static get FullQuad(): string;
	static get PerspectiveAll(): string;
	static get Undo(): string;
	static get Redo(): string;
	static get Pan(): string;
	static get CropMode(): string;
	static get Load(): string;
	static get Download(): string;
	static get Print(): string;
	static get Filter(): string;
	static get Restore(): string;
	static get ThumbnailSwitch(): string;
	static get Pagination(): string;
	static get FitMode(): string;
	static get FitWindow(): string;
	static get FitHeight(): string;
	static get FitWidth(): string;
	static get ActualSize(): string;
	static get DisplayMode(): string;
	static get SinglePage(): string;
	static get ContinuousPage(): string;
	static get MainView(): string;
	static get SeparatorLine(): string;
	static get Done(): string;
	static get Back(): string;
	static get Blank(): string;
	static get Close(): string;
	static get AnnotationSet(): string;
	static get EllipseAnnotation(): string;
	static get EraseAnnotation(): string;
	static get InkAnnotation(): string;
	static get LineAnnotation(): string;
	static get PolygonAnnotation(): string;
	static get PolylineAnnotation(): string;
	static get RectAnnotation(): string;
	static get SelectAnnotation(): string;
	static get StampIconAnnotation(): string;
	static get StampImageAnnotation(): string;
	static get TextBoxAnnotation(): string;
	static get TextTypewriterAnnotation(): string;
	static get BringForward(): string;
	static get BringToFront(): string;
	static get SendBackward(): string;
	static get SendToBack(): string;
}
declare class Ellipse extends BaseAnnotation<EllipseAnnotationOptions> {
	constructor(options?: EllipseAnnotationOptions);
	get type(): string;
}
declare class FitModeChangedEvent extends BaseEvent {
	readonly oldFitMode: FitModeEnum;
	readonly newFitMode: FitModeEnum;
	static create(oldFitMode: FitModeEnum, newFitMode: FitModeEnum): FitModeChangedEvent;
	constructor(oldFitMode: FitModeEnum, newFitMode: FitModeEnum);
}
declare class ImageFilter implements IImageFilter {
	#private;
	get defaultFilterType(): string;
	applyFilter(image: VImageData, type: EnumImageFilterType, filterInputOptions?: FilterInputOptions, outputOptions?: ProcessOutputOptions): Promise<Blob>;
	querySupported(): ImageFilterItem[];
	destroy(): void;
}
declare class ImageIOWasmEnv {
	#private;
	static resourceDir: string;
	static fetchOptions: {
		mode: string;
		credentials: string;
		retries: number;
		retryDelay: number;
	};
	static enableSimd: boolean;
	static get isApple(): boolean;
	static get version(): string;
	static enableDebugOutput(enable: boolean, callback: (...args: any) => void): void;
	static getMemoryUsed(): any;
	static get heapConfig(): any;
	static updateHeapConfig(workerName: WorkerName, maxHeapSize?: number, initHeapSize?: number): void;
	static getLicenseInfo(license: any, isLts: boolean, uuid: string): Promise<LicenseInfo>;
	private static Init;
	static isResourceDirValid(maxRetries?: number, retryDelay?: number): Promise<boolean>;
	static loadPdfReader(license: any, isLts: boolean, uuid: string): Promise<boolean | void>;
	static loadMain(license: any, isLts: boolean, uuid: string): Promise<boolean | void>;
	static load(license: any, isLts: boolean, uuid: string): Promise<void>;
	static preloadModule(name: WasmModuleName): Promise<boolean | void>;
	static unloadMainWorker(): void;
	static unloadPdfReaderWorker(): void;
	static unloadDocumentDetectorWorker(): void;
	static unloadWorker(): Promise<void>;
	static unload(): Promise<void>;
	private static getUseSimd;
	static getPdfFonts(): string[];
	static getPdfInfo(blob: Blob, password?: string): Promise<unknown>;
}
declare class Incomplete {
	#private;
	uid: string;
	creationDate: string;
	modificationDate: string;
	constructor(raw: any);
	get type(): string;
	get pageUid(): string;
	get raw(): any;
}
declare class Ink extends BaseAnnotation<InkAnnotationOptions> {
	constructor(options?: InkAnnotationOptions);
	get type(): string;
}
declare class Line extends BaseAnnotation<LineAnnotationOptions> {
	constructor(options?: LineAnnotationOptions);
	get type(): string;
}
declare class PageRenderedEvent extends BaseEvent {
	readonly index: number;
	readonly pageUid: string;
	static create(index: number, pageUid: string): PageRenderedEvent;
	constructor(index: number, pageUid: string);
}
declare class PagesAddedEvent extends BaseEvent {
	readonly docUid: string;
	readonly indices: number[];
	readonly pageUids: string[];
	static create(docUid: string, indices: number[], pageUids: string[]): PagesAddedEvent;
	constructor(docUid: string, indices: number[], pageUids: string[]);
}
declare class PagesDeletedEvent extends BaseEvent {
	readonly docUid: string;
	readonly pageUids: string[];
	readonly indices: number[];
	static create(docUid: string, pageUids: string[], indices: number[]): PagesDeletedEvent;
	constructor(docUid: string, pageUids: string[], indices: number[]);
}
declare class PagesDraggedEvent extends BaseEvent {
	readonly indices: number[];
	readonly pageUids: string[];
	static create(indices: number[], pageUids: string[]): PagesDraggedEvent;
	constructor(indices: number[], pageUids: string[]);
}
declare class PagesDroppedEvent extends BaseEvent {
	readonly indicesBefore: number[];
	readonly indicesAfter: number[];
	readonly pageUids: string[];
	static create(indicesBefore: number[], indicesAfter: number[], pageUids: string[]): PagesDroppedEvent;
	constructor(indicesBefore: number[], indicesAfter: number[], pageUids: string[]);
}
declare class PlayedEvent extends BaseEvent {
	readonly deviceId: string;
	readonly resolution: [
		number,
		number
	];
	static create(deviceId: string, resolution: [
		number,
		number
	]): PlayedEvent;
	constructor(deviceId: string, resolution: [
		number,
		number
	]);
}
declare class Polygon extends BaseAnnotation<PolygonAnnotationOptions> {
	constructor(options?: PolygonAnnotationOptions);
	get type(): string;
}
declare class Polyline extends BaseAnnotation<PolylineAnnotationOptions> {
	constructor(options?: PolylineAnnotationOptions);
	get type(): string;
}
declare class QuadModifiedEvent extends BaseEvent {
	readonly oldQuad: Quad;
	readonly newQuad: Quad;
	static create(oldQuad: Quad, newQuad: Quad): QuadModifiedEvent;
	constructor(oldQuad: Quad, newQuad: Quad);
}
declare class Rectangle extends BaseAnnotation<RectAnnotationOptions> {
	constructor(options?: RectAnnotationOptions);
	get type(): string;
}
declare class ResizedEvent extends BaseEvent {
	readonly oldWidth: number;
	readonly oldHeight: number;
	readonly newWidth: number;
	readonly newHeight: number;
	static create(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): ResizedEvent;
	constructor(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number);
}
declare class SelectedAnnotationsChangedEvent extends BaseEvent {
	readonly oldAnnotationUids: string[];
	readonly newAnnotationUids: string[];
	static create(oldAnnotationUids: string[], newAnnotationUids: string[]): SelectedAnnotationsChangedEvent;
	constructor(oldAnnotationUids: string[], newAnnotationUids: string[]);
}
declare class SelectedPagesChangedEvent extends BaseEvent {
	readonly oldIndices: number[];
	readonly newIndices: number[];
	readonly oldPageUids: string[];
	readonly newPageUids: string[];
	static create(oldIndices: number[], newIndices: number[], oldPageUids: string[], newPageUids: string[]): SelectedPagesChangedEvent;
	constructor(oldIndices: number[], newIndices: number[], oldPageUids: string[], newPageUids: string[]);
}
declare class Stamp {
	#private;
	uid: string;
	creationDate: string;
	modificationDate: string;
	constructor(options?: StampAnnotationOptions);
	get type(): AnnotationTypesEnum;
	get pageUid(): string;
	getOptions(): StampAnnotationOptions;
	updateOptions(options: StampAnnotationOptions): Promise<void>;
}
declare class StoppedEvent extends BaseEvent {
	readonly deviceId: string;
	static create(deviceId: string): StoppedEvent;
	constructor(deviceId: string);
}
declare class TextBox extends BaseAnnotation<TextBoxAnnotationOptions> {
	constructor(options?: TextBoxAnnotationOptions);
	get type(): string;
}
declare class TextTypewriter extends BaseAnnotation<TextTypewriterAnnotationOptions> {
	constructor(options?: TextTypewriterAnnotationOptions);
	get type(): string;
}
declare class ToolModeChangedEvent extends BaseEvent {
	readonly oldToolMode: ToolModeEnum;
	readonly newToolMode: ToolModeEnum;
	static create(oldToolMode: ToolModeEnum, newToolMode: ToolModeEnum): ToolModeChangedEvent;
	constructor(oldToolMode: ToolModeEnum, newToolMode: ToolModeEnum);
}
declare class Unknown {
	uid: string;
	creationDate: string;
	modificationDate: string;
	constructor();
	get type(): string;
	get pageUid(): string;
}
declare class VPointerEvent extends BaseEvent {
	readonly index: number;
	readonly pageUid: string;
	readonly imageX: number;
	readonly imageY: number;
	readonly canvasX: number;
	readonly canvasY: number;
	readonly nativeEvent: PointerEvent;
	static create(index: number, pageUid: string, imageX: number, imageY: number, canvasX: number, canvasY: number, nativeEvent: PointerEvent): VPointerEvent;
	constructor(index: number, pageUid: string, imageX: number, imageY: number, canvasX: number, canvasY: number, nativeEvent: PointerEvent);
}
declare class ViewerCommon {
	getIsBoundContainer(viewer: Viewer): any;
	bindContainer(viewer: Viewer, container: HTMLElement | string, apiName: string): void;
	unbindContainer(viewer: Viewer): void;
	getIsVisible(viewer: Viewer): boolean;
	show(viewer: Viewer): void;
	hide(viewer: Viewer): void;
	getCurrentDocument(viewer: Viewer): IDocument | null;
	openDocument(docUidOrDoc: string | IDocument, viewerUid: string, apiName: string): void;
	closeDocument(viewer: Viewer, apiName: string): boolean;
	getStyle(viewer: Viewer, viewerType: "capture" | "perspective" | "edit" | "browse", styleName: string, styleList: string[], apiName: string): any;
	updateStyle(viewer: Viewer, styleName: string, style: any, styleList: string[], apiName: string): boolean;
	getUiConfig(viewer: Viewer): UiConfig;
	updateUiConfig(viewer: Viewer, config: UiConfig, viewerType: string, apiName: string): any;
	indexToUid(viewer: Viewer, index: number, apiName: string): any;
	uidToIndex(viewer: Viewer, pageUid: string, apiName: string): number;
	getCurrentPageUid(viewer: Viewer): string;
	getCurrentPageIndex(viewer: Viewer): number;
	getPageCount(viewer: Viewer): number;
	gotoPage(viewer: Viewer, index: number, apiName: string): any;
	rotate(viewer: Viewer, angle: number, indices: number[], apiName: string): any;
	saveOperation(viewer: Viewer): boolean;
	on<K extends keyof ViewerEventMap>(viewer: Viewer, apiName: string, eventName: K, listener?: (event: ViewerEventMap[K]) => any): void;
	off<K extends keyof ViewerEventMap>(viewer: Viewer, apiName: string, eventName: K, listener?: (event: ViewerEventMap[K]) => any): void;
	destroy(viewer: Viewer): void;
}
declare class ZoomChangedEvent extends BaseEvent {
	readonly oldZoomRatio: number;
	readonly newZoomRatio: number;
	static create(oldZoomRatio: number, newZoomRatio: number): ZoomChangedEvent;
	constructor(oldZoomRatio: number, newZoomRatio: number);
}
declare const Version: string;
declare enum EnumImageFilterType {
	NONE = "none",
	BLACK_AND_WHITE = "blackAndWhite",
	GRAY = "gray",
	REMOVE_SHADOW = "removeShadow",
	SAVE_INK = "saveInk",
	ENHANCE = "enhance",
	INVERT = "invert",
	BRIGHTNESS = "brightness",
	CONTRAST = "contrast",
	BRIGHTNESS_AND_CONTRAST = "brightnessAndContrast"
}
declare enum EnumLineEnding {
	NONE = "none",
	OPEN = "open",
	OPEN_REVERSE = "openReverse",
	CLOSED = "closed",
	CLOSED_REVERSE = "closedReverse",
	BUTT = "butt",
	SLASH = "slash",
	SQUARE = "square",
	DIAMOND = "diamond",
	CIRCLE = "circle"
}
declare enum EnumStampIcon {
	REJECTED = "rejected",// cross
	ACCEPTED = "accepted",// tick
	INITIAL_HERE = "initialHere",
	SIGN_HERE = "signHere",
	WITNESS = "witness",
	APPROVED = "approved",
	NOT_APPROVED = "notApproved",
	DRAFT = "draft",
	FINAL = "final",
	COMPLETED = "completed",
	CONFIDENTIAL = "confidential",
	VOID = "void"
}
declare enum ImageType {
	IT_DIB = -1,
	IT_RGBA = -2,
	IT_BGRA = -3,
	IT_BMP = 0,
	IT_JPG = 1,
	IT_PNG = 3,
	IT_ALL = 5
}
declare enum WorkerName {
	core = "ddv-core",
	reader = "ddv-reader",
	detector = "ddv-detector",
	loader = "ddv-loader"
}
export declare class BrowseViewer extends BaseBrowseViewer {
	constructor(options: BrowseViewerConstructorOptions);
	get currentDocument(): IDocument | null;
	bindContainer(container: string | HTMLElement): void;
	unbindContainer(): void;
	openDocument(docUidOrDoc: string | IDocument): void;
	closeDocument(): boolean;
	/**
	 * Rotate pages specified by the indices in the activated document.
	 * @param indices - The indices of pages to be rotated.
	 * @param angle - The angle to rotate the pages, in degrees.
	 * Positive values mean clockwise rotation.
	 * @returns A boolean value represent whether the operation is successful.
	*/
	rotate(angle: number, indices?: number[]): boolean;
	/**
	 * Get the uid of the page represented by the index in the activated document.
	 * @param index  - The index of a page in the activated document.
	 * @returns The uid of the page.
	 */
	indexToUid(index: number): string;
	/**
	 * Get the index of the page represented by the uid in the activated document.
	 * @param uid  - The uid of a page in the activated document.
	 * @returns The index of the page.
	 */
	uidToIndex(uid: string): number;
	/**
	 * Get the uid of the current page.
	 * @returns The uid of the current page.
	 */
	getCurrentPageUid(): string;
	getCurrentPageIndex(): number;
	getPageCount(): number;
	goToPage(index: number): number;
	saveOperations(): boolean;
	destroy(): void;
}
export declare class CaptureViewer {
	#private;
	uid: string;
	groupUid: string;
	postfix: string;
	constructor(options?: CaptureViewerConstructorOptions);
	get isVisible(): boolean;
	get isBoundContainer(): boolean;
	get currentDocument(): IDocument | null;
	get acceptedPolygonConfidence(): number;
	set acceptedPolygonConfidence(val: number);
	get maxFrameNumber(): number;
	set maxFrameNumber(val: number);
	get enableAutoDetect(): boolean;
	set enableAutoDetect(val: boolean);
	get enableAutoCapture(): boolean;
	set enableAutoCapture(val: boolean);
	bindContainer(container: HTMLElement | string): void;
	unbindContainer(): void;
	show(): void;
	hide(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	openDocument(docUidOrDoc: string | IDocument): void;
	closeDocument(): boolean;
	getStyle(name: "canvasStyle"): CanvasStyle;
	getStyle(name: "quadSelectionStyle"): QuadSelectionStyle;
	updateStyle(name: "canvasStyle", style: CanvasStyle): boolean;
	updateStyle(name: "quadSelectionStyle", style: QuadSelectionStyle): boolean;
	capture(): Promise<Blob>;
	play(config?: VideoConfig): Promise<void>;
	stop(): void;
	getCurrentCamera(): VideoDeviceInfo;
	getAllCameras(): Promise<VideoDeviceInfo[]>;
	selectCamera(cameraObjectOrDeviceID: VideoDeviceInfo | string): Promise<PlayCallbackInfo>;
	getCurrentResolution(): [
		number,
		number
	];
	turnOnTorch(): Promise<void>;
	turnOffTorch(): Promise<void>;
	on<K extends keyof CaptureViewerEventMap>(eventName: K, listener: (event: CaptureViewerEventMap[K]) => any): void;
	off<K extends keyof CaptureViewerEventMap>(eventName: K, listener?: (event: CaptureViewerEventMap[K]) => any): void;
	destroy(): void;
}
export declare class CustomViewer {
	#private;
	uid: string;
	isDestroyed: boolean;
	postfix: string;
	constructor(options?: CustomViewerConstructorOptions);
	get isBoundContainer(): boolean;
	get isVisible(): boolean;
	bindContainer(container: HTMLElement): void;
	unbindContainer(): void;
	hide(): void;
	show(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	on(eventName: string, listener: (...args: any[]) => void): void;
	off(eventName: string, listener?: (...args: any[]) => void): void;
	destroy(): void;
}
export declare class EditViewer {
	#private;
	uid: string;
	groupUid: string;
	postfix: string;
	thumbnail: IBrowseViewer;
	constructor(options?: EditViewerConstructorOptions);
	get isVisible(): boolean;
	get isBoundContainer(): boolean;
	get currentDocument(): IDocument | null;
	get zoom(): number;
	set zoom(val: number);
	get zoomOrigin(): ZoomOrigin;
	set zoomOrigin(val: ZoomOrigin);
	get displayMode(): DisplayMode;
	set displayMode(val: DisplayMode);
	get toolMode(): ToolMode;
	set toolMode(val: ToolMode);
	get annotationMode(): AnnotationMode;
	set annotationMode(val: AnnotationMode);
	get fitMode(): FitMode;
	set fitMode(type: FitMode);
	bindContainer(container: HTMLElement | string): void;
	unbindContainer(): void;
	show(): void;
	hide(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	openDocument(docUidOrDoc: string | IDocument): void;
	closeDocument(): boolean;
	getStyle(name: "canvasStyle"): CanvasStyle;
	getStyle(name: "pageStyle"): BaseStyle;
	getStyle(name: "currentPageStyle"): BaseStyle;
	getStyle(name: "quadSelectionStyle"): QuadSelectionStyle;
	getStyle(name: "annotationSelectionStyle"): AnnotationSelectionStyle;
	updateStyle(name: "canvasStyle", style: CanvasStyle): boolean;
	updateStyle(name: "pageStyle", style: BaseStyle): boolean;
	updateStyle(name: "currentPageStyle", style: BaseStyle): boolean;
	updateStyle(name: "quadSelectionStyle", style: QuadSelectionStyle): boolean;
	updateStyle(name: "annotationSelectionStyle", style: AnnotationSelectionStyle): boolean;
	setParallelScrollCount(count: number): boolean;
	/**
	 * Set the selection rectangle of the selected page.
	 * @param rect - The selection rectangle to be set.
	 * @param keepExisted - Whether to keep the existed selection rectangle.
	 * @returns A boolean value represent whether the operation is successful.
	 */
	setCropRect(rect: Rect): boolean;
	getCropRect(): Rect | null;
	crop(rect: Rect, indices?: number[]): boolean;
	/**
	 * Rotate pages specified by the indices in the activated document.
	 * @param indices - The indices of pages to be rotated.
	 * @param angle - The angle to rotate the pages, in degrees.
	 * Positive values mean clockwise rotation.
	 * @returns A boolean value represent whether the operation is successful.
	*/
	rotate(angle: number, indices?: number[]): boolean;
	/**
	 * Undo the last operation.
	 * @returns A boolean value represent whether the operation is successful.
	*/
	undo(): boolean;
	/**
	 * Redo the last undo operation.
	 * @returns A boolean value represent whether the operation is successful.
	*/
	redo(): boolean;
	saveOperations(): boolean;
	/**
	 * Get the uid of the page represented by the index in the activated document.
	 * @param index  - The index of a page in the activated document.
	 * @returns The uid of the page.
	 */
	indexToUid(index: number): string;
	/**
	 * Get the index of the page represented by the uid in the activated document.
	 * @param uid  - The uid of a page in the activated document.
	 * @returns The index of the page.
	 */
	uidToIndex(uid: string): number;
	/**
	 * Get the uid of the current page.
	 * @returns The uid of the current page.
	 */
	getCurrentPageUid(): string;
	getCurrentPageIndex(): number;
	getPageCount(): number;
	goToPage(index: number): number;
	selectAnnotations(annotationUids: string[]): boolean;
	getSelectedAnnotations(): (Incomplete | Unknown | OuterAnnotation)[];
	on<K extends keyof EditViewerEventMap>(eventName: K, listener: (event: EditViewerEventMap[K]) => any): void;
	off<K extends keyof EditViewerEventMap>(eventName: K, listener?: (event: EditViewerEventMap[K]) => any): void;
	destroy(): void;
}
export declare class PerspectiveViewer {
	#private;
	uid: string;
	groupUid: string;
	postfix: string;
	constructor(options: PerspectiveViewerConstructorOptions);
	get isVisible(): boolean;
	get isBoundContainer(): boolean;
	get currentDocument(): IDocument | null;
	bindContainer(container: HTMLElement | string): void;
	unbindContainer(): void;
	show(): void;
	hide(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	openDocument(docUidOrDoc: string | IDocument): void;
	closeDocument(): boolean;
	getStyle(name: "canvasStyle"): CanvasStyle;
	getStyle(name: "pageStyle"): BaseStyle;
	getStyle(name: "quadSelectionStyle"): QuadSelectionStyle;
	updateStyle(name: "canvasStyle", style: CanvasStyle): boolean;
	updateStyle(name: "pageStyle", style: BaseStyle): boolean;
	updateStyle(name: "quadSelectionStyle", style: QuadSelectionStyle): boolean;
	setQuadSelection(quad: Quad): boolean;
	getQuadSelection(): Quad | null;
	resetQuadSelection(indices?: number[]): boolean;
	applyPerspective(quad: Quad): Promise<Blob>;
	rotate(angle: number, indices?: number[]): boolean;
	saveOperations(): boolean;
	/**
	 * Jump to the target page.
	 * @param index - The index of the page to be selected as the current page
	 * in the activated document.
	 * @returns A number represent the index of page. It is -1 while the input parameter is invalid.
	 */
	goToPage(index: number): number;
	/**
	 * Get the uid of the page represented by the index in the activated document.
	 * @param index  - The index of a page in the activated document.
	 * @returns The uid of the page.
	 */
	indexToUid(index: number): string;
	/**
	 * Get the index of the page represented by the uid in the activated document.
	 * @param uid  - The uid of a page in the activated document.
	 * @returns The index of the page.
	 */
	uidToIndex(uid: string): number;
	/**
	 * Get the uid of the current page.
	 * @returns The uid of the current page.
	 */
	getCurrentPageUid(): string;
	/**
	 * Get the index of the current page.
	 * @returns The index of the current page.
	 */
	getCurrentPageIndex(): number;
	getPageCount(): number;
	on<K extends keyof PerspectiveViewerEventMap>(eventName: K, listener: (eventName: PerspectiveViewerEventMap[K]) => any): void;
	off<K extends keyof PerspectiveViewerEventMap>(eventName: K, listener?: (event: PerspectiveViewerEventMap[K]) => any): void;
	destroy(): void;
}
export declare const DDV: {
	/** The document manager object */
	documentManager: DocumentManager;
	/** The configuration object */
	Core: Core;
	Elements: typeof Elements;
	/** The constructor of the DocumentDetect class. */
	DocumentDetect: typeof DocumentDetect;
	/** The constructor of the ImageFilter class. */
	ImageFilter: typeof ImageFilter;
	/** The constructor of the BrowseViewer class. */
	BrowseViewer: typeof BrowseViewer;
	/** The constructor of the CaptureViewer class. */
	CaptureViewer: typeof CaptureViewer;
	/** The constructor of the CustomViewer class. */
	CustomViewer: typeof CustomViewer;
	/** The constructor of the EditViewer class. */
	EditViewer: typeof EditViewer;
	/** The constructor of the PerspectiveViewer class. */
	PerspectiveViewer: typeof PerspectiveViewer;
	readonly lastError: LastError;
	clearLastError(): void;
	Experiments: {
		get(name: string, params?: any): any;
		set(name: string, value: any): any;
	};
	addFonts(fonts: Blob[]): Promise<void>;
	getDefaultUiConfig(viewerType: ViewerType, options?: DefaultUiConfigOptions): UiConfig | null;
	/**
	 * Set a processing handler to the DDV system.
	 */
	setProcessingHandler<K extends keyof ProcessingHandlerMap>(type: K, handler: ProcessingHandlerMap[K]): void;
	/**
	 * Set a filter parser to the DDV system.
	 * @param mine - The MIME type of file.
	 * @param parserClass - The constructor of the file parser.
	 */
	setFileParser(mine: SourceMIME, parserClass: FileParserConstructor): void;
	unload(): void;
	/**
	 * Register an event listener to the DDV system.
	 * @param eventName - The name of the event.
	 * @param listener - The listener function.
	 * @template K - The type of the event name.
	 */
	on<K extends keyof DDVEventMap>(eventName: K, listener: (event: DDVEventMap[K]) => any): void;
	/**
	 * Unregister an event listener from the DDV system.
	 * @param eventName - The name of the event.
	 * @param listener - The listener function (optional).
	 * If listener is not provided, all listeners of the event will be removed.
	 * @template K - The type of the event name.
	 */
	off<K extends keyof DDVEventMap>(eventName: K, listener?: (event: DDVEventMap[K]) => any): void;
	/** Enums */
	EnumImageDataType: typeof EnumImageDataType;
	EnumConvertMode: typeof EnumConvertMode;
	EnumDocumentDetectionStatus: typeof EnumDocumentDetectionStatus;
	EnumImageFilterType: typeof EnumImageFilterType;
	EnumPDFCompressionType: typeof EnumPDFCompressionType;
	EnumPDFPageType: typeof EnumPDFPageType;
	EnumTIFFCompressionType: typeof EnumTIFFCompressionType;
	EnumStampIcon: typeof EnumStampIcon;
	EnumLineEnding: typeof EnumLineEnding;
	EnumAnnotationRenderMode: typeof EnumAnnotationRenderMode;
	/** Annotations */
	annotationManager: AnnotationManager;
};
export declare const enum AnnotationTypesEnum {
	ARC = "arc",
	CIRCLE = "circle",
	IMAGE = "image",
	TEXT_ASSIST = "textAssist",
	ELLIPSE = "ellipse",
	RECT = "rectangle",
	LINE = "line",
	POLYGON = "polygon",
	POLYLINE = "polyline",
	TEXT_TYPEWRITER = "textTypewriter",
	TEXT_BOX = "textBox",
	INK = "ink",
	STAMP = "stamp",
	HIGHLIGHT = "highlight",
	UNDERLINE = "underline",
	STRIKEOUT = "strikeout",
	INCOMPLETE = "incomplete",
	UNKNOWN = "unknown"
}
export declare const enum AnnotationTypesEnum {
	ARC = "arc",
	CIRCLE = "circle",
	IMAGE = "image",
	TEXT_ASSIST = "textAssist",
	ELLIPSE = "ellipse",
	RECT = "rectangle",
	LINE = "line",
	POLYGON = "polygon",
	POLYLINE = "polyline",
	TEXT_TYPEWRITER = "textTypewriter",
	TEXT_BOX = "textBox",
	INK = "ink",
	STAMP = "stamp",
	HIGHLIGHT = "highlight",
	UNDERLINE = "underline",
	STRIKEOUT = "strikeout",
	INCOMPLETE = "incomplete",
	UNKNOWN = "unknown"
}
export declare const enum DisplayModeEnum {
	SINGLE = "single",
	MULTIPLE = "multiple",
	CONTINUOUS = "continuous",
	SLIDE = "slide"
}
export declare const enum FitModeEnum {
	NONE = "none",
	WIDTH = "width",
	HEIGHT = "height",
	WINDOW = "window",
	ACTUAL_SIZE = "actualSize"
}
export declare const enum SourceMIME {
	IMAGE_PNG = "image/png",
	IMAGE_JPEG = "image/jpeg",
	IMAGE_BMP = "image/bmp",
	IMAGE_WEBP = "image/webp",
	IMAGE_TIFF = "image/tiff",
	IMAGE_JP2 = "image/jp2",
	APPLICATION_PDF = "application/pdf",
	IMAGE_RGBA = "image/rgba",
	APPLICATION_BLANK_IMAGE = "application/ddv-blank-image"
}
export declare const enum ToolModeEnum {
	PAN = "pan",
	CROP = "crop",
	ZOOM_IN = "zoomIn",
	ZOOM_OUT = "zoomOut",
	ANNOTATION = "annotation"
}
export declare enum EnumAnnotationRenderMode {
	NO_ANNOTATIONS = "noAnnotations",
	RENDER_ANNOTATIONS = "renderAnnotations",
	LOAD_ANNOTATIONS = "loadAnnotations"
}
export declare enum EnumConvertMode {
	CM_RENDERALL = "cm/renderall",
	CM_IMAGEONLY = "cm/imageonly",
	CM_AUTO = "cm/auto"
}
export declare enum EnumDocumentDetectionStatus {
	GOOD = "Good",
	AUTO_CAPTURE = "AutoCaptured",
	SMALL_SIZE = "SmallSize",
	OFF_CENTER = "OffCenter",
	SKEW = "Skew",
	NOTHING_DETECTED = "NothingDetected"
}
export declare enum EnumImageDataType {
	RGBA = 1,
	BGRA = 2,
	JPEG = 3,
	PNG = 4
}
export declare enum EnumImageFilterType {
	NONE = "none",
	BLACK_AND_WHITE = "blackAndWhite",
	GRAY = "gray",
	REMOVE_SHADOW = "removeShadow",
	SAVE_INK = "saveInk",
	ENHANCE = "enhance",
	INVERT = "invert"
}
export declare enum EnumPDFCompressionType {
	PDF_AUTO = "pdf/auto",
	PDF_FAX4 = "pdf/fax4",
	PDF_LZW = "pdf/lzw",
	PDF_JPEG = "pdf/jpeg",
	PDF_JP2000 = "pdf/jp2000",
	PDF_JBIG2 = "pdf/jbig2"
}
export declare enum EnumPDFPageType {
	PAGE_DEFAULT = "page/default",
	PAGE_A4 = "page/a4",
	PAGE_A4_REVERSE = "page/a4reverse",
	PAGE_A3 = "page/a3",
	PAGE_A3_REVERSE = "page/a3reverse",
	PAGE_LETTER = "page/letter",
	PAGE_LETTER_REVERSE = "page/letterreverse",
	PAGE_LEGAL = "page/legal",
	PAGE_LEGAL_REVERSE = "page/legalreverse"
}
export declare enum EnumTIFFCompressionType {
	TIFF_AUTO = "tiff/auto",
	TIFF_FAX3 = "tiff/fax3",
	TIFF_FAX4 = "tiff/fax4",
	TIFF_LZW = "tiff/lzw",
	TIFF_JPEG = "tiff/jpeg"
}
export interface AnnotationCommonStyle {
	x?: number;
	y?: number;
	borderWidth?: number;
	borderColor?: string;
	background?: string;
	lineDash?: number[];
	lineCap?: string;
	lineJoin?: string;
	miterLimit?: number;
	opacity?: number;
}
export interface AnnotationConfig {
	toolbarConfig?: ToolbarConfig;
	paletteConfig?: PaletteConfig;
	annotationSelectionStyle?: AnnotationSelectionStyle;
	/**
	 * Specify the ink creation delay. The delay allows users to create the annotation with
	 * multiple strokes. Default value: 1000, means 1 second.
	 */
	inkCreateDelay?: number;
	/** Whether to show the selected annotation on top level. Default value: true */
	showOnTopWhenSelected?: boolean;
	enableContinuousDrawing?: boolean;
	defaultStyleConfig?: {
		rectangle?: RectangleStyle;
		ellipse?: EllipseStyle;
		polygon?: PolygonStyle;
		polyline?: PolylineStyle;
		line?: LineStyle;
		ink?: InkStyle;
		textBox?: TextBoxStyle;
		textTypewriter?: TextTypewriterStyle;
		stamp?: StampStyle;
	};
}
export interface AnnotationLayerChangedEvent {
	oldAnnotationUidList: string[];
	newAnnotationUidList: string[];
}
export interface AnnotationManagerEventMap {
	annotationsAdded: AnnotationsAddedEvent;
	annotationsDeleted: AnnotationsDeletedEvent;
	annotationsModified: AnnotationsModifiedEvent;
	annotationLayerChanged: AnnotationLayerChangedEvent;
}
export interface AnnotationOptionsMap {
	ellipse: EllipseAnnotationOptions;
	ink: InkAnnotationOptions;
	line: LineAnnotationOptions;
	polygon: PolygonAnnotationOptions;
	polyline: PolylineAnnotationOptions;
	rectangle: RectAnnotationOptions;
	stamp: StampAnnotationOptions;
	textBox: TextBoxAnnotationOptions;
	textTypewriter: TextTypewriterAnnotationOptions;
}
export interface AnnotationRawData {
	borderStyle?: {
		width?: number;
		style?: string;
		dash?: number[];
	};
	color?: number[];
	interiorColor?: number[];
	contents?: string;
	creationdate?: string;
	flags?: string[];
	defaultStyle?: string;
	defaultAppearance?: string;
	inreplyto?: number;
	intent?: string;
	line?: number[];
	lineEnding?: string[];
	date?: string;
	name?: string;
	normalAppearance?: NormalAppearance;
	opacity?: number;
	rectDifference?: number[];
	rect?: number[];
	subject?: string;
	type?: string;
	title?: string;
	vertices?: number[];
	inkList?: number[][];
	icon?: string;
	state?: string;
	statemodel?: string;
	defaultAppearanceData?: {
		fontColor?: number[];
		fontName?: string;
		fontSize?: number;
	};
	richText?: string;
	quadPoints?: number[][];
	replies?: AnnotationRawData[];
	markedStates: AnnotationRawData[];
	reviewStates: AnnotationRawData[];
	oriIndex: number;
	modified: boolean;
}
export interface AnnotationSelectionStyle {
	border?: string;
	background?: string;
	ctrlBorderRadius?: string;
	ctrlBorder?: string;
	ctrlWidth?: string;
	ctrlHeight?: string;
	ctrlBackground?: string;
}
export interface AnnotationStyle extends AnnotationCommonStyle {
	rx?: number;
	ry?: number;
	width?: number;
	height?: number;
	text?: string;
	textAlign?: FreeTextAlign;
	color?: string;
	fontSize?: number;
	fontFamily?: string;
	fontStyle?: string;
	fontWeight?: string;
	textBaseLine?: string;
	img?: HTMLImageElement;
	startPoint?: Point3Init;
	endPoint?: Point3Init;
	lineEnding?: string[];
	points?: Point3Init[];
	textContents?: FreeTextContent[];
	segments?: Point3Init[][];
	imageData?: string | Blob;
	stampConfig?: any[];
	annotationRaw?: AnnotationRawData;
	iconName?: string;
	renderBlendMode?: string;
}
export interface AnnotationToolbarButton {
	id?: string;
	className?: string;
	style?: CSSStyleDeclaration;
	tooltip?: string;
	label?: string;
	displayText?: string;
}
export interface AnnotationTransform {
	scale: Vector3Init;
	angle: number;
	position?: Point3Init;
}
export interface AnnotationsAddedEvent {
	annotationUids: string[];
}
export interface AnnotationsDeletedEvent {
	annotationUids: string[];
}
export interface AnnotationsModifiedEvent<K extends keyof AnnotationOptionsMap = keyof AnnotationOptionsMap> {
	modifiedAnnotations: {
		uid: string;
		oldOptions: AnnotationOptionsMap[K];
		newOptions: AnnotationOptionsMap[K];
	}[];
	actions: AnnotationModifiedAction[];
}
export interface AnnotationsTypeMap {
	rectangle: {
		options: RectAnnotationOptions;
		return: Rectangle;
	};
	ellipse: {
		options: EllipseAnnotationOptions;
		return: Ellipse;
	};
	polygon: {
		options: PolygonAnnotationOptions;
		return: Polygon;
	};
	polyline: {
		options: PolylineAnnotationOptions;
		return: Polyline;
	};
	line: {
		options: LineAnnotationOptions;
		return: Line;
	};
	ink: {
		options: InkAnnotationOptions;
		return: Ink;
	};
	textBox: {
		options: TextBoxAnnotationOptions;
		return: TextBox;
	};
	textTypewriter: {
		options: TextTypewriterAnnotationOptions;
		return: TextTypewriter;
	};
	unknown: {
		options: any;
		return: Unknown;
	};
	incomplete: {
		options: any;
		return: Incomplete;
	};
}
export interface AnnotationsTypeMapOuter extends AnnotationsTypeMap {
	stamp: {
		options: StampAnnotationOptions;
		return: Promise<Stamp>;
	};
}
export interface BaseAnnotationOptions {
	borderWidth?: number;
	borderColor?: string;
	background?: string;
	opacity?: number;
	lineDash?: number[];
	flags?: Flags;
	rotation?: number;
}
export interface BaseAnnotationStyle {
	opacity?: number;
}
export interface BaseStyle {
	border?: string;
	background?: string;
}
export interface BrowseViewerConfig {
	canvasStyle?: CanvasStyle;
	currentPageStyle?: BaseStyle;
	pageStyle?: BaseStyle;
	selectedPageStyle?: BaseStyle;
	hoveredPageStyle?: BaseStyle;
	placeholderStyle?: BaseStyle;
	pageNumberStyle?: PageNumberStyle;
	checkboxStyle?: CheckboxStyle;
	rows?: number;
	columns?: number;
	scrollDirection?: "horizontal" | "vertical";
	multiselectMode?: boolean;
	scrollToLatest?: boolean;
	enableDragPage?: boolean;
}
export interface BrowseViewerConstructorOptions {
	container?: string | HTMLElement;
	viewerConfig?: BrowseViewerConfig;
	uiConfig?: UiConfig;
	/** The uid of the controller/viewer to be synced */
	groupUid?: string;
}
export interface BrowseViewerEventMap {
	"resized": ResizedEvent;
	"pageRendered": PageRenderedEvent;
	"currentIndexChanged": CurrentIndexChangedEvent;
	"currentPageChanged": CurrentPageChangedEvent;
	"selectedPagesChanged": SelectedPagesChangedEvent;
	"pagesDragged": PagesDraggedEvent;
	"pagesDropped": PagesDroppedEvent;
	"click": VPointerEvent;
	"dblclick": VPointerEvent;
	"rightclick": VPointerEvent;
}
export interface CameraChangedEvent {
	readonly oldDeviceId: string;
	readonly newDeviceId: string;
}
export interface CanvasStyle {
	border?: string;
	background?: string;
	cursor?: Cursor;
}
export interface CaptureViewerConfig {
	canvasStyle?: CanvasStyle;
	quadSelectionStyle?: QuadSelectionStyle;
	enableTorch?: boolean;
	enableAutoCapture?: boolean;
	enableAutoDetect?: boolean;
	acceptedPolygonConfidence?: number;
	maxFrameNumber?: number;
	autoCaptureDelay?: number;
}
export interface CaptureViewerConstructorOptions {
	container?: string | HTMLElement;
	viewerConfig?: CaptureViewerConfig;
	uiConfig?: UiConfig;
	/** The uid of the controller/viewer to be synced */
	groupUid?: string;
}
export interface CaptureViewerEventMap {
	"resized": ResizedEvent;
	"played": PlayedEvent;
	"stopped": StoppedEvent;
	"captured": CapturedEvent;
	"cameraChanged": CameraChangedEvent;
	"click": VPointerEvent;
	"dblclick": VPointerEvent;
	"rightclick": VPointerEvent;
}
export interface CapturedEvent {
	readonly pageUid: string;
}
export interface CheckboxStyle {
	left?: string;
	top?: string;
	right?: string;
	bottom?: string;
	width?: string;
	height?: string;
	background?: string;
	border?: string;
	borderRadius?: string;
	translateX?: string;
	translateY?: string;
	opacity?: number;
	visibility?: "hidden" | "visible";
	checkMarkColor?: string;
	checkMarkLineWidth?: string;
}
export interface ConfigResult {
	licenseInfo: LicenseInfo;
	deviceUuid?: string;
}
export interface CreateDocumentOptions {
	name?: string;
	author?: string;
	creationDate?: string;
}
export interface CropRectDeletedEvent {
	readonly rect: Rect;
}
export interface CropRectDrawnEvent {
	readonly rect: Rect;
}
export interface CropRectModifiedEvent {
	readonly oldRect: Rect;
	readonly newRect: Rect;
}
export interface CurrentIndexChangedEvent {
	readonly oldIndex: number;
	readonly newIndex: number;
}
export interface CurrentPageChangedEvent {
	readonly oldPageUid: string;
	readonly newPageUid: string;
}
export interface CustomViewerConstructorOptions {
	container?: HTMLElement | string;
	uiConfig?: UiConfig;
}
export interface DDVError {
	message: string;
	cause: VError;
}
export interface DDVEventMap {
	"error": DDVError;
	"warning": DDVError;
	"verbose": DDVError;
}
export interface DDVVersionInfo {
	viewer?: typeof Version;
	build?: string;
	engine: typeof ImageIOWasmEnv.version;
}
export interface DefaultUiConfigOptions {
	includeAnnotationSet?: boolean;
}
export interface DetectResult {
	location: Quad;
	width: number;
	height: number;
	config: DocumentDetectConfig;
	confidence?: number;
}
export interface DisplayModeChangedEvent {
	readonly oldDisplayMode: DisplayModeEnum;
	readonly newDisplayMode: DisplayModeEnum;
}
export interface DisplayTextConfig extends IconComponent {
	FitMode_FitWidth?: string;
	FitMode_FitHeight?: string;
	FitMode_FitWindow?: string;
	FitMode_ActualSize?: string;
	DisplayMode_SinglePage?: string;
	DisplayMode_ContinuousPage?: string;
	Crop_CropAll?: string;
	Crop_CropCurrent?: string;
	Crop_CropCancel?: string;
	Crop_CropApply?: string;
	Filter_FilterAll?: string;
	Delete_DeleteCurrent?: string;
	Delete_DeleteAll?: string;
	CameraResolution_720P?: string;
	CameraResolution_1080P?: string;
	CameraResolution_1440P?: string;
	CameraResolution_2160P?: string;
}
export interface DocumentDetectConfidence {
	angleConfidence: number;
	areaConfidence: number;
	centerConfidence: number;
}
export interface DocumentDetectConfig {
	acceptedPolygonConfidence?: number;
	enableAutoCapture?: boolean;
	autoCaptureDelay: number;
}
export interface DocumentDetectResult {
	success: boolean;
	location?: Quad;
	confidence?: number;
	status?: EnumDocumentDetectionStatus;
	statusMsg?: string;
}
/**
 * Support DocumentCreated and DocumentDeleted events
 */
export interface DocumentEvent {
	readonly docUid: string;
	readonly docName: string;
}
export interface DocumentManagerEventMap {
	"documentCreated": DocumentEvent;
	"documentDeleted": DocumentEvent;
	"pagesAdded": PagesAddedEvent;
	"pagesDeleted": PagesDeletedEvent;
}
export interface EditViewerConfig {
	canvasStyle?: CanvasStyle;
	pageStyle?: BaseStyle;
	currentPageStyle?: BaseStyle;
	quadSelectionStyle?: QuadSelectionStyle;
	minZoom?: number;
	maxZoom?: number;
	scrollDirection?: "horizontal" | "vertical";
	enableSlide?: boolean;
	scrollToLatest?: boolean;
}
export interface EditViewerConstructorOptions {
	container?: string | HTMLElement;
	viewerConfig?: EditViewerConfig;
	thumbnailConfig?: ThumbnailConfig;
	uiConfig?: UiConfig;
	/** The uid of the controller/viewer to be synced */
	groupUid?: string;
	annotationConfig?: AnnotationConfig;
}
export interface EditViewerEventMap {
	"resized": ResizedEvent;
	"pageRendered": PageRenderedEvent;
	"currentIndexChanged": CurrentIndexChangedEvent;
	"currentPageChanged": CurrentPageChangedEvent;
	"displayModeChanged": DisplayModeChangedEvent;
	"fitModeChanged": FitModeChangedEvent;
	"zoomChanged": ZoomChangedEvent;
	"toolModeChanged": ToolModeChangedEvent;
	"cropRectDrawn": CropRectDrawnEvent;
	"cropRectDeleted": CropRectDeletedEvent;
	"cropRectModified": CropRectModifiedEvent;
	"click": VPointerEvent;
	"dblclick": VPointerEvent;
	"rightclick": VPointerEvent;
	"selectedAnnotationsChanged": SelectedAnnotationsChangedEvent;
}
export interface EllipseAnnotationOptions extends BaseAnnotationOptions {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
}
export interface EllipseStyle extends RectangleStyle {
}
export interface ExtraPageData {
	index: number;
	rotation?: number;
	filter?: string;
	perspectiveQuad?: Quad;
}
export interface FileParserConstructor {
	new(): IFileParser;
}
export interface FilterInputOptions {
	brightness?: number;
	contrast?: number;
	method?: string;
}
export interface FitModeChangedEvent {
	readonly oldFitMode: FitModeEnum;
	readonly newFitMode: FitModeEnum;
}
export interface Flags {
	print?: boolean;
	noView?: boolean;
	readOnly?: boolean;
}
export interface FreeTextContent extends FreeTextContentProps {
	fontSize?: string | number;
}
export interface FreeTextContentProps {
	content?: string;
	color?: string;
	lineThrough?: boolean;
	underline?: boolean;
	fontFamily?: string;
	fontStyle?: string;
	fontWeight?: string;
}
export interface IBrowseViewer {
	uid: string;
	groupUid: string;
	postfix: string;
	get isVisible(): boolean;
	get multiselectMode(): boolean;
	get isBoundContainer(): boolean;
	getStyle(styleName: BrowseViewerStyleName): BrowseViewerStyle;
	updateStyle(styleName: BrowseViewerStyleName, style: BrowseViewerStyle): boolean;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	show(): void;
	hide(): void;
	getSelectedPageIndices(): number[];
	selectAllPages(): string[];
	selectPages(indices: number[]): string[];
	setRowAndColumn(rows: number, columns: number): boolean;
	on<K extends keyof BrowseViewerEventMap>(type: K, listener: (event: BrowseViewerEventMap[K]) => any): void;
	off<K extends keyof BrowseViewerEventMap>(type: K, listener?: (event: BrowseViewerEventMap[K]) => any): void;
}
export interface IDisposable {
	dispose(): void;
	register?: <T extends IDisposable>(disposable: T) => T;
}
export interface IDocument {
	get name(): string;
	get uid(): string;
	get pages(): string[];
	get creationDate(): string;
	get author(): string;
	loadSource(sources: Source | PdfSource | (Source | PdfSource)[], index?: number): Promise<string[]>;
	loadSource(fileData: Blob | Blob[], index?: number): Promise<string[]>;
	loadSource(sources: any, loadSourceOptions?: LoadSourceOptions | number): Promise<string[]>;
	getPageData(pageUid: string): Promise<PageData>;
	insertBlankPage(pageWidth: number, pageHeight: number, insertBeforeIndex?: number): string;
	updatePage(pageUid: string, data: Blob, options?: UpdatePageOptions): Promise<boolean>;
	setPageCustomData(pageUid: string, data: any): Promise<boolean>;
	getPageCustomData(pageUid: string): Promise<any>;
	deletePages(indices: number[]): boolean;
	deleteAllPages(): boolean;
	movePages(indices: number[], insertBeforeIndex?: number): void;
	switchPage(one: number, another: number): void;
	rename(name: string): boolean;
	saveToPng(index: number, setting?: SavePngSettings): Promise<Blob>;
	saveToJpeg(index: number, saveJpegSettings?: SaveJpegSettings): Promise<Blob>;
	saveToPdf(savePDFSettings?: SavePdfSettings): Promise<Blob>;
	saveToPdf(indices: number[], savePDFSettings?: SavePdfSettings): Promise<Blob>;
	saveToTiff(saveTIFFSettings?: SaveTiffSettings): Promise<Blob>;
	saveToTiff(indices: number[], saveTIFFSettings?: SaveTiffSettings): Promise<Blob>;
	print(indices?: number[]): void;
	print(indices: number[], setting?: PrintSettings): void;
}
export interface IDocumentDetect {
	detect(image: VImageData, config?: DocumentDetectConfig): Promise<DocumentDetectResult>;
	getStatusMsg(status: EnumDocumentDetectionStatus): string;
	processDetectResult(detectResult: DetectResult): DocumentDetectResult;
	calculateConfidence(location: Quad, width: number, height: number): DocumentDetectConfidence;
	calculateTotalConfidence(conf: DocumentDetectConfidence): number;
	reset(): void;
	destroy(): void;
}
export interface IDomainEvent {
}
export interface IFileParser {
	type: string;
	once: boolean;
	initParser(source: Blob, parserOptions?: ParserOptions): void;
	getPageCount(): Promise<number>;
	parse(indices?: number[]): Promise<ParsedPage[]>;
	getPage(index?: number): Promise<ParsedPage>;
	cancelGetPage(index?: number): void;
	destroy(): void;
}
export interface IImageFilter {
	querySupported(): ImageFilterItem[];
	get defaultFilterType(): string;
	applyFilter(image: VImageData, type: string): Promise<Blob>;
	destroy(): void;
}
export interface IconComponent {
	CameraResolution?: string;
	Capture?: string;
	Flashlight?: string;
	CameraConvert?: string;
	AutoDetect?: string;
	AutoCapture?: string;
	Rotate?: string;
	RotateLeft?: string;
	RotateRight?: string;
	Load?: string;
	Download?: string;
	Delete?: string;
	DeleteCurrent?: string;
	DeleteAll?: string;
	Zoom?: string;
	ZoomIn?: string;
	ZoomOut?: string;
	ZoomByPercentage?: string;
	Crop?: string;
	CropAll?: string;
	CropCurrent?: string;
	CropMode?: string;
	PerspectiveAll?: string;
	FullQuad?: string;
	Undo?: string;
	Redo?: string;
	Restore?: string;
	Pan?: string;
	Filter?: string;
	Print?: string;
	ThumbnailSwitch?: string;
	DisplayMode?: string;
	ContinuousPage?: string;
	MultiPage?: string;
	SinglePage?: string;
	FitMode?: string;
	FitWidth?: string;
	FitHeight?: string;
	FitWindow?: string;
	ActualSize?: string;
	Back?: string;
	Close?: string;
	Done?: string;
	FirstPage?: string;
	LastPage?: string;
	NextPage?: string;
	PrevPage?: string;
	ImagePreview?: string;
	AnnotationSet?: string;
	EllipseAnnotation?: string;
	InkAnnotation?: string;
	LineAnnotation?: string;
	PolygonAnnotation?: string;
	PolylineAnnotation?: string;
	RectAnnotation?: string;
	StampIconAnnotation?: string;
	StampImageAnnotation?: string;
	TextBoxAnnotation?: string;
	TextTypewriterAnnotation?: string;
	SelectAnnotation?: string;
	EraseAnnotation?: string;
	BringForward?: string;
	BringToFront?: string;
	SendBackward?: string;
	SendToBack?: string;
}
export interface ImageFilterItem {
	type: string;
	label: string;
}
export interface InkAnnotationOptions extends Omit<BaseAnnotationOptions, "background" | "lineDash"> {
	points?: Point[][];
}
export interface InkStyle extends BaseAnnotationStyle {
	borderWidth?: number;
	borderColor?: string;
}
export interface LastError {
	message: string;
	cause: VError;
}
export interface LicenseInfo {
	modules: {
		code: number;
		message: string;
		module: number;
	}[];
	msg: string;
	trial: number;
}
export interface LineAnnotationOptions extends Omit<BaseAnnotationOptions, "rotation"> {
	startPoint?: Point;
	endPoint?: Point;
	lineEnding?: LineEnding;
}
export interface LineEnding {
	start?: EnumLineEnding;
	end?: EnumLineEnding;
}
export interface LineStyle extends PolylineStyle {
}
export interface LoadSourceOptions {
	insertBeforeIndex?: number;
	/** Whether ignore the exception while loading the source. */
	exception?: ExceptionType;
}
export interface MergeDocumentsOptions {
	name?: string;
	author?: string;
	creationDate?: string;
	deleteOriginal?: boolean;
	includeAnnotations?: boolean;
}
export interface NormalAppearance {
	matrix: number[];
	bbox: number[];
	objs: OBJS[];
	transform: number[];
	blendMode?: string;
}
export interface OBJS {
	charSpace?: number;
	dashArray?: number[];
	dashPhase?: number;
	fillColor?: number[];
	fillType?: number;
	fontCharSet?: number;
	fontIsBold?: boolean;
	fontIsItalic?: boolean;
	fontName?: string;
	fontPitchFamily?: number;
	fontSize?: number;
	isStroke?: boolean;
	lineCap?: number;
	lineJoin?: number;
	lineWidth?: number;
	miterLimit?: number;
	position?: number[];
	renderMode?: number;
	segments?: any;
	objMatrix?: number[];
	strokeColor?: number[];
	type: string;
	text?: string;
	wordSpace?: number;
}
export interface PageData {
	uid: string;
	fileData: Blob;
	fileIndex?: number;
	filter?: string;
	perspectiveQuad?: Quad;
	rotation?: number;
	raw?: {
		width: number;
		height: number;
		data: Blob;
	};
	thumbnail?: {
		width: number;
		height: number;
		data: Blob;
	};
	display?: {
		width: number;
		height: number;
		data: Blob;
	};
	mediaBox: Rect;
	cropBox: Rect;
}
export interface PageDraggedEvent {
	readonly indices: number[];
	readonly pageUids: string[];
}
export interface PageDroppedEvent {
	readonly indicesBefore: number[];
	readonly indicesAfter: number[];
	readonly pageUids: string[];
}
export interface PageNumberStyle {
	onPage?: boolean;
	left?: string;
	top?: string;
	right?: string;
	bottom?: string;
	width?: string;
	height?: string;
	background?: string;
	border?: string;
	borderRadius?: string;
	translateX?: string;
	translateY?: string;
	opacity?: number;
	visibility?: "hidden" | "visible";
	color?: string;
	fontSize?: string;
	fontFamily?: string;
}
export interface PageRenderedEvent {
	readonly index: number;
	readonly pageUid: string;
}
export interface PagesAddedEvent {
	readonly docUid: string;
	readonly indices: number[];
	readonly pageUids: string[];
}
export interface PagesDeletedEvent {
	readonly docUid: string;
	readonly pageUids: string[];
	readonly indices: number[];
}
export interface PaletteConfig {
	id?: string;
	style?: Partial<CSSStyleDeclaration>;
	className?: string;
	colorList?: string[];
	labels?: {
		text?: string;
		stroke?: string;
		fill?: string;
		opacity?: string;
		style?: string;
		standardBusiness?: string;
	};
}
export interface ParsedAnnotation {
	uid?: string;
	type?: AnnotationTypesEnum;
	style?: AnnotationStyle | AnnotationStyle[];
	transform?: AnnotationTransform;
	iconColor?: string;
	comment?: ParsedAnnotationComment;
	opacity?: number;
	flags?: string[];
	raw?: AnnotationRawData;
}
export interface ParsedAnnotationComment extends ParsedAnnotationReply {
	replies?: ParsedAnnotationReply[];
}
export interface ParsedAnnotationReply {
	uid: string;
	author: string;
	type: string;
	subject?: string;
	contents: string;
	creationDate?: string;
	modifiedDate?: string;
	stateModel?: string;
	state?: string;
	reviewStates?: ParsedAnnotationReply[];
	markedStates?: ParsedAnnotationReply[];
	flags?: string[];
}
/**
 * The parsed resource is an image.
 */
export interface ParsedImageResource {
	data?: Blob;
	width: number;
	height: number;
	resolutionX: number;
	resolutionY: number;
	bitDepth?: number;
}
export interface ParsedPage {
	pageUid?: string;
	fileIndex: number;
	annotations?: ParsedAnnotation[];
	rotation?: number;
	filter?: string;
	mediaBox: Rect;
	cropBox: Rect;
	resource: ParsedImageResource;
	pdfOptions?: ParsedPagePdfOptions;
}
export interface ParsedPagePdfOptions {
	convertMode: EnumConvertMode;
	renderOptions: {
		renderAnnotations: EnumAnnotationRenderMode;
		renderGrayscale: boolean;
	};
}
export interface ParserOptions {
	pageWidth?: number;
	pageHeight?: number;
}
export interface PdfSource extends Source {
	convertMode: EnumConvertMode;
	password?: string;
	renderOptions?: {
		renderAnnotations?: EnumAnnotationRenderMode;
		resolution?: number;
		maxWidth?: number;
		maxHeight?: number;
		renderGrayscale?: boolean;
	};
}
export interface PerspectiveViewerConfig {
	canvasStyle?: CanvasStyle;
	pageStyle?: BaseStyle;
	quadSelectionStyle?: QuadSelectionStyle;
	enableSlide?: boolean;
	scrollToLatest?: boolean;
}
export interface PerspectiveViewerConstructorOptions {
	container?: string | HTMLElement;
	viewerConfig?: PerspectiveViewerConfig;
	uiConfig?: UiConfig;
	/** The uid of the controller/viewer to be synced */
	groupUid?: string;
}
export interface PerspectiveViewerEventMap {
	"resized": ResizedEvent;
	"pageRendered": PageRenderedEvent;
	"currentIndexChanged": CurrentIndexChangedEvent;
	"currentPageChanged": CurrentPageChangedEvent;
	"quadModified": QuadModifiedEvent;
	"click": VPointerEvent;
	"dblclick": VPointerEvent;
	"rightclick": VPointerEvent;
}
export interface PlayCallbackInfo {
	deviceId: string;
	width: number;
	height: number;
}
export interface PlayedEvent {
	readonly deviceId: string;
	readonly resolution: [
		number,
		number
	];
}
export interface Point {
	x: number;
	y: number;
}
export interface Point3Init {
	x: number;
	y: number;
	z?: number;
}
export interface PolygonAnnotationOptions extends Omit<BaseAnnotationOptions, "rotation"> {
	points?: Point[];
}
export interface PolygonStyle extends RectangleStyle {
}
export interface PolylineAnnotationOptions extends Omit<BaseAnnotationOptions, "rotation"> {
	points?: Point[];
	lineEnding?: LineEnding;
}
export interface PolylineStyle extends RectangleStyle {
	lineEnding?: {
		start: EnumLineEnding;
		end: EnumLineEnding;
	};
}
export interface PrintSettings {
	printAnnotation?: boolean;
}
export interface ProcessOutputOptions {
	returnType?: ImageType;
	bRGBA?: boolean;
	returnBlob?: boolean;
	is1BitTo8Bit?: boolean;
	jpegQuality?: number;
	bitDepth?: number;
	xdpi?: number;
	ydpi?: number;
	outputType?: EnumImageDataType;
}
export interface ProcessingHandlerMap {
	"documentBoundariesDetect": IDocumentDetect;
	"imageFilter": IImageFilter;
}
export interface QuadModifiedEvent {
	readonly oldQuad: Quad;
	readonly newQuad: Quad;
}
export interface QuadSelectionStyle {
	border?: string;
	background?: string;
	maskColor?: string;
	ctrlBorderRadius?: string;
	ctrlBorder?: string;
	ctrlWidth?: string;
	ctrlHeight?: string;
	ctrlBackground?: string;
	invalidCtrlBorderColor?: string;
	invalidBorderColor?: string;
}
export interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
}
export interface RectAnnotationOptions extends BaseAnnotationOptions {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
}
export interface RectangleStyle extends BaseAnnotationStyle {
	opacity?: number;
	borderWidth?: number;
	borderColor?: string;
	background?: string;
	lineDash?: number[];
}
export interface ResizedEvent {
	readonly oldWidth: number;
	readonly oldHeight: number;
	readonly newWidth: number;
	readonly newHeight: number;
}
export interface SaveJpegSettings {
	quality?: number;
	saveAnnotation?: boolean;
}
export interface SavePdfSettings {
	/**
	 * Specify the author.
	 */
	author?: string;
	/**
	 * Specify the compression type.
	 */
	compression?: EnumPDFCompressionType;
	/**
	* Specify the page type.
	*/
	pageType?: EnumPDFPageType;
	/**
	 * Specify the creator.
	 */
	creator?: string;
	/**
	 * Specify the creation date.
	 * Note that the argument should be 'D:YYYYMMDDHHmmSS', like 'D:20230101085959'.
	 */
	creationDate?: string;
	/**
	 * Specify the key words.
	 */
	keyWords?: string;
	/**
	 * Specify the modified date.
	 * Note that the argument should be 'D:YYYYMMDDHHmmSS', like 'D:20230101085959'.
	 */
	modifiedDate?: string;
	/**
	 * Specify the producer.
	 */
	producer?: string;
	/**
	 * Specify the subject.
	 */
	subject?: string;
	/**
	 * Specify the title.
	 */
	title?: string;
	/**
	 * Specify the PDF version. For example, 1.5. The allowed values are 1.1 ~ 1.7.
	 * NOTE: If the compression type is PDF_JBig2, the lowest version is 1.4
	 * If the compression type is PDF_JP2000, the lowest version is 1.5
	 */
	version?: string;
	/**
	 * Specify the quality of the images in the file.
	 * The value ranges from 0 to 100.
	 * Only valid when the {compression} is 'JPEG' or 'JPEG2000'.
	 */
	quality?: number;
	password?: string;
	saveAnnotation?: "none" | "image" | "annotation" | "flatten";
	mimeType?: string;
	/**
	* Specify the scale factor of the images in the file.
	* The value ranges from greater than 0 to less than or equal to 1.
	* Default is 1.
	*/
	imageScaleFactor?: number;
}
export interface SavePngSettings {
	saveAnnotation?: boolean;
}
export interface SaveTiffSettings {
	customTag?: TiffCustomTag[];
	/**
	 * Specify the compression type.
	 */
	compression?: EnumTIFFCompressionType;
	/**
	 * Specify the quality of the images in the file.
	 * The value ranges from 0 to 100.
	 * Only valid when the {compression} is 'JPEG'.
	 */
	quality?: number;
	saveAnnotation?: boolean;
}
export interface SelectedAnnotationsChangedEvent {
	oldAnnotationUids: string[];
	newAnnotationUids: string[];
}
export interface SelectedPagesChangedEvent {
	readonly oldIndices: number[];
	readonly newIndices: number[];
	readonly oldPageUids: string[];
	readonly newPageUids: string[];
}
export interface Source {
	fileData: Blob;
	extraPageData?: ExtraPageData[];
}
export interface StampAnnotationOptions {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	stamp?: EnumStampIcon | string | Blob;
	opacity?: number;
	flags?: Flags;
	rotation?: number;
}
export interface StampStyle extends BaseAnnotationStyle {
	stamp?: EnumStampIcon | string | Blob;
}
export interface StoppedEvent {
	readonly deviceId: string;
}
export interface TextBoxAnnotationOptions extends BaseAnnotationOptions {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	textAlign?: "left" | "right" | "center" | "justify";
	textContents?: TextContent[];
}
export interface TextBoxStyle extends RectangleStyle {
	textAlign?: string;
	textContent?: TextContent;
}
export interface TextContent {
	content?: string;
	color?: string;
	underline?: boolean;
	lineThrough?: boolean;
	fontSize?: number;
	fontFamily?: string;
	fontStyle?: string;
	fontWeight?: string;
}
export interface TextTypewriterAnnotationOptions {
	x?: number;
	y?: number;
	textContents?: TextContent[];
	opacity?: number;
	author?: string;
	subject?: string;
	flags?: Flags;
}
export interface TextTypewriterStyle extends BaseAnnotationStyle {
	textContent?: TextContent;
}
export interface ThumbnailConfig extends BrowseViewerConfig {
	size?: string;
	visibility?: "visible" | "hidden";
	position?: "left" | "right" | "top" | "bottom";
}
export interface TiffCustomTag {
	id?: number;
	content?: string;
	contentIsBase64?: boolean;
}
export interface ToolModeChangedEvent {
	readonly oldToolMode: ToolModeEnum;
	readonly newToolMode: ToolModeEnum;
}
export interface ToolbarConfig {
	id?: string;
	className?: string;
	style?: Partial<CSSStyleDeclaration>;
	paletteButton?: AnnotationToolbarButton;
	deleteButton?: AnnotationToolbarButton;
}
export interface Tooltip extends IconComponent {
}
export interface TransferOptions {
	sourceIndices?: number[];
	insertBeforeIndex?: number;
	includeAnnotations?: boolean;
}
export interface UiConfig {
	type: string;
	flexDirection?: "row" | "column";
	id?: string;
	name?: string;
	tooltip?: string;
	dataId?: string;
	style?: Partial<CSSStyleDeclaration>;
	className?: string;
	label?: string;
	events?: Partial<Record<keyof GlobalEventHandlersEventMap, any>>;
	children?: (UiConfig | string)[];
}
export interface UpdatePageOptions {
	fileIndex?: number;
	filter?: string;
	rotation?: number;
	perspectiveQuad?: Quad;
}
export interface VError {
	code: number;
	message: string;
	details?: string[];
	name?: string;
}
export interface VImageData {
	type: EnumImageDataType;
	data: ArrayBuffer | Blob;
	height?: number;
	width?: number;
}
/**
 * Support click/dblclick/rightclick/longtap/tap
 */
export interface VPointerEvent {
	readonly index: number;
	readonly pageUid: string;
	readonly imageX: number;
	readonly imageY: number;
	readonly canvasX: number;
	readonly canvasY: number;
	readonly nativeEvent: PointerEvent;
}
export interface Vector3Init {
	x: number;
	y: number;
	z?: number;
}
export interface VideoConfig {
	resolution?: [
		number,
		number
	];
	fill?: boolean;
}
export interface VideoDeviceInfo {
	deviceId: string;
	label: string;
}
export interface ViewerEventMap {
	cameraChanged: CameraChangedEvent;
	captured: CapturedEvent;
	cropRectDeleted: CropRectDeletedEvent;
	cropRectDrawn: CropRectDrawnEvent;
	cropRectModified: CropRectModifiedEvent;
	currentIndexChanged: CurrentIndexChangedEvent;
	currentPageChanged: CurrentPageChangedEvent;
	displayModeChanged: DisplayModeChangedEvent;
	documentCreated: DocumentEvent;
	fitModeChanged: FitModeChangedEvent;
	pagesDragged: PagesDraggedEvent;
	pagesDropped: PagesDroppedEvent;
	pageRendered: PageRenderedEvent;
	pagesAdded: PagesAddedEvent;
	pagesDeleted: PagesDeletedEvent;
	played: PlayedEvent;
	quadModified: QuadModifiedEvent;
	resized: ResizedEvent;
	selectedPagesChanged: SelectedPagesChangedEvent;
	stopped: StoppedEvent;
	toolModeChanged: ToolModeChangedEvent;
	click: VPointerEvent;
	dblclick: VPointerEvent;
	rightclick: VPointerEvent;
	tap: VPointerEvent;
	longtap: VPointerEvent;
	zoomChanged: ZoomChangedEvent;
	selectedAnnotationsChanged: SelectedAnnotationsChangedEvent;
}
export interface ZoomChangedEvent {
	readonly oldZoomRatio: number;
	readonly newZoomRatio: number;
}
export interface ZoomOrigin {
	x: "start" | "center" | "end";
	y: "start" | "center" | "end";
}
export type AnnotationMode = "select" | "erase" | "rectangle" | "ellipse" | "line" | "polygon" | "polyline" | "ink" | "textBox" | "textTypewriter" | "stamp";
export type AnnotationModifiedAction = "moved" | "resized" | "rotated" | "flagsChanged" | "styleChanged";
export type BrowseViewerStyle = BaseStyle | CanvasStyle | PageNumberStyle | CheckboxStyle;
export type BrowseViewerStyleName = "canvasStyle" | "pageStyle" | "selectedPageStyle" | "hoveredPageStyle" | "placeholderStyle" | "pageNumberStyle" | "checkboxStyle" | "currentPageStyle";
/**
 * cursor
 * @see https://drafts.csswg.org/css-ui-3/#cursor
 */
export type Cursor = "auto" | "default" | "none" | "context-menu" | "help" | "pointer" | "progress" | "wait" | "cell" | "crosshair" | "text" | "vertical-text" | "alias" | "copy" | "move" | "no-drop" | "not-allowed" | "e-resize" | "n-resize" | "ne-resize" | "nw-resize" | "s-resize" | "se-resize" | "sw-resize" | "w-resize" | "ns-resize" | "ew-resize" | "nesw-resize" | "col-resize" | "nwse-resize" | "row-resize" | "all-scroll" | "zoom-in" | "zoom-out" | "grab" | "grabbing";
export type DisplayMode = "single" | "continuous";
export type ExceptionType = "fail" | "ignore";
export type FitMode = "width" | "height" | "window" | "actualSize";
export type FreeTextAlign = "left" | "right" | "center" | "justify";
export type OuterAnnotation = Rectangle | Ellipse | Ink | Line | Polygon | Polyline | Stamp | TextBox | TextTypewriter;
export type Quad = [
	[
		number,
		number
	],
	[
		number,
		number
	],
	[
		number,
		number
	],
	[
		number,
		number
	]
];
export type ToolMode = "pan" | "crop" | "annotation";
export type Viewer = any;
export type ViewerType = "editViewer" | "perspectiveViewer" | "captureViewer" | "browseViewer";
export type WasmModuleName = "core" | "pdf" | "proc";

export { };
