declare class BaseBrowseViewer implements IBrowseViewer {
	#private;
	v: any;
	uid: string;
	groupUid: string;
	postfix: string;
	errorPrefix: string;
	constructor(options: BrowseViewerConstructorOptions, prefix?: string);
	get isVisible(): boolean;
	get isBoundContainer(): boolean;
	set multiselectMode(val: boolean);
	get multiselectMode(): boolean;
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
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	show(): void;
	hide(): void;
	getSelectedPageIndices(): number[];
	selectAllPages(): string[];
	selectPages(indices: number[]): string[];
	setRowAndColumn(row: number, column: number): boolean;
	on<K extends keyof BrowseViewerEventMap>(eventName: K, listener: (event: BrowseViewerEventMap[K]) => any): void;
	off<K extends keyof BrowseViewerEventMap>(eventName: K, listener?: (event: BrowseViewerEventMap[K]) => any): void;
	destroy(): void;
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
declare class DocumentDetect implements IDocumentDetect {
	#private;
	constructor();
	reset(): void;
	destroy(): void;
	clear(): void;
	detect(image: VImageData, config?: DocumentDetectConfig): Promise<DocumentDetectResult>;
	getStatusMsg(status: EnumDocumentDetectionStatus): string;
	processDetectResult(detectResult: DetectResult): DocumentDetectResult;
	calculateConfidence(location: Quad, width: number, height: number): DocumentDetectConfidence;
	calculateTotalConfidence(conf: DocumentDetectConfidence): number;
}
declare class DocumentManager {
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
}
declare class ImageFilterHandler implements IImageFilter {
	#private;
	constructor(image?: VImageData);
	applyFilter(image: VImageData, type: string): Promise<Blob>;
	applyFilter(type: string): Promise<ArrayBuffer>;
	queryParams(type: string): any;
	get defaultFilterType(): string;
	querySupported(): ImageFilterItem[];
	destroy(): void;
}
declare class ImageIOWasmEnv {
	#private;
	static resourceDir: string;
	static fetchOptions: any;
	static enableSimd: boolean;
	static get isApple(): boolean;
	static get version(): string;
	static enableDebugOutput(enable: boolean, callback: (...args: any) => void): void;
	static getMemoryUsed(): any;
	static get heapConfig(): any;
	static updateHeapConfig(workerName: WorkerName, maxHeapSize?: number, initHeapSize?: number): void;
	static getLicenseInfo(license: any, isLts: boolean, uuid: string): Promise<any>;
	private static Init;
	static isResourceDirValid(): Promise<boolean>;
	static loadPdfReader(license: any, isLts: boolean, uuid: string): Promise<any>;
	static loadMain(license: any, isLts: boolean, uuid: string): Promise<any>;
	static load(license: any, isLts: boolean, uuid: string): Promise<void>;
	static preloadModule(name: WasmModuleName): Promise<any>;
	static unloadMainWorker(): void;
	static unloadPdfReaderWorker(): void;
	static unloadDocumentDetectorWorker(): void;
	static unloadWorker(): Promise<void>;
	static unload(): Promise<void>;
	private static getUseSimd;
	static getPdfInfo(blob: Blob, password?: string): Promise<unknown>;
}
declare const Version: string;
declare enum WorkerName {
	core = "ddv-core",
	reader = "ddv-reader",
	detector = "ddv-detector",
	loader = "ddv-loader"
}
export declare class BrowseViewer extends BaseBrowseViewer {
	constructor(options: BrowseViewerConstructorOptions);
	get currentDocument(): IDocument | null;
	bindContainer(container: HTMLElement | string): void;
	unbindContainer(): void;
	/**
	 * Open a document to the controller.
	 * @param doc - A document to be opened on the controller.
	 */
	openDocument(docUid: string): void;
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
}
export declare class CaptureViewer {
	#private;
	uid: string;
	groupUid: string;
	postfix: string;
	constructor(options: CaptureViewerConstructorOptions);
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
	bindContainer(container: HTMLElement): void;
	unbindContainer(): void;
	show(): void;
	hide(): void;
	/**
	 * Open a document to the viewer.
	 * @param doc - A document to be opened.
	 */
	openDocument(docUid: string): void;
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
	getUiConfig(): UiConfig;
	updateUiConfig(config: UiConfig): boolean;
	on<K extends keyof CaptureViewerEventMap>(eventName: K, listener: (event: CaptureViewerEventMap[K]) => any): void;
	off<K extends keyof CaptureViewerEventMap>(eventName: K, listener?: (event: CaptureViewerEventMap[K]) => any): void;
	destroy(): void;
}
export declare class CustomViewer {
	#private;
	uid: string;
	isDestroyed: boolean;
	postfix: string;
	constructor(options: CustomViewerConstructorOptions);
	get isBoundContainer(): boolean;
	get isVisible(): boolean;
	hide(): void;
	show(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(uiConfig: UiConfig): boolean;
	bindContainer(container: HTMLElement): void;
	unbindContainer(): void;
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
	constructor(options: EditViewerConstructorOptions);
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
	get fitMode(): FitMode;
	set fitMode(type: FitMode);
	setParallelScrollCount(count: number): boolean;
	bindContainer(container: HTMLElement): void;
	unbindContainer(): void;
	show(): void;
	hide(): void;
	getUiConfig(): UiConfig;
	updateUiConfig(config: UiConfig): boolean;
	/**
	 * Open a document to the controller.
	 * @param doc - A document to be opened on the controller.
	 */
	openDocument(docUid: string): void;
	closeDocument(): boolean;
	getStyle(name: "canvasStyle"): CanvasStyle;
	getStyle(name: "pageStyle"): BaseStyle;
	getStyle(name: "currentPageStyle"): BaseStyle;
	getStyle(name: "quadSelectionStyle"): QuadSelectionStyle;
	updateStyle(name: "canvasStyle", style: CanvasStyle): boolean;
	updateStyle(name: "pageStyle", style: BaseStyle): boolean;
	updateStyle(name: "currentPageStyle", style: BaseStyle): boolean;
	updateStyle(name: "quadSelectionStyle", style: QuadSelectionStyle): boolean;
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
	getUiConfig(): UiConfig;
	updateUiConfig(config: UiConfig): boolean;
	bindContainer(container: HTMLElement): void;
	unbindContainer(): void;
	show(): void;
	hide(): void;
	/**
	 * Open a document to the controller.
	 * @param doc - A document to be opened on the controller.
	*/
	openDocument(docUid: string): void;
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
	rotate(angle: number, indices?: number[]): boolean;
	applyPerspective(quad: Quad): Promise<Blob>;
	saveOperations(): boolean;
	/**
	 * Get the index of the current page.
	 * @returns The index of the current page.
	 */
	getCurrentPageIndex(): number;
	getPageCount(): number;
	/**
	 * Jump to the target page.
	 * @param index - The index of the page to be selected as the current page
	 * in the activated document.
	 * @returns A number represent the index of page. It is -1 while the input parameter is invalid.
	 */
	goToPage(index: number): number;
	/**
	 * Get the index of the page represented by the uid in the activated document.
	 * @param uid  - The uid of a page in the activated document.
	 * @returns The index of the page.
	 */
	uidToIndex(uid: string): number;
	/**
	 * Get the uid of the page represented by the index in the activated document.
	 * @param index  - The index of a page in the activated document.
	 * @returns The uid of the page.
	 */
	indexToUid(index: number): string;
	/**
	 * Get the uid of the current page.
	 * @returns The uid of the current page.
	 */
	getCurrentPageUid(): string;
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
	DocumentDetect: typeof DocumentDetect;
	ImageFilter: typeof ImageFilterHandler;
	BrowseViewer: typeof BrowseViewer;
	CaptureViewer: typeof CaptureViewer;
	CustomViewer: typeof CustomViewer;
	EditViewer: typeof EditViewer;
	PerspectiveViewer: typeof PerspectiveViewer;
	readonly lastError: DDVError;
	Experiments: {
		get(name: string, params?: any): any;
		set(name: string, value: any): any;
	};
	getDefaultUiConfig(viewerType: ViewerType): UiConfig | null;
	setProcessingHandler<K extends keyof ProcessingHandlerMap>(type: K, handler: ProcessingHandlerMap[K]): void;
	/**
	 * Set a filter parser to the DDV system.
	 * @param mine - The MIME type of file.
	 * @param parserClass - The constructor of the file parser.
	 */
	setFileParser(mine: string, parserClass: FileParserConstructor): void;
	unload(): void;
	clearLastError(): void;
	on<K_1 extends keyof DDVEventMap>(eventName: K_1, listener: (event: DDVEventMap[K_1]) => any): void;
	off<K_2 extends keyof DDVEventMap>(eventName: K_2, listener?: (event: DDVEventMap[K_2]) => any): void;
	EnumImageDataType: typeof EnumImageDataType;
	EnumConvertMode: typeof EnumConvertMode;
	EnumDocumentDetectionStatus: typeof EnumDocumentDetectionStatus;
	EnumImageFilterType: typeof EnumImageFilterType;
	EnumImageProcessMethodType: typeof EnumImageProcessMethodType;
	EnumPDFCompressionType: typeof EnumPDFCompressionType;
	EnumPDFPageType: typeof EnumPDFPageType;
	EnumTIFFCompressionType: typeof EnumTIFFCompressionType;
};
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
export declare const enum ToolModeEnum {
	PAN = "pan",
	CROP = "crop",
	ZOOM_IN = "zoomIn",
	ZOOM_OUT = "zoomOut",
	ANNOTATION = "annotation"
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
export declare enum EnumImageProcessMethodType {
	BlackAndWhite = 1,
	Gray = 2,
	RemoveShadow = 3,
	Enhance = 4,
	Invert = 5,
	Brightness = 6,
	Contrast = 7,
	BrightnessAndContrast = 8,
	Perspective = 9,
	Deskew = 10,
	Rotate = 11,
	Flip = 12,
	Resize = 13,
	SetHeight = 14,
	SetWidth = 15,
	SetDPI = 16,
	Crop = 17,
	Erase = 18,
	DrawPolygon = 19
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
	"pagesDragged": PageDraggedEvent;
	"pagesDropped": PageDroppedEvent;
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
	licenseInfo: string;
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
export interface CustomTag {
	id?: number;
	content?: string;
	contentIsBase64?: boolean;
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
	quadSelectionStyle?: QuadSelectionStyle;
	currentPageStyle?: BaseStyle;
	minZoom?: number;
	maxZoom?: number;
	scrollDirection?: "horizontal" | "vertical";
	enableSlide?: boolean;
	scrollToLatest?: boolean;
}
export interface EditViewerConstructorOptions {
	container?: string | HTMLElement;
	viewerConfig?: EditViewerConfig;
	uiConfig?: UiConfig;
	thumbnailConfig?: ThumbnailConfig;
	/** The uid of the controller/viewer to be synced */
	groupUid?: string;
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
}
export interface ExtraPageData {
	index: number;
	rotation?: number;
	filter?: string;
	perspectiveQuad?: Quad;
}
export interface FileParserConstructor {
	new (): IFileParser;
}
export interface FitModeChangedEvent {
	readonly oldFitMode: FitModeEnum;
	readonly newFitMode: FitModeEnum;
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
	destroy(): void;
}
export interface IDocument {
	get name(): string;
	get uid(): string;
	get pages(): string[];
	get creationDate(): string;
	get author(): string;
	loadSource(fileData: Blob | Blob[], index?: number): Promise<string[]>;
	loadSource(sources: Source | Source[], index?: number): Promise<string[]>;
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
	saveToPng(index: number): Promise<Blob>;
	saveToJpeg(index: number, saveJpegSettings?: SaveJpegSettings): Promise<Blob>;
	saveToPdf(savePDFSettings?: SavePdfSettings): Promise<Blob>;
	saveToPdf(indices: number[], savePDFSettings?: SavePdfSettings): Promise<Blob>;
	saveToTiff(saveTIFFSettings?: SaveTiffSettings): Promise<Blob>;
	saveToTiff(indices: number[], saveTIFFSettings?: SaveTiffSettings): Promise<Blob>;
	print(indices?: number[]): void;
}
export interface IDocumentDetect {
	detect(image: VImageData, config?: DocumentDetectConfig): Promise<DocumentDetectResult>;
	destroy(): void;
}
export interface IFileParser {
	once: boolean;
	getPageCount(file: Blob, options?: any): Promise<number>;
	parse(file: Blob, options?: any): Promise<ParsedPage[]>;
	parse(file: Blob, indices: number[], options?: any): Promise<ParsedPage[]>;
	getPage(index: number, options?: any): Promise<ParsedPage>;
	cancelGetPage(index: number): void;
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
}
export interface ImageFilterItem {
	type: string;
	label: string;
}
export interface MergeDocumentsOptions {
	name?: string;
	author?: string;
	creationDate?: string;
	deleteOriginal?: boolean;
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
export interface ParsedAnnotation {
	type: string;
	style: any;
}
export interface ParsedPage {
	fileIndex: number;
	data?: Blob;
	width?: number;
	height?: number;
	annotations?: ParsedAnnotation[];
	bitDepth?: number;
	resolutionX?: number;
	resolutionY?: number;
	rotation?: number;
	pageWidth?: number;
	pageHeight?: number;
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
export interface ResizedEvent {
	readonly oldWidth: number;
	readonly oldHeight: number;
	readonly newWidth: number;
	readonly newHeight: number;
}
export interface SaveJpegSettings {
	quality?: number;
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
	includeAnnotations?: boolean;
	mimeType?: string;
}
export interface SaveTiffSettings {
	customTag?: CustomTag[];
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
export interface StoppedEvent {
	readonly deviceId: string;
}
export interface ThumbnailConfig extends BrowseViewerConfig {
	size?: string;
	visibility?: "visible" | "hidden";
	position?: "left" | "right" | "top" | "bottom";
}
export interface ToolModeChangedEvent {
	readonly oldToolMode: ToolModeEnum;
	readonly newToolMode: ToolModeEnum;
}
export interface Tooltip extends IconComponent {
}
export interface TransferOptions {
	sourceIndices?: number[];
	insertBeforeIndex?: number;
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
export interface ZoomChangedEvent {
	readonly oldZoomRatio: number;
	readonly newZoomRatio: number;
}
export interface ZoomOrigin {
	x: "start" | "center" | "end";
	y: "start" | "center" | "end";
}
export type BrowseViewerStyle = BaseStyle | CanvasStyle | PageNumberStyle | CheckboxStyle;
export type BrowseViewerStyleName = "canvasStyle" | "pageStyle" | "selectedPageStyle" | "hoveredPageStyle" | "placeholderStyle" | "pageNumberStyle" | "checkboxStyle" | "currentPageStyle";
/**
 * cursor
 * @see https://drafts.csswg.org/css-ui-3/#cursor
 */
export type Cursor = "auto" | "default" | "none" | "context-menu" | "help" | "pointer" | "progress" | "wait" | "cell" | "crosshair" | "text" | "vertical-text" | "alias" | "copy" | "move" | "no-drop" | "not-allowed" | "e-resize" | "n-resize" | "ne-resize" | "nw-resize" | "s-resize" | "se-resize" | "sw-resize" | "w-resize" | "ns-resize" | "ew-resize" | "nesw-resize" | "col-resize" | "nwse-resize" | "row-resize" | "all-scroll" | "zoom-in" | "zoom-out" | "grab" | "grabbing";
export type DisplayMode = "single" | "continuous";
export type FitMode = "width" | "height" | "window" | "actualSize";
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
export type ToolMode = "pan" | "crop";
export type ViewerType = "editViewer" | "perspectiveViewer" | "captureViewer" | "browseViewer";
export type WasmModuleName = "core" | "pdf" | "proc";

export {};
